import type {
  AddressInformation,
  CustomerProfile,
  EmploymentInformation,
  FinancialInformation,
  PersonalInformation,
  PersonalReference,
} from "../types/customerProfile";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const dominicanPhonePattern = /^(\+?1[-\s.]?)?(809|829|849)[-\s.]?\d{3}[-\s.]?\d{4}$/;
export const cedulaPattern = /^\d{3}-\d{7}-\d$/;

const today = () => new Date().toISOString().slice(0, 10);
const required = (value?: string | number) =>
  value !== undefined && value !== null && String(value).trim() !== "";

export function validatePersonalInformation(
  personal: PersonalInformation,
): FieldErrors<PersonalInformation> {
  const errors: FieldErrors<PersonalInformation> = {};

  if (!required(personal.firstNames)) errors.firstNames = "Indica tus nombres.";
  if (!required(personal.lastNames)) errors.lastNames = "Indica tus apellidos.";
  if (!required(personal.birthDate)) errors.birthDate = "Indica tu fecha de nacimiento.";
  if (personal.birthDate && personal.birthDate > today()) {
    errors.birthDate = "La fecha de nacimiento no puede ser futura.";
  }
  if (!required(personal.nationality)) errors.nationality = "Indica tu nacionalidad.";
  if (!personal.maritalStatus) errors.maritalStatus = "Selecciona tu estado civil.";
  if (!required(personal.email) || !emailPattern.test(personal.email)) {
    errors.email = "Ingresa un correo válido.";
  }
  if (!required(personal.primaryPhone) || !dominicanPhonePattern.test(personal.primaryPhone)) {
    errors.primaryPhone = "Ingresa un teléfono válido de República Dominicana.";
  }
  if (
    personal.alternatePhone &&
    !dominicanPhonePattern.test(personal.alternatePhone)
  ) {
    errors.alternatePhone = "Ingresa un teléfono alternativo válido.";
  }
  if (!required(personal.identificationNumber)) {
    errors.identificationNumber = "Indica tu número de identificación.";
  } else if (
    personal.identificationType === "CEDULA" &&
    !cedulaPattern.test(personal.identificationNumber)
  ) {
    errors.identificationNumber = "Usa el formato 000-0000000-0.";
  }
  if (
    personal.identificationExpiresAt &&
    personal.identificationExpiresAt < today()
  ) {
    errors.identificationExpiresAt = "La fecha de vencimiento no puede estar vencida.";
  }

  return errors;
}

export function validateAddressInformation(
  address: AddressInformation,
): FieldErrors<AddressInformation> {
  const errors: FieldErrors<AddressInformation> = {};
  if (!required(address.country)) errors.country = "Indica el país.";
  if (!required(address.province)) errors.province = "Indica la provincia.";
  if (!required(address.city)) errors.city = "Indica el municipio o ciudad.";
  if (!required(address.sector)) errors.sector = "Indica el sector.";
  if (!required(address.street)) errors.street = "Indica la calle.";
  if (!required(address.residenceNumber)) {
    errors.residenceNumber = "Indica el número de residencia.";
  }
  if (!address.housingType) errors.housingType = "Selecciona el tipo de vivienda.";
  if (!required(address.yearsAtAddress)) {
    errors.yearsAtAddress = "Indica el tiempo viviendo en esta dirección.";
  }

  return errors;
}

export function validateEmploymentInformation(
  employment: EmploymentInformation,
): FieldErrors<EmploymentInformation> {
  const errors: FieldErrors<EmploymentInformation> = {};
  const needsCompany =
    employment.status !== "SELF_EMPLOYED" &&
    employment.status !== "MERCHANT" &&
    employment.status !== "RETIRED";

  if (!employment.status) errors.status = "Selecciona tu situación laboral.";
  if (needsCompany && !required(employment.companyName)) {
    errors.companyName = "Indica la empresa o institución.";
  }
  if (!required(employment.position)) errors.position = "Indica tu cargo u ocupación.";
  if (!required(employment.yearsWorking)) errors.yearsWorking = "Indica el tiempo trabajando.";
  if (!employment.contractType) errors.contractType = "Selecciona el tipo de contrato.";
  if (!employment.paymentFrequency) errors.paymentFrequency = "Selecciona la frecuencia de pago.";
  if (!employment.monthlyIncome || employment.monthlyIncome <= 0) {
    errors.monthlyIncome = "Indica tu ingreso mensual aproximado.";
  }

  return errors;
}

export function validateFinancialInformation(
  financial: FinancialInformation,
): FieldErrors<FinancialInformation> {
  const errors: FieldErrors<FinancialInformation> = {};
  if (!financial.mainMonthlyIncome || financial.mainMonthlyIncome <= 0) {
    errors.mainMonthlyIncome = "Indica tu ingreso mensual principal.";
  }
  if (financial.approximateMonthlyExpenses < 0) {
    errors.approximateMonthlyExpenses = "El monto no puede ser negativo.";
  }
  if (financial.existingLoanPayments < 0) {
    errors.existingLoanPayments = "El monto no puede ser negativo.";
  }
  if (financial.creditCardPayments < 0) {
    errors.creditCardPayments = "El monto no puede ser negativo.";
  }
  if (financial.rentOrMortgagePayment < 0) {
    errors.rentOrMortgagePayment = "El monto no puede ser negativo.";
  }
  if (!financial.accountType) errors.accountType = "Selecciona el tipo de cuenta.";

  return errors;
}

export function validateReference(
  reference: PersonalReference,
): FieldErrors<PersonalReference> {
  const errors: FieldErrors<PersonalReference> = {};
  const hasAnyValue = [
    reference.fullName,
    reference.relationship,
    reference.phone,
    reference.knownFor,
  ].some((value) => value?.trim());

  if (!hasAnyValue) {
    errors.fullName = "No guardes referencias vacías.";
    return errors;
  }

  if (!required(reference.fullName)) errors.fullName = "Indica el nombre.";
  if (!required(reference.relationship)) errors.relationship = "Indica la relación.";
  if (!required(reference.phone) || !dominicanPhonePattern.test(reference.phone)) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  return errors;
}

export function validateProfile(profile: CustomerProfile) {
  return {
    personal: validatePersonalInformation(profile.personal),
    address: validateAddressInformation(profile.address),
    employment: validateEmploymentInformation(profile.employment),
    financial: validateFinancialInformation(profile.financial),
  };
}

export function hasErrors(errors: Record<string, unknown>) {
  return Object.values(errors).some((value) => {
    if (!value) return false;
    if (typeof value === "object") {
      return Object.keys(value).length > 0;
    }
    return true;
  });
}
