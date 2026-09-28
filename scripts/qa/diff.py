#!/usr/bin/env python3
"""视觉回归：对比两组整页截图（cdp.mjs shoot 的产物）。REPO_ONLY。

  python3 scripts/qa/diff.py <dirA> <dirB> <outDir>

每页输出：尺寸、变化像素占比、变化行段；并写一张 A | B | 热力图 的三联图（缩到宽 1200）供人工解释。
差异必须能被计划内的配色 / 布局改动解释——这个脚本只负责把差异找出来，不负责判定对错。
"""
import sys, os
import numpy as np
from PIL import Image

a_dir, b_dir, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
for name in sorted(os.listdir(a_dir)):
    if not name.endswith('.png') or not os.path.exists(os.path.join(b_dir, name)):
        continue
    A = Image.open(os.path.join(a_dir, name)).convert('RGB')
    B = Image.open(os.path.join(b_dir, name)).convert('RGB')
    w = min(A.width, B.width); h = min(A.height, B.height)
    a = np.asarray(A.crop((0, 0, w, h)), dtype=np.int16)
    b = np.asarray(B.crop((0, 0, w, h)), dtype=np.int16)
    d = np.abs(a - b).max(axis=2)
    mask = d > 24
    pct = mask.mean() * 100
    rows = np.where(mask.any(axis=1))[0]
    bands = []
    if rows.size:
        start = prev = rows[0]
        for r in rows[1:]:
            if r - prev > 40:
                bands.append((int(start), int(prev))); start = r
            prev = r
        bands.append((int(start), int(prev)))
    print(f"{name:34} A={A.width}x{A.height} B={B.width}x{B.height} changed={pct:5.2f}%  bands={bands[:8]}{' …' if len(bands) > 8 else ''}")
    heat = np.zeros((h, w, 3), dtype=np.uint8)
    heat[..., 0] = np.clip(d * 3, 0, 255)
    trip = Image.new('RGB', (w * 3, h))
    trip.paste(Image.fromarray(a.astype(np.uint8)), (0, 0))
    trip.paste(Image.fromarray(b.astype(np.uint8)), (w, 0))
    trip.paste(Image.fromarray(heat), (w * 2, 0))
    scale = 1200 / trip.width
    trip.resize((1200, max(1, int(trip.height * scale)))).save(os.path.join(out, name.replace('.png', '-diff.png')))
