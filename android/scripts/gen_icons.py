#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
灰烬誓约 · 应用图标生成器
================================================================
无需任何外部素材：用 Pillow 直接绘制「金剑 + 血晶 + 暗色光环」徽记，
一次性产出：
  - mipmap-*/ic_launcher.png            传统方形图标（48/72/96/144/192）
  - mipmap-*/ic_launcher_round.png      传统圆形图标
  - mipmap-*/ic_launcher_foreground.png 自适应图标前景（108dp 基准）
  - drawable-nodpi/splash_mark.png      启动页徽记（512）

用法：python android/scripts/gen_icons.py
依赖：Pillow（pip install pillow）
"""
from __future__ import annotations

import math
import os
import random
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.normpath(os.path.join(HERE, "..", "app", "src", "main", "res"))

GOLD_LIGHT = (243, 226, 184)
GOLD = (201, 162, 101)
GOLD_DARK = (142, 106, 52)
CRIMSON = (194, 65, 61)
CRIMSON_DARK = (108, 32, 34)

SUPERSAMPLE = 4  # 先放大绘制再缩小，边缘更干净


def _radial_background(size: int) -> Image.Image:
    """深色径向背景：中心略带血锈色，四周近黑。"""
    bg = Image.new("RGB", (size, size), (9, 9, 12))
    gradient = Image.radial_gradient("L").resize((size, size), Image.LANCZOS)
    # 中心亮、0.65 半径处收敛为 0
    mask = gradient.point(lambda v: max(0, 235 - int(v * 1.45)))
    glow = Image.new("RGB", (size, size), (46, 24, 27))
    bg = Image.composite(glow, bg, mask)

    # 细颗粒：避免大面积纯色渐变出现色带
    noise = Image.effect_noise((size, size), 12).convert("L")
    bg = Image.composite(Image.new("RGB", (size, size), (30, 26, 26)), bg,
                         noise.point(lambda v: 18 if v > 128 else 0))
    return bg


def _embers(size: int) -> Image.Image:
    """散落的火星：低透明度金色光点 + 轻微模糊。"""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    rng = random.Random(20261028)
    for _ in range(46):
        angle = rng.uniform(0, math.tau)
        radius = rng.uniform(0.30, 0.47) * size
        cx = size / 2 + math.cos(angle) * radius
        cy = size / 2 + math.sin(angle) * radius
        r = rng.uniform(0.0035, 0.010) * size
        alpha = rng.randint(40, 130)
        color = CRIMSON if rng.random() < 0.35 else GOLD
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(size * 0.004))


def _draw_ring(draw: ImageDraw.ImageDraw, size: int) -> None:
    """双环：外环暗金，内环更细，形成"誓约"徽章感。"""
    pad = size * 0.045
    width = max(2, int(size * 0.011))
    draw.ellipse((pad, pad, size - pad, size - pad), outline=(122, 95, 60), width=width)
    pad2 = size * 0.085
    draw.ellipse((pad2, pad2, size - pad2, size - pad2), outline=(60, 46, 34),
                 width=max(1, int(size * 0.004)))
    # 四方位刻点
    for angle in (0, 90, 180, 270):
        cx = size / 2 + math.cos(math.radians(angle)) * (size * 0.045 + width)
        cy = size / 2 + math.sin(math.radians(angle)) * (size * 0.045 + width)
        r = size * 0.008
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=GOLD)


def _draw_sword(layer: Image.Image) -> None:
    """在方形图层上绘制竖直长剑，坐标按 size 归一化。"""
    size = layer.size[0]
    d = ImageDraw.Draw(layer)
    cx = size / 2

    def y(v: float) -> float:
        return v * size

    def x(v: float) -> float:
        return cx + v * size

    # 剑刃：细长六边形，上尖下宽
    blade = [
        (cx, y(0.190)),
        (x(0.034), y(0.310)),
        (x(0.034), y(0.652)),
        (cx, y(0.706)),
        (x(-0.034), y(0.652)),
        (x(-0.034), y(0.310)),
    ]
    d.polygon(blade, fill=GOLD)
    # 刃面高光（右半）
    d.polygon([(cx, y(0.196)), (x(0.032), y(0.314)), (x(0.032), y(0.646)), (cx, y(0.700))],
              fill=GOLD_LIGHT)
    # 血槽
    d.line([(cx, y(0.235)), (cx, y(0.690))], fill=GOLD_DARK, width=max(2, int(size * 0.006)))

    # 护手：两端上翘
    guard = [
        (x(-0.150), y(0.742)), (x(0.150), y(0.742)),
        (x(0.116), y(0.706)), (x(-0.116), y(0.706)),
    ]
    d.polygon(guard, fill=GOLD_DARK)
    d.polygon([(x(-0.150), y(0.742)), (x(0.150), y(0.742)),
               (x(0.150), y(0.762)), (x(-0.150), y(0.762))], fill=GOLD)

    # 握柄
    d.rounded_rectangle((cx - size * 0.022, y(0.762), cx + size * 0.022, y(0.858)),
                        radius=size * 0.010, fill=(58, 36, 28))
    for i in range(3):
        yy = y(0.782 + i * 0.026)
        d.line([(cx - size * 0.022, yy), (cx + size * 0.022, yy)], fill=(92, 62, 40),
               width=max(1, int(size * 0.004)))

    # 柄头
    r = size * 0.030
    d.ellipse((cx - r, y(0.884) - r, cx + r, y(0.884) + r), fill=GOLD)
    d.ellipse((cx - r * 0.45, y(0.884) - r * 0.45, cx + r * 0.45, y(0.884) + r * 0.45),
              fill=(70, 44, 32))

    # 血晶：嵌在剑身中部
    gem = [(cx, y(0.452)), (x(0.040), y(0.505)), (cx, y(0.560)), (x(-0.040), y(0.505))]
    d.polygon(gem, fill=CRIMSON_DARK)
    d.polygon([(cx, y(0.466)), (x(0.028), y(0.505)), (cx, y(0.542)), (x(-0.028), y(0.505))],
              fill=CRIMSON)
    d.polygon([(cx, y(0.466)), (x(0.012), y(0.500)), (cx, y(0.530)), (x(-0.006), y(0.500))],
              fill=(226, 120, 110))


def render_mark(size: int, ring: bool = True) -> Image.Image:
    """输出透明底徽记。"""
    s = size * SUPERSAMPLE
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    if ring:
        _draw_ring(ImageDraw.Draw(layer), s)
        layer = layer.filter(ImageFilter.GaussianBlur(s * 0.0012))
    _draw_sword(layer)

    # 血晶外发光
    glow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = s / 2, s * 0.505
    r = s * 0.085
    gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=CRIMSON + (70,))
    glow = glow.filter(ImageFilter.GaussianBlur(s * 0.02))
    layer = Image.alpha_composite(glow, layer)

    return layer.resize((size, size), Image.LANCZOS)


def compose_icon(size: int, round_mask: bool) -> Image.Image:
    s = size * SUPERSAMPLE
    base = _radial_background(s).convert("RGBA")
    base = Image.alpha_composite(base, _embers(s))

    mark = render_mark(int(s * 0.82), ring=True)
    base.alpha_composite(mark, (int((s - mark.size[0]) / 2), int((s - mark.size[1]) / 2)))

    # 圆角/圆形裁切
    mask = Image.new("L", (s, s), 0)
    md = ImageDraw.Draw(mask)
    if round_mask:
        md.ellipse((0, 0, s - 1, s - 1), fill=255)
    else:
        md.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * 0.22), fill=255)
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out.resize((size, size), Image.LANCZOS)


def render_foreground(size: int) -> Image.Image:
    """自适应图标前景：内容控制在 72/108 安全区内，避免被系统裁切。"""
    s = size * SUPERSAMPLE
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    mark = render_mark(int(s * 0.60), ring=True)
    # 轻微投影，让徽记从背景中浮起
    shadow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 120), (int((s - mark.size[0]) / 2), int((s - mark.size[1]) / 2) + int(s * 0.008)), mark)
    layer = Image.alpha_composite(layer, shadow.filter(ImageFilter.GaussianBlur(s * 0.012)))
    layer.alpha_composite(mark, (int((s - mark.size[0]) / 2), int((s - mark.size[1]) / 2)))
    return layer.resize((size, size), Image.LANCZOS)


def render_monochrome(size: int) -> Image.Image:
    """Android 13+ 主题图标用的单色剪影（白色前景 + 透明底）。"""
    s = size * SUPERSAMPLE
    mark = render_mark(int(s * 0.60), ring=True)
    silhouette = Image.new("RGBA", mark.size, (255, 255, 255, 0))
    silhouette.putalpha(mark.getchannel("A"))
    out = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.alpha_composite(silhouette, (int((s - mark.size[0]) / 2), int((s - mark.size[1]) / 2)))
    return out.resize((size, size), Image.LANCZOS)


def save(image: Image.Image, *parts: str) -> None:
    path = os.path.join(RES, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    image.save(path, "PNG", optimize=True)
    print("  ->", os.path.relpath(path, RES))


def main() -> None:
    densities = {"mdpi": 1.0, "hdpi": 1.5, "xhdpi": 2.0, "xxhdpi": 3.0, "xxxhdpi": 4.0}
    for name, factor in densities.items():
        square = int(round(48 * factor))
        save(compose_icon(square, round_mask=False), f"mipmap-{name}", "ic_launcher.png")
        save(compose_icon(square, round_mask=True), f"mipmap-{name}", "ic_launcher_round.png")
        fg = int(round(108 * factor))
        save(render_foreground(fg), f"mipmap-{name}", "ic_launcher_foreground.png")
        save(render_monochrome(fg), f"mipmap-{name}", "ic_launcher_monochrome.png")

    save(render_mark(512, ring=True), "drawable-nodpi", "splash_mark.png")
    print("图标生成完成。")


if __name__ == "__main__":
    main()
