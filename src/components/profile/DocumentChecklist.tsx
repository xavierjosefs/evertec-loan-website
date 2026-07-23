import { FileUp, Landmark, ShieldCheck } from "lucide-react";
import type { ChangeEvent } from "react";
import type { CustomerDocument } from "../../types/customerProfile";
import DocumentUploadCard from "./DocumentUploadCard";

type Props = {
  documents: CustomerDocument[];
  onUpload: (document: CustomerDocument, file: File) => void;
  onRemove: (document: CustomerDocument) => void;
};

export default function DocumentChecklist({
  documents,
  onUpload,
  onRemove,
}: Props) {
  const bankStatements = documents.filter((document) =>
    document.requirementKey.startsWith("bank_statement_"),
  );

  const otherDocuments = documents.filter(
    (document) => !document.requirementKey.startsWith("bank_statement_"),
  );

  const handleAddBankStatement = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const requirementKey = `bank_statement_${Date.now()}`;

    const document: CustomerDocument = {
      id: `doc-${requirementKey}`,
      requirementKey,
      name: `Estado de cuenta ${bankStatements.length + 1}`,
      description: "Estado de cuenta bancario agregado por el cliente.",
      required: false,
      status: "MISSING",
    };

    onUpload(document, file);
  };

  return (
    <div className="space-y-6">
      <div
        className="
          rounded-2xl border border-brand-100
          bg-brand-50 px-4 py-4
        "
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="
              mt-0.5 h-5 w-5 shrink-0
              text-brand-600
            "
          />

          <p className="text-xs leading-5 text-brand-900">
            Para solicitar un financiamiento debes cargar tu documento de
            identidad y al menos un estado de cuenta bancario.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {otherDocuments.map((document) => (
          <DocumentUploadCard
            key={document.requirementKey}
            document={document}
            onUpload={onUpload}
            onRemove={onRemove}
          />
        ))}
      </div>

      <section
        className="
          overflow-hidden rounded-2xl border
          border-slate-200 bg-white
        "
      >
        <div
          className="
            flex flex-col gap-4 border-b
            border-slate-200 px-5 py-5
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl bg-brand-50
                text-brand-700
              "
            >
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className="
                    text-base font-bold
                    text-slate-950
                  "
                >
                  Estados de cuenta bancarios
                </h3>

                <span
                  className="
                    rounded-full bg-rose-50
                    px-2.5 py-1 text-[11px]
                    font-semibold text-rose-700
                  "
                >
                  Mínimo 1
                </span>
              </div>

              <p
                className="
                  mt-1 text-sm leading-6
                  text-slate-500
                "
              >
                Carga al menos un estado de cuenta reciente. Puedes agregar
                documentos adicionales.
              </p>
            </div>
          </div>

          <label
            className="
              inline-flex min-h-11 cursor-pointer
              items-center justify-center gap-2
              rounded-xl bg-brand-600 px-4
              text-sm font-semibold text-white
              transition-colors hover:bg-brand-700
              focus-within:ring-4
              focus-within:ring-brand-200
            "
          >
            <FileUp className="h-4 w-4" aria-hidden="true" />

            {bankStatements.length
              ? "Agregar otro"
              : "Agregar estado de cuenta"}

            <input
              type="file"
              className="sr-only"
              accept="
                .pdf,
                .jpg,
                .jpeg,
                .png,
                application/pdf,
                image/jpeg,
                image/png
              "
              onChange={handleAddBankStatement}
            />
          </label>
        </div>

        <div className="px-5 py-5">
          {bankStatements.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {bankStatements.map((document) => (
                <DocumentUploadCard
                  key={document.requirementKey}
                  document={document}
                  onUpload={onUpload}
                  onRemove={onRemove}
                />
              ))}
            </div>
          ) : (
            <div
              className="
                rounded-xl border border-dashed
                border-amber-300 bg-amber-50
                px-5 py-6 text-center
              "
            >
              <p
                className="
                  text-sm font-semibold
                  text-amber-900
                "
              >
                Todavía no has agregado ningún estado de cuenta.
              </p>

              <p
                className="
                  mt-1 text-xs leading-5
                  text-amber-800
                "
              >
                Debes cargar al menos uno antes de solicitar el financiamiento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
