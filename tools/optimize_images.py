"""Converte as imagens-fonte (gen/*.png, geradas pelo Codex) em WebP otimizados
com várias larguras para srcset. Imagens com transparência são recortadas
nas bordas vazias antes do redimensionamento.

Uso:  python3 tools/optimize_images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "gen"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# nome-fonte -> (prefixo de saída, larguras, qualidade)
JOBS = {
    "gummy-bear.png":   ("bear",        [160, 320, 640], 82),
    "jar.png":          ("jar",         [400, 640, 900], 78),
    "strawberry.png":   ("strawberry",  [320], 74),
    "gummies-pile.png": ("gummies",     [640], 80),
    "flowers.png":      ("flowers",     [900], 72),
    "hero-woman.png":   ("hero-woman",  [480, 800, 1100], 78),
    "libido.png":       ("libido",      [600, 900, 1300], 76),
    "scene.png":        ("scene",       [480, 800, 1100], 78),
    "group.png":        ("group",       [700, 1400, 2000], 76),
    "booklet.png":      ("booklet",     [400], 78),
    "ben-hair.png":     ("ben-hair",    [360, 640], 76),
    "ben-nails.png":    ("ben-nails",   [360, 640], 76),
    "ben-skin.png":     ("ben-skin",    [360, 640], 76),
    "ben-libido.png":   ("ben-libido",  [360, 640], 76),
}

# ilustrações em line-art saem menores como PNG-8
PNG8 = {"flowers"}


def trim_alpha(im: Image.Image) -> Image.Image:
    if im.mode != "RGBA":
        return im
    alpha = im.getchannel("A")
    bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    # pixels totalmente transparentes ainda guardam cor "invisível" que pesa no
    # arquivo; zerá-los reduz bastante o WebP
    clean = Image.new("RGBA", im.size, (0, 0, 0, 0))
    clean.paste(im, mask=alpha.point(lambda v: 255 if v > 0 else 0))
    return clean.crop(bbox) if bbox else clean


def main() -> None:
    total_in = total_out = 0
    for name, (prefix, widths, quality) in JOBS.items():
        src = SRC / name
        if not src.exists():
            print(f"!! faltando {src.name}, pulando")
            continue
        total_in += src.stat().st_size
        im = trim_alpha(Image.open(src))
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA")
        for nominal in widths:
            w = min(nominal, im.width)
            h = round(im.height * w / im.width)
            resized = im.resize((w, h), Image.LANCZOS)
            if prefix in PNG8:
                # traço fino: PNG com paleta sai bem menor que WebP
                out = OUT / f"{prefix}-{nominal}.png"
                resized.quantize(64, method=Image.FASTOCTREE).save(out, optimize=True)
            else:
                out = OUT / f"{prefix}-{nominal}.webp"
                resized.save(out, "WEBP", quality=quality, method=6)
            total_out += out.stat().st_size
            print(f"{out.name:28s} {w}x{h}  {out.stat().st_size / 1024:6.1f} KB")

    # fotos de clientes ("recebidos"), baixadas do site antigo
    for src in sorted((SRC / "recebidos").glob("r[0-9]*.png")):
        im = Image.open(src).convert("RGB")
        total_in += src.stat().st_size
        for w in (320, 560):
            h = round(im.height * w / im.width)
            out = OUT / f"recebido-{src.stem[1:]}-{w}.webp"
            im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=76, method=6)
            total_out += out.stat().st_size
            print(f"{out.name:28s} {w}x{h}  {out.stat().st_size / 1024:6.1f} KB")

    # antes & depois (Codex) — imagens ilustrativas
    for src in sorted((SRC / "ba").glob("*-*.png")):
        im = Image.open(src).convert("RGB")
        total_in += src.stat().st_size
        for w in (400, 640):
            out = OUT / f"ba-{src.stem}-{w}.webp"
            im.resize((w, w), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
            total_out += out.stat().st_size
            print(f"{out.name:28s} {w}x{w}  {out.stat().st_size / 1024:6.1f} KB")

    # avatares dos depoimentos (Codex)
    for src in sorted((SRC / "avatars").glob("*.png")):
        im = Image.open(src).convert("RGB")
        side = min(im.size)
        im = im.crop(((im.width - side) // 2, (im.height - side) // 2, (im.width + side) // 2, (im.height + side) // 2))
        total_in += src.stat().st_size
        out = OUT / f"avatar-{src.stem}.webp"
        im.resize((96, 96), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
        total_out += out.stat().st_size
        print(f"{out.name:28s} 96x96  {out.stat().st_size / 1024:6.1f} KB")

    # favicon + og image
    bear = trim_alpha(Image.open(SRC / "gummy-bear.png"))
    bear.thumbnail((180, 180), Image.LANCZOS)
    fav = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
    fav.paste(bear, ((192 - bear.width) // 2, (192 - bear.height) // 2), bear)
    fav.save(OUT / "favicon.png", optimize=True)

    scene = Image.open(SRC / "scene.png").convert("RGB")
    s = scene.width
    og = scene.crop((0, round(s * 0.2), s, round(s * 0.2 + s / 1.91))).resize((1200, 628), Image.LANCZOS)
    og.save(OUT / "og.jpg", quality=80, optimize=True, progressive=True)

    print(f"\nfonte: {total_in / 1e6:.1f} MB  ->  webp: {total_out / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
