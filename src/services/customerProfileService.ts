import type { MockUser } from "../types/auth";
import type {
  CustomerConsent,
  CustomerDocument,
  CustomerProfile,
  ContractType,
  EmploymentStatus,
  HousingType,
  IdentificationType,
  MaritalStatus,
} from "../types/customerProfile";
import { apiRequest } from "./apiClient";

export const CUSTOMER_PROFILE_STORAGE_KEY = "evertec_customer_profiles_v1";

type StoredProfiles = Record<string, CustomerProfile>;
type ApiCustomerProfile = Partial<CustomerProfile> & {
  _id?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  province?: string;
  residenceTimeMonths?: number;
  housingStatus?: string;
  occupation?: string;
  idNumberImage?: string | null;
  proofOfIncomeFile?: string | null;
  bankStatementsFiles?: string[];
  employmentType?: string;
  employerName?: string;
  businessName?: string;
  position?: string;
  contractType?: string;
  timeOnJobMonths?: number;
  monthlyIncomeNet?: number;
  otherMonthlyIncome?: number;
  monthlyExpenses?: number;
  monthlyDebtPayments?: number;
  hasOtherLoans?: boolean;
  hasCreditCards?: boolean;
};

const nowIso = () => new Date().toISOString();

export const consentTemplates: CustomerConsent[] = [
  {
    key: "truthfulness",
    label: "Confirmo que la información suministrada es veraz.",
    accepted: false,
  },
  {
    key: "contact",
    label: "Autorizo a Evertec a contactarme sobre esta solicitud.",
    accepted: false,
  },
  {
    key: "evaluation",
    label: "Autorizo de forma simulada la evaluación de mi solicitud.",
    accepted: false,
  },
  {
    key: "terms",
    label: "Acepto los términos y la política de privacidad provisionales.",
    accepted: false,
  },
];

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstNames: parts
      .slice(0, Math.max(1, Math.ceil(parts.length / 2)))
      .join(" "),
    lastNames: parts.slice(Math.max(1, Math.ceil(parts.length / 2))).join(" "),
  };
}

export function getDocumentRequirements(
  identificationType: IdentificationType,
  employmentStatus: EmploymentStatus | "",
) {
  const identity =
    identificationType === "PASSPORT"
      ? [
          {
            key: "identity_document",
            name: "Pasaporte",
            description: "Imagen o PDF de la página principal del pasaporte.",
            required: true,
          },
        ]
      : [
          {
            key: "identity_document",
            name: "Documento de identidad",
            description:
              "Carga una imagen o PDF claro de tu cédula o documento de identidad.",
            required: true,
          },
        ];

  const business =
    employmentStatus === "SELF_EMPLOYED" || employmentStatus === "MERCHANT"
      ? [
          {
            key: "mercantile_registry",
            name: "Registro mercantil",
            description: "Documento opcional para negocios registrados.",
            required: false,
          },
          {
            key: "rnc",
            name: "RNC",
            description: "Constancia opcional de RNC si aplica.",
            required: false,
          },
          {
            key: "commercial_activity",
            name: "Evidencia de actividad comercial",
            description: "Factura, contrato o soporte de actividad.",
            required: false,
          },
          {
            key: "additional_bank_movements",
            name: "Movimientos bancarios adicionales",
            description: "Soportes complementarios de ingresos.",
            required: false,
          },
        ]
      : [];

  return [
    ...identity,
    {
      key: "income_proof",
      name: "Comprobante de ingresos",
      description: "Carta de trabajo, volante de pago o certificación.",
      required: false,
    },
    {
      key: "address_proof",
      name: "Comprobante de dirección",
      description: "Factura de servicio, contrato de alquiler o equivalente.",
      required: false,
    },
    ...business,
  ];
}

function buildDocuments(profile?: CustomerProfile): CustomerDocument[] {
  const identificationType = profile?.personal.identificationType ?? "CEDULA";

  const employmentStatus = profile?.employment.status ?? "";

  const existingDocuments = Array.isArray(profile?.documents)
    ? profile.documents
    : [];

  const existing = new Map(
    existingDocuments.map((document) => [document.requirementKey, document]),
  );

  const fixedDocuments = getDocumentRequirements(
    identificationType,
    employmentStatus,
  ).map((requirement) => {
    const current = existing.get(requirement.key);

    return {
      id: current?.id ?? `doc-${requirement.key}`,
      requirementKey: requirement.key,
      name: requirement.name,
      description: requirement.description,
      required: requirement.required,
      fileName: current?.fileName,
      mimeType: current?.mimeType,
      size: current?.size,
      uploadedAt: current?.uploadedAt,
      status: current?.status ?? "MISSING",
      fileUrl: current?.fileUrl,
    } as CustomerDocument;
  });

  const dynamicDocuments = existingDocuments.filter((document) =>
    document.requirementKey.startsWith("bank_statement_"),
  );

  return [...fixedDocuments, ...dynamicDocuments];
}

