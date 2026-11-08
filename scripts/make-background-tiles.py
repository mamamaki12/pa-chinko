"""Build horizontally repeating tiles from preserved originals (Pillow, NumPy)."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets/generated'
SIZES = {'cloudsea': (2048, 512), 'aurora': (2048, 768),
         'stars': (2048, 1024), 'water': (2048, 512)}

for name, size in SIZES.items():
    src = Image.open(ROOT / 'tile-originals' / f'tile-{name}.png').convert('RGBA')
    pixels = np.asarray(src, dtype=np.float64) / 255
    # Blend premultiplied colors, so transparent cloud edges retain their color.
    pixels[..., :3] *= pixels[..., 3:4]
    if name == 'water':
        # The generated source also contains a narrow discontinuity at its center.
        center, radius = src.width // 2, 24
        u = np.linspace(0, 1, radius * 2)[None, :, None]
        u = u * u * (3 - 2 * u)
        pixels[:, center-radius:center+radius] = (
            pixels[:, center-radius:center-radius+1] * (1-u)
            + pixels[:, center+radius-1:center+radius] * u)
    overlap = round(src.width * .125)
    t = np.linspace(0, 1, overlap)[None, :, None]
    t = t * t * t * (t * (t * 6 - 15) + 10)  # zero slope at both ends
    join = pixels[:, -overlap:] * (1 - t) + pixels[:, :overlap] * t
    tile = np.concatenate((pixels[:, overlap:-overlap], join), axis=1)
    alpha = tile[..., 3:4]
    tile[..., :3] = np.divide(tile[..., :3], alpha,
                              out=np.zeros_like(tile[..., :3]), where=alpha > 0)
    image = Image.fromarray(np.uint8(np.clip(tile * 255, 0, 255).round()), 'RGBA')
    image = image.resize(size, Image.Resampling.LANCZOS)
    out = np.array(image)
    # Make endpoint equality explicit after resampling, including cloud alpha.
    edge = ((out[:, 0].astype(np.uint16) + out[:, -1].astype(np.uint16)) / 2).round().astype(np.uint8)
    out[:, 0] = out[:, -1] = edge
    if name == 'aurora':
        # Remove almost-black haze without cutting off colored light.
        rgb = out[..., :3]
        out[..., :3] = np.clip((rgb.astype(float) - 3) * 255 / 252, 0, 255).round().astype(np.uint8)
    result = Image.fromarray(out, 'RGBA')
    if name != 'cloudsea':
        result = result.convert('RGB')
    result.save(ROOT / f'tile-{name}.png')
    assert np.array_equal(np.asarray(result)[:, 0], np.asarray(result)[:, -1])
    print(name, result.size, result.mode, 'matching horizontal edges')
