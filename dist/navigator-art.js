// Illustrated navigator atlas: four expressions per row, Sora above Hana.
// Keep event selection independent of game results; this module only renders the pose it receives.
export const NAVIGATOR_ATLAS = {
  path: 'assets/navigator-portraits.webp',
  columns: 4,
  rows: 2,
  expressions: { normal: 0, happy: 1, surprise: 2, closed: 3, sleepy: 3 },
};
// Face parts for blinking and lip flaps: small patches cut from edited copies of the atlas cells. Each entry is
// [x, y in the parts sheet, x, y in the atlas cell, width, height]; drawn over the cell, a patch closes the eyes or
// opens / shuts the mouth and leaves the rest of the picture untouched.
export const NAVIGATOR_FACES = {
  path: 'assets/navigator-faces.webp',
  sora: { 'normal:blink': [0, 0, 123, 141, 125, 63], 'surprise:blink': [127, 0, 145, 150, 121, 51], 'normal:open': [250, 0, 168, 186, 29, 20], 'happy:shut': [281, 0, 163, 181, 40, 31], 'surprise:shut': [323, 0, 193, 192, 28, 21], 'closed:open': [353, 0, 199, 198, 30, 17] },
  hana: { 'normal:blink': [385, 0, 115, 144, 126, 58], 'surprise:blink': [0, 65, 144, 139, 120, 62], 'normal:open': [122, 65, 162, 191, 26, 19], 'happy:shut': [150, 65, 196, 178, 34, 29], 'surprise:shut': [186, 65, 199, 182, 25, 24], 'closed:open': [213, 65, 205, 193, 29, 19] },
};
// Which faces are drawn with the mouth open; talking flips between this and the other state.
const MOUTH_OPEN = { normal: false, happy: true, surprise: true, closed: false };
const FACE_OF = ['normal', 'happy', 'surprise', 'closed'];
// Seconds an expression change takes to cross-fade, so the swap reads as a change of face rather than a cut.
export const FADE = .18;
// Per-character time offset so Sora and Hana never blink or fidget in step.
const SEED = { sora: 0, hana: 3.1 };
let atlas, faces;
export function portraitCell(kind, expression) {
  return { column: NAVIGATOR_ATLAS.expressions[expression] ?? 0, row: kind === 'hana' ? 1 : 0 };
}
// Tracks the expression on screen per navigator and returns the cells to draw with their opacity (the old face fades out under the new one).
export function portraitLayers(n, t, reduced = false) {
  if (n.artExpr === undefined) { n.artExpr = n.expr; n.artFrom = n.expr; n.artAt = -9; }
  if (n.expr !== n.artExpr) { n.artFrom = n.artExpr; n.artExpr = n.expr; n.artAt = t; }
  const k = reduced ? 1 : Math.min(1, Math.max(0, (t - n.artAt) / FADE));
  const now = portraitCell(n.kind, n.artExpr);
  if (k >= 1 || n.artFrom === n.artExpr) return [{ ...now, alpha: 1 }];
  return [{ ...portraitCell(n.kind, n.artFrom), alpha: 1 - k }, { ...now, alpha: Math.min(1, k * 2) }];
}
const talkingNow = (n, t) => !!n.line && t < n.lineUntil && n.shown < n.line.length;
// Blinks come every few seconds at uneven gaps (two overlapping rhythms), sometimes twice in a row.
export function blinking(n, t) {
  const s = SEED[n.kind] ?? 0;
  return (t + s) % 4.3 < .12 || (t + s * 2) % 7.1 < .11 || (t + s) % 12.9 < .11;
}
// The face patch to lay over the cell this frame ('normal:blink', 'happy:shut', …), or null for the plain cell.
// While a line is typed out the mouth flaps about nine times a second and stays shut on punctuation.
export function faceVariant(n, t, layers, reduced = false) {
  if (reduced || layers.length !== 1) return null;
  const face = FACE_OF[layers[0].column];
  if (talkingNow(n, t)) {
    const ch = n.line[Math.max(0, n.shown - 1)] ?? '';
    const open = !/[、。！？!?…〜ー\s]/.test(ch) && Math.floor((t - n.lineAt) * 9) % 2 === 0;
    if (open !== MOUTH_OPEN[face]) return `${face}:${open ? 'open' : 'shut'}`;
  }
  if ((face === 'normal' || face === 'surprise') && blinking(n, t)) return `${face}:blink`;
  return null;
}
// Little idle actions while nothing is happening, one every 6.5 seconds or so.
export const FIDGETS = ['hop', 'sway', 'twirl', 'stretch', 'bounce', 'look'];
const FIDGET_EVERY = 6.5, FIDGET_LEN = 1.6;
export function fidgetAt(n, t) {
  const s = SEED[n.kind] ?? 0, slot = Math.floor((t + s) / FIDGET_EVERY), p = ((t + s) % FIDGET_EVERY) / FIDGET_LEN;
  if (p >= 1 || n.pose !== 'idle' || t - n.poseAt < 1 || talkingNow(n, t)) return null;
  return { name: FIDGETS[(slot * 7 + (n.kind === 'hana' ? 3 : 0)) % FIDGETS.length], p };
}
const bump = p => Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
// Body motion for this frame, in units of the drawn figure height (1 = the whole figure).
// lift: up from the floor; dx: sideways; angle: radians; sx, sy: squash and stretch about the feet (sx < 0 while
// twirling shows the back of the turn); bend: how far the head leans sideways compared with the feet; pop: cut-in zoom.
export function portraitMotion(n, t, { gentle = true, reduced = false } = {}) {
  const m = { lift: 0, dx: 0, angle: 0, sx: 1, sy: 1, bend: 0, pop: 1 };
  const age = Math.max(0, t - n.poseAt), active = t < n.poseUntil, pose = active ? n.pose : 'idle';
  const env = active ? Math.min(1, age / .2, Math.max(0, n.poseUntil - t) / .25) : 0, amt = gentle ? .65 : 1;
  if (pose === 'cheer' && n.prio >= 3) m.pop = 1 + .14 * (reduced ? 1 : Math.min(1, age / .35) * Math.min(1, (n.poseUntil - t) / .4));
  if (reduced) return m;
  // Always: breathing, a slow float and a soft sway of the hair and dress.
  const s = SEED[n.kind] ?? 0, breath = Math.sin(t * 2.1 + s);
  m.sy = 1 + breath * .012; m.sx = 1 - breath * .006;
  m.lift = Math.sin(t * 1.8 + s) * .006; m.angle = Math.sin(t * 1.2 + s) * .012; m.bend = Math.sin(t * 1.1 + s) * .012;
  const land = (h, p) => { const up = Math.abs(Math.sin(p)); m.lift += up * h; m.sy *= up < .25 ? 1 - (.25 - up) * .28 * amt : 1 + up * .035 * amt; m.sx /= Math.sqrt(m.sy); };
  if (pose === 'cheer') {
    land(.1 * amt * env, age * 5.5); m.bend += Math.sin(age * 5.5) * .03 * env;
    // A big win starts with a quick twirl.
    if (n.prio >= 3 && age < .7) m.sx *= Math.cos(age / .7 * Math.PI * 2);
  } else if (pose === 'clap') { land(.035 * amt * env, age * 9); }
  else if (pose === 'point') {
    // Startled hop, then a little shiver of excitement while leaning toward the reels.
    if (age < .4) land(.13 * amt, age / .4 * Math.PI);
    else { m.dx += Math.sin(age * 38) * .006 * amt * env; m.bend += .03 * env; }
  } else if (pose === 'wave') { m.bend += Math.sin(age * 5) * .035 * env; m.angle += Math.sin(age * 5) * .02 * env; }
  else if (pose === 'watch') { m.bend += .025 * env; m.lift += Math.abs(Math.sin(age * 3)) * .012 * amt; }
  else if (pose === 'nod') { const d = bump(age / .45) * env; m.sy *= 1 - d * .05; m.bend += d * .02; }
  else if (pose === 'bow') { const d = Math.min(1, age / .6); m.sy *= 1 - d * .06; m.angle += .09 * d; m.bend -= .03 * d; }
  else if (pose === 'sleepy') { m.angle += .035 * Math.sin(t * .7); m.bend += Math.sin(t * .7) * .03; m.sy *= 1 - Math.max(0, Math.sin(t * .9)) * .02; }
  const f = fidgetAt(n, t);
  if (f) {
    const p = f.p, e = bump(p);
    if (f.name === 'hop') land(.05 * amt, p * Math.PI * 2);
    else if (f.name === 'sway') m.bend += Math.sin(p * Math.PI * 3) * .04 * e;
    else if (f.name === 'twirl') m.sx *= Math.cos(Math.min(1, p / .6) * Math.PI * 2);
    else if (f.name === 'stretch') { m.sy *= 1 + e * .05; m.sx *= 1 - e * .03; m.lift += e * .01; }
    else if (f.name === 'bounce') land(.025 * amt, p * Math.PI * 4);
    else if (f.name === 'look') m.sx *= Math.cos(bump(p) * Math.PI);
  }
  if (talkingNow(n, t)) { const b = Math.abs(Math.sin(t * 11)); m.lift += b * .008 * amt; m.sy *= 1 - b * .012 * amt; }
  return m;
}
function getImage(path) {
  const image = new Image();
  image.src = new URL(path, import.meta.url).href;
  return image;
}
const ready = image => image?.complete && image.naturalWidth > 0;
let comp, warp;
function surface(c, w, h) {
  c ??= document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, w, h);
  return c;
}
// Returns false while loading (or after an image error), retaining the vector fallback; otherwise the motion used,
// plus where the head ended up, so the caller can place sparkles and marks.
export function drawPortrait(c, n, t, { x, y, scale = 1, gentle = true, reduced = false, flip = false }) {
  if (typeof Image === 'undefined' || typeof document === 'undefined') return false;
  atlas ??= getImage(NAVIGATOR_ATLAS.path);
  faces ??= getImage(NAVIGATOR_FACES.path);
  if (!ready(atlas)) return false;
  const cw = atlas.naturalWidth / NAVIGATOR_ATLAS.columns, ch = atlas.naturalHeight / NAVIGATOR_ATLAS.rows;
  const m = portraitMotion(n, t, { gentle, reduced });
  const height = 106 * scale * m.pop, width = height * cw / ch;
  // 1. The face of this frame: the cell(s), then a blink or mouth patch.
  comp = surface(comp, cw, ch);
  const g = comp.getContext('2d');
  g.imageSmoothingEnabled = false;
  const layers = portraitLayers(n, t, reduced);
  for (const { column, row, alpha } of layers) { g.globalAlpha = alpha; g.drawImage(atlas, column * cw, row * ch, cw, ch, 0, 0, cw, ch); }
  g.globalAlpha = 1;
  const patch = ready(faces) && NAVIGATOR_FACES[n.kind]?.[faceVariant(n, t, layers, reduced)];
  if (patch) { const [px, py, ox, oy, w, h] = patch; g.drawImage(faces, px, py, w, h, ox, oy, w, h); }
  // 2. Bend the figure in thin bands: the feet stay put and the head leans furthest, so a sway reads as a body moving
  // rather than a card tilting.
  const margin = Math.ceil(ch * .1), bend = m.bend * ch;
  warp = surface(warp, cw + margin * 2, ch);
  const wg = warp.getContext('2d'), band = 8;
  for (let sy = 0; sy < ch; sy += band) {
    const k = 1 - (sy + band / 2) / ch;
    wg.drawImage(comp, 0, sy, cw, band, margin + bend * k ** 1.6, sy, cw, band);
  }
  // 3. Put it on the LCD with a faint floor shadow, scaled about the feet.
  const unit = height;
  c.save();
  c.globalAlpha = .16 * Math.max(.3, 1 - m.lift * 6);
  c.fillStyle = '#0a1030';
  c.beginPath(); c.ellipse(x + m.dx * unit, y + 2 * scale, width * .26 * Math.max(.5, 1 - m.lift * 4), 3.5 * scale, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  c.save();
  c.translate(x + m.dx * unit, y - m.lift * unit);
  c.rotate(m.angle);
  c.scale((flip ? -1 : 1) * m.sx, m.sy);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  // A restrained outline separates fine hair and white fabric from the bright LCD without washing out the face.
  c.shadowColor = '#edf4ff90';
  c.shadowBlur = 2 * scale;
  const mw = margin * width / cw;
  c.drawImage(warp, -width / 2 - mw, -height, width + mw * 2, height);
  c.restore();
  return { ...m, head: [x + m.dx * unit + bend * .7 * width / cw, y - m.lift * unit - height * .66], height };
}
