import { Plus, Trash2 } from "lucide-react";
import type { PersonalReference } from "../../types/customerProfile";
import { inputClassName } from "./formClasses";
import { FieldError, RequiredMark } from "./formStyles";

type ReferenceErrors = Record<string, Partial<Record<keyof PersonalReference, string>>>;

type Props = {
  value: PersonalReference[];
  errors: ReferenceErrors;
  editing: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: <K extends keyof PersonalReference>(
    id: string,
    key: K,
    value: PersonalReference[K],
  ) => void;
};

export default function PersonalReferencesForm({
  value,
  errors,
  editing,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Agrega entre dos y tres referencias personales. No guardes referencias
          completamente vacías.
        </p>
        <button
          type="button"
          disabled={!editing || value.length >= 3}
          onClick={onAdd}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar
        </button>
      </div>

      {value.length < 2 ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Necesitas al menos dos referencias para completar el expediente.
        </p>
      ) : null}

      <div className="space-y-4">
        {value.map((reference, index) => (
          <section
            key={reference.id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-950">
                Referencia {index + 1}
              </h3>
              <button
                type="button"
                disabled={!editing}
                onClick={() => onRemove(reference.id)}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Nombre completo<RequiredMark />
                <input
                  disabled={!editing}
                  value={reference.fullName}
                  onChange={(event) =>
                    onChange(reference.id, "fullName", event.target.value)
                  }
                  className={inputClassName}
                />
                <FieldError message={errors[reference.id]?.fullName} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Relación<RequiredMark />
                <input
                  disabled={!editing}
                  value={reference.relationship}
                  onChange={(event) =>
                    onChange(reference.id, "relationship", event.target.value)
                  }
                  className={inputClassName}
                />
                <FieldError message={errors[reference.id]?.relationship} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Teléfono<RequiredMark />
                <input
                  disabled={!editing}
                  value={reference.phone}
                  onChange={(event) =>
                    onChange(reference.id, "phone", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="809-000-0000"
                />
                <FieldError message={errors[reference.id]?.phone} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Tiempo de conocerlo
                <input
                  disabled={!editing}
                  value={reference.knownFor ?? ""}
                  onChange={(event) =>
                    onChange(reference.id, "knownFor", event.target.value)
                  }
                  className={inputClassName}
                />
              </label>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
