// Texture-parity gate for the circuit optimize pipeline.
//
// Fails the build if a material that SURVIVES optimization loses its
// baseColorTexture. This is the backstop for the prune step silently dropping
// textures from surviving materials (verified: Monza shadow_serraglio — the
// green smear — kept its material but lost tex under prune; --no-prune restores).
//
// Correctness notes:
//  - Match materials by NAME and only flag ones present in BOTH source and
//    output. A material missing from the output is benign: dedup merges
//    identical materials (Monza 58 -> 55: branch5/bushes/hedge collapse to one),
//    and the geometry still renders textured. Only a material that survives yet
//    loses its texture is a real regression.
//  - Resolve textures through the gltf-transform Document API. The optimized
//    files use EXT_texture_webp, so the image index lives under
//    textures[i].extensions, not textures[i].source; a naive JSON check reports
//    every webp texture as broken. getBaseColorTexture().getImage() resolves it.
//
// Usage: node texture-parity.mjs "<source>::<output>" ["<source>::<output>" ...]

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

// name -> has a resolvable (image-backed) baseColorTexture
function texMap(doc) {
  const m = new Map();
  for (const mat of doc.getRoot().listMaterials()) {
    const name = mat.getName() || '(unnamed)';
    const tex = mat.getBaseColorTexture();
    m.set(name, !!(tex && tex.getImage()));
  }
  return m;
}

const pairs = process.argv.slice(2);
if (!pairs.length) {
  console.error('no source::output pairs given');
  process.exit(2);
}

let failed = false;
for (const pair of pairs) {
  const [src, out] = pair.split('::');
  const tag = out.split('/').pop();
  let sDoc, oDoc;
  try {
    sDoc = await io.read(src);
    oDoc = await io.read(out);
  } catch (err) {
    console.error(`FAIL ${tag}: could not read (${err.message})`);
    failed = true;
    continue;
  }
  const s = texMap(sDoc);
  const o = texMap(oDoc);
  const broken = [];
  for (const [name, srcHas] of s) {
    if (!srcHas) continue;        // source had no texture — nothing to lose
    if (!o.has(name)) continue;   // material merged/removed (dedup) — benign
    if (!o.get(name)) broken.push(name); // survives but lost its texture — broken
  }
  if (broken.length) {
    failed = true;
    console.error(`FAIL ${tag}: ${broken.length} surviving material(s) lost baseColorTexture:`);
    for (const n of broken) console.error(`   ${n}`);
  } else {
    const srcTex = [...s.values()].filter(Boolean).length;
    const outTex = [...o.values()].filter(Boolean).length;
    console.log(`OK   ${tag}: source textured=${srcTex} output textured=${outTex} — every surviving material kept its texture`);
  }
}

if (failed) {
  console.error('\nTexture-parity check FAILED — a surviving material lost its texture; not committing meshes.');
  process.exit(1);
}
console.log('\nTexture-parity check passed.');
