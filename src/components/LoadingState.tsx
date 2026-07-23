interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = "Cargando información...",
}: LoadingStateProps) {
  return (
    <div
      className="
        relative flex min-h-[320px] w-full items-center justify-center
        overflow-hidden rounded-3xl border border-slate-200/80
        bg-white px-6 py-14
        shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)]
      "
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="
          pointer-events-none absolute left-1/2 top-0 h-48 w-72
          -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-brand-100/60 blur-3xl
        "
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="relative flex h-16 w-16 items-center justify-center"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />

          <div
            className="
              absolute inset-0 animate-spin rounded-full border-4
              border-transparent border-t-brand-600 border-r-brand-600
            "
          />

          <div className="h-3 w-3 animate-pulse rounded-full bg-brand-600" />
        </div>

        <p className="mt-5 text-sm font-medium text-slate-600 sm:text-base">
          {label}
        </p>

        <div
          className="mt-3 flex items-center justify-center gap-1.5"
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-300" />

          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400"
            style={{ animationDelay: "150ms" }}
          />

          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