export function createDefaultCustomerProfile(user: MockUser): CustomerProfile {
  const createdAt = nowIso();
  const name = splitName(user.name || "Cliente Evertec");

  const profile: CustomerProfile = {
    id: `customer-profile-${user.id}`,
    userId: user.id,
    personal: {
      firstNames: name.firstNames || "Cliente",
      lastNames: name.lastNames,
      birthDate: "",
      nationality: "Dominicana",
      maritalStatus: "",
      email: user.email,
      primaryPhone: user.phone,
      alternatePhone: "",
      identificationType: "CEDULA",
      identificationNumber: "",
      identificationExpiresAt: "",
    },
    address: {
      country: "República Dominicana",
      province: "",
      city: "",
      sector: "",
      street: "",
      residenceNumber: "",
      apartment: "",
      locationReference: "",
      postalCode: "",
      housingType: "",
      yearsAtAddress: "",
      monthlyHousingPayment: 0,
    },
    employment: {
      status: "",
      companyName: "",
      position: "",
      yearsWorking: "",
      workPhone: "",
      workAddress: "",
      contractType: "",
      paymentFrequency: "",
      monthlyIncome: 0,
      otherIncome: 0,
      otherIncomeSource: "",
    },
    financial: {
      mainMonthlyIncome: 0,
      otherMonthlyIncome: 0,
      approximateMonthlyExpenses: 0,
      existingLoanPayments: 0,
      creditCardPayments: 0,
      rentOrMortgagePayment: 0,
      primaryBank: "",
      accountType: "",
    },
    documents: [],
    references: [],
    consents: consentTemplates.map((consent) => ({ ...consent })),
    createdAt,
    updatedAt: createdAt,
  };

  return {
    ...profile,
    documents: buildDocuments(profile),
  };
}

function readStore(): StoredProfiles {
  try {
    const raw = localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as StoredProfiles)
      : {};
  } catch {
    return {};
  }
}

function writeStore(store: StoredProfiles) {
  localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(store));
}

function normalizeProfile(
  profile: CustomerProfile,
  user: MockUser,
): CustomerProfile {
  const fallback = createDefaultCustomerProfile(user);
  const next: CustomerProfile = {
    ...fallback,
    ...profile,
    personal: { ...fallback.personal, ...profile.personal },
    address: { ...fallback.address, ...profile.address },
    employment: { ...fallback.employment, ...profile.employment },
    financial: { ...fallback.financial, ...profile.financial },
    consents: consentTemplates.map((template) => {
      const current = profile.consents?.find(
        (consent) => consent.key === template.key,
      );
      return current ? { ...template, ...current } : { ...template };
    }),
    references: Array.isArray(profile.references) ? profile.references : [],
  };

  return {
    ...next,
    documents: buildDocuments(next),
  };
}

function getFileNameFromUrl(url: string, fallback: string) {
  try {
    const pathname = new URL(url).pathname;

    return decodeURIComponent(pathname.split("/").pop() || "") || fallback;
  } catch {
    return fallback;
  }
}

