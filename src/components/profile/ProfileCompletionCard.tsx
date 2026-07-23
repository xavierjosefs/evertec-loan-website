import { AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import type { CustomerProfile, ProfileCompletion } from "../../types/customerProfile";
import { profileStatusLabels } from "../../utils/profileCompletion";

type ProfileCompletionCardProps = {
  profile: CustomerProfile;
  completion: ProfileCompletion;
  displayName: string;
  onContinue: () => void;
};

export default function ProfileCompletionCard({
  profile,
  completion,
  displayName,
  onContinue,
}: ProfileCompletionCardProps) {
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const ready = completion.status === "READY";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
      <div className="bg-slate-950 px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-brand-600 text-2xl font-bold text-white shadow-[0_20px_50px_-30px_rgba(245,110,37,0.9)]">
              {initials}
            </div>
            <div className="min-w-0">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${ready ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
                {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {profileStatusLabels[completion.status]}
              </span>
              <h1 className="mt-3 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 truncate text-sm text-slate-400">
                {profile.personal.email} · {profile.personal.primaryPhone}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="block text-xs font-medium text-slate-400">
              Perfil completado
            </span>
            <strong className="mt-1 block text-3xl font-bold">
              {completion.percentage}%
            </strong>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-7">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="text-xs font-medium text-emerald-700">
              Completados
            </span>
            <strong className="mt-1 block text-xl text-emerald-900">
              {completion.completed}
            </strong>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <span className="text-xs font-medium text-amber-700">
              Pendientes
            </span>
            <strong className="mt-1 block text-xl text-amber-900">
              {completion.pending}
            </strong>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Última actualización
            </span>
            <strong className="mt-1 block text-sm text-slate-900">
              {new Date(profile.updatedAt).toLocaleDateString("es-DO")}
            </strong>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Próximos requisitos
              </h2>
              <ul className="mt-3 space-y-2">
                {(completion.pendingRequirements.length
                  ? completion.pendingRequirements.slice(0, 4)
                  : completion.requirements.slice(0, 3)
                ).map((requirement) => (
                  <li key={requirement.key} className="flex gap-2 text-sm text-slate-600">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        requirement.completed ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {requirement.label}
                  </li>
                ))}
              </ul>
            </div>

            {!ready ? (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                Continuar completando
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
