import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/format";
import ProductVisual from "./ProductVisual";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== undefined && product.salePrice < product.price;

  const discountPercentage = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  const maximumTerm =
    product.financingTerms?.maximum && product.financingTerms.maximum > 0
      ? product.financingTerms.maximum
      : null;

  const productUrl = `/productos/${product.id}`;

  return (
    <article
      className="
        group flex h-full flex-col overflow-hidden rounded-3xl
        border border-slate-200/80 bg-white
        shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]
        transition-all duration-300
        hover:-translate-y-1 hover:border-brand-200
        hover:shadow-[0_25px_55px_-28px_rgba(245,110,37,0.25)]
      "
    >
      <div className="relative overflow-hidden bg-slate-50">
        <Link
          to={productUrl}
          className="
            block aspect-[4/3] overflow-hidden
            focus-visible:outline-none focus-visible:ring-4
            focus-visible:ring-inset focus-visible:ring-brand-200
          "
          aria-label={`Ver detalles de ${product.name}`}
        >
          <div
            className="
              h-full w-full transition-transform duration-500
              ease-out group-hover:scale-[1.035]
            "
          >
            <ProductVisual product={product} />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isFeatured ? (
            <span
              className="
                inline-flex items-center gap-1.5 rounded-full
                border border-white/70 bg-white/95 px-3 py-1.5
                text-xs font-semibold text-brand-700 shadow-sm
                backdrop-blur-sm
              "
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Destacado
            </span>
          ) : null}

          {hasDiscount ? (
            <span
              className="
                rounded-full bg-rose-600 px-3 py-1.5
                text-xs font-bold text-white shadow-sm
              "
            >
              -{discountPercentage}%
            </span>
          ) : null}
        </div>

        <span
          className={`
            absolute bottom-4 right-4 inline-flex items-center gap-1.5
            rounded-full border px-3 py-1.5 text-xs font-semibold
            shadow-sm backdrop-blur-sm
            ${
              product.isAvailable
                ? "border-emerald-100 bg-emerald-50/95 text-emerald-700"
                : "border-slate-200 bg-white/95 text-slate-500"
            }
          `}
        >
          {product.isAvailable ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
          )}

          {product.isAvailable ? "Disponible" : "No disponible"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
          {product.brand}
        </span>

        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-slate-900">
          <Link
            to={productUrl}
            className="
              transition-colors hover:text-brand-700
              focus-visible:rounded focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-500
              focus-visible:ring-offset-2
            "
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {product.shortDescription}
        </p>

        <div className="mt-5">
          <span className="block text-xs font-medium text-slate-500">
            Precio
          </span>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <strong className="text-2xl font-bold tracking-tight text-slate-950">
              {formatMoney(currentPrice, product.currency)}
            </strong>

            {hasDiscount ? (
              <span className="text-sm font-medium text-slate-400 line-through">
                {formatMoney(product.price, product.currency)}
              </span>
            ) : null}
          </div>
        </div>

        {maximumTerm ? (
          <div
            className="
              mt-4 flex items-center gap-2 rounded-2xl
              border border-brand-100 bg-brand-50/70 px-3.5 py-3
              text-sm text-brand-800
            "
          >
            <span
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-xl bg-white text-brand-600 shadow-sm
              "
            >
              <Clock3 className="h-4 w-4" aria-hidden="true" />
            </span>

            <span>
              Fináncialo hasta en{" "}
              <strong className="font-semibold">{maximumTerm} cuotas</strong>
            </span>
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          <Link
            to={productUrl}
            className="
              flex min-h-11 w-full items-center justify-center gap-2
              rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold
              text-white transition-all duration-200
              hover:bg-brand-600
              focus-visible:outline-none focus-visible:ring-4
              focus-visible:ring-brand-200
              active:scale-[0.99]
            "
          >
            Ver detalles
            <ArrowRight
              className="
                h-4 w-4 transition-transform duration-200
                group-hover:translate-x-0.5
              "
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
