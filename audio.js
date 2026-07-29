/* GOLAudio — standalone Web Audio engine for a 3D F1 racing game.
 * Global, no imports, no build step.  window.GOLAudio
 * Sound design: layered harmonic V10/V12 wail (stacked oscillators at
 * harmonic multiples of a firing frequency), rpm-tracked lowpass, 2-4kHz
 * bandpass scream, WaveShaper drive on load, stereo pan + inverse-square
 * distance, internal doppler from a computed closing rate.
 */
(function (global) {
  'use strict';

  var MAX_VOICES = 6;
  var HARM   = [1, 1.5, 2, 3, 4.5, 6];
  var WAVE   = ['sawtooth', 'sawtooth', 'square', 'sawtooth', 'square', 'sawtooth'];
  var HGAIN  = [1.00, 0.50, 0.62, 0.40, 0.24, 0.17];
  var HDET   = [0, 7, -6, 11, -9, 5];          // cents, chorus thickness
  var F_IDLE = 60, F_MAX = 420;                 // firing frequency range (Hz)
  var TC     = 0.035;                           // default setTargetAtTime constant
  var TC_F   = 0.012;                           // fast (pan / doppler)

  var ctx = null, ok = false, dead = false, enabled = true;
  var master = null, comp = null, engineBus = null, sfxBus = null;
  var noiseBuf = null, shaperCurve = null;
  var voices = [], byId = Object.create(null);
  var crowd = null;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }
  function at(param, v, tc) {
    try { param.setTargetAtTime(v, ctx.currentTime, tc || TC); }
    catch (e) { try { param.value = v; } catch (e2) {} }
  }

  function makeCurve() {
    var n = 1024, c = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(x * 2.2) * 0.85;         // gentle asymmetric-free soft clip
    }
    return c;
  }

  function makeNoise() {
    var len = Math.floor(ctx.sampleRate * 2), b = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;          // mild brown tilt
      d[i] = w * 0.6 + last * 2.2;
    }
    return b;
  }

  function panner() {
    if (ctx.createStereoPanner) return ctx.createStereoPanner();
    return null;                                 // degrade: mono
  }

  // ---- engine voice -------------------------------------------------------
  function buildVoice() {
    var v = {
      id: null, osc: [], og: [], busy: false, t: 0,
      dist: 1, lastDist: 1, lastT: 0, closing: 0
    };
    v.sum    = ctx.createGain();  v.sum.gain.value = 0.14;
    v.drive  = ctx.createGain();  v.drive.gain.value = 1;
    v.shaper = ctx.createWaveShaper(); v.shaper.curve = shaperCurve; v.shaper.oversample = '2x';
    v.lp     = ctx.createBiquadFilter(); v.lp.type = 'lowpass'; v.lp.frequency.value = 1200; v.lp.Q.value = 1.1;
    v.bp     = ctx.createBiquadFilter(); v.bp.type = 'bandpass'; v.bp.frequency.value = 2600; v.bp.Q.value = 6;
    v.bpg    = ctx.createGain();  v.bpg.gain.value = 0;
    v.air    = ctx.createGain();  v.air.gain.value = 0;      // induction/air noise
    v.airF   = ctx.createBiquadFilter(); v.airF.type = 'bandpass'; v.airF.frequency.value = 3000; v.airF.Q.value = 1.2;
    v.out    = ctx.createGain();  v.out.gain.value = 0;      // distance / release
    v.pan    = panner();

    for (var i = 0; i < HARM.length; i++) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = WAVE[i];
      o.frequency.value = F_IDLE * HARM[i];
      o.detune.value = HDET[i];
      g.gain.value = 0;
      o.connect(g); g.connect(v.sum);
      try { o.start(); } catch (e) {}
      v.osc.push(o); v.og.push(g);
    }
    var nz = ctx.createBufferSource();
    nz.buffer = noiseBuf; nz.loop = true;
    nz.connect(v.airF); v.airF.connect(v.air); v.air.connect(v.sum);
    try { nz.start(); } catch (e) {}
    v.noise = nz;

    v.sum.connect(v.drive); v.drive.connect(v.shaper);
    v.shaper.connect(v.lp); v.lp.connect(v.out);
    v.shaper.connect(v.bp); v.bp.connect(v.bpg); v.bpg.connect(v.out);
    if (v.pan) { v.out.connect(v.pan); v.pan.connect(engineBus); }
    else v.out.connect(engineBus);
    return v;
  }

  function freeVoice(v) {
    v.busy = false; v.id = null;
    at(v.out.gain, 0, 0.06);
    for (var i = 0; i < v.og.length; i++) at(v.og[i].gain, 0, 0.06);
    at(v.air.gain, 0, 0.06); at(v.bpg.gain, 0, 0.06);
  }

  function reap(now) {
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.busy && now - v.t > 0.45) { delete byId[v.id]; freeVoice(v); }
    }
  }

  function acquire(id, distance01) {
    var v = byId[id];
    if (v && v.busy && v.id === id) return v;
    var i, far = null;
    for (i = 0; i < voices.length; i++) if (!voices[i].busy) { v = voices[i]; break; }
    if (!v || v.busy) {
      for (i = 0; i < voices.length; i++) {
        if (!far || voices[i].dist > far.dist) far = voices[i];
      }
      // only steal from a car that is further away than this one (nearest 6 win)
      if (!far || far.dist <= distance01 + 0.02) return null;
      delete byId[far.id];
      v = far;
    }
    v.busy = true; v.id = id;
    v.dist = v.lastDist = distance01;
    v.lastT = ctx.currentTime; v.closing = 0;
    byId[id] = v;
    return v;
  }

  // ---- graph bootstrap ----------------------------------------------------
  function build() {
    master = ctx.createGain(); master.gain.value = enabled ? 0.9 : 0.0001;
    comp = ctx.createDynamicsCompressor();
    try {
      comp.threshold.value = -14; comp.knee.value = 24;
      comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.22;
    } catch (e) {}
    engineBus = ctx.createGain(); engineBus.gain.value = 0.85;
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
    engineBus.connect(master); sfxBus.connect(master);
    master.connect(comp); comp.connect(ctx.destination);

    shaperCurve = makeCurve();
    noiseBuf = makeNoise();
    for (var i = 0; i < MAX_VOICES; i++) voices.push(buildVoice());
  }

  // ---- public API ---------------------------------------------------------
  var API = {};

  API.init = function () {
    if (ok || dead) { if (ok) API.resume(); return ok; }
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) { dead = true; return false; }
      ctx = new AC();
      build();
      ok = true;
    } catch (e) { dead = true; ctx = null; return false; }
    API.resume();
    return true;
  };

  API.resume = function () {
    if (!ok || !ctx) return;
    try { if (ctx.state === 'suspended') ctx.resume(); } catch (e) {}
    if (enabled) at(master.gain, 0.9, 0.05);   // undo suspendAll's duck
  };

  API.setEnabled = function (on) {
    enabled = !!on;
    if (!ok) return;
    at(master.gain, enabled ? 0.9 : 0.0001, 0.05);
    if (enabled) API.resume();
  };

  API.isEnabled = function () { return enabled; };
  API.context = function () { return ctx; };

  /* engine(id, rpm01, load01, distance01, pan) */
  API.engine = function (id, rpm01, load01, distance01, pan) {
    if (!ok || !enabled) return;
    var now = ctx.currentTime;
    reap(now);

    var rpm = clamp(num(rpm01, 0), 0, 1);
    var load = clamp(num(load01, 0), 0, 1);
    var d = clamp(num(distance01, 1), 0, 1);
    var p = clamp(num(pan, 0), -1, 1);

    var v = acquire(String(id), d);
    if (!v) return;                      // beyond nearest-6 cap: silently skipped
    v.t = now;

    // doppler: closing rate = -d(distance)/dt, internally derived
    var dt = now - v.lastT;
    if (dt > 0.004) {
      var raw = (v.lastDist - d) / dt;             // >0 approaching
      v.closing += (clamp(raw, -6, 6) - v.closing) * 0.35;
      v.lastDist = d; v.lastT = now;
    }
    v.dist = d;
    var dop = clamp(v.closing * 34, -120, 120);    // cents

    var f = F_IDLE + (F_MAX - F_IDLE) * Math.pow(rpm, 0.92);
    var bright = 0.30 + 0.70 * rpm;

    for (var i = 0; i < HARM.length; i++) {
      at(v.osc[i].frequency, f * HARM[i], TC);
      at(v.osc[i].detune, HDET[i] + dop + (i % 2 ? 3 : -3) * rpm, TC_F);
      var g = HGAIN[i] * (i >= 2 ? bright : 1) * (0.75 + 0.35 * load);
      at(v.og[i].gain, g, TC);
    }

    at(v.lp.frequency, clamp((900 + Math.pow(rpm, 1.35) * 9500) * (0.75 + 0.45 * load), 200, 18000), TC);
    at(v.bp.frequency, 2000 + 2000 * rpm, TC);
    at(v.bpg.gain, 0.10 + 0.30 * rpm, TC);
    at(v.air.gain, 0.012 + 0.045 * rpm * (0.5 + 0.5 * load), TC);
    at(v.drive.gain, 1 + 2.6 * load * (0.4 + 0.6 * rpm), TC);

    // inverse-square-ish attenuation + slight near-field boost
    var atten = 1 / (1 + 26 * d * d);
    at(v.out.gain, clamp(atten * (0.55 + 0.45 * rpm), 0, 1), TC);
    if (v.pan) at(v.pan.pan, p * (0.35 + 0.65 * (1 - d)), TC_F);
  };

  API.releaseEngine = function (id) {
    if (!ok) return;
    var v = byId[String(id)];
    if (!v) return;
    delete byId[String(id)];
    freeVoice(v);
  };

  API.releaseAllEngines = function () {
    if (!ok) return;
    for (var k in byId) delete byId[k];
    for (var i = 0; i < voices.length; i++) freeVoice(voices[i]);
  };

  /* crowd(level01) — looping crowd bed */
  API.crowd = function (level01) {
    if (!ok || !enabled) return;
    var lv = clamp(num(level01, 0), 0, 1);
    if (!crowd) {
      var src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.55;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      var g  = ctx.createGain(); g.gain.value = 0;
      var lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.13;
      var lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(sfxBus);
      try { src.start(); lfo.start(); } catch (e) {}
      crowd = { g: g, bp: bp };
    }
    at(crowd.g.gain, lv * 0.30, 0.35);
    at(crowd.bp.frequency, 700 + 700 * lv, 0.4);
  };

  function burst(dur, filtType, f0, f1, Q, level, dest) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    s.playbackRate.value = 0.8 + Math.random() * 0.5;
    var bq = ctx.createBiquadFilter(); bq.type = filtType;
    var g = ctx.createGain();
    var t = ctx.currentTime;
    try {
      bq.frequency.setValueAtTime(f0, t);
      bq.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      if (Q) bq.Q.value = Q;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } catch (e) {}
    s.connect(bq); bq.connect(g); g.connect(dest || sfxBus);
    try { s.start(t); s.stop(t + dur + 0.05); } catch (e) {}
  }

  API.crash = function () {
    if (!ok || !enabled) return;
    var t = ctx.currentTime;
    burst(0.55, 'lowpass', 5200, 220, 0.8, 0.85);      // body / debris
    burst(0.30, 'bandpass', 3200, 1400, 3.5, 0.40);    // carbon crack
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    try {
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.42);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    } catch (e) {}
    o.connect(g); g.connect(sfxBus);
    try { o.start(t); o.stop(t + 0.55); } catch (e) {}
  };

  function tone(freq, dur, type, level, delay, glideTo) {
    if (!ok || !enabled) return;
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o2.type = 'sine';
    try {
      o.frequency.setValueAtTime(freq, t);
      o2.frequency.setValueAtTime(freq * 2, t);
      if (glideTo) {
        o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
        o2.frequency.exponentialRampToValueAtTime(glideTo * 2, t + dur);
      }
      o2.detune.value = 6;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 0.012);
      g.gain.setValueAtTime(level, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } catch (e) {}
    o.connect(g); o2.connect(g); g.connect(sfxBus);
    try { o.start(t); o2.start(t); o.stop(t + dur + 0.03); o2.stop(t + dur + 0.03); } catch (e) {}
  }

  API.pitBeep = function () { tone(1180, 0.09, 'square', 0.18); };

  /* startLights(n): n=1..5 formation beep, n=0 = lights-out tone */
  API.startLights = function (n) {
    if (!ok || !enabled) return;
    n = clamp(num(n, 0) | 0, 0, 5);
    if (n === 0) {
      tone(760, 0.85, 'sawtooth', 0.24, 0, 690);
      tone(1140, 0.85, 'square', 0.10, 0.0, 1035);
    } else {
      tone(560 + n * 8, 0.26, 'square', 0.22);
    }
  };

  API.suspendAll = function () {
    if (!ok || !ctx) return;
    API.releaseAllEngines();
    if (crowd) at(crowd.g.gain, 0, 0.05);
    at(master.gain, 0.0001, 0.03);
    try {
      var c = ctx;
      global.setTimeout(function () { try { c.suspend(); } catch (e) {} }, 90);
    } catch (e) { try { ctx.suspend(); } catch (e2) {} }
  };

  API.version = '1.0.0';
  global.GOLAudio = API;
})(typeof window !== 'undefined' ? window : this);
