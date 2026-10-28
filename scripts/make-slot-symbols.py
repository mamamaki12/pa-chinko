# パチスロの図柄（assets/slot-symbols.png の生成画像、1536×1024・透明背景に6つ）から、リールで使う1枚のシート
# assets/slot-symbol-sprites.webp（3列×2行、1マス 400×176）を作る。
#   1行目 seven・bar・cherry　2行目 bell・watermelon・replay（engine.js の図柄名、slot-view.js の SYMBOL_SHEET と同じ順）
# 図柄ごとに中の1点から透明でない所を塗りつぶしてたどり、隣の図柄の光が入らないようにその形だけを切り出す。
# 縦横比はそのままで、マスの高さの 0.9・幅の 0.96 に収まる大きさにして中央に置く（リールの1コマ 100×44 にそのまま縮めて描く）。
# 使い方: python3 scripts/make-slot-symbols.py
from PIL import Image, ImageDraw
import numpy as np

SRC, OUT, CELL = 'assets/slot-symbols.png', '{}assets/slot-symbol-sprites.webp', (400, 176)
SEEDS = [('seven', (250, 300)), ('bar', (770, 290)), ('cherry', (1180, 350)),
         ('bell', (260, 700)), ('watermelon', (770, 700)), ('replay', (1270, 735))]

src = Image.open(SRC).convert('RGBA')
alpha = np.array(src)[:, :, 3]
sheet = Image.new('RGBA', (CELL[0] * 3, CELL[1] * 2), (0, 0, 0, 0))
for i, (name, seed) in enumerate(SEEDS):
    mask = Image.fromarray(((alpha > 8) * 255).astype('uint8')).copy()  # copy: fromarray の画像は塗りつぶしが効かない
    ImageDraw.floodfill(mask, seed, 128)
    own = np.array(mask) == 128
    ys, xs = np.where(own)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    part = np.array(src.crop(box))
    part[:, :, 3] = np.where(own[box[1]:box[3], box[0]:box[2]], part[:, :, 3], 0)
    part = Image.fromarray(part)
    k = min(CELL[0] * .96 / part.width, CELL[1] * .9 / part.height)
    part = part.resize((round(part.width * k), round(part.height * k)), Image.LANCZOS)
    x, y = (i % 3) * CELL[0] + (CELL[0] - part.width) // 2, (i // 3) * CELL[1] + (CELL[1] - part.height) // 2
    sheet.alpha_composite(part, (x, y))
    print(name, box, part.size)
for root in ['', 'dist/']:
    sheet.save(OUT.format(root), 'WEBP', quality=90, method=6)
