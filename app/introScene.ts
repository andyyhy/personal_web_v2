/**
 * Opening animation for the landing page.
 *
 * A thread appears alone in the dark, drifting on slow currents; later, far
 * away, another. They notice each other: everything holds its breath, one
 * turns toward the other, and the other follows. They curve toward each other
 * and pass, close enough almost to touch. The one who noticed first turns
 * back in a wide arc; the other drifts on, as if waiting, until they are side
 * by side. They travel together, weaving loosely and unevenly across each
 * other like two threads in water, and their tips bloom into two souls that
 * circle closer and closer until they become one. Their light floods the
 * screen and stays, until it cuts to pitch black, and the page's text emerges,
 * very slowly, from the dark where they met.
 *
 * Each thread is a small rope simulation drifting in a gently swirling
 * current. Its tip swims, steered with a limited turning circle so its path is
 * always a smooth curve, and the body follows, sliding along its length more
 * easily than sideways, as a thread in water does.
 *
 * Positions are in "stage units": 1 unit is the shorter side of the screen and
 * (0, 0) is its centre, so the scene composes the same on any screen.
 */

export type Point = { x: number; y: number };
type RGB = readonly [number, number, number];

export interface IntroCallbacks {
  /** Time for the text to appear, at this point (CSS px from the viewport's top-left). */
  onReveal: (at: Point) => void;
  /** The intro has finished, or was skipped, and can be removed. */
  onDone: () => void;
}

// Timeline in seconds. The text starts to emerge at `reveal` and is fully
// there before 30 seconds.
const T = {
  dustIn: 1.8, // the abyss: only faint dust at first
  aIn: 1.2, // one thread appears, alone...
  aInEnd: 3.0,
  bIn: 3.8, // ...later, far away, another
  bInEnd: 5.4,
  notice: 8.4, // they sense each other; everything holds its breath
  noticeA: 8.6, // one turns toward the other...
  noticeB: 9.2, // ...and the other follows
  turn: 1.4, // how long turning toward each other takes
  pass: 12.2, // they pass each other, close enough almost to touch...
  touch: 14.2, // ...one turns back and comes alongside the other (about then)
  soul: 18.0, // their tips bloom into souls
  soulFull: 19.0,
  plunge: 20.0, // the final spiral in
  merge: 20.8, // the two become one; a calm moment
  swell: 21.4, // their light floods out...
  white: 22.8, // ...until the screen is white, and stays
  cut: 24.2, // then, all of a sudden, pitch black
  reveal: 25.2, // the text emerges, very slowly, from the dark
} as const;

// Barely-there tints: one soul a touch warm, the other a touch cool.
const WARM: RGB = [248, 243, 234];
const COOL: RGB = [232, 239, 248];
const WHITE: RGB = [255, 255, 255];

const TAU = Math.PI * 2;
const STEP = 1 / 240; // fixed simulation step, so motion is the same at any frame rate
const ROPE = 60; // points per thread
const POINTS = 2 * (ROPE - 1) + 1; // points per drawn thread (smoothed between rope points)

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const angleDiff = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Smooth random wandering in about [-1, 1], at roughly `hz` cycles a second. */
const makeNoise = (hz: number) => {
  const f1 = rand(0.7, 1.3) * hz * TAU, f2 = rand(1.7, 2.3) * hz * TAU, f3 = rand(3, 3.8) * hz * TAU;
  const p1 = rand(0, TAU), p2 = rand(0, TAU), p3 = rand(0, TAU);
  return (t: number) =>
    0.55 * Math.sin(f1 * t + p1) + 0.3 * Math.sin(f2 * t + p2) + 0.15 * Math.sin(f3 * t + p3);
};

/** A soft round glow, drawn scaled wherever light is needed. */
function glowSprite(c: RGB, alphas: number[]): HTMLCanvasElement {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  [0, 0.18, 0.42, 0.7, 1].forEach((stop, i) =>
    grd.addColorStop(stop, rgba(c, alphas[i]))
  );
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return canvas;
}

/** Heartbeat shape: a "lub-dub" for each cycle of `ph`. */
function beat(ph: number) {
  const x = ph - Math.floor(ph);
  return (
    Math.exp(-(((x - 0.08) / 0.045) ** 2)) +
    0.55 * Math.exp(-(((x - 0.25) / 0.06) ** 2))
  );
}

/** Drama builds steadily from the moment they notice each other until the merge. */
const intensityAt = (t: number) => Math.pow(clamp((t - T.notice) / (T.merge - T.notice)), 1.6);

/** 1 while everything holds its breath, as they notice each other. */
const hesitationAt = (t: number) =>
  smooth(T.notice - 0.4, T.notice + 0.1, t) * (1 - smooth(T.notice + 0.4, T.notice + 1.3, t));

/** The final light: 0 → 1, slow at first, then flooding the screen. */
const swellAt = (t: number) => Math.pow(clamp((t - T.swell) / (T.white - T.swell)), 2.2);

// Stacked glow layers around each thread: [width multiplier, alpha].
const GLOW = [
  [14, 0.008],
  [8.5, 0.016],
  [5, 0.03],
  [3, 0.055],
  [1.8, 0.1],
] as const;

interface Buffers {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  nx: Float32Array;
  ny: Float32Array;
  w: Float32Array;
  occ: Float32Array;
  front: Float32Array;
  bead: Float32Array;
  n: number;
}

const makeBuffers = (): Buffers => ({
  x: new Float32Array(POINTS),
  y: new Float32Array(POINTS),
  z: new Float32Array(POINTS),
  nx: new Float32Array(POINTS),
  ny: new Float32Array(POINTS),
  w: new Float32Array(POINTS),
  occ: new Float32Array(POINTS),
  front: new Float32Array(POINTS),
  bead: new Float32Array(POINTS),
  n: 0,
});

interface Rope {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  px: Float32Array;
  py: Float32Array;
  z: Float32Array; // depth along the thread while interweaving: > 0 passes in front
}

interface Thread {
  rope: Rope; // point 0 is the tip
  L: number; // full length
  heading: number; // the tip swims this way...
  speed: number; // ...this fast, and drifts with the current too
  dir: number;
  z: number;
  vel: Point; // the tip's velocity, smoothed
  last: Point; // the tip a step ago
  tint: RGB;
  sprite: HTMLCanvasElement;
  appear: [number, number]; // when it fades in
  noticeAt: number; // when it turns toward the other
  swim: { amp: number; wander: (t: number) => number; speed: number };
  wobble: (t: number) => number; // keeps its approach from being a straight line
  target: Point; // where the tip is being drawn to while they dance
  prevTarget: Point;
  heart: { ph: number; f: number; bias: number };
  pulses: number[];
  echoes: Point[];
  echoClock: number;
  wispDebt: number;
  buf: Buffers;
}