function apiCustomerToProfile(
  customer: ApiCustomerProfile,
  user: MockUser,
): CustomerProfile {
  const fallback = createDefaultCustomerProfile(user);
  const split = splitName(customer.name || user.name || "");

  const apiDocuments: CustomerDocument[] = [];

  if (customer.idNumberImage) {
    apiDocuments.push({
      id: "doc-identity_document",
      requirementKey: "identity_document",
      name: "Documento de identidad",
      description: "Documento de identidad guardado en tu perfil.",
      required: true,
      fileName: getFileNameFromUrl(
        customer.idNumberImage,
        "documento-identidad",
      ),
      mimeType: "",
      size: 0,
      uploadedAt: "",
      status: "UPLOADED",
      fileUrl: customer.idNumberImage,
    });
  }

  const bankStatements = Array.isArray(customer.bankStatementsFiles)
    ? customer.bankStatementsFiles
    : [];

  bankStatements.forEach((url, index) => {
    apiDocuments.push({
      id: `doc-bank-statement-${index}`,
      requirementKey: `bank_statement_${index}`,
      name: `Estado de cuenta ${index + 1}`,
      description: "Estado de cuenta bancario guardado en tu perfil.",
      required: index === 0,
      fileName: getFileNameFromUrl(url, `estado-cuenta-${index + 1}`),
      mimeType: "",
      size: 0,
      uploadedAt: "",
      status: "UPLOADED",
      fileUrl: url,
    });
  });

  return normalizeProfile(
    {
      ...fallback,
      id: String(customer._id || fallback.id),
      userId: user.id,
      documents: apiDocuments,
      personal: {
        ...fallback.personal,
        firstNames: split.firstNames || fallback.personal.firstNames,
        lastNames: split.lastNames || fallback.personal.lastNames,
        email: customer.email || fallback.personal.email,
        primaryPhone: customer.phoneNumber || fallback.personal.primaryPhone,
        identificationType: (customer.idType === "NATIONAL_ID"
          ? "CEDULA"
          : customer.idType ||
            fallback.personal.identificationType) as IdentificationType,
        identificationNumber:
          customer.idNumber || fallback.personal.identificationNumber,
        birthDate: customer.dateOfBirth
          ? String(customer.dateOfBirth).slice(0, 10)
          : fallback.personal.birthDate,
        maritalStatus:
          (customer.maritalStatus as MaritalStatus | undefined) ||
          fallback.personal.maritalStatus,
      },
      address: {
        ...fallback.address,
        street: customer.address || fallback.address.street,
        city: customer.city || fallback.address.city,
        province: customer.province || fallback.address.province,
        housingType:
          (customer.housingStatus as HousingType | undefined) ||
          fallback.address.housingType,
        yearsAtAddress:
          customer.residenceTimeMonths !== undefined
            ? String(Math.floor(Number(customer.residenceTimeMonths || 0) / 12))
            : fallback.address.yearsAtAddress,
      },
      employment: {
        ...fallback.employment,
        status:
          (customer.employmentType as EmploymentStatus | undefined) ||
          fallback.employment.status,
        companyName: customer.employerName || fallback.employment.companyName,
        position: customer.position || fallback.employment.position,
        contractType:
          (customer.contractType as ContractType | undefined) ||
          fallback.employment.contractType,
        yearsWorking:
          customer.timeOnJobMonths !== undefined
            ? String(Math.floor(Number(customer.timeOnJobMonths || 0) / 12))
            : fallback.employment.yearsWorking,
        monthlyIncome:
          customer.monthlyIncomeNet ?? fallback.employment.monthlyIncome,
        otherIncome:
          customer.otherMonthlyIncome ?? fallback.employment.otherIncome,
        otherIncomeSource:
          customer.businessName || fallback.employment.otherIncomeSource,
      },
      financial: {
        ...fallback.financial,
        mainMonthlyIncome:
          customer.monthlyIncomeNet ?? fallback.financial.mainMonthlyIncome,
        otherMonthlyIncome:
          customer.otherMonthlyIncome ?? fallback.financial.otherMonthlyIncome,
        approximateMonthlyExpenses:
          customer.monthlyExpenses ??
          fallback.financial.approximateMonthlyExpenses,
        existingLoanPayments:
          customer.monthlyDebtPayments ??
          fallback.financial.existingLoanPayments,
      },
    },
    user,
  );
}

function profileToApiCustomer(profile: CustomerProfile) {
  return {
    name: `${profile.personal.firstNames} ${profile.personal.lastNames}`.trim(),
    email: profile.personal.email,
    phoneNumber: profile.personal.primaryPhone,
    idType:
      profile.personal.identificationType === "CEDULA"
        ? "NATIONAL_ID"
        : profile.personal.identificationType,
    idNumber: profile.personal.identificationNumber,
    dateOfBirth: profile.personal.birthDate,
    maritalStatus: profile.personal.maritalStatus || undefined,
    province: profile.address.province,
    city: profile.address.city,
    address: [
      profile.address.street,
      profile.address.residenceNumber,
      profile.address.sector,
    ]
      .filter(Boolean)
      .join(", "),
    housingStatus: profile.address.housingType || undefined,
    residenceTimeMonths: Number(profile.address.yearsAtAddress || 0) * 12,
    employmentType: profile.employment.status || undefined,
    occupation: profile.employment.position || profile.employment.status || "",
    employerName: profile.employment.companyName,
    businessName: profile.employment.otherIncomeSource,
    position: profile.employment.position,
    contractType: profile.employment.contractType || undefined,
    timeOnJobMonths: Number(profile.employment.yearsWorking || 0) * 12,
    monthlyIncomeNet: profile.financial.mainMonthlyIncome,
    otherMonthlyIncome: profile.financial.otherMonthlyIncome,
    monthlyExpenses: profile.financial.approximateMonthlyExpenses,
    monthlyDebtPayments: profile.financial.existingLoanPayments,
    hasOtherLoans: profile.financial.existingLoanPayments > 0,
    hasCreditCards: profile.financial.creditCardPayments > 0,
  };
}

