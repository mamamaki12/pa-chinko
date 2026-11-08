# 流星リーチ・天空城リーチの場面の絵（assets/generated/reach-*.png、16:9 不透明）を、液晶で使う大きさの WebP にして assets/lcd-stages/ に置く。
# python3 scripts/make-reach-scenes.py assets/generated assets/lcd-stages（流星3だけ幅が1px小さいので、全部を同じ 1280×720 にそろえる）
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
for n in ['reach-meteor-1', 'reach-meteor-2', 'reach-meteor-3', 'reach-castle-1', 'reach-castle-2', 'reach-castle-3', 'reach-castle-4']:
    im = Image.open(f'{src}/{n}.png').convert('RGB').resize((1280, 720), Image.LANCZOS)
    im.save(f'{out}/{n}.webp', quality=82, method=6); print(n, im.size)
