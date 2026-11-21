/**
 * Opening animation for the landing page.
 *
 * A thread appears alone in the dark, then another, far away. Each drifts on
 * its own until they notice each other: everything holds its breath, one
 * turns toward the other, and the other follows. They draw closer, thickening
 * and brightening, touch, and interweave. Their tips bloom into two souls that
 * circle each other and become one. Their light floods the screen and stays,
 * until it cuts to pitch black, and the page's text slowly emerges from the
 * dark where they met.
 *
 * Everything is drawn on one canvas in "stage units": 1 unit is the shorter
 * side of the screen and (0, 0) is its centre, so the scene keeps the same
 * composition on a phone, a laptop or a 4K monitor.
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
// there by 20 seconds.
const T = {
  dustIn: 1.5, // the abyss: only faint dust at first
  aIn: 0.6, // one thread appears, alone...
  aInEnd: 2.2,
  bIn: 2.2, // ...then another, far away
  bInEnd: 3.6,
  notice: 5.4, // they sense each other; everything holds its breath
  noticeA: 5.5, // one turns toward the other...
  noticeB: 6.0, // ...and the other follows
  turn: 1.2, // how long turning toward each other takes
  approach: 6.8, // drawn toward each other
  approachFull: 8.4, // fully drawn into their dance
  travelStart: 8.0, // the pair starts travelling together
  twist: 9.0, // they start to twist around each other
  close: 9.8, // side by side and interweaving
  soul: 12.0, // their tips bloom into souls
  soulFull: 13.0,
  travelEnd: 13.6, // the pair settles at the meeting point
  plunge: 13.9, // the final spiral in
  merge: 14.6, // the two souls become one; a calm moment
  swell: 15.0, // their light floods out...
  white: 16.2, // ...until the screen is white, and stays
  cut: 17.3, // then, all of a sudden, pitch black
  reveal: 17.9, // the text emerges from the dark
} as const;

// Barely-there tints: one soul a touch warm, the other a touch cool.
const WARM: RGB = [248, 243, 234];
const COOL: RGB = [232, 239, 248];
const WHITE: RGB = [255, 255, 255];

const TAU = Math.PI * 2;
const STEP = 1 / 240; // fixed simulation step, so motion is the same at any frame rate
const POINTS = 80; // points per drawn thread

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

/** A cubic Bézier path, walked at constant speed. */
function makePath(p0: Point, p1: Point, p2: Point, p3: Point) {
  const at = (u: number): Point => {
    const v = 1 - u;
    const a = v * v * v,
      b = 3 * v * v * u,
      c = 3 * v * u * u,
      d = u * u * u;
    return {
      x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
      y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    };
  };
  const tangent = (u: number): Point => {
    const v = 1 - u;
    return {
      x: 3 * v * v * (p1.x - p0.x) + 6 * v * u * (p2.x - p1.x) + 3 * u * u * (p3.x - p2.x),
      y: 3 * v * v * (p1.y - p0.y) + 6 * v * u * (p2.y - p1.y) + 3 * u * u * (p3.y - p2.y),
    };
  };
  const samples = 128;
  const lengths = new Float32Array(samples + 1);
  let prev = p0;
  for (let i = 1; i <= samples; i++) {
    const p = at(i / samples);
    lengths[i] = lengths[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const total = lengths[samples];
  return (fraction: number) => {
    const target = clamp(fraction) * total;
    let lo = 0,
      hi = samples;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] < target) lo = mid;
      else hi = mid;
    }
    const span = lengths[hi] - lengths[lo] || 1;
    const u = (lo + (target - lengths[lo]) / span) / samples;
    return { p: at(u), d: tangent(u) };
  };
}

interface Buffers {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  nx: Float32Array;
  ny: Float32Array;
  prof: Float32Array;
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
  prof: new Float32Array(POINTS),
  w: new Float32Array(POINTS),
  occ: new Float32Array(POINTS),
  front: new Float32Array(POINTS),
  bead: new Float32Array(POINTS),
  n: 0,
});

