import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileClock,
  PackageSearch,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { listApplications } from "../services/applicationService";
import type { FinancingApplication } from "../types/application";
import { formatDate, formatMoney } from "../utils/format";
import { statusLabels } from "../utils/status";

const statusStyles: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  SUBMITTED: "border-amber-200 bg-amber-50 text-amber-700",
  AI_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  PRE_APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MANUAL_REVIEW: "border-violet-200 bg-violet-50 text-violet-700",
  ADDITIONAL_INFORMATION_REQUIRED: "border-amber-200 bg-amber-50 text-amber-700",
  FINAL_APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ERROR_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  UNDER_REVIEW: "border-violet-200 bg-violet-50 text-violet-700",
  DOCUMENTS_REQUIRED:
    "border-violet-200 bg-violet-50 text-violet-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-500",
};

const statusDotStyles: Record<string, string> = {
  DRAFT: "bg-slate-400",
  SUBMITTED: "bg-amber-500",
  AI_REVIEW: "bg-sky-500",
  PRE_APPROVED: "bg-emerald-500",
  MANUAL_REVIEW: "bg-violet-500",
  ADDITIONAL_INFORMATION_REQUIRED: "bg-amber-500",
  FINAL_APPROVED: "bg-emerald-500",
  ERROR_REVIEW: "bg-amber-500",
  PENDING: "bg-amber-500",
  UNDER_REVIEW: "bg-violet-500",
  DOCUMENTS_REQUIRED: "bg-violet-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
  CANCELLED: "bg-slate-400",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<
    FinancingApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    listApplications()
      .then((result) => {
        if (!mounted) {
          return;
        }

        setApplications(result);
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

  const summary = useMemo(() => {
    const inProgress = applications.filter((application) =>
      [
        "SUBMITTED",
        "AI_REVIEW",
        "PRE_APPROVED",
        "MANUAL_REVIEW",
        "ADDITIONAL_INFORMATION_REQUIRED",
        "ERROR_REVIEW",
        "PENDING",
        "UNDER_REVIEW",
        "DOCUMENTS_REQUIRED",
      ].includes(application.status),
    ).length;

    const approved = applications.filter(
      (application) =>
        application.status === "FINAL_APPROVED" ||
        application.status === "APPROVED",
    ).length;

    return {
      total: applications.length,
      inProgress,
      approved,
    };
  }, [applications]);

  return (
    <main className="min-h-[70vh] bg-slate-50 pb-16 lg:pb-24">
      <section
        className="
          border-b border-slate-200 bg-white
          bg-[radial-gradient(circle_at_top_right,rgba(219,234,254,0.8),transparent_40%)]
        "
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <span
            className="
              inline-flex items-center gap-2 rounded-full
              border border-brand-100 bg-brand-50 px-3 py-1.5
              text-xs font-semibold uppercase tracking-[0.14em]
              text-brand-700
            "
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Seguimiento
          </span>

          <div
            className="
              mt-4 flex flex-col gap-6 lg:flex-row
              lg:items-end lg:justify-between
            "
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Mis solicitudes
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Consulta tus solicitudes de financiamiento y revisa su
                información principal desde un solo lugar.
              </p>
            </div>

            <Link
              to="/productos"
              className="
                group inline-flex min-h-11 w-fit items-center
                justify-center gap-2 rounded-xl bg-brand-600
                px-5 text-sm font-semibold text-white
                shadow-[0_12px_28px_-15px_rgba(245,110,37,0.9)]
                transition-all duration-200 hover:-translate-y-0.5
                hover:bg-brand-700 focus-visible:outline-none
                focus-visible:ring-4 focus-visible:ring-brand-200
              "
            >
              Nueva solicitud
              <ArrowRight
                className="
                  h-4 w-4 transition-transform
                  group-hover:translate-x-1
                "
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loading ? (
          <LoadingState label="Consultando tus solicitudes..." />
        ) : loadError ? (
          <EmptyState
            title="No pudimos cargar tus solicitudes"
            message="Ocurrió un inconveniente al consultar la información. Intenta ingresar nuevamente más tarde."
            actionLabel="Volver al inicio"
            actionTo="/"
          />
        ) : applications.length > 0 ? (
          <>
            <section
              className="grid gap-4 sm:grid-cols-3"
              aria-label="Resumen de solicitudes"
            >
              <article
                className="
                  flex items-center gap-4 rounded-2xl
                  border border-slate-200 bg-white p-5
                  shadow-[0_16px_40px_-32px_rgba(15,23,42,0.35)]
                "
              >
                <span
                  className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-2xl bg-slate-100
                    text-slate-600
                  "
                >
                  <ClipboardList className="h-6 w-6" aria-hidden="true" />
                </span>

                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Solicitudes totales
                  </span>

                  <strong className="mt-1 block text-2xl font-bold text-slate-950">
                    {summary.total}
                  </strong>
                </div>
              </article>

              <article
                className="
                  flex items-center gap-4 rounded-2xl
                  border border-brand-100 bg-white p-5
                  shadow-[0_16px_40px_-32px_rgba(245,110,37,0.3)]
                "
              >
                <span
                  className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-2xl bg-brand-50
                    text-brand-600
                  "
                >
                  <FileClock className="h-6 w-6" aria-hidden="true" />
                </span>

                <div>
                  <span className="text-xs font-medium text-slate-500">
                    En proceso
                  </span>

                  <strong className="mt-1 block text-2xl font-bold text-slate-950">
                    {summary.inProgress}
                  </strong>
                </div>
              </article>

              <article
                className="
                  flex items-center gap-4 rounded-2xl
                  border border-emerald-100 bg-white p-5
                  shadow-[0_16px_40px_-32px_rgba(5,150,105,0.3)]
                "
              >
                <span
                  className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-2xl bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CheckCircle2
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Aprobadas
                  </span>

                  <strong className="mt-1 block text-2xl font-bold text-slate-950">
                    {summary.approved}
                  </strong>
                </div>
              </article>
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    Historial de solicitudes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Ordenadas desde la solicitud más reciente.
                  </p>
                </div>

                <span
                  className="
                    hidden rounded-full border border-slate-200
                    bg-white px-3 py-1.5 text-xs font-medium
                    text-slate-500 sm:inline-flex
                  "
                >
                  {applications.length}{" "}
                  {applications.length === 1
                    ? "resultado"
                    : "resultados"}
                </span>
              </div>

              <div className="space-y-4">
                {applications.map((application) => {
                  const statusStyle =
                    statusStyles[application.status] ??
                    statusStyles.DRAFT;

                  const statusDot =
                    statusDotStyles[application.status] ??
                    statusDotStyles.DRAFT;

                  return (
                    <article
                      key={application.id}
                      className="
                        group overflow-hidden rounded-3xl
                        border border-slate-200 bg-white
                        shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]
                        transition-all duration-300
                        hover:border-brand-200
                        hover:shadow-[0_22px_55px_-32px_rgba(245,110,37,0.25)]
                      "
                    >
                      <div
                        className="
                          grid gap-5 p-5 sm:p-6
                          lg:grid-cols-[auto_minmax(0,1fr)_auto]
                          lg:items-center
                        "
                      >
                        <div
                          className="
                            flex h-14 w-14 shrink-0 items-center
                            justify-center rounded-2xl
                            border border-brand-100 bg-brand-50
                            text-brand-600
                          "
                        >
                          <PackageSearch
                            className="h-7 w-7"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span
                              className={`
                                inline-flex items-center gap-2
                                rounded-full border px-3 py-1
                                text-xs font-semibold ${statusStyle}
                              `}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusDot}`}
                                aria-hidden="true"
                              />

                              {statusLabels[application.status]}
                            </span>

                            <span className="text-xs font-medium text-slate-400">
                              #{application.id}
                            </span>
                          </div>

                          <h3 className="mt-3 truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                            {application.productName}
                          </h3>

                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                              <CalendarDays
                                className="h-4 w-4 text-slate-400"
                                aria-hidden="true"
                              />
                              {formatDate(application.createdAt)}
                            </span>

                            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                              <Clock3
                                className="h-4 w-4 text-slate-400"
                                aria-hidden="true"
                              />
                              {application.term} cuotas
                            </span>

                            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                              <CircleDollarSign
                                className="h-4 w-4 text-slate-400"
                                aria-hidden="true"
                              />
                              <strong className="font-semibold text-slate-700">
                                {formatMoney(
                                  application.estimatedMonthlyPayment,
                                )}
                              </strong>
                              / mes
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/productos/${application.productSlug}`}
                          className="
                            inline-flex min-h-11 items-center
                            justify-center gap-2 rounded-xl
                            border border-slate-200 bg-white px-5
                            text-sm font-semibold text-slate-700
                            transition-all duration-200
                            hover:border-brand-200 hover:bg-brand-50
                            hover:text-brand-700
                            focus-visible:outline-none
                            focus-visible:ring-4
                            focus-visible:ring-brand-100
                          "
                        >
                          Ver producto
                          <ArrowRight
                            className="
                              h-4 w-4 transition-transform
                              group-hover:translate-x-0.5
                            "
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <EmptyState
            title="Aún no tienes solicitudes"
            message="Explora nuestro catálogo, selecciona un producto y elige las cuotas que mejor se ajusten a ti."
            actionLabel="Explorar productos"
            actionTo="/productos"
          />
        )}
      </div>
    </main>
  );
}
