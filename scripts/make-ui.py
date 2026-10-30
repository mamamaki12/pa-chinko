# 数字・リーチ名・PUSH の生成画像（assets/generated/ui-*.webp）から、アプリで使う絵を作る。
# python3 scripts/make-ui.py
#   assets/ui/<id>.webp          透明な部品（ロゴ・帯・札・PUSHボタン・輪・文字・手・カットインのキャラ）。透明でない余白を切り、縮める
#   assets/lcd-fx/<id>.webp      黒の背景の光（押したときの光・止まったときのきらめき・オーラ・そろったときの線）
#   assets/pachinko-digit-sprites.webp       今の数字の表（3×3、1マス 288×312）の7を ui-num-7-premium に差し替える
#   assets/pachinko-digit-glow-sprites.webp  リーチ・当たり用の光る数字（ui-num-set-glow から切り出し、7は ui-num-7-reach）
#   assets/pachinko-digit-7-win.webp         当たりの7（ui-num-7-win、1マス分）
from PIL import Image, ImageFilter
import numpy as np
import os

G, CELL = 'assets/generated/', (288, 312)
def load(n): return Image.open(f'{G}{n}.webp' if os.path.exists(f'{G}{n}.webp') else f'{G}{n}.png').convert('RGBA')
def bbox(im, cut=12):
    a = np.asarray(im)[..., 3]; ys, xs = np.where(a > cut)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
def crop(im, pad=6, box=None):
    x0, y0, x1, y1 = box or bbox(im)
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
def save(im, path):
    im.save(path, quality=90, method=5); print(path, im.size)

# Transparent parts: (id, longest side in px).
for n, size in ([('ui-logo-meteor', 768), ('ui-logo-castle', 768), ('ui-logo-battle', 768), ('ui-logo-reach', 640),
                ('ui-band-meteor', 1024), ('ui-band-castle', 1024), ('ui-band-battle', 1024), ('ui-band-white', 1024), ('ui-plate-label', 512),
                ('ui-push-button', 256), ('ui-push-button-pink', 256), ('ui-push-button-green', 256), ('ui-push-button-red', 256),
                ('ui-push-button-gold', 256), ('ui-push-button-rainbow', 256), ('ui-push-ring', 320), ('ui-push-word', 512)]
               + [(f'cutin-{c}-{k}', 768) for c in ('hana', 'sora') for k in ('chance', 'hot', 'pray')]):
    save(fit(crop(load(n)), size, size), f'assets/ui/{n}.webp')
# The two hand frames share one crop box so they line up.
hands = [load('ui-push-hand'), load('ui-push-hand-b')]
b = [bbox(h) for h in hands]; box = (min(x[0] for x in b), min(x[1] for x in b), max(x[2] for x in b), max(x[3] for x in b))
for n, h in zip(['ui-push-hand', 'ui-push-hand-b'], hands): save(fit(crop(h, box=box), 192, 192), f'assets/ui/{n}.webp')

# Light on black.
for n, size in [('ui-push-hit', 640), ('ui-num-stop', 384), ('ui-num-aura', 512)]:
    save(load(n).convert('RGB').resize((size, size), Image.LANCZOS), f'assets/lcd-fx/{n}.webp')
line = load('ui-num-line').convert('RGB'); a = np.asarray(line).max(2); ys, xs = np.where(a > 16)
save(fit(line.crop((xs.min() - 8, ys.min() - 8, xs.max() + 8, ys.max() + 8)), 1024, 1024), 'assets/lcd-fx/ui-num-line.webp')

# Digits. A figure is placed in a 288×312 cell like the existing sheet (about 268 px wide or 272 px tall at most, centred;
# the winged 7s may use the whole width, or they would come out smaller than the other figures).
def cell(fig, w=268, h=272):
    fig = fit(crop(fig, pad=0), w, h); c = Image.new('RGBA', CELL, (0, 0, 0, 0))
    c.alpha_composite(fig, ((CELL[0] - fig.width) // 2, (CELL[1] - fig.height) // 2)); return c
def sheet(cells):
    s = Image.new('RGBA', (CELL[0] * 3, CELL[1] * 3), (0, 0, 0, 0))
    for i, c in enumerate(cells): s.alpha_composite(c, ((i % 3) * CELL[0], (i // 3) * CELL[1]))
    return s
# The nine figures of a 3×3 painted sheet. Columns are split at the empty gaps between them; inside a column the glows touch,
# so rows are split at the thinnest line near a third and two thirds of the height.
def figures(im):
    a = np.asarray(im)[..., 3] > 24; out = []
    cols = np.where(a.any(0))[0]; gaps = [i for i in range(1, len(cols)) if cols[i] - cols[i - 1] > 1]
    edges = [cols[0]] + [x for g in gaps for x in (cols[g - 1] + 1, cols[g])] + [cols[-1] + 1]
    strips = [(edges[i], edges[i + 1]) for i in range(0, len(edges), 2)]
    cuts = []
    for x0, x1 in strips:
        prof = a[:, x0:x1].sum(1); h = len(prof)
        cuts.append([0] + [lo + int(np.argmin(prof[lo:hi])) for lo, hi in ((h // 3 - 90, h // 3 + 90), (2 * h // 3 - 90, 2 * h // 3 + 90))] + [h])
    for r in range(3):
        for c, (x0, x1) in enumerate(strips):
            y0, y1 = cuts[c][r], cuts[c][r + 1]; out.append(im.crop((x0, y0, x1, y1)))
    return out

base = Image.open('assets/pachinko-digit-sprites.webp').convert('RGBA')
cells = [base.crop(((i % 3) * CELL[0], (i // 3) * CELL[1], (i % 3 + 1) * CELL[0], (i // 3 + 1) * CELL[1])) for i in range(9)]
cells[6] = cell(load('ui-num-7-premium'), 288, 300); save(sheet(cells), 'assets/pachinko-digit-sprites.webp')
glow = [cell(f) for f in figures(load('ui-num-set-glow'))]; glow[6] = cell(load('ui-num-7-reach'), 288, 300)
save(sheet(glow), 'assets/pachinko-digit-glow-sprites.webp')
save(cell(load('ui-num-7-win'), 288, 312), 'assets/pachinko-digit-7-win.webp')
