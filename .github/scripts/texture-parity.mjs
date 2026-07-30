// Texture-parity gate for the circuit optimize pipeline.
//
// Compares each source GLB against its optimized output and FAILS the build if
// the output has fewer materials with a resolvable baseColorTexture. This is the
// backstop for the silent texture-drop bug (optimize pruning near-solid textures
// — e.g. shadow gradients, glass — into flat colour factors).
//
// Uses the gltf-transform Document API, which resolves textures through the
// EXT_texture_webp extension. A naive check of the raw glTF `texture.source`
// field would false-positive here, because webp textures store their image
// under extensions rather than the top-level source field.
//
// Usage: node texture-parity.mjs "<source>::<output>" ["<source>::<output>" ...]

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function texturedMaterials(doc) {
  const names = [];
  for (const mat of doc.getRoot().listMaterials()) {
    if (mat.getBaseColorTexture()) names.push(mat.getName() || '(unnamed)');
  }
  return names;
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
  const sNames = texturedMaterials(sDoc);
  const oSet = new Set(texturedMaterials(oDoc));
  const dropped = sNames.filter((n) => !oSet.has(n));
  if (oSet.size < sNames.length) {
    failed = true;
    console.error(`FAIL ${tag}: baseColorTexture materials source=${sNames.length} output=${oSet.size} (dropped ${sNames.length - oSet.size})`);
    for (const n of dropped) console.error(`   dropped: ${n}`);
  } else {
    console.log(`OK   ${tag}: baseColorTexture materials source=${sNames.length} output=${oSet.size}`);
  }
}

if (failed) {
  console.error('\nTexture-parity check FAILED — optimize dropped textures; not committing meshes.');
  process.exit(1);
}
console.log('\nTexture-parity check passed.');
