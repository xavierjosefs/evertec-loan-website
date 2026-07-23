import { ShieldAlert } from "lucide-react";
import type { CustomerConsent } from "../../types/customerProfile";

type Props = {
  value: CustomerConsent[];
  editing: boolean;
  onChange: (key: string, accepted: boolean) => void;
};

export default function ConsentSection({ value, editing, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs leading-5 text-amber-900">
            Estos textos son provisionales y quedan pendientes de revisión
            legal. No representan una declaración legal definitiva.
          </p>
        </div>
      </div>

      {value.map((consent) => (
        <label
          key={consent.key}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <input
            disabled={!editing}
            checked={consent.accepted}
            onChange={(event) => onChange(consent.key, event.target.checked)}
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="block text-sm font-medium leading-6 text-slate-700">
              {consent.label}
            </span>
            {consent.acceptedAt ? (
              <span className="mt-1 block text-xs text-slate-500">
                Aceptado el {new Date(consent.acceptedAt).toLocaleString("es-DO")}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}
