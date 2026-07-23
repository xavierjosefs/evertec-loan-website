import type {
  CustomerProfile,
  ProfileCompletion,
  ProfileRequirement,
  ProfileStatus,
} from "../types/customerProfile";
import {
  cedulaPattern,
  dominicanPhonePattern,
  emailPattern,
} from "./profileValidation";

function filled(value?: string | number) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function validPersonal(profile: CustomerProfile) {
  const { personal } = profile;
  const idValid =
    personal.identificationType === "PASSPORT"
      ? filled(personal.identificationNumber)
      : cedulaPattern.test(personal.identificationNumber);

  return (
    filled(personal.firstNames) &&
    filled(personal.lastNames) &&
    filled(personal.birthDate) &&
    filled(personal.nationality) &&
    filled(personal.maritalStatus) &&
    emailPattern.test(personal.email) &&
    dominicanPhonePattern.test(personal.primaryPhone) &&
    idValid
  );
}

function validAddress(profile: CustomerProfile) {
  const { address } = profile;
  return (
    filled(address.country) &&
    filled(address.province) &&
    filled(address.city) &&
    filled(address.sector) &&
    filled(address.street) &&
    filled(address.residenceNumber) &&
    filled(address.housingType) &&
    filled(address.yearsAtAddress)
  );
}

function validEmployment(profile: CustomerProfile) {
  const { employment } = profile;
  return (
    filled(employment.status) &&
    filled(employment.position) &&
    filled(employment.yearsWorking) &&
    filled(employment.contractType) &&
    filled(employment.paymentFrequency) &&
    Number(employment.monthlyIncome) > 0
  );
}

// function validIncome(profile: CustomerProfile) {
//   const { financial } = profile;
//   return (
//     Number(financial.mainMonthlyIncome) > 0 && filled(financial.accountType)
//   );
// }

function hasUploadedDocument(profile: CustomerProfile, requirementKey: string) {
  const document = profile.documents.find(
    (item) => item.requirementKey === requirementKey,
  );
  return Boolean(document?.fileName && document.status !== "MISSING");
}

export function calculateProfileCompletion(
  profile: CustomerProfile,
): ProfileCompletion {
  const identityKeys =
    profile.personal.identificationType === "PASSPORT"
      ? ["passport_bio"]
      : ["cedula_front", "cedula_back"];

  const requirements: ProfileRequirement[] = [
    {
      key: "identity_documents",
      label: "Documento de identidad cargado",
      section: "Documentos",
      completed: identityKeys.some((key) => hasUploadedDocument(profile, key)),
    },
    {
      key: "bank_statements",
      label: "Al menos un estado de cuenta bancario cargado",
      section: "Documentos",
      completed: profile.documents.some(
        (document) =>
          document.requirementKey.startsWith("bank_statement_") &&
          Boolean(document.fileName) &&
          document.status !== "MISSING",
      ),
    },
  ];

  const completed = requirements.filter(
    (requirement) => requirement.completed,
  ).length;
  const pendingRequirements = requirements.filter(
    (requirement) => !requirement.completed,
  );
  const percentage = Math.round((completed / requirements.length) * 100);
  const hasMissingRequiredDocuments = profile.documents.some(
    (document) => document.required && document.status === "MISSING",
  );
  let status: ProfileStatus = "INCOMPLETE";

  if (percentage === 100) {
    status = "READY";
  } else if (
    !validPersonal(profile) ||
    !validAddress(profile) ||
    !validEmployment(profile)
  ) {
    status = "INCOMPLETE";
  } else if (hasMissingRequiredDocuments) {
    status = "PENDING_DOCUMENTS";
  } else {
    status = "UNDER_VERIFICATION";
  }

  return {
    total: requirements.length,
    completed,
    pending: pendingRequirements.length,
    percentage,
    status,
    pendingRequirements,
    requirements,
  };
}

export const profileStatusLabels: Record<ProfileStatus, string> = {
  INCOMPLETE: "Perfil incompleto",
  PENDING_DOCUMENTS: "Documentos pendientes",
  READY: "Listo para solicitar",
  UNDER_VERIFICATION: "En revisión",
};
