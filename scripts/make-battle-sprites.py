# バトルリーチのミニキャラ（assets/battle/ の生成画像、各 2172×724・横4ポーズ）から、液晶で使う1枚のシート
# assets/battle-sprites.webp（4列×3行、1マス 272×362）を作る。
#   1行目 ハナ：構え・魔法・必殺技のため・勝ちポーズ（構えと魔法は左右反転して、杖が右の敵を向くようにする）
#   2行目 ハナ（復活）：見送る・光りだす・復活・とどめ（とどめのビームはマスの右端で切れているので、右側を薄く消してプログラムで描き足す）
#   3行目 モクモ：構え・攻撃・目を回す・去る（全部左右反転して、左のハナを向くようにする）
# マスの境目にはみ出した髪や光が線にならないよう、マスの四辺を少しぼかす。足元の位置は battle-fx.js の BATTLE_CELLS に書く。
# 使い方: python3 scripts/make-battle-sprites.py
from PIL import Image, ImageOps
import numpy as np

SRC = 'assets/battle/{}.png'
ROWS = [('battle-hana', [True, True, False, False]), ('battle-hana-revive', [False] * 4), ('enemy-cloud', [True] * 4)]
CELL, OUT = (543, 724), (272, 362)
# 隣のマスの絵がはみ出している所（元画像のマスの右端から何pxを消すか）。モクモの構えの右端に、攻撃の雲と稲妻が少し入っている。
CUT_RIGHT = {('enemy-cloud', 0): 56}

def feather(a, edge=40, beam=False):
    h, w = a.shape
    x = np.arange(w)[None, :].astype(float)
    y = np.arange(h)[:, None].astype(float)
    k = np.clip(np.minimum(x, w - 1 - x) / edge, 0, 1) * np.clip(np.minimum(y, h - 1 - y) / (edge / 2), 0, 1)
    if beam:
        k = k * np.clip((w - x) / (w - 400), 0, 1) ** 1.5 * (x > 400) + k * (x <= 400)
    return (a * k).astype(np.uint8)

sheet = Image.new('RGBA', (OUT[0] * 4, OUT[1] * len(ROWS)), (0, 0, 0, 0))
for r, (name, flips) in enumerate(ROWS):
    im = Image.open(SRC.format(name)).convert('RGBA')
    for c in range(4):
        cell = im.crop((c * CELL[0], 0, (c + 1) * CELL[0], CELL[1]))
        px = np.array(cell)
        cut = CUT_RIGHT.get((name, c))
        if cut:
            px[:, -cut:, 3] = 0
        px[:, :, 3] = feather(px[:, :, 3], beam=(name == 'battle-hana-revive' and c == 3))
        cell = Image.fromarray(px)
        if flips[c]:
            cell = ImageOps.mirror(cell)
        cell = cell.resize(OUT, Image.LANCZOS)
        a = np.array(cell)[:, :, 3]
        ys, xs = np.where(a > 40)
        bottom = ys.max()
        ly, lx = np.where(a[bottom - 45:bottom + 1] > 40)
        print(f'{name} {c}: feet x={int(lx.mean())} y={bottom}')
        sheet.alpha_composite(cell, (c * OUT[0], r * OUT[1]))
sheet.save('assets/battle-sprites.webp', 'WEBP', quality=86, method=6)
print('saved', sheet.size)
