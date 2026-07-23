export type ProfileStatus =
  | "INCOMPLETE"
  | "PENDING_DOCUMENTS"
  | "READY"
  | "UNDER_VERIFICATION";

export type IdentificationType = "CEDULA" | "PASSPORT";
export type MaritalStatus =
  | "SINGLE"
  | "MARRIED"
  | "UNION"
  | "DIVORCED"
  | "WIDOWED";
export type HousingType = "OWNED" | "RENTED" | "FAMILY" | "MORTGAGED" | "OTHER";
export type EmploymentStatus =
  | "PRIVATE_EMPLOYEE"
  | "PUBLIC_EMPLOYEE"
  | "SELF_EMPLOYED"
  | "MERCHANT"
  | "RETIRED"
  | "OTHER";
export type ContractType =
  | "FIXED"
  | "INDEFINITE"
  | "INDEPENDENT"
  | "NOT_APPLICABLE";
export type PaymentFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";
export type BankAccountType = "SAVINGS" | "CHECKING" | "PAYROLL" | "OTHER";
export type CustomerDocumentStatus =
  | "MISSING"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface PersonalInformation {
  firstNames: string;
  lastNames: string;
  birthDate: string;
  nationality: string;
  maritalStatus: MaritalStatus | "";
  email: string;
  primaryPhone: string;
  alternatePhone?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  identificationExpiresAt?: string;
}

export interface AddressInformation {
  country: string;
  province: string;
  city: string;
  sector: string;
  street: string;
  residenceNumber: string;
  apartment?: string;
  locationReference?: string;
  postalCode?: string;
  housingType: HousingType | "";
  yearsAtAddress: string;
  monthlyHousingPayment?: number;
}

export interface EmploymentInformation {
  status: EmploymentStatus | "";
  companyName: string;
  position: string;
  yearsWorking: string;
  workPhone?: string;
  workAddress?: string;
  contractType: ContractType | "";
  paymentFrequency: PaymentFrequency | "";
  monthlyIncome: number;
  otherIncome?: number;
  otherIncomeSource?: string;
}

export interface FinancialInformation {
  mainMonthlyIncome: number;
  otherMonthlyIncome?: number;
  approximateMonthlyExpenses: number;
  existingLoanPayments: number;
  creditCardPayments: number;
  rentOrMortgagePayment: number;
  primaryBank: string;
  accountType: BankAccountType | "";
}

export interface CustomerDocument {
  id: string;
  requirementKey: string;
  name: string;
  description: string;
  required: boolean;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
  status: CustomerDocumentStatus;
}

export interface PersonalReference {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  knownFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerConsent {
  key: string;
  label: string;
  accepted: boolean;
  acceptedAt?: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  personal: PersonalInformation;
  address: AddressInformation;
  employment: EmploymentInformation;
  financial: FinancialInformation;
  documents: CustomerDocument[];
  references: PersonalReference[];
  consents: CustomerConsent[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRequirement {
  key: string;
  label: string;
  completed: boolean;
  section: string;
}

export interface ProfileCompletion {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
  status: ProfileStatus;
  pendingRequirements: ProfileRequirement[];
  requirements: ProfileRequirement[];
}