interface Thread {
  /** Where the tip has been, oldest first. The thread is drawn along it. */
  hist: { x: number; y: number; z: number }[];
  free: Point; // where it would drift on its own
  freeVel: Point; // and how fast
  aim: Point; // where its tip is being drawn to
  head: Point; // where its tip actually is: follows `aim` softly
  spring: Point; // the tip's velocity while following
  vel: Point;
  z: number; // depth while interweaving: > 0 passes in front
  dir: number;
  heading: number; // direction it is drifting
  L: number;
  tint: RGB;
  sprite: HTMLCanvasElement;
  appear: [number, number]; // when it fades in
  noticeAt: number; // when it turns toward the other
  wander: { amp: number; f1: number; f2: number; p1: number; p2: number; speed: number };
  heart: { ph: number; f: number; bias: number };
  pulses: number[];
  echoes: Point[];
  echoClock: number;
  wispDebt: number;
  buf: Buffers;
}

interface Dance {
  M: Point; // where they meet
  path: (f: number) => { p: Point; d: Point };
  mid0: Point; // midpoint between them when the dance began
  drift: Point; // how far that midpoint drifted while the pull took over
  R0: number;
  v0: number; // how fast they were already closing in when the pull began
  rBraid: number;
  R: number;
  beta: number; // shape of their orbit as seen: 0 = side to side, 1 = a circle
  side: number;
  spin: number;
  phi: number;
  tan: Point;
}

interface Mote { x: number; y: number; vx: number; vy: number; d: number; r: number; tw: number; tp: number }
interface Wisp { x: number; y: number; vx: number; vy: number; born: number; life: number; r0: number; r1: number; a: number; sprite: HTMLCanvasElement }

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

const GLOW = [
  [14, 0.008],
  [8.5, 0.016],
  [5, 0.03],
  [3, 0.055],
  [1.8, 0.1],
] as const;

/** 1 while everything holds its breath, as they notice each other. */
const hesitationAt = (t: number) =>
  smooth(T.notice - 0.4, T.notice + 0.1, t) * (1 - smooth(T.notice + 0.4, T.notice + 1.2, t));

