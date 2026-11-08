# 液晶の背景に漂う物（assets/generated/obj-*.png、透明の背景）を、液晶で使う大きさのアルファ付き WebP にして assets/lcd-objects/ に置く。
# python3 scripts/make-lcd-objects.py assets/generated assets/lcd-objects
# 生成画像の四辺に残る薄い点（alpha 8 以下）を消してから、物の周りで切り詰める。2コマの鯨・鳥は、2枚を合わせた同じ範囲で切るので位置が跳ねない。
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
def load(n):
    a = np.asarray(Image.open(f'{src}/{n}.png').convert('RGBA')).copy(); a[a[..., 3] <= 8] = 0; return a
def box(a, pad=12):
    ys, xs = np.where(a[..., 3] > 0); h, w = a.shape[:2]
    return max(0, xs.min()-pad), max(0, ys.min()-pad), min(w, xs.max()+1+pad), min(h, ys.max()+1+pad)
def save(a, bb, n, width):
    im = Image.fromarray(a).crop(bb); h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(f'{out}/{n}.webp', quality=86, method=6, exact=False); print(n, (width, h))
SIZES = {'obj-isle-a': 384, 'obj-isle-b': 384, 'obj-isle-c': 640, 'obj-ship': 384, 'obj-lantern': 128, 'obj-dragon': 640}
for n, width in SIZES.items():
    a = load(n); save(a, box(a), n, width)
for pair, width in [(('obj-whale', 'obj-whale-b'), 640), (('obj-birds', 'obj-birds-b'), 512)]:
    frames = [load(n) for n in pair]; bbs = [box(a) for a in frames]
    bb = (min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs))
    for n, a in zip(pair, frames): save(a, bb, n, width)
# 手前に重ねる物（fg-*）。画面の縁から続く絵なので、縁の側は切り詰めず、反対側の透明な余白だけを切る。
FG = {'fg-cloud-bank': (768, 'none'), 'fg-sakura-branch': (640, 'top-right'), 'fg-crystal': (512, 'bottom-left'), 'fg-vine': (768, 'top')}
for n, (width, edge) in FG.items():
    a = load(n); x0, y0, x1, y1 = box(a); h, w = a.shape[:2]
    if 'top' in edge: y0 = 0
    if 'bottom' in edge: y1 = h
    if 'left' in edge: x0 = 0
    if 'right' in edge: x1 = w
    if edge == 'top': x0, x1 = 0, w
    save(a, (x0, y0, x1, y1), n, width)