export async function getCustomerProfile(
  user: MockUser,
): Promise<CustomerProfile> {
  try {
    const response = await apiRequest<{ customer: ApiCustomerProfile }>(
      "/customer/me",
    );
    const profile = apiCustomerToProfile(response.customer, user);
    const store = readStore();
    writeStore({ ...store, [user.id]: profile });
    return profile;
  } catch {
    // Keep the local MVP usable when the API is unavailable.
  }

  const store = readStore();
  const stored = store[user.id];

  if (!stored) {
    const profile = createDefaultCustomerProfile(user);
    writeStore({ ...store, [user.id]: profile });
    return profile;
  }

  return normalizeProfile(stored, user);
}

export async function saveCustomerProfile(
  profile: CustomerProfile,
): Promise<CustomerProfile> {
  try {
    const response = await apiRequest<{ customer: ApiCustomerProfile }>(
      "/customer/me",
      {
        method: "PUT",
        body: JSON.stringify(profileToApiCustomer(profile)),
      },
    );
    const next = apiCustomerToProfile(response.customer, {
      id: profile.userId,
      name: `${profile.personal.firstNames} ${profile.personal.lastNames}`.trim(),
      email: profile.personal.email,
      phone: profile.personal.primaryPhone,
    });
    const store = readStore();
    writeStore({ ...store, [profile.userId]: next });
    return next;
  } catch {
    // Fall back to local persistence for offline development.
  }

  const store = readStore();
  const next = {
    ...profile,
    documents: buildDocuments(profile),
    updatedAt: nowIso(),
  };
  writeStore({ ...store, [next.userId]: next });
  return next;
}

export async function saveDocumentMetadata(
  profile: CustomerProfile,
  requirementKey: string,
  file: File,
): Promise<CustomerProfile> {
  const formData = new FormData();

  const isIdentityDocument = [
    "identity_document",
    "cedula_front",
    "cedula_back",
    "passport_bio",
  ].includes(requirementKey);

  const isBankStatement = requirementKey.startsWith("bank_statement_");

  if (isIdentityDocument) {
    formData.append("idNumberImage", file, file.name);
  } else if (isBankStatement) {
    formData.append("bankStatementsFiles", file, file.name);

    const currentDocument = profile.documents.find(
      (document) => document.requirementKey === requirementKey,
    );

    const indexMatch = requirementKey.match(/^bank_statement_(\d+)$/);
    const replacementIndex = indexMatch ? Number(indexMatch[1]) : null;

    const isExistingBankStatement =
      currentDocument?.status === "UPLOADED" &&
      Boolean(currentDocument.fileUrl) &&
      replacementIndex !== null &&
      Number.isInteger(replacementIndex);

    if (isExistingBankStatement) {
      formData.append(
        "bankStatementIndex",
        String(replacementIndex),
      );
    }
  } else if (requirementKey === "income_proof") {
    formData.append("proofOfIncomeFile", file, file.name);
  } else {
    throw new Error(
      "Este tipo de documento todavía no está conectado al perfil.",
    );
  }

  await apiRequest<{
    ok: boolean;
    customer: ApiCustomerProfile;
  }>("/customer/me", {
    method: "PUT",
    body: formData,
  });

  return getCustomerProfile({
    id: profile.userId,
    name: `${profile.personal.firstNames} ${profile.personal.lastNames}`.trim(),
    email: profile.personal.email,
    phone: profile.personal.primaryPhone,
  });
}

export async function removeDocumentMetadata(
  profile: CustomerProfile,
  requirementKey: string,
): Promise<CustomerProfile> {
  const currentDocument = profile.documents.find(
    (document) => document.requirementKey === requirementKey,
  );

  const isIdentityDocument = [
    "identity_document",
    "cedula_front",
    "cedula_back",
    "passport_bio",
  ].includes(requirementKey);

  const isBankStatement = requirementKey.startsWith("bank_statement_");

  let payload: Record<string, unknown>;

  if (isIdentityDocument) {
    payload = {
      removeIdNumberImage: true,
    };
  } else if (requirementKey === "income_proof") {
    payload = {
      removeProofOfIncomeFile: true,
    };
  } else if (isBankStatement) {
    if (!currentDocument?.fileUrl) {
      throw new Error(
        "No se encontró la URL del estado de cuenta que deseas eliminar.",
      );
    }

    payload = {
      removeBankStatementUrl: currentDocument.fileUrl,
    };
  } else {
    throw new Error(
      "Este tipo de documento todavía no está conectado al perfil.",
    );
  }

  await apiRequest<{
    ok: boolean;
    customer: ApiCustomerProfile;
  }>("/customer/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return getCustomerProfile({
    id: profile.userId,
    name: `${profile.personal.firstNames} ${profile.personal.lastNames}`.trim(),
    email: profile.personal.email,
    phone: profile.personal.primaryPhone,
  });
}