/** The final light: 0 → 1, slow at first, then flooding the screen. */
const swellAt = (t: number) => Math.pow(clamp((t - T.swell) / (T.white - T.swell)), 2.2);

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

  // --- The two threads, somewhere new every time -------------------------

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
    const L = rand(0.42, 0.52);

    // Lay the thread out behind its tip as a gentle, random curve that stays on screen.
    const hist: Thread["hist"] = [];
    const stepLen = 0.004;
    let x = head.x, y = head.y, a = dir + Math.PI;
    const bend = rand(2.5, 5) * (Math.random() < 0.5 ? -1 : 1);
    const bendFreq = TAU / (L * rand(0.8, 1.4));
    const bendPhase = rand(0, TAU);
    for (let i = 0, n = Math.ceil((L * 1.1) / stepLen); i < n; i++) {
      hist.push({ x, y, z: 0 });
      a += bend * Math.sin(i * stepLen * bendFreq + bendPhase) * stepLen;
      let nx = x + Math.cos(a) * stepLen, ny = y + Math.sin(a) * stepLen;
      for (let guard = 0; guard < 24 && (Math.abs(nx) > HX - 0.04 || Math.abs(ny) > HY - 0.04); guard++) {
        a += angleDiff(Math.atan2(-y, -x), a) * 0.25;
        nx = x + Math.cos(a) * stepLen;
        ny = y + Math.sin(a) * stepLen;
      }
      x = nx;
      y = ny;
    }
    hist.reverse();

    return {
      hist,
      free: { ...head },
      freeVel: { x: 0, y: 0 },
      aim: { ...head },
      head: { ...head },
      spring: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      z: 0,
      dir,
      heading: dir,
      L,
      tint,
      sprite: sprites.get(tint)!,
      appear,
      noticeAt,
      wander: { amp: rand(0.4, 0.7), f1: rand(0.25, 0.5), f2: rand(0.6, 0.9), p1: rand(0, TAU), p2: rand(0, TAU), speed: rand(0.03, 0.045) },
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

  // Faint dust in the dark, for depth. It stirs as the drama builds.
  const dust: Mote[] = Array.from({ length: Math.round(clamp((W * H) / 9000, 40, 150)) }, () => {
    const d = rand(0.25, 1);
    return { x: rand(-HX, HX), y: rand(-HY, HY), vx: rand(-0.01, 0.01), vy: rand(-0.01, 0.01), d, r: px(rand(0.6, 1.5)) * (0.6 + 0.4 * d), tw: rand(0.3, 1.2), tp: rand(0, TAU) };
  });

  const wisps: Wisp[] = [];
  let dance: Dance | null = null;
  const pair: Point = { x: 0, y: 0 };
  let ripple = 0; // phase of the ripples running along the threads
  let touchAt = -1; // when they first cross
  const touch: Point = { x: 0, y: 0 };

  // --- Choreography --------------------------------------------------------

  const beginDance = (): Dance => {
    const [a, b] = threads;
    const c0 = { x: (a.free.x + b.free.x) / 2, y: (a.free.y + b.free.y) / 2 };
    const dx = b.free.x - a.free.x, dy = b.free.y - a.free.y;
    const dist = Math.hypot(dx, dy) || 1e-3;

    // They travel together across the line between them, heading toward the
    // middle of the screen on a gentle arc, and meet a little way ahead.
    let tx = dy / dist, ty = -dx / dist;
    if (tx * c0.x + ty * c0.y > 0) {
      tx = -tx;
      ty = -ty;
    }
    const side = Math.sign(-dx * ty + dy * tx) || 1;
    // Curve gently toward the middle, so the climax and the text land centrally.
    const steer = clamp(angleDiff(Math.atan2(-c0.y, -c0.x), Math.atan2(ty, tx)), -0.6, 0.6);
    const turn = Math.hypot(c0.x, c0.y) > 0.1 ? steer * 0.8 + rand(-0.2, 0.2) : rand(-0.6, 0.6);
    const rot = (angle: number) => ({
      x: tx * Math.cos(angle) - ty * Math.sin(angle),
      y: tx * Math.sin(angle) + ty * Math.cos(angle),
    });
    const aim = rot(turn);
    const mx = Math.max(0.04, HX - 0.32), my = Math.max(0.04, HY - 0.3);
    const M = {
      x: clamp((c0.x + aim.x * 0.48) * 0.75, -mx, mx),
      y: clamp((c0.y + aim.y * 0.48) * 0.75, -my, my),
    };
    const k = Math.hypot(M.x - c0.x, M.y - c0.y) / 3;
    const arrive = rot(2 * turn);
    const p1 = { x: c0.x + tx * k, y: c0.y + ty * k };
    const p2 = { x: M.x - arrive.x * k, y: M.y - arrive.y * k };

    return {
      M,
      path: makePath(c0, p1, p2, M),
      mid0: { ...c0 },
      drift: { x: 0, y: 0 },
      R0: dist / 2,
      // Closing speed along the line between them (half of it, per thread), kept
      // small enough that the radius still eases down without overshooting.
      v0: clamp(
        -((b.freeVel.x - a.freeVel.x) * dx + (b.freeVel.y - a.freeVel.y) * dy) / dist / 2,
        0,
        (3 * (dist / 2 - Math.min(0.04, dist / 5))) / (T.close - T.approach)
      ),
      rBraid: Math.min(0.04, dist / 5),
      R: dist / 2,
      beta: 0,
      side,
      spin: Math.random() < 0.5 ? 1 : -1,
      phi: 0,
      tan: { x: tx, y: ty },
    };
  };

  /** Half the distance between them: closes in (carrying on at the speed they
   *  were already approaching), holds while they interweave, then plunges. */
  const radiusAt = (d: Dance, t: number) => {
    if (t <= T.close) {
      const span = T.close - T.approach;
      const u = clamp((t - T.approach) / span);
      // Cubic Hermite: starts at R0 moving inward at v0, arrives at rBraid at rest.
      return (2 * u ** 3 - 3 * u ** 2 + 1) * d.R0 - (u ** 3 - 2 * u ** 2 + u) * d.v0 * span + (3 * u ** 2 - 2 * u ** 3) * d.rBraid;
    }
    if (t <= T.plunge) return d.rBraid;
    return d.rBraid * (1 - Math.pow(clamp((t - T.plunge) / (T.merge - T.plunge)), 1.6));
  };

  /** Turns per second around each other: none while converging, then a steady
   *  twist, quickening as souls and racing in the final spiral. */
  const turnsAt = (d: Dance, t: number) => {
    const f = 0.8 * smooth(T.twist, T.close, t) + 0.6 * smooth(T.soul, T.plunge, t);
    return t > T.plunge ? Math.min(3.6, f * Math.pow(d.rBraid / Math.max(d.R, 0.01), 0.75)) : f;
  };

  /** Twisting side to side while they travel (a braid); circling once they're souls. */
  const betaAt = (t: number) => lerp(0.12, 0.9, smooth(T.soul - 0.3, T.travelEnd, t));

  const travelAt = (t: number) =>
    0.5 - 0.5 * Math.cos(Math.PI * clamp((t - T.travelStart) / (T.travelEnd - T.travelStart)));

  const freeStep = (th: Thread, other: Thread, t: number, dt: number) => {
    const w = th.wander;
    let desired =
      th.dir +
      w.amp * (0.6 * (Math.sin(w.f1 * t + w.p1) - Math.sin(w.p1)) + 0.4 * (Math.sin(w.f2 * t + w.p2) - Math.sin(w.p2)));
    // They notice each other: both pause, then each turns toward the other
    // (one a little before the other) and quickens.
    const notice = smooth(th.noticeAt, th.noticeAt + T.turn, t);
    if (notice > 0) {
      const toward = Math.atan2(other.free.y - th.free.y, other.free.x - th.free.x);
      desired += angleDiff(toward, desired) * notice * 0.85;
    }
    const speed =
      w.speed * (1 - 0.75 * hesitationAt(t)) * (1 + 1.8 * notice) * (1 - smooth(T.approach, T.approachFull, t));
    // Never turn tighter than a gentle arc for the current speed: a thread that
    // has almost stopped can only turn slowly, so it swings round in a curve
    // as it picks up speed instead of kinking.
    const maxTurn = 18 * speed * dt;
    th.heading += clamp(angleDiff(desired, th.heading), -maxTurn, maxTurn);
    th.freeVel.x = Math.cos(th.heading) * speed;
    th.freeVel.y = Math.sin(th.heading) * speed;
    th.free.x += th.freeVel.x * dt;
    th.free.y += th.freeVel.y * dt;
    const lx = HX - 0.1, ly = HY - 0.1;
    if (Math.abs(th.free.x) > lx) th.free.x -= Math.sign(th.free.x) * (Math.abs(th.free.x) - lx) * 3 * dt;
    if (Math.abs(th.free.y) > ly) th.free.y -= Math.sign(th.free.y) * (Math.abs(th.free.y) - ly) * 3 * dt;
  };

  const record = (th: Thread) => {
    const h = th.hist;
    const last = h[h.length - 1], prev = h[h.length - 2];
    if (prev && Math.hypot(th.head.x - prev.x, th.head.y - prev.y) < 0.0022) {
      last.x = th.head.x;
      last.y = th.head.y;
      last.z = th.z;
    } else {
      h.push({ x: th.head.x, y: th.head.y, z: th.z });
    }
  };

  const trim = (th: Thread) => {
    const h = th.hist;
    let walked = 0;
    for (let k = h.length - 1; k > 0; k--) {
      walked += Math.hypot(h[k].x - h[k - 1].x, h[k].y - h[k - 1].y);
      if (walked > th.L * 1.08) {
        if (k > 1) h.splice(0, k - 1);
        return;
      }
    }
  };

  const updateHearts = (t: number, dt: number) => {
    const I = intensityAt(t);
    const [a, b] = threads;
    // As they close in, both hearts quicken and fall into step.
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
    freeStep(threads[0], threads[1], t, dt);
    freeStep(threads[1], threads[0], t, dt);
    if (!dance && t >= T.approach) dance = beginDance();

    const [a, b] = threads;
    if (dance && t < T.merge) {
      const d = dance;
      d.R = radiusAt(d, t);
      d.beta = betaAt(t);
      d.phi += d.spin * TAU * turnsAt(d, t) * dt;
      // While the pull takes over, its centre follows the pair's own drift (which
      // eases to a stop), then that offset fades as they travel to where they meet.
      if (t <= T.approachFull) {
        d.drift.x = (a.free.x + b.free.x) / 2 - d.mid0.x;
        d.drift.y = (a.free.y + b.free.y) / 2 - d.mid0.y;
      }
      const prog = travelAt(t);
      const { p: onPath, d: dv } = d.path(prog);
      const c = { x: onPath.x + d.drift.x * (1 - prog), y: onPath.y + d.drift.y * (1 - prog) };
      const dl = Math.hypot(dv.x, dv.y);
      if (dl > 1e-5) {
        d.tan.x = dv.x / dl;
        d.tan.y = dv.y / dl;
      }
      const tx = d.tan.x, ty = d.tan.y;
      const cs = Math.cos(d.phi), sn = Math.sin(d.phi);
      const ox = (-ty * cs + tx * d.beta * sn) * d.R * d.side;
      const oy = (tx * cs + ty * d.beta * sn) * d.R * d.side;
      // Their orbit is a circle seen at an angle; this is how far in front or behind.
      const depth = sn * d.side * Math.sqrt(1 - d.beta * d.beta);
      const w = smooth(T.approach, T.approachFull, t);
      a.aim.x = lerp(a.free.x, c.x - ox, w);
      a.aim.y = lerp(a.free.y, c.y - oy, w);
      b.aim.x = lerp(b.free.x, c.x + ox, w);
      b.aim.y = lerp(b.free.y, c.y + oy, w);
      a.z = -depth * w;
      b.z = depth * w;
      if (touchAt < 0 && Math.abs(d.phi) >= Math.PI / 2) {
        touchAt = t;
        touch.x = c.x;
        touch.y = c.y;
      }
    } else if (dance) {
      for (const th of threads) {
        th.aim.x = dance.M.x;
        th.aim.y = dance.M.y;
        th.z = 0;
      }
    } else {
      for (const th of threads) {
        th.aim.x = th.free.x;
        th.aim.y = th.free.y;
      }
    }

    // Each tip follows its aim like silk on a soft spring, so every turn is a
    // curve: loose while they float and approach, tighter as they braid, and
    // tight for the fast final spiral.
    const tau = lerp(lerp(0.2, 0.09, smooth(T.twist, T.close, t)), 0.03, smooth(T.soul, T.plunge, t));
    const k = 2 / tau;
    for (const th of threads) {
      th.spring.x += (k * k * (th.aim.x - th.head.x) - 2 * k * th.spring.x) * dt;
      th.spring.y += (k * k * (th.aim.y - th.head.y) - 2 * k * th.spring.y) * dt;
      th.head.x += th.spring.x * dt;
      th.head.y += th.spring.y * dt;
    }
    if (dance && t >= T.merge) {
      for (const th of threads) {
        th.head.x = dance.M.x;
        th.head.y = dance.M.y;
      }
    }
    pair.x = (a.head.x + b.head.x) / 2;
    pair.y = (a.head.y + b.head.y) / 2;

    for (const th of threads) {
      const last = th.hist[th.hist.length - 1];
      th.vel.x = lerp(th.vel.x, (th.head.x - last.x) / dt, 0.2);
      th.vel.y = lerp(th.vel.y, (th.head.y - last.y) / dt, 0.2);
      record(th);
    }
    updateHearts(t, dt);
  };

  // --- Particles -------------------------------------------------------------

  const update = (t: number, dt: number) => {
    const I = intensityAt(t);
    const L = swellAt(t);
    const S = smooth(T.soul, T.soulFull, t);
    const P = dance ? clamp(1 - dance.R / dance.R0) : 0;
    // Ripples run faster as the drama builds, and flicker like flame once they're souls.
    ripple += TAU * (lerp(0.45, 1.3, P) + 1.5 * S) * dt;

    // Dust: drifts, then is drawn into a slow swirl around the pair, and at
    // the end is pulled into the light.
    for (const m of dust) {
      if (dance) {
        const c = t < T.merge ? pair : dance.M;
        const dx = c.x - m.x, dy = c.y - m.y;
        const d = Math.hypot(dx, dy) + 0.08;
        const pull = (0.07 * I * I + 0.5 * L) / d, swirl = (0.11 * I * I * dance.spin) / d;
        m.vx += ((dx / d) * pull - (dy / d) * swirl) * dt;
        m.vy += ((dy / d) * pull + (dx / d) * swirl) * dt;
      }
      const damp = Math.exp(-dt * (0.9 + 3 * hesitationAt(t)));
      m.vx *= damp;
      m.vy *= damp;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < -HX - 0.05) m.x += 2 * HX + 0.1;
      else if (m.x > HX + 0.05) m.x -= 2 * HX + 0.1;
      if (m.y < -HY - 0.05) m.y += 2 * HY + 0.1;
      else if (m.y > HY + 0.05) m.y -= 2 * HY + 0.1;
    }

    // Souls: shed soft wisps and leave fading afterimages (their shadows).
    if (S > 0.02 && t < T.merge) {
      for (const th of threads) {
        th.wispDebt += 50 * S * dt;
        while (th.wispDebt >= 1) {
          th.wispDebt -= 1;
          wisps.push({
            x: th.head.x + rand(-0.006, 0.006),
            y: th.head.y + rand(-0.006, 0.006),
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
          th.echoes.unshift({ x: th.head.x, y: th.head.y });
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
      trim(th);
    }
  };

  // --- Drawing ---------------------------------------------------------------

  const sampleInto = (th: Thread, L: number) => {
    const h = th.hist, buf = th.buf;
    let k = h.length - 1;
    buf.x[0] = h[k].x;
    buf.y[0] = h[k].y;
    buf.z[0] = h[k].z;
    const ds = L / (POINTS - 1);
    let count = 1, walked = 0, need = ds;
    for (; k > 0 && count < POINTS; k--) {
      const p = h[k], q = h[k - 1];
      const seg = Math.hypot(q.x - p.x, q.y - p.y);
      while (walked + seg >= need && count < POINTS) {
        const f = seg > 0 ? (need - walked) / seg : 0;
        buf.x[count] = p.x + (q.x - p.x) * f;
        buf.y[count] = p.y + (q.y - p.y) * f;
        buf.z[count] = p.z + (q.z - p.z) * f;
        count++;
        need += ds;
      }
      walked += seg;
    }
    buf.n = count;
    return count;
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
    const absorb = 1 - smooth(T.merge - 0.25, T.merge, t); // tails are drawn into the souls
    const core = px(lerp(0.9, 3, Math.pow(P, 1.3)) * (1 + 0.5 * S));
    const gap = px(1.6);
    const amp = lerp(0.013, 0.004, P) * (1 - S) + 0.005 * S;
    const lambda = lerp(0.3, 0.16, P) * (1 - S) + 0.08 * S;
    const beatAmp = 0.12 + 0.5 * I;

    for (const th of threads) {
      const buf = th.buf;
      const L = th.L * (1 - 0.7 * S) * absorb;
      if (L < 0.004 || sampleInto(th, L) < 3) {
        buf.n = 0;
        continue;
      }
      const n = buf.n;
      // Ripple along the body: still at the tip, freer toward the tail.
      normals(buf);
      for (let i = 1; i < n; i++) {
        const f = i / (POINTS - 1);
        const off = amp * Math.pow(f, 0.8) * Math.sin((TAU * f * L) / lambda - ripple);
        buf.x[i] += buf.nx[i] * off;
        buf.y[i] += buf.ny[i] * off;
      }
      normals(buf);
      for (let i = 0; i < n; i++) {
        const f = i / (POINTS - 1);
        // Tapered at both ends while floating; heavier at the tip once it's a soul.
        const both = Math.pow(Math.sin(Math.PI * (0.02 + 0.96 * f)), 0.6);
        const comet = Math.pow(1 - f, 1.3) * Math.min(1, 0.45 + f * 10);
        const prof = lerp(both, comet, S);
        const z = buf.z[i];
        buf.prof[i] = prof;
        buf.w[i] = core * prof * (1 + 0.35 * z);
        // Where this thread passes in front, a thin dark edge hides the one behind,
        // so the crossings read as over-and-under.
        buf.occ[i] = z > 0 ? (buf.w[i] + 2 * gap * Math.min(1, prof * 3)) * Math.min(1, z * 2.5) : 0;
        buf.front[i] = Math.min(buf.w[i], buf.occ[i]);
      }
    }

    const fadeOf = (th: Thread) => smooth(th.appear[0], th.appear[1], t);
    // A soft brightening the moment each one notices the other.
    const awareOf = (th: Thread) => 1 + 0.6 * Math.exp(-(((t - th.noticeAt - 0.2) / 0.45) ** 2));
    const coreAlpha = (th: Thread) =>
      (0.6 + 0.4 * G) * fadeOf(th) * awareOf(th) * (1 + beatAmp * 0.6 * beat(th.heart.ph));

    // Glow and core.
    for (const th of threads) {
      const buf = th.buf;
      if (!buf.n) continue;
      const hb = 1 + beatAmp * 0.6 * beat(th.heart.ph);
      const fadeIn = fadeOf(th);
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
            const f = (i / (POINTS - 1) - centre) / 0.045;
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
    for (const th of threads) if (th.buf.n) ribbon(th.buf, th.buf.occ, 1);
    ctx.globalCompositeOperation = "lighter";
    for (const th of threads) {
      if (!th.buf.n) continue;
      ctx.fillStyle = rgba(th.tint, Math.min(1, coreAlpha(th) * 1.15));
      ribbon(th.buf, th.buf.front, 1);
    }
    ctx.globalAlpha = 1;
  };

  const drawSouls = (S: number, L: number) => {
    if (S <= 0) return;
    const grow = 1 + 1.5 * L;
    for (const th of threads) {
      const h = th.head;
      const hb = beat(th.heart.ph);
      const front = 1 + 0.2 * th.z;
      // Their shadows: fading afterimages trailing behind.
      th.echoes.forEach((e, i) => {
        const f = (i + 1) / (th.echoes.length + 1);
        drawSprite(th.sprite, e.x, e.y, (0.02 + 0.004 * i) * S, 0.24 * S * Math.pow(1 - f, 1.3));
      });
      drawSprite(th.sprite, h.x, h.y, (0.065 + 0.02 * hb) * S * front * grow, 0.2 * S * grow);
      drawSprite(th.sprite, h.x, h.y, (0.026 + 0.008 * hb) * S * front * grow, 0.8 * S);
      ctx.globalAlpha = S;
      ctx.fillStyle = rgba(th.tint, 1);
      ctx.beginPath();
      ctx.arc(h.x, h.y, px(2.8) * (0.5 + 0.5 * S) * front, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawMerged = (t: number, M: Point, L: number, hb: number) => {
    const a = smooth(T.merge - 0.04, T.merge + 0.03, t);
    if (a <= 0) return;
    const flare = Math.exp(-Math.max(0, t - T.merge) / 0.12);
    const breath = 1 + 0.08 * hb;
    const white = sprites.get(WHITE)!;
    drawSprite(white, M.x, M.y, (0.13 + 0.08 * flare + 0.35 * L) * breath, 0.5 * a);
    drawSprite(white, M.x, M.y, (0.045 + 0.12 * L) * breath, 0.9 * a);
    ctx.globalAlpha = a;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(M.x, M.y, px(3.2) * (1.3 + 3 * L), 0, TAU);
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
    const P = dance ? clamp(1 - dance.R / dance.R0) : 0;
    const G = Math.max(P * 0.85, I);

    // The view leans in slowly toward where they will meet, and on into the light.
    const k = DPR * U;
    ctx.setTransform(k, 0, 0, k, (DPR * W) / 2, (DPR * H) / 2);
    if (dance) {
      const zoom = 1 + 0.07 * easeInOutCubic(I) + 0.06 * L;
      ctx.translate(dance.M.x, dance.M.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-dance.M.x, -dance.M.y);
    }
    ctx.globalCompositeOperation = "lighter";

    // Their joined heartbeat.
    const hb = (beat(threads[0].heart.ph) + beat(threads[1].heart.ph)) / 2;
    const centre = dance && t >= T.merge ? dance.M : pair;

    // A soft light gathers around the pair, breathing with their hearts.
    if (dance) {
      drawSprite(fog, centre.x, centre.y, 0.5 + 0.25 * I, (0.05 * I + 0.03 * I * hb) * (1 - L));
    }

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
        drawSprite(th.sprite, th.head.x, th.head.y, 0.035, 0.45 * g * smooth(th.appear[0], th.appear[1], t));
      }
    }

    // A soft bloom of light where they first touch.
    if (touchAt >= 0 && t - touchAt < 1.4) {
      const f = (t - touchAt) / 1.4;
      const out = 1 - (1 - f) ** 3;
      drawSprite(sprites.get(WHITE)!, touch.x, touch.y, lerp(0.02, 0.14, out), 0.4 * (1 - f) ** 2);
      ctx.globalAlpha = 0.12 * (1 - f) ** 2;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = px(1);
      ctx.beginPath();
      ctx.arc(touch.x, touch.y, lerp(0.01, 0.3, out), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (dance && t >= T.merge - 0.04) drawMerged(t, dance.M, L, hb);

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

  // --- Loop --------------------------------------------------------------------

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
    cb.onReveal(dance ? toScreen(dance.M) : { x: W / 2, y: H / 2 });
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
