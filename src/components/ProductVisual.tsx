import type { Product } from "../types/product";

type ProductVisualProps = {
  product: Product;
  size?: "card" | "hero" | "thumb";
};

const toneClasses = {
  clean:
    "from-slate-50 via-white to-brand-50 text-slate-700 [--accent:245_110_37]",
  cool:
    "from-brand-50 via-white to-brand-100 text-brand-700 [--accent:245_110_37]",
  fresh:
    "from-emerald-50 via-white to-brand-50 text-emerald-700 [--accent:16_185_129]",
  warm:
    "from-amber-50 via-brand-50 to-orange-100 text-amber-800 [--accent:245_158_11]",
  dark:
    "from-slate-800 via-slate-900 to-brand-950 text-white [--accent:255_153_98]",
};

const sizeClasses = {
  card: {
    wrapper: "h-full min-h-[230px]",
    object: "h-32 w-44 sm:h-36 sm:w-52",
    label: "text-xs",
  },
  hero: {
    wrapper: "min-h-[360px] sm:min-h-[460px]",
    object: "h-48 w-64 sm:h-64 sm:w-80 lg:h-72 lg:w-96",
    label: "text-sm",
  },
  thumb: {
    wrapper: "h-full min-h-[86px]",
    object: "h-12 w-20",
    label: "text-[10px]",
  },
};

export default function ProductVisual({
  product,
  size = "card",
}: ProductVisualProps) {
  const tone = product.images[0]?.tone ?? "clean";
  const image = product.images[0];
  const selectedTone = toneClasses[tone];
  const selectedSize = sizeClasses[size];
  const shortName = product.name
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  return (
    <div
      role="img"
      aria-label={product.images[0]?.alt ?? product.name}
      className={`
        relative flex h-full w-full items-center justify-center
        overflow-hidden bg-gradient-to-br ${selectedTone}
        ${selectedSize.wrapper}
      `}
    >
      <span
        className="
          pointer-events-none absolute -left-10 top-8 h-36 w-36
          rounded-full bg-[rgb(var(--accent))]/15 blur-3xl
        "
        aria-hidden="true"
      />
      <span
        className="
          pointer-events-none absolute -bottom-12 -right-8 h-44 w-44
          rounded-full bg-white/55 blur-3xl
        "
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        {image?.src ? (
          <img
            src={image.src}
            alt={image.alt || product.name}
            loading={size === "hero" ? "eager" : "lazy"}
            className={`
              ${selectedSize.object}
              rounded-[1.5rem] object-contain drop-shadow-xl
            `}
          />
        ) : (
          <div
            className={`
              relative rounded-[1.75rem] border border-white/70
              bg-white/55 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.7)]
              backdrop-blur-sm ${selectedSize.object}
            `}
          >
            <span
              className="
                absolute inset-x-7 top-5 h-2 rounded-full
                bg-[rgb(var(--accent))]/25
              "
              aria-hidden="true"
            />
            <span
              className="
                absolute bottom-5 left-1/2 h-2/3 w-[58%]
                -translate-x-1/2 rounded-[1.35rem]
                bg-gradient-to-br from-white to-slate-100
                shadow-inner
              "
              aria-hidden="true"
            />
            <span
              className="
                absolute bottom-8 left-1/2 h-12 w-12
                -translate-x-1/2 rounded-full
                bg-[rgb(var(--accent))]/90 shadow-lg
              "
              aria-hidden="true"
            />
          </div>
        )}

        {size !== "thumb" ? (
          <span
            className={`
              mt-5 max-w-[14rem] truncate rounded-full bg-white/70 px-3 py-1
              font-semibold uppercase tracking-[0.14em] shadow-sm
              ${selectedSize.label}
            `}
          >
            {shortName}
          </span>
        ) : null}
      </div>
    </div>
  );
}
