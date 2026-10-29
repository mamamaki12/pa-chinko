# バトルリーチのミニキャラ（assets/battle/ の生成画像、各 2172×724・横4ポーズ）から、液晶で使うシートを2枚作る。
# assets/battle-sprites.webp（ハナ、4列×2行、1マス 272×362）
#   1行目 ハナ：構え・魔法・必殺技のため・勝ちポーズ（構えと魔法は左右反転して、杖が右の敵を向くようにする）
#   2行目 ハナ（復活）：見送る・光りだす・復活・とどめ（とどめのビームはマスの右端で切れているので、右側を薄く消してプログラムで描き足す）
# マスの境目にはみ出した髪や光が線にならないよう、マスの四辺を少しぼかす。
# assets/battle-foes.webp（敵、4列×3行、1マス 400×362）：構え・攻撃・目を回す・去る
#   1行目 モクモ（全部左右反転して、左のハナを向くようにする）、2行目 グラシエ、3行目 ノクス
# 敵の絵は剣や羽が隣のマスの位置まで伸びているので、等分に切らず、つながった絵ごとに4つのポーズへ分け、
# 足元の真ん中がマスの中央に来るように置く。足元の位置は battle-fx.js の SHEET.feet・FOES.feet に書く。
# 使い方: python3 scripts/make-battle-sprites.py
from PIL import Image, ImageOps
import numpy as np
from scipy import ndimage

SRC = 'assets/battle/{}.png'
ROWS = [('battle-hana', [True, True, False, False]), ('battle-hana-revive', [False] * 4)]
FOES = [('enemy-cloud', True), ('enemy-ice', False), ('enemy-dragon', False)]
CELL, OUT, FOE_OUT = (543, 724), (272, 362), (400, 362)
SCALE = OUT[1] / CELL[1]

def feather(a, edge=40, beam=False):
    h, w = a.shape
    x = np.arange(w)[None, :].astype(float)
    y = np.arange(h)[:, None].astype(float)
    k = np.clip(np.minimum(x, w - 1 - x) / edge, 0, 1) * np.clip(np.minimum(y, h - 1 - y) / (edge / 2), 0, 1)
    if beam:
        k = k * np.clip((w - x) / (w - 400), 0, 1) ** 1.5 * (x > 400) + k * (x <= 400)
    return (a * k).astype(np.uint8)

def feet(a):
    ys, xs = np.where(a > 40)
    bottom = ys.max()
    ly, lx = np.where(a[bottom - 45:bottom + 1] > 40)
    return int(lx.mean()), int(bottom)

sheet = Image.new('RGBA', (OUT[0] * 4, OUT[1] * len(ROWS)), (0, 0, 0, 0))
for r, (name, flips) in enumerate(ROWS):
    im = Image.open(SRC.format(name)).convert('RGBA')
    for c in range(4):
        cell = im.crop((c * CELL[0], 0, (c + 1) * CELL[0], CELL[1]))
        px = np.array(cell)
        px[:, :, 3] = feather(px[:, :, 3], beam=(name == 'battle-hana-revive' and c == 3))
        cell = Image.fromarray(px)
        if flips[c]:
            cell = ImageOps.mirror(cell)
        cell = cell.resize(OUT, Image.LANCZOS)
        fx, fy = feet(np.array(cell)[:, :, 3])
        print(f'{name} {c}: feet x={fx} y={fy}')
        sheet.alpha_composite(cell, (c * OUT[0], r * OUT[1]))
sheet.save('assets/battle-sprites.webp', 'WEBP', quality=86, method=6)
print('saved', sheet.size)

# 敵：まず元画像全体を（必要なら反転して）つながった絵に分け、大きい順の4つを各ポーズの本体にする。
# 反転した絵はポーズの並びも逆になるので、右から順に数える。小さな破片や光は、いちばん近い本体のポーズに入れる。薄いぼかしも拾えるよう、ポーズごとの範囲を少し広げてから切り出す。
foes = Image.new('RGBA', (FOE_OUT[0] * 4, FOE_OUT[1] * len(FOES)), (0, 0, 0, 0))
for r, (name, flip) in enumerate(FOES):
    im = Image.open(SRC.format(name)).convert('RGBA')
    if flip:
        im = ImageOps.mirror(im)
    px = np.array(im)
    alpha = px[:, :, 3]
    lab, n = ndimage.label(alpha > 40)
    sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
    bodies = sorted(np.argsort(sizes)[-4:] + 1, key=lambda i: ndimage.center_of_mass(lab == i)[1], reverse=flip)
    centers = [ndimage.center_of_mass(lab == i)[1] for i in bodies]
    owner = np.zeros(n + 1, int)
    for i in range(1, n + 1):
        cx = ndimage.center_of_mass(lab == i)[1]
        owner[i] = int(np.argmin([abs(cx - c) for c in centers]))
    for c in range(4):
        mine = np.isin(lab, [i for i in range(1, n + 1) if owner[i] == c])
        mine = ndimage.binary_dilation(mine, iterations=14)
        pose = px.copy()
        pose[:, :, 3] = (alpha * mine).astype(np.uint8)
        img = Image.fromarray(pose).resize((round(px.shape[1] * SCALE), FOE_OUT[1]), Image.LANCZOS)
        a = np.array(img)[:, :, 3]
        fx, fy = feet(a)
        left = fx - FOE_OUT[0] // 2
        cell = Image.new('RGBA', FOE_OUT, (0, 0, 0, 0))
        cell.alpha_composite(img.crop((max(0, left), 0, left + FOE_OUT[0], FOE_OUT[1])), (max(0, -left), 0))
        cp = np.array(cell)
        cp[:, :, 3] = feather(cp[:, :, 3], edge=12)
        cell = Image.fromarray(cp)
        print(f'{name} {c}: feet y={feet(cp[:, :, 3])[1]}')
        foes.alpha_composite(cell, (c * FOE_OUT[0], r * FOE_OUT[1]))
foes.save('assets/battle-foes.webp', 'WEBP', quality=86, method=6)
print('saved', foes.size)
