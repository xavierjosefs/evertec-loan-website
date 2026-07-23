import type { FinancialInformation } from "../../types/customerProfile";
import type { FinancialSummary } from "../../utils/financialSummary";
import type { FieldErrors } from "../../utils/profileValidation";
import { formatMoney } from "../../utils/format";
import { inputClassName, selectClassName } from "./formClasses";
import { FieldError, RequiredMark } from "./formStyles";

type Props = {
  value: FinancialInformation;
  errors: FieldErrors<FinancialInformation>;
  summary: FinancialSummary;
  editing: boolean;
  onChange: <K extends keyof FinancialInformation>(
    key: K,
    value: FinancialInformation[K],
  ) => void;
};

export default function FinancialInformationForm({
  value,
  errors,
  summary,
  editing,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ["mainMonthlyIncome", "Ingreso mensual principal", true],
          ["otherMonthlyIncome", "Otros ingresos", false],
          ["approximateMonthlyExpenses", "Gastos mensuales aproximados", false],
          ["existingLoanPayments", "Pagos mensuales de préstamos", false],
          ["creditCardPayments", "Pagos mensuales de tarjetas", false],
          ["rentOrMortgagePayment", "Alquiler o hipoteca", false],
        ].map(([key, label, isRequired]) => (
          <label key={String(key)} className="text-sm font-medium text-slate-700">
            {label}
            {isRequired ? <RequiredMark /> : null}
            <input
              disabled={!editing}
              type="number"
              min="0"
              value={Number(value[key as keyof FinancialInformation] ?? 0)}
              onChange={(event) =>
                onChange(key as keyof FinancialInformation, Number(event.target.value))
              }
              className={inputClassName}
            />
            <FieldError message={errors[key as keyof FinancialInformation]} />
          </label>
        ))}

        <label className="text-sm font-medium text-slate-700">
          Referencia financiera
          <input
            disabled={!editing}
            value={value.primaryBank}
            onChange={(event) => onChange("primaryBank", event.target.value)}
            className={inputClassName}
            placeholder="Entidad o referencia opcional"
          />
          <FieldError message={errors.primaryBank} />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Tipo de cuenta<RequiredMark />
          <select
            disabled={!editing}
            value={value.accountType}
            onChange={(event) =>
              onChange("accountType", event.target.value as FinancialInformation["accountType"])
            }
            className={selectClassName}
          >
            <option value="">Selecciona</option>
            <option value="SAVINGS">Ahorros</option>
            <option value="CHECKING">Corriente</option>
            <option value="PAYROLL">Nómina</option>
            <option value="OTHER">Otra</option>
          </select>
          <FieldError message={errors.accountType} />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-950">
          Resumen financiero orientativo
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SummaryItem label="Ingresos" value={summary.totalIncome} />
          <SummaryItem label="Compromisos" value={summary.totalMonthlyCommitments} />
          <SummaryItem label="Disponible aprox." value={summary.approximateAvailableIncome} />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Este cálculo es una orientación para el MVP y no representa aprobación
          crediticia.
        </p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <span className="text-xs text-slate-500">{label}</span>
      <strong className="mt-1 block text-sm text-slate-950">
        {formatMoney(value, "DOP")}
      </strong>
    </div>
  );
}
