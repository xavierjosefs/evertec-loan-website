import { FileCheck2, FileUp, Trash2 } from "lucide-react";
import type { CustomerDocument } from "../../types/customerProfile";

const statusStyles: Record<CustomerDocument["status"], string> = {
  MISSING: "border-amber-200 bg-amber-50 text-amber-800",
  UPLOADED: "border-violet-200 bg-violet-50 text-violet-800",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
};

const statusLabels: Record<CustomerDocument["status"], string> = {
  MISSING: "Pendiente",
  UPLOADED: "Cargado",
  UNDER_REVIEW: "En revisión",
  APPROVED: "Verificado",
  REJECTED: "Requiere corrección",
};

type Props = {
  document: CustomerDocument;
  onUpload: (document: CustomerDocument, file: File) => void;
  onRemove: (document: CustomerDocument) => void;
};

export default function DocumentUploadCard({
  document,
  onUpload,
  onRemove,
}: Props) {
  const inputId = `document-${document.requirementKey}`;
  const hasFile = Boolean(document.fileName);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">
              {document.name}
            </h3>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[document.status]}`}
            >
              {statusLabels[document.status]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {document.required ? "Obligatorio" : "Opcional"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {document.description}
          </p>
        </div>
      </div>

      {hasFile ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
            <div className="min-w-0">
              <strong className="block truncate text-sm text-slate-900">
                {document.fileName}
              </strong>
              <span className="mt-1 block text-xs text-slate-500">
                {document.mimeType} · {formatFileSize(document.size ?? 0)} ·{" "}
                {document.uploadedAt
                  ? new Date(document.uploadedAt).toLocaleDateString("es-DO")
                  : "Sin fecha"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-within:ring-4 focus-within:ring-brand-200"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          {hasFile ? "Reemplazar" : "Cargar"}
          <input
            id={inputId}
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(document, file);
            }}
          />
        </label>

        {hasFile ? (
          <button
            type="button"
            onClick={() => onRemove(document)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
