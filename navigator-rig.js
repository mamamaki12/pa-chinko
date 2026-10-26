// Part animation for the illustrated navigators, in the spirit of Live2D: each atlas cell is laid on a fine mesh, and the
// mesh is bent around joints marked on the picture (neck, shoulders, hips, wing roots), so the head tilts, arms swing,
// legs kick, wings flap and the long hair and skirt sway while the rest of the picture stays put.
// All coordinates are pixels in an atlas cell (384 × 512, feet near the bottom).

// Joints per character and expression column (0 normal, 1 happy, 2 surprise, 3 closed), read off the pictures.
// head: [neck x, neck y, centre x, centre y, radius x, radius y]; arms / legs: [joint x, y, end x, y] for the arm or leg
// on the left of the picture first; wings: [root x, y, centre x, y, radius x, radius y], left first.
// pose tells the animation what the arms are doing in that picture: 'down' (by the sides), 'wave' (left arm raised),
// 'chest' (hands together in front of the chest).
export const RIGS = {
  sora: [
    { pose: 'down', head: [180, 217, 178, 135, 102, 92], arms: [[150, 255, 88, 322], [215, 258, 290, 310]], legs: [[178, 388, 176, 496], [196, 388, 200, 496]], wings: [[130, 215, 72, 207, 42, 44], [235, 230, 336, 227, 42, 44]], hem: 392 },
    { pose: 'wave', head: [179, 220, 203, 150, 102, 92], arms: [[133, 230, 69, 143], [236, 253, 289, 297]], legs: [[179, 373, 193, 490], [205, 375, 219, 453]], wings: [[150, 215, 80, 194, 46, 32], [230, 230, 322, 214, 36, 32]], hem: 380 },
    { pose: 'chest', head: [200, 220, 200, 140, 102, 92], arms: [[167, 247, 200, 228], [240, 255, 293, 330]], legs: [[180, 395, 167, 496], [200, 395, 205, 496]], wings: [[150, 215, 87, 208, 48, 46], [250, 225, 336, 207, 38, 30]], hem: 392 },
    { pose: 'chest', head: [203, 220, 203, 133, 102, 92], arms: [[170, 260, 203, 235], [240, 260, 210, 235]], legs: [[190, 400, 192, 496], [205, 400, 205, 496]], wings: [[150, 230, 70, 223, 30, 38], [250, 230, 312, 223, 26, 32]], hem: 392 },
  ],
  hana: [
    { pose: 'down', head: [170, 213, 180, 133, 105, 92], arms: [[130, 253, 73, 310], [220, 253, 287, 313]], legs: [[172, 390, 172, 496], [192, 390, 190, 496]], wings: [[140, 250, 100, 253, 42, 36], [215, 250, 266, 247, 48, 36]], hem: 385 },
    { pose: 'wave', head: [196, 213, 209, 133, 105, 92], arms: [[149, 230, 76, 140], [256, 253, 309, 293]], legs: [[190, 400, 190, 496], [205, 400, 200, 496]], wings: [[150, 250, 66, 253, 38, 36], [240, 250, 330, 240, 48, 40]], hem: 395 },
    { pose: 'chest', head: [200, 213, 193, 127, 105, 92], arms: [[165, 250, 193, 230], [240, 255, 205, 232]], legs: [[180, 395, 170, 496], [200, 395, 207, 496]], wings: [[160, 250, 96, 257, 56, 38], [235, 250, 296, 253, 64, 36]], hem: 392 },
    { pose: 'chest', head: [213, 213, 203, 127, 105, 92], arms: [[190, 250, 225, 225], [255, 250, 232, 225]], legs: [[200, 400, 200, 496], [212, 400, 212, 496]], wings: [[170, 250, 110, 253, 66, 40], [250, 240, 296, 233, 48, 34]], hem: 395 },
  ],
};
export const MESH = { cols: 32, rows: 42 };
const CW = 384, CH = 512;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
// Distance from p to the segment a-b, and how far along it p lies (0 at a, 1 at b).
function capsule(x, y, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1, u = ((x - ax) * dx + (y - ay) * dy) / len2, k = clamp(u, 0, 1);
  return { d: Math.hypot(x - ax - dx * k, y - ay - dy * k), u };
}
// Weights of every mesh vertex for each part: how much of the part's motion the vertex follows. A vertex only fully
// follows a part well inside it and fades out over a soft border, so the picture stretches smoothly instead of tearing.
export function rigWeights(rig, { cols = MESH.cols, rows = MESH.rows } = {}) {
  const n = (cols + 1) * (rows + 1), W = {
    head: new Float32Array(n), arm0: new Float32Array(n), arm1: new Float32Array(n), leg0: new Float32Array(n), leg1: new Float32Array(n),
    wing0: new Float32Array(n), wing1: new Float32Array(n), hair: new Float32Array(n), skirt: new Float32Array(n), x: new Float32Array(n), y: new Float32Array(n),
  };
  const [nx, ny, hx, hy, rx, ry] = rig.head, coreX = (nx + (rig.legs[0][2] + rig.legs[1][2]) / 2) / 2;
  for (let j = 0, i = 0; j <= rows; j++) for (let c = 0; c <= cols; c++, i++) {
    const x = c / cols * CW, y = j / rows * CH;
    W.x[i] = x; W.y[i] = y;
    // The head turns about the neck; below the chin the weight fades so the shoulders stay.
    const e = Math.hypot((x - hx) / rx, (y - hy) / ry);
    let head = (1 - smooth(.85, 1.2, e)) * (1 - smooth(ny - 6, ny + 22, y));
    const parts = [];
    rig.arms.forEach(([sx, sy, ex, ey], k) => {
      const { d, u } = capsule(x, y, sx, sy, ex, ey);
      parts.push(['arm' + k, (1 - smooth(22, 44, d)) * smooth(-.25, .15, u)]);
    });
    rig.legs.forEach(([sx, sy, ex, ey], k) => {
      const { d, u } = capsule(x, y, sx, sy, ex, ey);
      // Each leg owns only its own side of the gap between the two legs.
      const other = rig.legs[1 - k], side = Math.sign((x - (sx + other[0]) / 2) * (k ? 1 : -1));
      parts.push(['leg' + k, (1 - smooth(12, 26, d)) * smooth(.05, .3, u) * (side >= 0 ? 1 : 1 - smooth(0, 6, Math.abs(x - (sx + other[0]) / 2)))]);
    });
    rig.wings.forEach(([, , cx, cy, wx, wy], k) => parts.push(['wing' + k, 1 - smooth(.8, 1.25, Math.hypot((x - cx) / wx, (y - cy) / wy))]));
    let sum = head + parts.reduce((s, [, w]) => s + w, 0);
    const norm = sum > 1 ? 1 / sum : 1;
    W.head[i] = head * norm;
    for (const [key, w] of parts) W[key][i] = w * norm;
    // Long hair: everything well outside the body column below the shoulders, more toward the tips.
    const core = 1 - smooth(52, 84, Math.abs(x - coreX));
    const free = 1 - Math.min(1, sum);
    W.hair[i] = (1 - core) * free * smooth(190, 470, y);
    // Skirt: the dress below the waist, more toward the hem.
    W.skirt[i] = core * free * smooth(rig.hem - 110, rig.hem, y) * (1 - smooth(rig.hem, rig.hem + 14, y));
  }
  return W;
}
const rot = (x, y, px, py, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py; return [px + dx * c - dy * s - x, py + dx * s + dy * c - y]; };
// Moves the mesh for one frame. p: angles in radians (arms and legs: positive raises the arm / swings the leg outward;
// wings: positive flaps up), head: [tilt, dx, dy], hair / skirt: sideways sway in pixels with a travelling phase.
export function deform(rig, W, p, out = new Float32Array(W.x.length * 2)) {
  const [nx, ny] = rig.head;
  for (let i = 0; i < W.x.length; i++) {
    const x = W.x[i], y = W.y[i];
    let dx = 0, dy = 0, w, d;
    if ((w = W.head[i])) { d = rot(x, y, nx, ny, p.head[0]); dx += w * (d[0] + p.head[1]); dy += w * (d[1] + p.head[2]); }
    for (let k = 0; k < 2; k++) {
      const s = k ? -1 : 1;
      if ((w = W['arm' + k][i])) { const a = rig.arms[k]; d = rot(x, y, a[0], a[1], s * p.arms[k]); dx += w * d[0]; dy += w * d[1]; }
      if ((w = W['leg' + k][i])) { const l = rig.legs[k]; d = rot(x, y, l[0], l[1], s * p.legs[k]); dx += w * d[0]; dy += w * d[1]; }
      if ((w = W['wing' + k][i])) { const g = rig.wings[k]; d = rot(x, y, g[0], g[1], s * p.wings); dx += w * d[0]; dy += w * d[1]; }
    }
    if ((w = W.hair[i])) dx += w * p.hair * Math.sin(p.phase - y * .012) * (y / CH);
    if ((w = W.skirt[i])) dx += w * p.skirt * Math.sin(p.phase * 1.3 + x * .05);
    // A lean of the whole body: the head moves most, the feet stay.
    dx += p.bend * CH * (1 - y / CH) ** 1.6;
    out[i * 2] = x + dx; out[i * 2 + 1] = y + dy;
  }
  return out;
}
export const REST = { head: [0, 0, 0], arms: [0, 0], legs: [0, 0], wings: 0, hair: 0, skirt: 0, phase: 0, bend: 0 };
