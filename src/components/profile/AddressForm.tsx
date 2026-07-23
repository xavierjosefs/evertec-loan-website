import type { AddressInformation } from "../../types/customerProfile";
import type { FieldErrors } from "../../utils/profileValidation";
import { inputClassName, selectClassName, textareaClassName } from "./formClasses";
import { FieldError, RequiredMark } from "./formStyles";

type Props = {
  value: AddressInformation;
  errors: FieldErrors<AddressInformation>;
  editing: boolean;
  onChange: <K extends keyof AddressInformation>(
    key: K,
    value: AddressInformation[K],
  ) => void;
};

export default function AddressForm({ value, errors, editing, onChange }: Props) {
  const showPayment =
    value.housingType === "RENTED" || value.housingType === "MORTGAGED";

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {[
        ["country", "País"],
        ["province", "Provincia"],
        ["city", "Municipio o ciudad"],
        ["sector", "Sector"],
        ["street", "Calle"],
        ["residenceNumber", "Número de residencia"],
      ].map(([key, label]) => (
        <label key={key} className="text-sm font-medium text-slate-700">
          {label}<RequiredMark />
          <input
            disabled={!editing}
            value={String(value[key as keyof AddressInformation] ?? "")}
            onChange={(event) =>
              onChange(key as keyof AddressInformation, event.target.value)
            }
            className={inputClassName}
          />
          <FieldError message={errors[key as keyof AddressInformation]} />
        </label>
      ))}

      <label className="text-sm font-medium text-slate-700">
        Edificio o apartamento
        <input
          disabled={!editing}
          value={value.apartment ?? ""}
          onChange={(event) => onChange("apartment", event.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Código postal
        <input
          disabled={!editing}
          value={value.postalCode ?? ""}
          onChange={(event) => onChange("postalCode", event.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Tipo de vivienda<RequiredMark />
        <select
          disabled={!editing}
          value={value.housingType}
          onChange={(event) =>
            onChange("housingType", event.target.value as AddressInformation["housingType"])
          }
          className={selectClassName}
        >
          <option value="">Selecciona</option>
          <option value="OWNED">Propia</option>
          <option value="RENTED">Alquilada</option>
          <option value="FAMILY">Familiar</option>
          <option value="MORTGAGED">Hipotecada</option>
          <option value="OTHER">Otra</option>
        </select>
        <FieldError message={errors.housingType} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Tiempo viviendo en la dirección<RequiredMark />
        <input
          disabled={!editing}
          value={value.yearsAtAddress}
          onChange={(event) => onChange("yearsAtAddress", event.target.value)}
          className={inputClassName}
          placeholder="Ej. 2 años"
        />
        <FieldError message={errors.yearsAtAddress} />
      </label>

      {showPayment ? (
        <label className="text-sm font-medium text-slate-700">
          Pago mensual de alquiler o hipoteca
          <input
            disabled={!editing}
            type="number"
            min="0"
            value={value.monthlyHousingPayment ?? 0}
            onChange={(event) =>
              onChange("monthlyHousingPayment", Number(event.target.value))
            }
            className={inputClassName}
          />
        </label>
      ) : null}

      <label className="text-sm font-medium text-slate-700 sm:col-span-2">
        Referencia de ubicación
        <textarea
          disabled={!editing}
          rows={3}
          value={value.locationReference ?? ""}
          onChange={(event) => onChange("locationReference", event.target.value)}
          className={textareaClassName}
        />
      </label>
    </div>
  );
}
