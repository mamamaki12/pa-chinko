# 横に繰り返す背景（assets/generated/tile-*.png、左右の端がつながる絵。#75）を、液晶で使う WebP にして assets/lcd-objects/ に置く。
# python3 scripts/make-lcd-tiles.py assets/generated assets/lcd-objects
# 縮めても継ぎ目が出ないよう、左右を回り込ませて足してから縮めて切り戻す。
# 雲海：そのまま（透明の空）。オーロラ・星空：光だけを黒の上に（オーロラは下へ、星空は下へ向かって薄く）、'lighter' で重ねる。
# 水面：上の縁を透明にぼかした帯にして、普通に重ねる。
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
def tile(n, width):
    a = np.asarray(Image.open(f'{src}/tile-{n}.png').convert('RGBA')).astype(np.float64)[:, :-1]  # the last column repeats the first
    h, w = a.shape[:2]; pad = 32
    wide = np.concatenate((a[:, -pad:], a, a[:, :pad]), axis=1)
    rgb = wide[..., :3] * wide[..., 3:4] / 255  # premultiplied, so transparent cloud edges keep their colour
    im = Image.fromarray(np.uint8(np.dstack((rgb, wide[..., 3:4])).round()), 'RGBA')
    k = width / w; H = round(h * k); P = round(pad * k)
    im = im.resize((round(wide.shape[1] * k), H), Image.LANCZOS).crop((P, 0, P + width, H))
    b = np.asarray(im).astype(np.float64); al = b[..., 3:4]
    b[..., :3] = np.divide(b[..., :3] * 255, al, out=np.zeros_like(b[..., :3]), where=al > 0)
    return np.clip(b, 0, 255)
def fade(h, start, end):  # 1 above start, 0 below end (shares of the height), smooth
    y = np.linspace(0, 1, h)[:, None]; t = np.clip((y - start) / (end - start), 0, 1); return 1 - t * t * (3 - 2 * t)
def save(b, n):
    Image.fromarray(np.uint8(b.round()), 'RGBA').save(f'{out}/{n}.webp', quality=86, method=6, exact=False); print(n, b.shape[1], b.shape[0])
save(tile('cloudsea', 1024), 'tile-cloudsea')
a = tile('aurora', 1024); a[..., :3] *= fade(a.shape[0], .55, 1)[..., None]; a[..., 3] = 255; save(a, 'tile-aurora')
s = tile('stars', 1024); base = np.percentile(s[..., :3].reshape(-1, 3), 60, axis=0)
s[..., :3] = np.clip((s[..., :3] - base) * 1.4, 0, 255) * fade(s.shape[0], .5, 1)[..., None]; s[..., 3] = 255; save(s, 'tile-stars')
w = tile('water', 1024); w[..., 3] = 255 * (1 - fade(w.shape[0], 0, .35)); save(w, 'tile-water')