interface Dance {
  C: Point; // the point they weave around, travelling
  ct: number; // the way it travels
  V0: number; // how fast they were going when they joined
  phi: number; // how far they've woven round each other
  side: number;
  spin: number;
  R0: number; // how far apart they were when they joined (half of it)
  R: number;
  beta: number; // the angle their weaving is seen from: 0 = side on, 1 = face on
  start: number;
  offA: Point; // where each tip was, relative to its place in the weave, as they
  offB: Point; // joined: faded out, so the weave begins exactly where they are
  meander: (t: number) => number;
  twist: (t: number) => number;
  breath: (t: number) => number;
  tilt: (t: number) => number;
  asym: (t: number) => number;
}

interface Mote { x: number; y: number; vx: number; vy: number; d: number; r: number; tw: number; tp: number }
interface Wisp { x: number; y: number; vx: number; vy: number; born: number; life: number; r0: number; r1: number; a: number; sprite: HTMLCanvasElement }

export function startIntro(canvas: HTMLCanvasElement, cb: IntroCallbacks): () => void {
  const ctx = canvas.getContext("2d");
  let W = 1, H = 1, U = 1, HX = 0.5, HY = 0.5, DPR = 1, SF = 1;

  const measure = () => {
    W = Math.max(1, canvas.clientWidth || window.innerWidth);
    H = Math.max(1, canvas.clientHeight || window.innerHeight);
    U = Math.min(W, H);
    HX = W / 2 / U;
    HY = H / 2 / U;
    SF = clamp(U / 800, 0.8, 1.8);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(W * DPR);
    const ch = Math.round(H * DPR);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
  };
  measure();

  const toScreen = (p: Point): Point => ({ x: W / 2 + p.x * U, y: H / 2 + p.y * U });

  // No canvas, or the visitor asked for less motion: go straight to the text.
  if (!ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cb.onReveal({ x: W / 2, y: H / 2 });
    cb.onDone();
    return () => {};
  }

  const ro = new ResizeObserver(measure);
  ro.observe(canvas);

  /** CSS pixels → stage units, a little larger on big screens. */
  const px = (n: number) => (n * SF) / U;

  const sprites = new Map<RGB, HTMLCanvasElement>(
    [WARM, COOL, WHITE].map((c) => [c, glowSprite(c, [1, 0.5, 0.16, 0.04, 0])])
  );
  const fog = glowSprite(WHITE, [1, 0.62, 0.26, 0.07, 0]);

  // --- The water: a slowly swirling current everything drifts in -----------------

  const waves = [
    [1.6, 0.02],
    [1.0, 0.014],
    [0.55, 0.009],
    [0.32, 0.006],
  ].map(([lambda, speed]) => {
    const k = TAU / lambda, a = rand(0, TAU);
    return {
      kx: Math.cos(a) * k,
      ky: Math.sin(a) * k,
      amp: speed / k,
      w: rand(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1),
      p: rand(0, TAU),
    };
  });
  let calm = 1; // the current stills while they notice each other
  const flow: Point = { x: 0, y: 0 };
  /** The current at (x, y), plus a gentle push back from the screen's edges. */
  const flowAt = (x: number, y: number, t: number) => {
    let vx = 0, vy = 0;
    for (const w of waves) {
      // Velocity of a stream function: swirls, never sources or sinks.
      const c = Math.cos(w.kx * x + w.ky * y + w.w * t + w.p) * w.amp * calm;
      vx += c * w.ky;
      vy -= c * w.kx;
    }
    const mx = HX - 0.06, my = HY - 0.06;
    if (Math.abs(x) > mx) vx -= Math.sign(x) * (Math.abs(x) - mx) * 3;
    if (Math.abs(y) > my) vy -= Math.sign(y) * (Math.abs(y) - my) * 3;
    flow.x = vx;
    flow.y = vy;
    return flow;
  };

  // --- The two threads, somewhere new every time -----------------------------------

  const tints: RGB[] = Math.random() < 0.5 ? [WARM, COOL] : [COOL, WARM];

  /** A point toward the screen edge in direction `a`, `frac` of the way there. */
  const onSide = (a: number, frac: number): Point => {
    const ex = HX - 0.16, ey = HY - 0.16;
    const c = Math.cos(a), s = Math.sin(a);
    const k = Math.min(ex / Math.max(Math.abs(c), 1e-6), ey / Math.max(Math.abs(s), 1e-6));
    return { x: c * k * frac, y: s * k * frac };
  };

  const makeThread = (head: Point, tint: RGB, appear: [number, number], noticeAt: number): Thread => {
    const toCentre = Math.atan2(-head.y, -head.x);
    const dir = toCentre + (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 1.4);
    const L = rand(0.4, 0.5);
    const seg = L / (ROPE - 1);
    const rope: Rope = {
      x: new Float32Array(ROPE),
      y: new Float32Array(ROPE),
      vx: new Float32Array(ROPE),
      vy: new Float32Array(ROPE),
      px: new Float32Array(ROPE),
      py: new Float32Array(ROPE),
      z: new Float32Array(ROPE),
    };
    // Lay it out behind its tip as a gentle, random curve that stays on screen.
    let x = head.x, y = head.y, a = dir + Math.PI;
    const bend = rand(2, 4.5) * (Math.random() < 0.5 ? -1 : 1);
    const bendFreq = TAU / (L * rand(0.8, 1.4));
    const bendPhase = rand(0, TAU);
    for (let i = 0; i < ROPE; i++) {
      rope.x[i] = x;
      rope.y[i] = y;
      a += bend * Math.sin(i * seg * bendFreq + bendPhase) * seg;
      let nx = x + Math.cos(a) * seg, ny = y + Math.sin(a) * seg;
      for (let guard = 0; guard < 24 && (Math.abs(nx) > HX - 0.04 || Math.abs(ny) > HY - 0.04); guard++) {
        a += angleDiff(Math.atan2(-y, -x), a) * 0.25;
        nx = x + Math.cos(a) * seg;
        ny = y + Math.sin(a) * seg;
      }
      x = nx;
      y = ny;
    }
    return {
      rope,
      L,
      heading: dir,
      speed: 0.015,
      dir,
      z: 0,
      vel: { x: 0, y: 0 },
      last: { ...head },
      tint,
      sprite: sprites.get(tint)!,
      appear,
      noticeAt,
      swim: { amp: rand(0.4, 0.8), wander: makeNoise(0.06), speed: rand(0.014, 0.022) },
      wobble: makeNoise(0.4),
      target: { ...head },
      prevTarget: { ...head },
      heart: { ph: rand(0, 1), f: 0.9, bias: 0 },
      pulses: [],
      echoes: [],
      echoClock: 0,
      wispDebt: 0,
      buf: makeBuffers(),
    };
  };

  const spawnAngle = rand(0, TAU);
  const threads = [
    makeThread(onSide(spawnAngle, rand(0.45, 0.8)), tints[0], [T.aIn, T.aInEnd], T.noticeA),
    makeThread(onSide(spawnAngle + Math.PI + rand(-0.6, 0.6), rand(0.45, 0.8)), tints[1], [T.bIn, T.bInEnd], T.noticeB),
  ];
  // Two hearts, out of step at first.
  threads[0].heart.bias = -rand(0.1, 0.2);
  threads[1].heart.bias = rand(0.1, 0.2);

  // Faint dust in the dark, for depth. It drifts on the same current.
  const dust: Mote[] = Array.from({ length: Math.round(clamp((W * H) / 9000, 40, 150)) }, () => {
    const d = rand(0.25, 1);
    return { x: rand(-HX, HX), y: rand(-HY, HY), vx: 0, vy: 0, d, r: px(rand(0.6, 1.5)) * (0.6 + 0.4 * d), tw: rand(0.3, 1.2), tp: rand(0, TAU) };
  });

  const wisps: Wisp[] = [];
  let plan: { qa: Point; qb: Point } | null = null; // where each heads to slip past the other
  let dance: Dance | null = null;
  let M: Point | null = null; // where they became one
  const pair: Point = { x: 0, y: 0 };
  const view: Point = { x: 0, y: 0 }; // where the view leans in toward
  let ripple = 0; // phase of the faint ripples running along the threads
  let lastDist = Infinity;
  let passAt = -1; // the moment they almost touched
  const passP: Point = { x: 0, y: 0 };
  let joinSide = 0; // which side of the other the follower comes alongside
  let waitHeading = 0; // the way the one who waits drifts on
  let touchAt = -1; // the moment they joined
  const touch: Point = { x: 0, y: 0 };

  // --- Choreography ------------------------------------------------------------------

  /** As they notice each other: aim each just past the other, so they nearly touch. */
  const planPass = () => {
    const [a, b] = threads;
    const ax = a.rope.x[0], ay = a.rope.y[0], bx = b.rope.x[0], by = b.rope.y[0];
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1e-6;
    const ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
    const miss = 0.085, over = clamp(d * 0.25, 0.12, 0.22);
    const inside = (p: Point) => ({
      x: clamp(p.x, -(HX - 0.14), HX - 0.14),
      y: clamp(p.y, -(HY - 0.14), HY - 0.14),
    });
    return {
      qa: inside({ x: mx + (nx * miss) / 2 + ux * over, y: my + (ny * miss) / 2 + uy * over }),
      qb: inside({ x: mx - (nx * miss) / 2 - ux * over, y: my - (ny * miss) / 2 - uy * over }),
    };
  };

  /** Side by side at last: weave on together from where they are. */
  const beginDance = (t: number): Dance => {
    const [a, b] = threads;
    const C = { x: (a.rope.x[0] + b.rope.x[0]) / 2, y: (a.rope.y[0] + b.rope.y[0]) / 2 };
    // Travel the way the one who waited is going.
    const ct = b.heading;
    const nx = -Math.sin(ct), ny = Math.cos(ct);
    const across = (a.rope.x[0] - C.x) * nx + (a.rope.y[0] - C.y) * ny;
    return {
      C,
      ct,
      V0: Math.max(0.06, b.speed),
      phi: 0,
      side: across > 0 ? -1 : 1,
      spin: Math.random() < 0.5 ? 1 : -1,
      R0: Math.max(0.012, Math.abs(across)),
      R: Math.max(0.012, Math.abs(across)),
      beta: 0.2,
      start: t,
      offA: { x: 0, y: 0 },
      offB: { x: 0, y: 0 },
      meander: makeNoise(0.12),
      twist: makeNoise(0.18),
      breath: makeNoise(0.22),
      tilt: makeNoise(0.15),
      asym: makeNoise(0.2),
    };
  };

  /** Moves the point they weave around, and where each tip is drawn to. */
  const danceStep = (d: Dance, t: number, dt: number) => {
    const since = t - d.start;
    const settle = smooth(T.soul, T.plunge - 0.2, t); // as souls, they drift to a stop

    // Travelling on together, unhurried, on a gently wandering path that
    // curves back toward the middle when it strays (never turning tighter
    // than a wide arc).
    const far = clamp((Math.hypot(d.C.x, d.C.y) - 0.08) / 0.27);
    d.ct += (0.2 * d.meander(t) + 0.65 * far * clamp(angleDiff(Math.atan2(-d.C.y, -d.C.x), d.ct), -1, 1)) * dt;
    const travel = lerp(d.V0, 0.085, smooth(0, 1.5, since)) * (1 - settle);
    const f = flowAt(d.C.x, d.C.y, t);
    // As souls, slowing down, they drift in toward the middle, where it ends.
    d.C.x += (Math.cos(d.ct) * travel + f.x * 0.4 * (1 - settle) - d.C.x * 0.3 * settle) * dt;
    d.C.y += (Math.sin(d.ct) * travel + f.y * 0.4 * (1 - settle) - d.C.y * 0.3 * settle) * dt;

    // Weaving loosely across each other, the gap breathing in and out; as
    // souls a little further apart, circling; then the plunge.
    let Rb = lerp(lerp(d.R0, 0.028, smooth(0, 1.2, since)), 0.045, smooth(T.soul - 0.5, T.soulFull, t));
    if (t > T.plunge) Rb *= 1 - Math.pow(clamp((t - T.plunge) / (T.merge - T.plunge)), 1.6);
    d.R = Rb * (1 + 0.2 * d.breath(t) * (1 - settle));

    // How fast they weave: unhurried and uneven; quicker as souls.
    let turns = (0.25 + 0.06 * d.twist(t)) * smooth(0, 1, since) + 0.7 * smooth(T.soul, T.plunge, t);
    if (t > T.plunge) turns *= Math.min(3, Math.pow(0.045 / Math.max(Rb, 0.008), 0.6));
    d.phi += d.spin * TAU * turns * dt;

    // Seen nearly side on while they travel (so they cross back and forth),
    // face on as souls (so they circle).
    d.beta = lerp(clamp(0.16 + 0.08 * d.tilt(t), 0.06, 0.26), 0.88, smooth(T.soul - 0.4, T.plunge, t));

    placeTargets(d, t);
  };

  /** Where each tip is drawn to, from the dance's current shape. */
  const placeTargets = (d: Dance, t: number) => {
    const since = t - d.start;
    const tx = Math.cos(d.ct), ty = Math.sin(d.ct);
    const cs = Math.cos(d.phi), sn = Math.sin(d.phi);
    const ox = (-ty * cs + tx * d.beta * sn) * d.R * d.side;
    const oy = (tx * cs + ty * d.beta * sn) * d.R * d.side;
    // Sometimes one swings wider than the other.
    const asym = 0.15 * d.asym(t) * (1 - smooth(T.soul, T.soulFull, t));
    const [a, b] = threads;
    const join = 1 - smooth(d.start, d.start + 1.5, t);
    a.prevTarget.x = a.target.x;
    a.prevTarget.y = a.target.y;
    b.prevTarget.x = b.target.x;
    b.prevTarget.y = b.target.y;
    a.target.x = d.C.x - ox * (1 + asym) + d.offA.x * join;
    a.target.y = d.C.y - oy * (1 + asym) + d.offA.y * join;
    b.target.x = d.C.x + ox * (1 - asym) + d.offB.x * join;
    b.target.y = d.C.y + oy * (1 - asym) + d.offB.y * join;
    // A circle seen at an angle: this is how far in front or behind each is.
    const depth = sn * d.side * Math.sqrt(Math.max(0, 1 - d.beta * d.beta)) * smooth(0, 0.8, since);
    a.z = -depth;
    b.z = depth;
  };

  // --- Motion ----------------------------------------------------------------------------

  /** On its own: a slow, lazy swim, turning away from the edges. */
  const desireFree = (th: Thread, t: number) => {
    const hx = th.rope.x[0], hy = th.rope.y[0];
    let h = th.dir + th.swim.amp * th.swim.wander(t);
    const edge = Math.max(Math.abs(hx) / (HX - 0.14), Math.abs(hy) / (HY - 0.14));
    if (edge > 0.75) h += angleDiff(Math.atan2(-hy, -hx), h) * clamp((edge - 0.75) / 0.25);
    const s = th.swim.speed * (1 - 0.85 * hesitationAt(t));
    return { vx: Math.cos(h) * s, vy: Math.sin(h) * s };
  };

  /** Swim to `(tx, ty)`, arriving about `timeLeft` from now, curving by `bend`. */
  const desireTo = (th: Thread, tx: number, ty: number, timeLeft: number, sMin: number, sMax: number, bend: number, t: number) => {
    const dx = tx - th.rope.x[0], dy = ty - th.rope.y[0], d = Math.hypot(dx, dy) || 1e-6;
    const s = clamp(d / Math.max(0.35, timeLeft), sMin, sMax);
    const h = Math.atan2(dy, dx) + (bend + 0.3 * th.wobble(t)) * clamp(d / 0.4);
    return { vx: Math.cos(h) * s, vy: Math.sin(h) * s };
  };

  /** While they dance: chase the moving target, matching its speed. */
  const desireDance = (th: Thread, t: number, dt: number) => {
    const kp = lerp(6, 30, smooth(T.soul, T.plunge, t));
    let fx = (th.target.x - th.prevTarget.x) / dt, fy = (th.target.y - th.prevTarget.y) / dt;
    const fs = Math.hypot(fx, fy);
    if (fs > 0.8) {
      fx *= 0.8 / fs;
      fy *= 0.8 / fs;
    }
    return { vx: fx + (th.target.x - th.rope.x[0]) * kp, vy: fy + (th.target.y - th.rope.y[0]) * kp };
  };

  /** Swim the tip: turn toward `h` no tighter than the turning circle allows. */
  const swimTip = (th: Thread, h: number, s: number, flowK: number, kappa: number, ks: number, t: number, dt: number) => {
    const maxTurn = kappa * th.speed * dt;
    th.heading += clamp(angleDiff(h, th.heading), -maxTurn, maxTurn);
    th.speed += (s - th.speed) * (1 - Math.exp(-dt * ks));
    const f = flowAt(th.rope.x[0], th.rope.y[0], t);
    th.rope.x[0] += (Math.cos(th.heading) * th.speed + f.x * flowK) * dt;
    th.rope.y[0] += (Math.sin(th.heading) * th.speed + f.y * flowK) * dt;
  };

  /** The body follows: drifting with the water, sliding along its length far
   *  more easily than sideways, held together and kept from kinking. */
  const ropeStep = (th: Thread, seg: number, t: number, dt: number) => {
    const r = th.rope;
    const ka = Math.exp(-dt * 1.2), kn = Math.exp(-dt * 14);
    for (let i = 1; i < ROPE; i++) {
      const f = flowAt(r.x[i], r.y[i], t);
      let tx = r.x[i - 1] - r.x[i], ty = r.y[i - 1] - r.y[i];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const rvx = r.vx[i] - f.x, rvy = r.vy[i] - f.y;
      const along = rvx * tx + rvy * ty;
      const nx = rvx - along * tx, ny = rvy - along * ty;
      r.vx[i] = f.x + along * ka * tx + nx * kn;
      r.vy[i] = f.y + along * ka * ty + ny * kn;
      r.px[i] = r.x[i] + r.vx[i] * dt;
      r.py[i] = r.y[i] + r.vy[i] * dt;
    }
    r.px[0] = r.x[0];
    r.py[0] = r.y[0];
    const minBend = seg * 1.94; // no joint bends more than about 28°
    for (let it = 0; it < 4; it++) {
      for (let i = 0; i < ROPE - 1; i++) {
        const dx = r.px[i + 1] - r.px[i], dy = r.py[i + 1] - r.py[i];
        const d = Math.hypot(dx, dy) || 1e-9;
        const k = (d - seg) / d;
        if (i === 0) {
          r.px[1] -= dx * k;
          r.py[1] -= dy * k;
        } else {
          r.px[i] += dx * k * 0.5;
          r.py[i] += dy * k * 0.5;
          r.px[i + 1] -= dx * k * 0.5;
          r.py[i + 1] -= dy * k * 0.5;
        }
      }
      for (let i = 0; i < ROPE - 2; i++) {
        const dx = r.px[i + 2] - r.px[i], dy = r.py[i + 2] - r.py[i];
        const d = Math.hypot(dx, dy) || 1e-9;
        if (d >= minBend) continue;
        const k = ((d - minBend) / d) * 0.5;
        if (i === 0) {
          r.px[2] -= dx * k;
          r.py[2] -= dy * k;
        } else {
          r.px[i] += dx * k * 0.5;
          r.py[i] += dy * k * 0.5;
          r.px[i + 2] -= dx * k * 0.5;
          r.py[i + 2] -= dy * k * 0.5;
        }
      }
    }
    for (let i = 1; i < ROPE; i++) {
      r.vx[i] = (r.px[i] - r.x[i]) / dt;
      r.vy[i] = (r.py[i] - r.y[i]) / dt;
      r.x[i] = r.px[i];
      r.y[i] = r.py[i];
    }
    // Depth travels down the thread as the tip draws it along.
    const moved = Math.hypot(r.x[0] - th.last.x, r.y[0] - th.last.y);
    const f = clamp(moved / seg);
    for (let i = ROPE - 1; i > 0; i--) r.z[i] += (r.z[i - 1] - r.z[i]) * f;
    r.z[0] = th.z;
    th.vel.x = lerp(th.vel.x, (r.x[0] - th.last.x) / dt, 0.2);
    th.vel.y = lerp(th.vel.y, (r.y[0] - th.last.y) / dt, 0.2);
    th.last.x = r.x[0];
    th.last.y = r.y[0];
  };

  const updateHearts = (t: number, dt: number) => {
    const I = intensityAt(t);
    const [a, b] = threads;
    // As they close in, both hearts quicken and fall into step; once they are
    // one, their heart calms.
    const target = 0.85 + 1.6 * I - 1.1 * smooth(T.merge, T.merge + 0.8, t);
    const pull = (4 * I * I) / TAU;
    const offset = Math.sin(TAU * (b.heart.ph - a.heart.ph));
    for (const [th, sign] of [[a, 1], [b, -1]] as const) {
      const hrt = th.heart;
      hrt.f += (target + hrt.bias * (1 - I) - hrt.f) * (1 - Math.exp(-dt * 1.5));
      const before = hrt.ph;
      hrt.ph += (hrt.f + pull * offset * sign) * dt;
      if (Math.floor(before - 0.02) !== Math.floor(hrt.ph - 0.02)) th.pulses.push(t);
    }
  };

  const step = (t: number, dt: number) => {
    calm = 1 - 0.75 * hesitationAt(t);
    const [a, b] = threads;
    if (!plan && t >= T.notice) plan = planPass();
    if (dance && t < T.merge) danceStep(dance, t, dt);
    if (dance && !M && t >= T.merge) M = { ...dance.C };

    const passed = passAt >= 0 || t >= T.pass + 0.6;
    if (passed && !joinSide) {
      // The follower comes alongside on whichever side it's already on.
      const cross = Math.cos(b.heading) * (a.rope.y[0] - b.rope.y[0]) - Math.sin(b.heading) * (a.rope.x[0] - b.rope.x[0]);
      joinSide = cross >= 0 ? 1 : -1;
      waitHeading = b.heading;
    }
    // The place beside the one who waited, where the follower is heading.
    const hbx = Math.cos(b.heading), hby = Math.sin(b.heading);
    const slotX = b.rope.x[0] - hby * joinSide * 0.045 - hbx * 0.02;
    const slotY = b.rope.y[0] + hbx * joinSide * 0.045 - hby * 0.02;

    const S = smooth(T.soul, T.soulFull, t);
    const absorb = 1 - smooth(T.merge - 0.3, T.merge, t); // tails are drawn into the souls
    for (const th of threads) {
      if (M) {
        th.rope.x[0] = M.x;
        th.rope.y[0] = M.y;
      } else if (dance) {
        const want = desireDance(th, t, dt);
        const tight = smooth(T.soul, T.plunge + 0.3, t);
        const ease = smooth(dance.start, dance.start + 1.5, t);
        swimTip(th, Math.atan2(want.vy, want.vx), Math.min(1.2, Math.hypot(want.vx, want.vy)), 0.3 * (1 - tight), lerp(lerp(25, 80, ease), 300, tight), lerp(10, 20, tight), t, dt);
      } else {
        // On its own until it notices the other, then drawn toward it (the first
        // to notice turns first): past each other, then one turns back.
        const free = desireFree(th, t);
        const drawn = plan ? smooth(th.noticeAt, th.noticeAt + T.turn, t) : 0;
        let vx = free.vx, vy = free.vy;
        if (plan && drawn > 0) {
          let want: { vx: number; vy: number };
          if (!passed) {
            const q = th === a ? plan.qa : plan.qb;
            want = desireTo(th, q.x, q.y, T.pass + 0.35 - t, 0.02, 0.22, 0.45, t);
          } else if (th === a) {
            // The follower: turn back, catch up, and match the other's pace.
            const gap = Math.hypot(slotX - a.rope.x[0], slotY - a.rope.y[0]);
            want = desireTo(th, slotX, slotY, T.touch + 0.2 - t, 0.07, 0.3, 0, t);
            if (gap < 0.12) {
              const s = b.speed + gap * 1.5;
              const h = Math.atan2(slotY - a.rope.y[0], slotX - a.rope.x[0]);
              want = { vx: Math.cos(h) * s, vy: Math.sin(h) * s };
            }
          } else {
            // The one who waits: drifts slowly on the way it was going, curving
            // gently away from the edges.
            const edge = Math.max(Math.abs(b.rope.x[0]) / (HX - 0.15), Math.abs(b.rope.y[0]) / (HY - 0.15));
            waitHeading += 0.35 * clamp((edge - 0.7) / 0.3) * clamp(angleDiff(Math.atan2(-b.rope.y[0], -b.rope.x[0]), waitHeading), -1, 1) * dt;
            want = { vx: Math.cos(waitHeading) * 0.065, vy: Math.sin(waitHeading) * 0.065 };
          }
          vx = lerp(vx, want.vx, drawn);
          vy = lerp(vy, want.vy, drawn);
        }
        swimTip(th, Math.atan2(vy, vx), Math.min(1.2, Math.hypot(vx, vy)), lerp(1, 0.35, drawn), 20, lerp(2.5, 5, drawn), t, dt);
      }
      const seg = Math.max(1e-4, (th.L * (1 - 0.72 * S) * absorb) / (ROPE - 1));
      ropeStep(th, seg, t, dt);
    }

    const ax = a.rope.x[0], ay = a.rope.y[0], bx = b.rope.x[0], by = b.rope.y[0];
    pair.x = (ax + bx) / 2;
    pair.y = (ay + by) / 2;
    // The almost-touch as they pass, then joining up.
    const dist = Math.hypot(bx - ax, by - ay);
    if (plan && !passed && t > T.noticeB + 1 && dist < 0.16 && dist > lastDist) {
      passAt = t;
      passP.x = pair.x;
      passP.y = pair.y;
    }
    lastDist = dist;
    if (!dance && passed && t > T.pass + 0.6) {
      const near = Math.hypot(slotX - ax, slotY - ay) < 0.035 && Math.cos(a.heading - b.heading) > 0.8;
      if (near || t >= T.touch + 1) {
        touchAt = t;
        touch.x = pair.x;
        touch.y = pair.y;
        dance = beginDance(t);
        // Start each target exactly on its tip, so nothing jumps.
        placeTargets(dance, t);
        dance.offA = { x: a.rope.x[0] - a.target.x, y: a.rope.y[0] - a.target.y };
        dance.offB = { x: b.rope.x[0] - b.target.x, y: b.rope.y[0] - b.target.y };
        for (const th of threads) {
          th.target.x = th.prevTarget.x = th.rope.x[0];
          th.target.y = th.prevTarget.y = th.rope.y[0];
        }
      }
    }
    const focus = M ?? pair;
    const lean = 1 - Math.exp(-dt / (M ? 0.3 : 1.2));
    view.x += (focus.x - view.x) * lean;
    view.y += (focus.y - view.y) * lean;
    updateHearts(t, dt);
  };

  // --- Particles -------------------------------------------------------------------------

  const update = (t: number, dt: number) => {
    const I = intensityAt(t);
    const L = swellAt(t);
    const S = smooth(T.soul, T.soulFull, t);
    const P = dance ? clamp(1 - (dance.R - 0.03) / 0.5) : 0;
    // Faint ripples run along the threads, flickering like flame once they're souls.
    ripple += TAU * (lerp(0.45, 1.3, P) + 1.5 * S) * dt;

    // Dust drifts with the current, is drawn into a slow swirl around the pair,
    // and at the end is pulled into the light.
    const spin = dance ? dance.spin : 1;
    const c = M ?? pair;
    const lag = 1 - Math.exp(-dt * 1.5);
    for (const m of dust) {
      const f = flowAt(m.x, m.y, t);
      let ax = 0, ay = 0;
      if (t > T.notice) {
        const dx = c.x - m.x, dy = c.y - m.y;
        const d = Math.hypot(dx, dy) + 0.08;
        const pull = (0.04 * I * I + 0.5 * L) / d, swirl = (0.06 * I * I * spin) / d;
        ax = (dx / d) * pull - (dy / d) * swirl;
        ay = (dy / d) * pull + (dx / d) * swirl;
      }
      m.vx += (f.x + ax - m.vx) * lag;
      m.vy += (f.y + ay - m.vy) * lag;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }

    // Souls shed soft wisps and leave fading afterimages (their shadows).
    if (S > 0.02 && t < T.merge) {
      for (const th of threads) {
        th.wispDebt += 50 * S * dt;
        while (th.wispDebt >= 1) {
          th.wispDebt -= 1;
          wisps.push({
            x: th.rope.x[0] + rand(-0.006, 0.006),
            y: th.rope.y[0] + rand(-0.006, 0.006),
            vx: -th.vel.x * 0.12 + rand(-0.03, 0.03),
            vy: -th.vel.y * 0.12 + rand(-0.03, 0.03),
            born: t,
            life: rand(0.5, 0.8),
            r0: rand(0.008, 0.014),
            r1: rand(0.03, 0.05),
            a: rand(0.04, 0.07),
            sprite: th.sprite,
          });
        }
        th.echoClock += dt;
        if (th.echoClock >= 0.05) {
          th.echoClock = 0;
          th.echoes.unshift({ x: th.rope.x[0], y: th.rope.y[0] });
          if (th.echoes.length > 6) th.echoes.pop();
        }
      }
    }
    for (let i = wisps.length - 1; i >= 0; i--) {
      const w = wisps[i];
      if (t - w.born > w.life) {
        wisps.splice(i, 1);
        continue;
      }
      const damp = Math.exp(-dt * 1.5);
      w.vx *= damp;
      w.vy *= damp;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
    }
    for (const th of threads) {
      while (th.pulses.length && t - th.pulses[0] > 0.6) th.pulses.shift();
    }
  };

  // --- Drawing -----------------------------------------------------------------------------

  /** The rope's points, with a smooth (Catmull–Rom) point between each pair. */
  const sampleRope = (th: Thread) => {
    const r = th.rope, buf = th.buf;
    let n = 0;
    for (let i = 0; i < ROPE - 1; i++) {
      const i0 = Math.max(0, i - 1), i3 = Math.min(ROPE - 1, i + 2);
      buf.x[n] = r.x[i];
      buf.y[n] = r.y[i];
      buf.z[n] = r.z[i];
      n++;
      buf.x[n] = (-r.x[i0] + 9 * r.x[i] + 9 * r.x[i + 1] - r.x[i3]) / 16;
      buf.y[n] = (-r.y[i0] + 9 * r.y[i] + 9 * r.y[i + 1] - r.y[i3]) / 16;
      buf.z[n] = (r.z[i] + r.z[i + 1]) / 2;
      n++;
    }
    buf.x[n] = r.x[ROPE - 1];
    buf.y[n] = r.y[ROPE - 1];
    buf.z[n] = r.z[ROPE - 1];
    buf.n = n + 1;
  };

  const normals = (buf: Buffers) => {
    const n = buf.n;
    for (let i = 0; i < n; i++) {
      const i0 = i > 0 ? i - 1 : i, i1 = i < n - 1 ? i + 1 : i;
      const dx = buf.x[i1] - buf.x[i0], dy = buf.y[i1] - buf.y[i0];
      const l = Math.hypot(dx, dy) || 1;
      buf.nx[i] = -dy / l;
      buf.ny[i] = dx / l;
    }
  };

  /** Fill a ribbon along the thread with the given full widths. */
  const ribbon = (buf: Buffers, widths: Float32Array, mul: number) => {
    const n = buf.n;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const hw = widths[i] * mul * 0.5;
      const x = buf.x[i] + buf.nx[i] * hw, y = buf.y[i] + buf.ny[i] * hw;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    for (let i = n - 1; i >= 0; i--) {
      const hw = widths[i] * mul * 0.5;
      ctx.lineTo(buf.x[i] - buf.nx[i] * hw, buf.y[i] - buf.ny[i] * hw);
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawSprite = (sprite: HTMLCanvasElement, x: number, y: number, r: number, alpha: number) => {
    if (r <= 0 || alpha <= 0.002) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - r, y - r, 2 * r, 2 * r);
  };

  const drawThreads = (t: number, P: number, G: number, S: number, I: number) => {
    const core = px(lerp(0.9, 3, Math.pow(P, 1.3)) * (1 + 0.5 * S));
    const gap = px(1.6);
    const amp = 0.005 * (1 - P) * (1 - S) + 0.003 * S;
    const beatAmp = 0.12 + 0.5 * I;

    for (const th of threads) {
      const buf = th.buf;
      sampleRope(th);
      const n = buf.n;
      normals(buf);
      // A faint ripple: still at the tip, freer toward the tail.
      for (let i = 1; i < n; i++) {
        const f = i / (n - 1);
        const off = amp * Math.pow(f, 0.8) * Math.sin(TAU * f * 2.2 - ripple);
        buf.x[i] += buf.nx[i] * off;
        buf.y[i] += buf.ny[i] * off;
      }
      normals(buf);
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        // Tapered at both ends while floating; heavier at the tip once it's a soul.
        const both = Math.pow(Math.sin(Math.PI * (0.02 + 0.96 * f)), 0.6);
        const comet = Math.pow(1 - f, 1.3) * Math.min(1, 0.45 + f * 10);
        const prof = lerp(both, comet, S);
        const z = buf.z[i];
        buf.w[i] = core * prof * (1 + 0.35 * z);
        // Where this thread passes in front, a thin dark edge hides the one
        // behind, so the crossings read as over-and-under.
        buf.occ[i] = z > 0 ? (buf.w[i] + 2 * gap * Math.min(1, prof * 3)) * Math.min(1, z * 2.5) : 0;
        buf.front[i] = Math.min(buf.w[i], buf.occ[i]);
      }
    }

    const fadeOf = (th: Thread) => smooth(th.appear[0], th.appear[1], t);
    // A soft brightening the moment each one notices the other.
    const awareOf = (th: Thread) => 1 + 0.6 * Math.exp(-(((t - th.noticeAt - 0.2) / 0.45) ** 2));
    const coreAlpha = (th: Thread) =>
      (0.6 + 0.4 * G) * fadeOf(th) * awareOf(th) * (1 + beatAmp * 0.6 * beat(th.heart.ph));

    for (const th of threads) {
      const buf = th.buf;
      const fadeIn = fadeOf(th);
      if (fadeIn <= 0) continue;
      const hb = 1 + beatAmp * 0.6 * beat(th.heart.ph);
      ctx.globalAlpha = 1;
      // Stacked layers, wide and faint to narrow and brighter, read as a soft glow.
      const glow = (0.25 + 0.75 * G) * fadeIn * hb * awareOf(th);
      for (const [width, alpha] of GLOW) {
        ctx.fillStyle = rgba(th.tint, alpha * glow);
        ribbon(buf, buf.w, width);
      }
      ctx.fillStyle = rgba(th.tint, Math.min(1, coreAlpha(th)));
      ribbon(buf, buf.w, 1);

      // Each heartbeat sends a bead of light running along the thread to its tip.
      if (S < 1) {
        for (const start of th.pulses) {
          const q = (t - start) / 0.5;
          if (q < 0 || q > 1) continue;
          const centre = 1 - q;
          for (let i = 0; i < buf.n; i++) {
            const f = (i / (buf.n - 1) - centre) / 0.045;
            buf.bead[i] = Math.abs(f) < 2.5 ? buf.w[i] * 2.2 * Math.exp(-f * f) : 0;
          }
          ctx.fillStyle = rgba(th.tint, 0.55 * beatAmp * Math.sin(Math.PI * q) * fadeIn * (1 - S));
          ribbon(buf, buf.bead, 1);
        }
      }
    }

    // Over-and-under at the crossings.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    for (const th of threads) if (fadeOf(th) > 0) ribbon(th.buf, th.buf.occ, 1);
    ctx.globalCompositeOperation = "lighter";
    for (const th of threads) {
      if (fadeOf(th) <= 0) continue;
      ctx.fillStyle = rgba(th.tint, Math.min(1, coreAlpha(th) * 1.15));
      ribbon(th.buf, th.buf.front, 1);
    }
    ctx.globalAlpha = 1;
  };

  const drawSouls = (S: number, L: number) => {
    if (S <= 0) return;
    const grow = 1 + 1.5 * L;
    for (const th of threads) {
      const hx = th.rope.x[0], hy = th.rope.y[0];
      const hb = beat(th.heart.ph);
      const front = 1 + 0.2 * th.z;
      // Their shadows: fading afterimages trailing behind.
      th.echoes.forEach((e, i) => {
        const f = (i + 1) / (th.echoes.length + 1);
        drawSprite(th.sprite, e.x, e.y, (0.02 + 0.004 * i) * S, 0.24 * S * Math.pow(1 - f, 1.3));
      });
      drawSprite(th.sprite, hx, hy, (0.065 + 0.02 * hb) * S * front * grow, 0.2 * S * grow);
      drawSprite(th.sprite, hx, hy, (0.026 + 0.008 * hb) * S * front * grow, 0.8 * S);
      ctx.globalAlpha = S;
      ctx.fillStyle = rgba(th.tint, 1);
      ctx.beginPath();
      ctx.arc(hx, hy, px(2.8) * (0.5 + 0.5 * S) * front, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawMerged = (t: number, at: Point, L: number, hb: number) => {
    const a = smooth(T.merge - 0.04, T.merge + 0.03, t);
    if (a <= 0) return;
    const flare = Math.exp(-Math.max(0, t - T.merge) / 0.12);
    const breath = 1 + 0.08 * hb;
    const white = sprites.get(WHITE)!;
    drawSprite(white, at.x, at.y, (0.13 + 0.08 * flare + 0.35 * L) * breath, 0.5 * a);
    drawSprite(white, at.x, at.y, (0.045 + 0.12 * L) * breath, 0.9 * a);
    ctx.globalAlpha = a;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(at.x, at.y, px(3.2) * (1.3 + 3 * L), 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const render = (t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // After the cut: pitch black, nothing at all.
    if (t >= T.cut) return;

    const I = intensityAt(t);
    const S = smooth(T.soul, T.soulFull, t);
    const L = swellAt(t);
    // How close they are: thicker and brighter as they draw together.
    const gapNow = Math.hypot(threads[1].rope.x[0] - threads[0].rope.x[0], threads[1].rope.y[0] - threads[0].rope.y[0]);
    const P = clamp(1 - (gapNow - 0.06) / 0.6) * smooth(T.notice, T.notice + 2, t);
    const G = Math.max(P * 0.85, I);

    // The view leans in slowly toward them, and on into the light.
    const k = DPR * U;
    ctx.setTransform(k, 0, 0, k, (DPR * W) / 2, (DPR * H) / 2);
    const zoom = 1 + 0.07 * easeInOutCubic(I) + 0.06 * L;
    ctx.translate(view.x, view.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-view.x, -view.y);
    ctx.globalCompositeOperation = "lighter";

    // Their joined heartbeat.
    const hb = (beat(threads[0].heart.ph) + beat(threads[1].heart.ph)) / 2;
    const centre = M ?? pair;
    const white = sprites.get(WHITE)!;

    // A soft light gathers around the pair, breathing with their hearts.
    drawSprite(fog, centre.x, centre.y, 0.5 + 0.25 * I, (0.05 * I + 0.03 * I * hb) * (1 - L));

    // Dust.
    const dustFade = smooth(0, T.dustIn, t);
    ctx.fillStyle = "#fff";
    for (const m of dust) {
      const near = Math.exp(-((m.x - centre.x) ** 2 + (m.y - centre.y) ** 2) / 0.05);
      const alpha = (0.08 + 0.3 * I + 0.4 * L) * m.d * (0.55 + 0.45 * Math.sin(TAU * m.tw * t + m.tp)) * (1 + 1.5 * I * near) * dustFade;
      if (alpha < 0.004) continue;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, TAU);
      ctx.fill();
    }

    for (const w of wisps) {
      const f = (t - w.born) / w.life;
      drawSprite(w.sprite, w.x, w.y, lerp(w.r0, w.r1, f), w.a * S * Math.pow(1 - f, 1.5) * Math.min(1, f * 8));
    }

    if (t < T.merge + 0.02) {
      drawThreads(t, P, G, S, I);
      drawSouls(S, L);
      // Their tips light up as they notice each other.
      for (const th of threads) {
        const g = Math.exp(-(((t - th.noticeAt - 0.2) / 0.5) ** 2));
        drawSprite(th.sprite, th.rope.x[0], th.rope.y[0], 0.035, 0.45 * g * smooth(th.appear[0], th.appear[1], t));
      }
    }

    // A faint spark as they almost touch...
    if (passAt >= 0 && t - passAt < 1.2) {
      const f = (t - passAt) / 1.2;
      drawSprite(white, passP.x, passP.y, lerp(0.015, 0.07, 1 - (1 - f) ** 2), 0.22 * (1 - f) ** 2);
    }
    // ...and a soft bloom where they really do.
    if (touchAt >= 0 && t - touchAt < 1.4) {
      const f = (t - touchAt) / 1.4;
      const out = 1 - (1 - f) ** 3;
      drawSprite(white, touch.x, touch.y, lerp(0.02, 0.14, out), 0.4 * (1 - f) ** 2);
      ctx.globalAlpha = 0.12 * (1 - f) ** 2;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = px(1);
      ctx.beginPath();
      ctx.arc(touch.x, touch.y, lerp(0.01, 0.3, out), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (M) drawMerged(t, M, L, hb);

    // The light pours out of them, brighter and brighter, pulsing faintly with
    // their heartbeat, until the screen is white. It stays, still brightening
    // a touch, right up to the cut.
    if (L > 0) {
      const pulse = t < T.white ? 1 + 0.06 * hb : 1;
      drawSprite(fog, centre.x, centre.y, lerp(0.2, 2.6, Math.pow(L, 0.55)), Math.min(1, (0.12 + 1.2 * L) * pulse));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = Math.min(1, 0.9 * Math.pow(L, 1.7) * pulse + 0.1 * smooth(T.white, T.cut, t));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  // --- Loop --------------------------------------------------------------------------------

  // Let the threads settle into the current before anything is seen.
  for (let s = -1.5; s < 0; s += STEP) step(s, STEP);
  view.x = pair.x;
  view.y = pair.y;

  let t = 0;
  let acc = 0;
  let last = -1;
  let raf = 0;
  let stopped = false;
  let revealed = false;
  let skipAt = -1;

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    cb.onReveal(M ? toScreen(M) : { x: W / 2, y: H / 2 });
  };

  const finish = () => {
    if (stopped) return;
    stopped = true;
    cleanup();
    reveal();
    cb.onDone();
  };

  // A tap, click or key press skips ahead.
  const skip = () => {
    if (skipAt < 0) {
      skipAt = performance.now();
      reveal();
    }
  };

  const frame = (now: number) => {
    if (stopped) return;
    try {
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      acc += dt;
      while (acc >= STEP) {
        step(t, STEP);
        t += STEP;
        acc -= STEP;
      }
      update(t, dt);
      render(t);

      const opacity = skipAt >= 0 ? 1 - (now - skipAt) / 350 : 1;
      canvas.style.opacity = String(Math.max(0, opacity));
      if (t >= T.reveal || opacity <= 0) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    } catch {
      // Never leave the page without its text.
      finish();
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("pointerdown", skip);
    window.removeEventListener("keydown", skip);
  };

  window.addEventListener("pointerdown", skip);
  window.addEventListener("keydown", skip);
  raf = requestAnimationFrame(frame);

  return () => {
    stopped = true;
    cleanup();
  };
}
