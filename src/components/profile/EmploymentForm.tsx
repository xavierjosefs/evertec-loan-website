import type { EmploymentInformation } from "../../types/customerProfile";
import type { FieldErrors } from "../../utils/profileValidation";
import { inputClassName, selectClassName, textareaClassName } from "./formClasses";
import { FieldError, RequiredMark } from "./formStyles";

type Props = {
  value: EmploymentInformation;
  errors: FieldErrors<EmploymentInformation>;
  editing: boolean;
  onChange: <K extends keyof EmploymentInformation>(
    key: K,
    value: EmploymentInformation[K],
  ) => void;
};

export default function EmploymentForm({
  value,
  errors,
  editing,
  onChange,
}: Props) {
  const companyOptional =
    value.status === "SELF_EMPLOYED" ||
    value.status === "MERCHANT" ||
    value.status === "RETIRED";

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Situación laboral<RequiredMark />
        <select
          disabled={!editing}
          value={value.status}
          onChange={(event) =>
            onChange("status", event.target.value as EmploymentInformation["status"])
          }
          className={selectClassName}
        >
          <option value="">Selecciona</option>
          <option value="PRIVATE_EMPLOYEE">Empleado privado</option>
          <option value="PUBLIC_EMPLOYEE">Empleado público</option>
          <option value="SELF_EMPLOYED">Independiente</option>
          <option value="MERCHANT">Comerciante</option>
          <option value="RETIRED">Pensionado</option>
          <option value="OTHER">Otro</option>
        </select>
        <FieldError message={errors.status} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Empresa, negocio o institución{companyOptional ? null : <RequiredMark />}
        <input
          disabled={!editing}
          value={value.companyName}
          onChange={(event) => onChange("companyName", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.companyName} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Cargo u ocupación<RequiredMark />
        <input
          disabled={!editing}
          value={value.position}
          onChange={(event) => onChange("position", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.position} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Tiempo trabajando<RequiredMark />
        <input
          disabled={!editing}
          value={value.yearsWorking}
          onChange={(event) => onChange("yearsWorking", event.target.value)}
          className={inputClassName}
          placeholder="Ej. 3 años"
        />
        <FieldError message={errors.yearsWorking} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Teléfono laboral
        <input
          disabled={!editing}
          value={value.workPhone ?? ""}
          onChange={(event) => onChange("workPhone", event.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Tipo de contrato<RequiredMark />
        <select
          disabled={!editing}
          value={value.contractType}
          onChange={(event) =>
            onChange("contractType", event.target.value as EmploymentInformation["contractType"])
          }
          className={selectClassName}
        >
          <option value="">Selecciona</option>
          <option value="FIXED">Fijo</option>
          <option value="INDEFINITE">Indefinido</option>
          <option value="INDEPENDENT">Independiente</option>
          <option value="NOT_APPLICABLE">No aplica</option>
        </select>
        <FieldError message={errors.contractType} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Frecuencia de pago<RequiredMark />
        <select
          disabled={!editing}
          value={value.paymentFrequency}
          onChange={(event) =>
            onChange("paymentFrequency", event.target.value as EmploymentInformation["paymentFrequency"])
          }
          className={selectClassName}
        >
          <option value="">Selecciona</option>
          <option value="WEEKLY">Semanal</option>
          <option value="BIWEEKLY">Quincenal</option>
          <option value="MONTHLY">Mensual</option>
        </select>
        <FieldError message={errors.paymentFrequency} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Ingreso mensual aproximado<RequiredMark />
        <input
          disabled={!editing}
          type="number"
          min="0"
          value={value.monthlyIncome}
          onChange={(event) => onChange("monthlyIncome", Number(event.target.value))}
          className={inputClassName}
        />
        <FieldError message={errors.monthlyIncome} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Otros ingresos
        <input
          disabled={!editing}
          type="number"
          min="0"
          value={value.otherIncome ?? 0}
          onChange={(event) => onChange("otherIncome", Number(event.target.value))}
          className={inputClassName}
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Fuente de otros ingresos
        <input
          disabled={!editing}
          value={value.otherIncomeSource ?? ""}
          onChange={(event) => onChange("otherIncomeSource", event.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="text-sm font-medium text-slate-700 sm:col-span-2">
        Dirección laboral
        <textarea
          disabled={!editing}
          rows={3}
          value={value.workAddress ?? ""}
          onChange={(event) => onChange("workAddress", event.target.value)}
          className={textareaClassName}
        />
      </label>
    </div>
  );
}
