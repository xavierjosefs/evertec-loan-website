import {
  ArrowLeft,
  Home,
  PackageSearch,
  SearchX,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main
      className="
        relative flex min-h-[calc(100vh-72px)] items-center
        justify-center overflow-hidden bg-slate-50
        px-4 py-16 sm:px-6 lg:px-8
      "
    >
      <div
        className="
          pointer-events-none absolute -left-48 -top-48
          h-[500px] w-[500px] rounded-full
          bg-brand-200/50 blur-[130px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute -bottom-60 -right-40
          h-[560px] w-[560px] rounded-full
          bg-brand-100/70 blur-[140px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute inset-0 opacity-[0.025]
          [background-image:linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)]
          [background-size:48px_48px]
        "
        aria-hidden="true"
      />

      <section
        className="
          relative w-full max-w-3xl overflow-hidden
          rounded-[2rem] border border-slate-200/80 bg-white
          px-6 py-12 text-center
          shadow-[0_35px_90px_-50px_rgba(15,23,42,0.45)]
          sm:px-12 sm:py-16
        "
        aria-labelledby="not-found-title"
      >
        <div
          className="
            pointer-events-none absolute left-1/2 top-0
            h-64 w-[500px] -translate-x-1/2
            -translate-y-1/2 rounded-full
            bg-brand-100/80 blur-3xl
          "
          aria-hidden="true"
        />

        <div className="relative">
          <div
            className="
              mx-auto flex h-20 w-20 items-center justify-center
              rounded-3xl border border-brand-100 bg-brand-50
              text-brand-600
              shadow-[0_18px_40px_-24px_rgba(245,110,37,0.7)]
            "
          >
            <SearchX className="h-10 w-10" aria-hidden="true" />
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-brand-200" />

            <span
              className="
                rounded-full border border-brand-100 bg-brand-50
                px-4 py-1.5 text-xs font-bold uppercase
                tracking-[0.2em] text-brand-700
              "
            >
              Error 404
            </span>

            <span className="h-px w-10 bg-brand-200" />
          </div>

          <h1
            id="not-found-title"
            className="
              mt-5 text-balance text-3xl font-bold
              tracking-tight text-slate-950
              sm:text-4xl lg:text-5xl
            "
          >
            Esta página no está disponible
          </h1>

          <p
            className="
              mx-auto mt-4 max-w-xl text-pretty text-sm
              leading-7 text-slate-500 sm:text-base
            "
          >
            Es posible que el enlace haya cambiado, que la página haya sido
            eliminada o que la dirección ingresada no sea correcta.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="
                inline-flex min-h-12 items-center justify-center
                gap-2 rounded-xl bg-brand-600 px-6
                text-sm font-semibold text-white
                shadow-[0_14px_30px_-16px_rgba(245,110,37,0.9)]
                transition-all duration-200
                hover:-translate-y-0.5 hover:bg-brand-700
                focus-visible:outline-none focus-visible:ring-4
                focus-visible:ring-brand-200
              "
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Link>

            <Link
              to="/productos"
              className="
                inline-flex min-h-12 items-center justify-center
                gap-2 rounded-xl border border-slate-200
                bg-white px-6 text-sm font-semibold text-slate-700
                transition-colors hover:border-brand-200
                hover:bg-brand-50 hover:text-brand-700
                focus-visible:outline-none focus-visible:ring-4
                focus-visible:ring-brand-100
              "
            >
              <PackageSearch className="h-4 w-4" aria-hidden="true" />
              Explorar productos
            </Link>
          </div>

          <Link
            to={-1 as never}
            className="
              mt-7 inline-flex items-center gap-2 rounded-lg
              text-sm font-medium text-slate-500
              transition-colors hover:text-brand-700
              focus-visible:outline-none focus-visible:ring-4
              focus-visible:ring-brand-100
            "
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Regresar a la página anterior
          </Link>
        </div>
      </section>
    </main>
  );
}
