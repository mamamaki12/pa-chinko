// Illustrated navigator atlas: four expressions per row, Sora above Hana.
// Keep event selection independent of game results; this module only renders the pose it receives.
export const NAVIGATOR_ATLAS = {
  path: 'assets/navigator-portraits.webp',
  columns: 4,
  rows: 2,
  expressions: { normal: 0, happy: 1, surprise: 2, closed: 3, sleepy: 3 },
};
// Seconds an expression change takes to cross-fade, so the swap reads as a change of face rather than a cut.
export const FADE = .18;
let atlas;
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
function getAtlas() {
  if (!atlas && typeof Image !== 'undefined') {
    atlas = new Image();
    atlas.src = new URL(NAVIGATOR_ATLAS.path, import.meta.url).href;
  }
  return atlas;
}
// Returns false while loading (or after an image error), retaining the vector fallback.
export function drawPortrait(c, n, t, { x, y, scale = 1, gentle = true, reduced = false, flip = false }) {
  const image = getAtlas();
  if (!image?.complete || !image.naturalWidth) return false;
  const age = Math.max(0, t - n.poseAt);
  const active = t < n.poseUntil;
  const pose = active ? n.pose : 'idle';
  const talking = !!n.line && t < n.lineUntil && n.shown < n.line.length;
  const cw = image.naturalWidth / NAVIGATOR_ATLAS.columns;
  const ch = image.naturalHeight / NAVIGATOR_ATLAS.rows;
  const height = 106 * scale;
  const width = height * cw / ch;
  const envelope = active ? Math.min(1, age / .2, Math.max(0, n.poseUntil - t) / .25) : 0;
  const amount = gentle ? .65 : 1;
  let lift = 0, angle = 0, lean = 0, squash = 1;
  if (!reduced) {
    lift = Math.sin(t * 1.8) * .65 * scale;
    angle = Math.sin(t * 1.2) * .012;
    if (pose === 'cheer') lift += Math.abs(Math.sin(age * 5)) * 3 * scale * envelope * amount;
    if (pose === 'clap') lean = Math.sin(age * 7) * .8 * scale * envelope;
    if (pose === 'wave') angle += Math.sin(age * 4) * .025 * envelope;
    if (pose === 'nod' || pose === 'watch') angle += Math.sin(age * 3) * .016 * envelope;
    if (pose === 'bow') angle += .1 * envelope;
    if (pose === 'sleepy') angle += .035 * Math.sin(t * .7);
    // While the line is typed out, a small bounce in time with the voice blips stands in for a moving mouth.
    if (talking) { const b = Math.abs(Math.sin(t * 11)); lift += b * .9 * scale * amount; squash = 1 - b * .012 * amount; }
  }
  c.save();
  c.translate(x + lean, y - lift);
  c.rotate(angle);
  c.scale(flip ? -1 / squash : 1 / squash, squash);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  // A restrained outline separates fine hair and white fabric from the bright LCD without washing out the face.
  c.shadowColor = '#edf4ff90';
  c.shadowBlur = 2 * scale;
  for (const { column, row, alpha } of portraitLayers(n, t, reduced)) {
    c.globalAlpha = alpha;
    c.drawImage(image, column * cw, row * ch, cw, ch, -width / 2, -height, width, height);
  }
  c.restore();
  return true;
}
