import { PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  const hasAction = Boolean(actionLabel && actionTo);

  return (
    <section
      className="
        relative flex min-h-[360px] w-full items-center justify-center
        overflow-hidden rounded-3xl border border-slate-200/80
        bg-white px-6 py-14 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)]
        sm:px-10 sm:py-16
      "
      aria-labelledby="empty-state-title"
      aria-describedby="empty-state-message"
    >
      <div
        className="
          pointer-events-none absolute left-1/2 top-0 h-48 w-72
          -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-brand-100/60 blur-3xl
        "
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <div
          className="
            mb-6 flex h-20 w-20 items-center justify-center rounded-3xl
            border border-brand-100 bg-gradient-to-br from-brand-50 to-slate-50
            text-brand-600 shadow-[0_12px_30px_-15px_rgba(245,110,37,0.55)]
          "
          aria-hidden="true"
        >
          <PackageSearch strokeWidth={1.7} className="h-9 w-9" />
        </div>

        <h2
          id="empty-state-title"
          className="text-balance text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
        >
          {title}
        </h2>

        <p
          id="empty-state-message"
          className="mt-3 max-w-sm text-pretty text-sm leading-6 text-slate-500 sm:text-base sm:leading-7"
        >
          {message}
        </p>

        {hasAction ? (
          <Link
            to={actionTo!}
            className="
              mt-7 inline-flex min-h-11 items-center justify-center rounded-xl
              bg-brand-600 px-6 py-3 text-sm font-semibold text-white
              shadow-[0_10px_25px_-10px_rgba(245,110,37,0.7)]
              transition-all duration-200
              hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_14px_30px_-10px_rgba(245,110,37,0.75)]
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200
              active:translate-y-0
            "
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
