// sim.js — pure race simulation & odds model for Grid of Legends.
//
// No DOM, no three.js, no globals: imports cleanly in Node so the model can be
// tested headlessly (see sim.test.mjs). game.js consumes these to build each
// race and to price the betting markets, so the browser and the tests run the
// exact same maths.
//
// Determinism: everything is driven by a seeded PRNG. Given the same seed the
// setup and every Monte-Carlo trial reproduce byte-for-byte. The RNG draw ORDER
// here is identical to the original inline code in game.js (verified against a
// snapshot of the shipped model) — do not reorder draws without re-verifying.

// ---- seeded PRNG (mulberry32-style; was `$` in game.js) ----
export function mkRng(seed) {
  let n = seed | 0;
  return function () {
    n |= 0; n = (n + 1831565813) | 0;
    let t = Math.imul(n ^ (n >>> 15), 1 | n);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Fisher–Yates shuffle using a supplied rng (was `ft`) ----
export function shuffle(arr, rng) {
  const o = arr.slice();
  for (let s = o.length - 1; s > 0; s--) {
    const r = Math.floor(rng() * (s + 1));
    [o[s], o[r]] = [o[r], o[s]];
  }
  return o;
}

// ---- tyre compound table for a given race length (laps) ----
// S=soft, M=medium, H=hard. m = pace multiplier, w = wear rate, cliff = the age
// (in laps) past which degradation accelerates, life ~ usable stint length.
export function buildCompounds(laps) {
  const LF = { S: 0.30, M: 0.52, H: 0.78 };   // fraction-of-race life
  const CL = { S: "#ff5252", M: "#ffd24a", H: "#e8e8ee" };
  const MU = { S: 1.045, M: 1, H: 0.966 };    // fresh-pace multiplier
  const C = {};
  for (const k in LF) {
    const cl = Math.max(1, laps * LF[k]);
    C[k] = { m: MU[k], w: 0.075 / cl, cliff: cl, col: CL[k], life: cl };
  }
  return C;
}

// ---- pure race setup (the deterministic half of game.js `zt`) ----
// Returns ratings, the starting grid, per-driver pace/form/stop-strategy, and
// which cars are scripted to crash (as a fraction of race distance — the caller
// multiplies by raceDist, which is track-dependent). No track geometry needed.
//
// The RNG is consumed in this exact order: ratings (2 draws/car), then per
// driver in index order [form, big, react, two, first, <stop branch draws>],
// then nc, then the crash shuffle + one draw per crashing car.
export function setupRace({ seed, laps, S, order, grid }) {
  const rng = mkRng(seed >>> 0);

  // ratings + qualifying-noise order
  const ratings = new Array(S);
  const rt = [];
  for (let c = 0; c < S; c++) {
    const r0 = 0.975 + rng() * 0.05;
    ratings[c] = r0;
    rt.push({ c, v: r0 + (rng() - 0.5) * 0.06 });
  }
  rt.sort((x, y) => y.v - x.v);
  // grid override (from qualifying) wins if supplied; else the ratings order
  const startGrid = (grid && grid.length === S) ? grid.slice() : rt.map(x => x.c);

  const comps = buildCompounds(laps);
  const LFm = { S: 0.30, M: 0.52, H: 0.78 };
  const lifeL = k => Math.max(1, Math.round(laps * LFm[k]));

  const drivers = new Array(S);
  for (let idx = 0; idx < S; idx++) {
    const rating = ratings[idx];
    const gridPos = startGrid.indexOf(idx);
    const gridKink = 0.05 * gridPos + 1.9 * Math.pow(Math.max(0, gridPos - 5), 1.5);
    const pace = rating * (1 - 0.0025 * gridKink);
    const form = 1 + (rng() - 0.5) * 0.02;
    const big = rng() < 0.05 ? 1.06 : 1;
    const laneBias = (gridPos % 2 ? 1 : -1) * (0.5 + gridPos / S * 0.5);
    const react = 0.5 + rng() * 1.1;

    // stop strategy
    const two = rng() < (laps >= 8 ? 0.5 : 0.25);
    const first = rng() < 0.6 ? "S" : "M";
    let stops;
    if (two) {
      const c2 = rng() < 0.5 ? "S" : "M";
      const c3 = rng() < 0.5 ? "M" : "H";
      const l1 = Math.max(1, Math.min(Math.max(1, laps - 2), Math.round(lifeL(first) * (0.75 + rng() * 0.45))));
      const l2 = Math.max(l1 + 1, Math.min(Math.max(2, laps - 1), l1 + Math.round(lifeL(c2) * (0.75 + rng() * 0.45))));
      stops = [{ lap: l1, c: c2 }, { lap: l2, c: c3 }];
    } else {
      const c2 = first === "S" ? (rng() < 0.6 ? "M" : "H") : "H";
      const l1 = Math.max(1, Math.min(Math.max(1, laps - 1), Math.round(lifeL(first) * (0.8 + rng() * 0.5))));
      stops = [{ lap: l1, c: c2 }];
    }

    drivers[idx] = {
      rating, gridPos, pace, form, big, react, laneBias,
      comp: first, age: 0, stops
    };
  }

  const nc = (q => q < 0.3 ? 0 : q < 0.7 ? 1 : 2)(rng());
  const crashes = shuffle([...Array(S).keys()], rng).slice(0, nc)
    .map(v => ({ car: v, atFrac: 0.2 + rng() * 0.65, done: false }));

  return { seed: seed >>> 0, laps, S, comps, grid: startGrid, drivers, crashes };
}

// ---- one Monte-Carlo trial: score every car, sort, return finishing order ----
// `rng` must be a fresh per-trial PRNG. Returns the sorted score list (best
// first), the finishing order of car indices, and the DNF count. Draw order:
// scA, then per car [big, score-noise, dnf], then (if scA) one draw per car.
export function simRaceOnce(rng, race) {
  const { drivers, comps, laps, S } = race;
  const sc = [];
  let dnf = 0;
  const scA = rng() < 0.7;                      // safety-car this trial?
  for (let c = 0; c < S; c++) {
    const a = drivers[c], cp = comps[a.comp];
    let age = 0, tsum = 0;
    const big = rng() < 0.05 ? 1.06 : 1;
    for (let L = 0; L < laps; L++) {
      const wear = Math.min(0.14, cp.w * Math.pow(age, 1.3) + (age > cp.cliff ? 0.012 * (age - cp.cliff) : 0));
      tsum += 1 / (a.rating * big * cp.m * (1 - wear));
      age++;
    }
    let score = -tsum * 100
      - (0.05 * a.gridPos + 1.9 * Math.pow(Math.max(0, a.gridPos - 5), 1.5))
      - a.stops.length * 0.55
      + (rng() - 0.5) * 32;
    if (rng() < 0.055) { score -= 999; dnf++; }  // retirement
    sc.push({ c, s: score });
  }
  if (scA) {                                     // safety car compresses the field
    let m = 0;
    for (let z = 0; z < S; z++) m += sc[z].s;
    m /= S;
    for (let z = 0; z < S; z++) sc[z].s = m + (sc[z].s - m) * 0.85 + (rng() - 0.5) * 8;
  }
  sc.sort((x, y) => y.s - x.s);
  return { sc, order: sc.map(x => x.c), dnf, classified: S - dnf };
}

// ---- Monte-Carlo odds (was `mcOdds`) ----
// Aggregates `trials` trials into win / podium / head-to-head / over-under
// markets. Same output shape game.js expects: o[c] win odds, o.pod[c], o.h2h
// (flat S*S prob matrix), o.ou {line,over,under}. Pass {diag:true} to also get
// raw win/position/classified tallies for calibration tests.
export function mcOdds(race, trials, opts) {
  trials = trials || 1100;
  const { S } = race;
  const res = new Array(S).fill(0);
  const posSum = new Array(S).fill(0);
  const podC = new Array(S).fill(0);
  const h2hC = new Array(S * S).fill(0);
  const classC = new Array(S + 1).fill(0);
  const pos = new Array(S);

  for (let it = 0; it < trials; it++) {
    const rng = mkRng((race.seed ^ (it * 2654435761)) >>> 0);
    const { sc, dnf } = simRaceOnce(rng, race);
    for (let k = 0; k < sc.length; k++) { posSum[sc[k].c] += k + 1; pos[sc[k].c] = k; }
    res[sc[0].c]++;
    for (let k = 0; k < 3; k++) podC[sc[k].c]++;
    for (let A = 0; A < S; A++) for (let B = 0; B < S; B++) if (pos[A] < pos[B]) h2hC[A * S + B]++;
    classC[S - dnf]++;
  }

  const ep = [];
  for (let c = 0; c < S; c++) ep.push({ c, p: res[c] / trials, ap: posSum[c] / trials });
  const apMin = Math.min.apply(null, ep.map(x => x.ap));
  const apMax = Math.max.apply(null, ep.map(x => x.ap));
  const o = {};
  const GAM = 0.85, OVR = 1.07, raw = [];
  let sm = 0;
  for (const x of ep) {
    const ps = 1 - (x.ap - apMin) / Math.max(0.001, apMax - apMin);
    const v = Math.max(0.004, 0.6 * x.p + 0.4 * Math.pow(ps, 1.6) * 0.25);
    raw.push(v); sm += v;
  }
  let s2 = 0;
  const pw = raw.map(v => { const q = Math.pow(v / sm, GAM); s2 += q; return q; });
  for (let c = 0; c < S; c++) o[c] = Math.max(1.08, Math.min(99, 1 / ((pw[c] / s2) * OVR)));
  o.pod = {};
  for (let c = 0; c < S; c++) o.pod[c] = Math.max(1.08, Math.min(99, 1 / (Math.max(0.01, podC[c] / trials) * OVR)));
  o.h2h = h2hC.map(v => v / trials);
  {
    const cP = new Array(S + 1).fill(0);
    cP[S] = 0.3; cP[S - 1] = 0.4; cP[S - 2] = 0.3;
    let bestLine = (S - 1) + 0.5, bestD = 9;
    for (let ln = 1.5; ln < S; ln += 1) {
      let po = 0;
      for (let kk = Math.ceil(ln); kk <= S; kk++) po += cP[kk];
      if (Math.abs(po - 0.5) < bestD) { bestD = Math.abs(po - 0.5); bestLine = ln; }
    }
    let pOver = 0;
    for (let k2 = Math.ceil(bestLine); k2 <= S; k2++) pOver += cP[k2];
    pOver = Math.max(0.03, Math.min(0.97, pOver));
    o.ou = {
      line: bestLine,
      over: Math.max(1.08, Math.min(99, 1 / (pOver * OVR))),
      under: Math.max(1.08, Math.min(99, 1 / ((1 - pOver) * OVR)))
    };
  }
  if (opts && opts.diag) o.diag = { win: res, posSum, classC, trials };
  return o;
}

// ---- pit-loss model (real seconds) ----
// Standalone physical estimate of the time a green-flag pit stop costs: crawl
// the pit lane at the speed limit + the stationary service time, minus the time
// the same distance would have taken at racing speed. Not yet coupled to the
// odds model (which uses an abstract stop penalty); exposed for tuning/tests.
export const PIT_MODEL = {
  laneLength_m: 350,   // pit lane length under the limit
  pitLimit_kmh: 70,    // pit-lane speed limit
  stationary_s: 2.6,   // tyres off/on (stopped)
  approach_kmh: 285    // racing speed past the pits if you'd stayed out
};
export function pitLossSeconds(cfg = PIT_MODEL) {
  const pit = cfg.pitLimit_kmh / 3.6;      // m/s
  const race = cfg.approach_kmh / 3.6;     // m/s
  const throughPit = cfg.laneLength_m / pit + cfg.stationary_s;
  const throughRacing = cfg.laneLength_m / race;
  return throughPit - throughRacing;
}
