import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Info,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import EstimatePanel from "../components/EstimatePanel";
import LoadingState from "../components/LoadingState";
import ProductCard from "../components/ProductCard";
import ProductVisual from "../components/ProductVisual";
import { useAuth } from "../hooks/useAuth";
import {
  getFeaturedProducts,
  getProductById,
} from "../services/productService";
import type { Product } from "../types/product";
import { formatMoney } from "../utils/format";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadError(false);
    setSelectedImageIndex(0);

    if (!id) {
      setProduct(null);
      setLoadError(true);
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    Promise.all([getProductById(id), getFeaturedProducts()])
      .then(([found, featured]) => {
        if (!mounted) {
          return;
        }

        setProduct(found);

        setSimilar(
          featured
            .filter((item) => item.id !== found?.id)
            .sort((a, b) => {
              const aMatches = a.categoryId === found?.categoryId ? 1 : 0;

              const bMatches = b.categoryId === found?.categoryId ? 1 : 0;

              return bMatches - aMatches;
            })
            .slice(0, 3),
        );

        setSelectedTerm(found?.financingTerms.default ?? 12);
      })
      .catch((error) => {
        console.error("Error cargando el producto:", error);

        if (mounted) {
          setProduct(null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const price = useMemo(
    () => (product ? (product.salePrice ?? product.price) : 0),
    [product],
  );

  const hasDiscount = Boolean(
    product?.salePrice !== undefined && product.salePrice < product.price,
  );

  const discountPercentage =
    product && hasDiscount
      ? Math.round(((product.price - price) / product.price) * 100)
      : 0;

  const visualProduct = useMemo(() => {
    if (!product || product.images.length === 0) {
      return product;
    }

    const selectedImage =
      product.images[selectedImageIndex] ?? product.images[0];

    return {
      ...product,
      images: [
        selectedImage,
        ...product.images.filter((_, index) => index !== selectedImageIndex),
      ],
    };
  }, [product, selectedImageIndex]);

  const startFinancing = () => {
    if (!product || !product.isAvailable) {
      return;
    }

    const target =
      `/financiamiento/solicitar?producto=${product.id}` +
      `&cuotas=${selectedTerm}`;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    navigate(target);
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <LoadingState label="Cargando información del producto..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <EmptyState
          title="No pudimos cargar el producto"
          message="Ocurrió un inconveniente al consultar la información. Regresa al catálogo para continuar explorando."
          actionLabel="Volver al catálogo"
          actionTo="/productos"
        />
      </main>
    );
  }

  if (!product || !visualProduct) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <EmptyState
          title="Producto no encontrado"
          message="El producto solicitado no existe o ya no se encuentra disponible en nuestro catálogo."
          actionLabel="Explorar productos"
          actionTo="/productos"
        />
      </main>
    );
  }

  return (
    <main className="bg-slate-50 pb-16 lg:pb-24">
      <div className="border-b border-slate-200 bg-white">
        <div
          className="
            mx-auto flex w-full max-w-[1440px] items-center
            gap-2 overflow-x-auto px-4 py-4 text-sm
            sm:px-6 lg:px-8
          "
          aria-label="Migas de navegación"
        >
          <Link
            to="/"
            className="
              shrink-0 text-slate-500 transition-colors
              hover:text-brand-700
            "
          >
            Inicio
          </Link>

          <ChevronRight
            className="h-4 w-4 shrink-0 text-slate-300"
            aria-hidden="true"
          />

          <Link
            to="/productos"
            className="
              shrink-0 text-slate-500 transition-colors
              hover:text-brand-700
            "
          >
            Productos
          </Link>

          <ChevronRight
            className="h-4 w-4 shrink-0 text-slate-300"
            aria-hidden="true"
          />

          <span className="truncate font-medium text-slate-800">
            {product.name}
          </span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to="/productos"
          className="
            inline-flex items-center gap-2 rounded-lg
            text-sm font-semibold text-slate-500
            transition-colors hover:text-brand-700
            focus-visible:outline-none focus-visible:ring-4
            focus-visible:ring-brand-100
          "
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al catálogo
        </Link>

        <div
          className="
            mt-6 grid items-start gap-8
            lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]
            lg:gap-12
          "
        >
          <div className="min-w-0">
            <div
              className="
                relative overflow-hidden rounded-[2rem]
                border border-slate-200 bg-white
                shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)]
              "
            >
              {product.isFeatured ? (
                <span
                  className="
                    absolute left-5 top-5 z-20 inline-flex
                    items-center gap-1.5 rounded-full
                    border border-white/80 bg-white/90
                    px-3 py-1.5 text-xs font-semibold
                    text-brand-700 shadow-sm backdrop-blur-sm
                    sm:left-6 sm:top-6
                  "
                >
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Producto destacado
                </span>
              ) : null}

              {hasDiscount ? (
                <span
                  className="
                    absolute right-5 top-5 z-20 rounded-full
                    bg-rose-600 px-3 py-1.5 text-xs font-bold
                    text-white shadow-sm sm:right-6 sm:top-6
                  "
                >
                  -{discountPercentage}%
                </span>
              ) : null}

              <ProductVisual product={visualProduct} size="hero" />
            </div>

            {product.images.length > 1 ? (
              <div
                className="
                  mt-4 grid grid-cols-4 gap-3
                  sm:grid-cols-5 lg:grid-cols-6
                "
                aria-label="Galería del producto"
              >
                {product.images.map((image, index) => {
                  const isSelected = index === selectedImageIndex;

                  const thumbnailProduct = {
                    ...product,
                    images: [
                      image,
                      ...product.images.filter(
                        (_, imageIndex) => imageIndex !== index,
                      ),
                    ],
                  };

                  return (
                    <button
                      key={image.id}
                      type="button"
                      aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`
                        relative aspect-square overflow-hidden
                        rounded-2xl border bg-white p-0.5
                        transition-all duration-200
                        focus-visible:outline-none
                        focus-visible:ring-4 focus-visible:ring-brand-100
                        ${
                          isSelected
                            ? "border-brand-600 ring-2 ring-brand-100"
                            : "border-slate-200 hover:border-brand-300"
                        }
                      `}
                    >
                      <ProductVisual product={thumbnailProduct} size="thumb" />

                      {isSelected ? (
                        <span
                          className="
                            absolute right-1.5 top-1.5 flex h-5 w-5
                            items-center justify-center rounded-full
                            bg-brand-600 text-white shadow-sm
                          "
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="
                    inline-flex rounded-full border border-brand-100
                    bg-brand-50 px-3 py-1 text-xs font-semibold
                    uppercase tracking-[0.13em] text-brand-700
                  "
                >
                  {product.brand}
                </span>

                <span className="text-sm font-medium text-slate-400">
                  Modelo {product.model}
                </span>
              </div>

              <h1
                className="
                  mt-4 text-3xl font-bold leading-tight
                  tracking-[-0.025em] text-slate-950
                  sm:text-4xl lg:text-[2.75rem]
                "
              >
                {product.name}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span
                  className={`
                    inline-flex items-center gap-2 rounded-full
                    border px-3 py-1.5 text-xs font-semibold
                    ${
                      product.isAvailable
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {product.isAvailable ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  )}

                  {product.isAvailable
                    ? "Disponible para solicitar"
                    : "No disponible"}
                </span>

                {product.isFeatured ? (
                  <span
                    className="
                      inline-flex items-center gap-2 rounded-full
                      border border-violet-200 bg-violet-50
                      px-3 py-1.5 text-xs font-semibold
                      text-violet-700
                    "
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Recomendado
                  </span>
                ) : null}
              </div>

              <div
                className="
                  mt-7 rounded-3xl border border-slate-200
                  bg-white p-5
                  shadow-[0_18px_50px_-38px_rgba(15,23,42,0.3)]
                  sm:p-6
                "
              >
                <span className="text-xs font-medium text-slate-500">
                  Precio del producto
                </span>

                <div className="mt-1 flex flex-wrap items-baseline gap-3">
                  <strong className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {formatMoney(price, product.currency)}
                  </strong>

                  {hasDiscount ? (
                    <span className="text-base font-medium text-slate-400 line-through">
                      {formatMoney(product.price, product.currency)}
                    </span>
                  ) : null}
                </div>

                {hasDiscount ? (
                  <div
                    className="
                      mt-4 inline-flex items-center gap-2
                      rounded-xl bg-rose-50 px-3 py-2
                      text-xs font-semibold text-rose-700
                    "
                  >
                    <Tag className="h-4 w-4" aria-hidden="true" />
                    Ahorras{" "}
                    {formatMoney(product.price - price, product.currency)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <EstimatePanel
                currency={product.currency}
                price={price}
                minimumTerm={product.financingTerms.minimum}
                maximumTerm={product.financingTerms.maximum}
                selectedTerm={selectedTerm}
                financingRules={
                  product.effectiveFinancingCriteria?.financingRules ?? {}
                }
                onTermChange={setSelectedTerm}
              />
            </div>

            <div
              className="
                mt-4 rounded-3xl border border-slate-200
                bg-white p-4
                shadow-[0_18px_50px_-38px_rgba(15,23,42,0.3)]
              "
            >
              <button
                type="button"
                disabled={!product.isAvailable}
                onClick={startFinancing}
                className="
                  group inline-flex min-h-13 w-full items-center
                  justify-center gap-2 rounded-xl bg-brand-600
                  px-6 text-sm font-semibold text-white
                  shadow-[0_14px_30px_-16px_rgba(245,110,37,0.9)]
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:bg-brand-700
                  disabled:cursor-not-allowed disabled:bg-slate-300
                  disabled:shadow-none disabled:hover:translate-y-0
                  focus-visible:outline-none focus-visible:ring-4
                  focus-visible:ring-brand-200
                "
              >
                <ClipboardList className="h-5 w-5" aria-hidden="true" />

                {product.isAvailable
                  ? "Solicitar financiamiento"
                  : "Producto no disponible"}

                {product.isAvailable ? (
                  <ArrowRight
                    className="
                      h-4 w-4 transition-transform
                      group-hover:translate-x-1
                    "
                    aria-hidden="true"
                  />
                ) : null}
              </button>

              <div
                className="
                  mt-4 flex items-start gap-2.5 rounded-2xl
                  bg-brand-50/70 px-3.5 py-3
                "
              >
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                  aria-hidden="true"
                />

                <p className="text-xs leading-5 text-brand-900">
                  La cuota mostrada es una estimación. El financiamiento está
                  sujeto a evaluación y aprobación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 border-y border-slate-200 bg-white py-14 sm:py-16 lg:py-20">
        <div
          className="
            mx-auto grid w-full max-w-[1440px] gap-7
            px-4 sm:px-6 lg:grid-cols-2 lg:px-8
          "
        >
          <article
            className="
              rounded-3xl border border-slate-200 bg-slate-50/60
              p-5 sm:p-7
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl bg-brand-50 text-brand-600
                "
              >
                <PackageCheck className="h-5 w-5" aria-hidden="true" />
              </span>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.13em] text-brand-600">
                  Lo más importante
                </span>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Características
                </h2>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="
                    flex items-start gap-3 rounded-2xl
                    border border-slate-200 bg-white
                    px-4 py-3.5 text-sm leading-6 text-slate-600
                  "
                >
                  <span
                    className="
                      mt-0.5 flex h-5 w-5 shrink-0 items-center
                      justify-center rounded-full bg-emerald-50
                      text-emerald-600
                    "
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>

                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="
              rounded-3xl border border-slate-200 bg-slate-50/60
              p-5 sm:p-7
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl bg-violet-50 text-violet-600
                "
              >
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.13em] text-violet-600">
                  Información técnica
                </span>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Especificaciones
                </h2>
              </div>
            </div>

            <dl
              className="
                mt-6 overflow-hidden rounded-2xl
                border border-slate-200 bg-white
              "
            >
              {product.specifications.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`
                    flex items-center justify-between gap-5
                    px-4 py-4 sm:px-5
                    ${
                      index < product.specifications.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }
                  `}
                >
                  <dt className="text-sm text-slate-500">{spec.label}</dt>

                  <dd className="text-right text-sm font-semibold text-slate-800">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div
            className="
              flex flex-col gap-5 sm:flex-row
              sm:items-end sm:justify-between
            "
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                También podrían interesarte
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Productos relacionados
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                Explora otras opciones disponibles para equipar tu hogar.
              </p>
            </div>

            <Link
              to="/productos"
              className="
                group inline-flex items-center gap-2
                text-sm font-semibold text-brand-700
                transition-colors hover:text-brand-800
              "
            >
              Ver todos los productos
              <ArrowRight
                className="
                  h-4 w-4 transition-transform
                  group-hover:translate-x-1
                "
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
