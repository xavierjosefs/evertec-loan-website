import {
  AirVent,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Flame,
  Package2,
  Refrigerator,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tv,
  WalletCards,
  WashingMachine,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductCard from "../components/ProductCard";
import { getCategories, getFeaturedProducts } from "../services/productService";
import type { Product, ProductCategory } from "../types/product";

const categoryIcons: Record<string, typeof Package2> = {
  "air-conditioning": AirVent,
  "washing-machines": WashingMachine,
  refrigerators: Refrigerator,
  stoves: Flame,
  televisions: Tv,
};

const processSteps = [
  {
    number: "01",
    icon: SlidersHorizontal,
    title: "Encuentra tu producto",
    text: "Explora el catálogo y filtra por categoría, marca, precio y disponibilidad.",
  },
  {
    number: "02",
    icon: WalletCards,
    title: "Elige tus cuotas",
    text: "Selecciona el plazo disponible y consulta una estimación de tu pago mensual.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Envía tu solicitud",
    text: "Completa tus datos y consulta el estado de la solicitud desde tu cuenta.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([getFeaturedProducts(), getCategories()])
      .then(([products, nextCategories]) => {
        if (!mounted) {
          return;
        }

        setFeatured(products);
        setCategories(nextCategories);
      })
      .catch(() => {
        if (mounted) {
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
  }, []);

  return (
    <main className="overflow-hidden">
      <section className="relative bg-slate-950 text-white">
        <div
          className="
            pointer-events-none absolute -left-32 -top-40
            h-[420px] w-[420px] rounded-full bg-brand-600/20
            blur-[110px]
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none absolute -bottom-48 right-0
            h-[520px] w-[520px] rounded-full bg-brand-500/10
            blur-[120px]
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)]
            [background-size:48px_48px]
          "
          aria-hidden="true"
        />

        <div
          className="
            relative mx-auto grid min-h-[680px] w-full max-w-[1440px]
            items-center gap-12 px-4 py-16 sm:px-6
            lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]
            lg:px-8 lg:py-20
          "
        >
          <div className="max-w-3xl">
            <div
              className="
                inline-flex items-center gap-2 rounded-full
                border border-brand-400/20 bg-brand-500/10
                px-3.5 py-2 text-xs font-semibold uppercase
                tracking-[0.15em] text-brand-300 backdrop-blur-sm
              "
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Financiamiento para tu hogar
            </div>

            <h1
              className="
                mt-6 text-balance text-4xl font-bold leading-[1.08]
                tracking-[-0.035em] text-white
                sm:text-5xl lg:text-6xl xl:text-[4.5rem]
              "
            >
              Equipa tu hogar hoy y{" "}
              <span
                className="
                  bg-gradient-to-r from-brand-400 to-brand-300
                  bg-clip-text text-transparent
                "
              >
                págalo a tu ritmo.
              </span>
            </h1>

            <p
              className="
                mt-6 max-w-2xl text-pretty text-base leading-8
                text-slate-300 sm:text-lg
              "
            >
              Encuentra los electrodomésticos que necesitas, elige la cantidad
              de cuotas y completa tu solicitud de financiamiento en pocos
              pasos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/productos"
                className="
                  group inline-flex min-h-13 items-center justify-center
                  gap-2 rounded-xl bg-brand-600 px-7 py-3.5
                  text-sm font-semibold text-white
                  shadow-[0_18px_40px_-20px_rgba(245,110,37,0.9)]
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:bg-brand-500
                  focus-visible:outline-none focus-visible:ring-4
                  focus-visible:ring-brand-500/40
                "
              >
                Explorar productos
                <ArrowRight
                  className="
                    h-4 w-4 transition-transform
                    group-hover:translate-x-1
                  "
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/mis-solicitudes"
                className="
                  inline-flex min-h-13 items-center justify-center
                  rounded-xl border border-slate-700 bg-slate-900/70
                  px-7 py-3.5 text-sm font-semibold text-slate-200
                  backdrop-blur-sm transition-all duration-200
                  hover:border-slate-600 hover:bg-slate-800
                  hover:text-white focus-visible:outline-none
                  focus-visible:ring-4 focus-visible:ring-slate-700
                "
              >
                Consultar solicitudes
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {[
                "Proceso sencillo",
                "Cuotas estimadas",
                "Seguimiento en línea",
              ].map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-2 text-sm text-slate-400"
                >
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-400"
                    aria-hidden="true"
                  />
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div
            className="
              relative mx-auto hidden h-[510px] w-full max-w-[540px]
              lg:block
            "
            aria-label="Productos disponibles para financiar"
          >
            <div
              className="
                absolute left-1/2 top-1/2 h-[390px] w-[390px]
                -translate-x-1/2 -translate-y-1/2 rounded-full
                border border-brand-400/10 bg-brand-500/5
              "
              aria-hidden="true"
            />

            <div
              className="
                absolute left-1/2 top-1/2 h-[300px] w-[300px]
                -translate-x-1/2 -translate-y-1/2 rounded-full
                border border-dashed border-brand-400/20
              "
              aria-hidden="true"
            />

            <div
              className="
                absolute left-1/2 top-1/2 z-10 flex h-[330px]
                w-[280px] -translate-x-1/2 -translate-y-1/2
                flex-col overflow-hidden rounded-[2.5rem]
                border border-white/20 bg-white p-6 text-slate-900
                shadow-[0_40px_90px_-35px_rgba(0,0,0,0.7)]
              "
            >
              <div
                className="
                  flex flex-1 items-center justify-center
                  rounded-[2rem] bg-gradient-to-br
                  from-brand-50 via-white to-slate-100
                "
              >
                <Refrigerator
                  className="h-32 w-32 text-brand-600"
                  strokeWidth={1.15}
                  aria-hidden="true"
                />
              </div>

              <span className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Para tu cocina
              </span>

              <strong className="mt-1 text-xl tracking-tight">
                Electrodomésticos
              </strong>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Cuotas flexibles</span>

                <span
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl bg-brand-600 text-white
                  "
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div
              className="
                absolute left-0 top-16 z-20 w-48 rounded-3xl
                border border-white/15 bg-white/10 p-4
                shadow-2xl backdrop-blur-xl
              "
            >
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl bg-brand-400/15 text-brand-300
                "
              >
                <AirVent className="h-6 w-6" aria-hidden="true" />
              </div>

              <strong className="mt-3 block text-sm text-white">
                Aires acondicionados
              </strong>

              <span className="mt-1 block text-xs text-slate-400">
                Confort para cada espacio
              </span>
            </div>

            <div
              className="
                absolute bottom-12 right-0 z-20 w-48 rounded-3xl
                border border-white/15 bg-white/10 p-4
                shadow-2xl backdrop-blur-xl
              "
            >
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl bg-violet-400/15 text-violet-300
                "
              >
                <Tv className="h-6 w-6" aria-hidden="true" />
              </div>

              <strong className="mt-3 block text-sm text-white">
                Entretenimiento
              </strong>

              <span className="mt-1 block text-xs text-slate-400">
                Tecnología para disfrutar
              </span>
            </div>

            <div
              className="
                absolute right-3 top-8 z-30 flex items-center gap-3
                rounded-2xl border border-emerald-300/20
                bg-emerald-400/10 px-4 py-3 backdrop-blur-xl
              "
            >
              <BadgeCheck
                className="h-5 w-5 text-emerald-300"
                aria-hidden="true"
              />

              <div>
                <strong className="block text-xs text-white">
                  Solicitud sencilla
                </strong>

                <span className="block text-[11px] text-emerald-200/70">
                  100% en línea
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-px border-b border-slate-200 bg-white">
        <div
          className="
            mx-auto grid w-full max-w-[1440px] divide-y
            divide-slate-200 px-4 sm:px-6 md:grid-cols-3
            md:divide-x md:divide-y-0 lg:px-8
          "
        >
          {processSteps.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.number}
                className="
                  group relative flex gap-4 px-2 py-7
                  sm:px-5 md:py-9 lg:px-8
                "
              >
                <span
                  className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-2xl bg-brand-50
                    text-brand-600 transition-colors
                    group-hover:bg-brand-600 group-hover:text-white
                  "
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                      Paso {item.number}
                    </span>
                  </div>

                  <h2 className="mt-1 text-base font-semibold text-slate-950">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div
            className="
              flex flex-col gap-5 sm:flex-row
              sm:items-end sm:justify-between
            "
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Productos destacados
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Opciones elegidas para ti
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Descubre algunos de nuestros productos disponibles y calcula una
                cuota estimada antes de solicitar.
              </p>
            </div>

            <Link
              to="/productos?destacados=true"
              className="
                group inline-flex items-center gap-2 text-sm
                font-semibold text-brand-700 transition-colors
                hover:text-brand-800
              "
            >
              Ver todos los destacados
              <ArrowRight
                className="
                  h-4 w-4 transition-transform
                  group-hover:translate-x-1
                "
                aria-hidden="true"
              />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10">
              <LoadingState label="Cargando productos destacados..." />
            </div>
          ) : loadError || featured.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No hay productos destacados"
                message="Explora el catálogo para conocer todos los productos disponibles."
                actionLabel="Explorar productos"
                actionTo="/productos"
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div
          className="
            relative mx-auto flex w-full max-w-[1376px]
            flex-col items-start justify-between gap-8
            overflow-hidden rounded-[2rem] bg-brand-600
            px-6 py-10 text-white
            shadow-[0_30px_70px_-40px_rgba(245,110,37,0.8)]
            sm:px-10 sm:py-12 lg:flex-row lg:items-center
            lg:px-14 lg:py-14
          "
        >
          <div
            className="
              pointer-events-none absolute -right-20 -top-32
              h-80 w-80 rounded-full border-[60px]
              border-white/5
            "
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
              Comienza hoy
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Encuentra el producto ideal para tu hogar.
            </h2>

            <p className="mt-4 text-sm leading-7 text-brand-100 sm:text-base">
              Explora el catálogo, selecciona tus cuotas y prepara tu solicitud
              en minutos.
            </p>
          </div>

          <Link
            to="/productos"
            className="
              group relative inline-flex min-h-13 shrink-0
              items-center justify-center gap-2 rounded-xl bg-white
              px-7 py-3.5 text-sm font-semibold text-brand-700
              shadow-lg transition-all duration-200
              hover:-translate-y-0.5 hover:bg-brand-50
              focus-visible:outline-none focus-visible:ring-4
              focus-visible:ring-white/30
            "
          >
            Ver productos
            <ArrowRight
              className="
                h-4 w-4 transition-transform
                group-hover:translate-x-1
              "
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
