# リーチ用の光の部品（assets/generated/ の生成画像、黒の背景）を、液晶で使う大きさの WebP にして assets/lcd-fx/ に置く。
# python3 scripts/make-lcd-fx.py assets/generated assets/lcd-fx（光の爆発は四隅で切れないよう外周をぼかす。きらめきは8粒を128pxの横一列に並べ直す）
import sys
from PIL import Image
import numpy as np
src, out = sys.argv[1], sys.argv[2]
def load(n): return Image.open(f'{src}/{n}.png').convert('RGB')
def fade_edges(im, start=.86):
    a = np.asarray(im).astype(float); h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot((xx - w/2)/(w/2), (yy - h/2)/(h/2))
    k = np.clip((1 - r) / (1 - start), 0, 1)[..., None]
    return Image.fromarray((a * k).astype(np.uint8))
def save(im, n, size):
    im = im.resize(size, Image.LANCZOS); im.save(f'{out}/{n}.webp', quality=88, method=6); print(n, size)
for n in ['fx-magic-circle', 'fx-rays', 'fx-shockwave', 'fx-petal-swirl', 'fx-star-swirl']:
    save(load(n), n, (640, 640))
save(fade_edges(load('fx-light-burst')), 'fx-light-burst', (640, 640))
save(load('fx-wings'), 'fx-wings', (768, 512))
save(load('fx-comet').crop((330, 16, 1714, 476)), 'fx-comet', (1024, 340))      # head on the left
save(load('fx-meteor-small').crop((330, 60, 742, 196)), 'fx-meteor-small', (384, 127))
sp = load('fx-sparkle-set'); strip = Image.new('RGB', (8*128, 128))
for k, (cx, cy) in enumerate([(454,243),(616,244),(780,254),(942,246),(1105,248),(1266,251),(1430,259),(1591,248)]):
    strip.paste(sp.crop((cx-128, cy-128, cx+128, cy+128)).resize((128, 128), Image.LANCZOS), (k*128, 0))
strip.save(f'{out}/fx-sparkle-set.webp', quality=88, method=6); print('fx-sparkle-set', strip.size)
