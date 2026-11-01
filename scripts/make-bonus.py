# 大当たり中・予告の生成画像（assets/generated/bn-*.png、#65）から、アプリで使う絵を作る。
# python3 scripts/make-bonus.py
#   assets/ui/<id>.webp      透明な部品（ROUND・FINAL ROUND・紋章・ラウンドの数字・幕・右打ち／左打ち・カウントの宝石・予告の文字）
#                            緑や青の抜き色の絵は、まわりからつながる抜き色だけを消し（中の同じ色の宝石は残す）、縁の色かぶりを取る
#   assets/lcd-fx/<id>.webp  黒の背景の光（ラウンドの始まり・右打ちの光・入ったときの光）。黒のわずかな明るさは0にする
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

G = 'assets/generated/'
def load(n): return Image.open(f'{G}{n}.png').convert('RGBA')
def bbox(im, cut=12):
    a = np.asarray(im)[..., 3]; ys, xs = np.where(a > cut)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
def crop(im, pad=4):
    x0, y0, x1, y1 = bbox(im)
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
def save(im, path):
    im.save(path, quality=90, method=5); print(path, im.size)

# Removes a flat-ish key colour (green or blue) that is connected to the picture's edge.
def key_out(im, tol=110, soft=90, hole=50):
    rgb = np.asarray(im.convert('RGB')).astype(int); h, w = rgb.shape[:2]
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]); key = np.median(edge, 0)
    dist = np.sqrt(((rgb - key) ** 2).sum(2))
    v = np.minimum(dist, 254).astype(np.uint8); m = Image.fromarray(np.dstack([v, v, v]))   # floodfill's thresh needs RGB
    for x, y in [(x, 0) for x in range(0, w, 16)] + [(x, h - 1) for x in range(0, w, 16)] + [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]:
        if m.getpixel((x, y))[1] < tol: ImageDraw.floodfill(m, (x, y), (255, 0, 0), thresh=tol)
    # Holes inside letters (the middle of C, A, R…) are not connected to the edge: fill those too when they are nearly the pure
    # key colour and bigger than a sparkle, so a small jewel of the same hue stays.
    for y in range(0, h, 6):
        for x in range(0, w, 6):
            p = m.getpixel((x, y))
            if p[0] == p[1] and p[1] < hole:
                ImageDraw.floodfill(m, (x, y), (0, 255, 0), thresh=hole)
                if (np.asarray(m)[..., 1] == 255).sum() > 300: ImageDraw.floodfill(m, (x, y), (255, 0, 0), thresh=0)
                else: ImageDraw.floodfill(m, (x, y), (2, 1, 1), thresh=0)
    f = np.asarray(m); bg = (f[..., 0] == 255) & (f[..., 1] == 0)
    near = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    alpha = np.where(bg, 0, 255).astype(float)
    band = near & ~bg
    alpha[band] = np.clip((dist[band] - tol * .6) / soft, 0, 1) * 255
    out = rgb.copy(); k = int(np.argmax(key))           # despill the key channel on the edge band
    others = [c for c in range(3) if c != k]
    out[..., k] = np.where(band, np.minimum(out[..., k], out[..., others].max(2)), out[..., k])
    return Image.fromarray(np.dstack([out, alpha]).astype(np.uint8), 'RGBA')

def light(n, w, h=None):
    a = np.asarray(Image.open(f'{G}{n}.png').convert('RGB')).astype(int)
    a = np.clip((a - 6) * 255 / 249, 0, 255).astype(np.uint8)           # pure black, so no box shows when added
    im = Image.fromarray(a); save(im.resize((w, h or round(w * im.height / im.width)), Image.LANCZOS), f'assets/lcd-fx/{n}.webp')

# Transparent parts: (id, longest side).
for n, size in [('bn-logo-round', 640), ('bn-medal-round-1', 320), ('bn-medal-round-2', 320), ('bn-medal-round-3', 320), ('bn-medal-round-4', 320),
                ('bn-curtain-left', 768), ('bn-curtain-right', 768), ('bn-curtain-top', 1024), ('bn-logo-right', 512), ('bn-logo-right-blank', 512),
                ('bn-plate-right-arrow', 512), ('bn-logo-left', 512), ('bn-count-empty', 96), ('bn-count-full', 96), ('bn-count-last', 128)]:
    save(fit(crop(load(n)), size, size), f'assets/ui/{n}.webp')
# Keyed on green or blue.
for n, size in [('bn-logo-final', 768), ('bn-logo-chance-blue', 768), ('bn-logo-chance-green', 768), ('bn-logo-hot-red', 768),
                ('bn-logo-hot-gold', 768), ('bn-logo-stage-change', 768)]:
    save(fit(crop(key_out(load(n))), size, size), f'assets/ui/{n}.webp')
# The round numbers 1-4 stand in a row; they are cut apart at the empty columns between them.
nums = load('bn-num-round'); a = np.asarray(nums)[..., 3] > 24; cols = np.where(a.any(0))[0]
gaps = [i for i in range(1, len(cols)) if cols[i] - cols[i - 1] > 6]
edges = [cols[0]] + [x for g in gaps for x in (cols[g - 1] + 1, cols[g])] + [cols[-1] + 1]
assert len(edges) == 8, edges
for k in range(4):
    save(fit(crop(nums.crop((edges[2 * k], 0, edges[2 * k + 1], nums.height))), 256, 256), f'assets/ui/bn-num-round-{k + 1}.webp')

light('bn-fx-round-open', 512); light('bn-fx-catch', 256); light('bn-fx-right-flash', 768)
