import type { PersonalInformation } from "../../types/customerProfile";
import type { FieldErrors } from "../../utils/profileValidation";
import { inputClassName, selectClassName } from "./formClasses";
import { FieldError, RequiredMark } from "./formStyles";

type Props = {
  value: PersonalInformation;
  errors: FieldErrors<PersonalInformation>;
  editing: boolean;
  onChange: <K extends keyof PersonalInformation>(
    key: K,
    value: PersonalInformation[K],
  ) => void;
};

export default function PersonalInformationForm({
  value,
  errors,
  editing,
  onChange,
}: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Nombres<RequiredMark />
        <input
          disabled={!editing}
          value={value.firstNames}
          onChange={(event) => onChange("firstNames", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.firstNames} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Apellidos<RequiredMark />
        <input
          disabled={!editing}
          value={value.lastNames}
          onChange={(event) => onChange("lastNames", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.lastNames} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Fecha de nacimiento<RequiredMark />
        <input
          disabled={!editing}
          type="date"
          value={value.birthDate}
          onChange={(event) => onChange("birthDate", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.birthDate} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Nacionalidad<RequiredMark />
        <input
          disabled={!editing}
          value={value.nationality}
          onChange={(event) => onChange("nationality", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.nationality} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Estado civil<RequiredMark />
        <select
          disabled={!editing}
          value={value.maritalStatus}
          onChange={(event) =>
            onChange(
              "maritalStatus",
              event.target.value as PersonalInformation["maritalStatus"],
            )
          }
          className={selectClassName}
        >
          <option value="">Selecciona</option>
          <option value="SINGLE">Soltero/a</option>
          <option value="MARRIED">Casado/a</option>
          <option value="UNION">Unión libre</option>
          <option value="DIVORCED">Divorciado/a</option>
          <option value="WIDOWED">Viudo/a</option>
        </select>
        <FieldError message={errors.maritalStatus} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Correo electrónico<RequiredMark />
        <input
          disabled={!editing}
          type="email"
          value={value.email}
          onChange={(event) => onChange("email", event.target.value)}
          className={inputClassName}
        />
        <FieldError message={errors.email} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Teléfono principal<RequiredMark />
        <input
          disabled={!editing}
          type="tel"
          value={value.primaryPhone}
          onChange={(event) => onChange("primaryPhone", event.target.value)}
          className={inputClassName}
          placeholder="809-000-0000"
        />
        <FieldError message={errors.primaryPhone} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Teléfono alternativo
        <input
          disabled={!editing}
          type="tel"
          value={value.alternatePhone ?? ""}
          onChange={(event) => onChange("alternatePhone", event.target.value)}
          className={inputClassName}
          placeholder="829-000-0000"
        />
        <FieldError message={errors.alternatePhone} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Tipo de identificación<RequiredMark />
        <select
          disabled={!editing}
          value={value.identificationType}
          onChange={(event) =>
            onChange(
              "identificationType",
              event.target.value as PersonalInformation["identificationType"],
            )
          }
          className={selectClassName}
        >
          <option value="CEDULA">Cédula</option>
          <option value="PASSPORT">Pasaporte</option>
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        Número de identificación<RequiredMark />
        <input
          disabled={!editing}
          value={value.identificationNumber}
          onChange={(event) =>
            onChange("identificationNumber", event.target.value)
          }
          className={inputClassName}
          placeholder={
            value.identificationType === "CEDULA"
              ? "000-0000000-0"
              : "Pasaporte"
          }
        />
        <FieldError message={errors.identificationNumber} />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Vencimiento del documento
        <input
          disabled={!editing}
          type="date"
          value={value.identificationExpiresAt ?? ""}
          onChange={(event) =>
            onChange("identificationExpiresAt", event.target.value)
          }
          className={inputClassName}
        />
        <FieldError message={errors.identificationExpiresAt} />
      </label>
    </div>
  );
}
