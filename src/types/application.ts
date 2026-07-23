export type FinancingApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "AI_REVIEW"
  | "PRE_APPROVED"
  | "MANUAL_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "FINAL_APPROVED"
  | "ERROR_REVIEW"
  | "PENDING"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface FinancingApplication {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  term: number;
  minimumTermMonths: number;
  maximumTermMonths: number;
  minimumDownPaymentPercent: number;
  downPaymentAmount: number;
  financedAmount: number;
  annualInterestRate: number;
  administrativeFeePercent: number;
  administrativeFeeAmount: number;
  estimatedMonthlyPayment: number;
  customerName: string;
  email: string;
  phone: string;
  identificationType?: string;
  identificationNumber?: string;
  addressSummary?: string;
  approximateIncome: number;
  employmentStatus: string;
  financialReference?: string;
  notes?: string;
  status: FinancingApplicationStatus;
  createdAt: string;
}

export interface CreateFinancingApplicationPayload
  extends Omit<FinancingApplication, "id" | "status" | "createdAt"> {}

export interface FinancingApplicationDraft {
  productId: string;
  term: number;
}
