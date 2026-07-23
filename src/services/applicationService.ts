import type {
  CreateFinancingApplicationPayload,
  FinancingApplication,
  FinancingApplicationStatus,
} from "../types/application";
import { apiRequest } from "./apiClient";

interface ApiApplication {
  _id?: string;
  applicationCode?: string;
  product?: string | { _id?: string; name?: string; slug?: string };
  productSnapshot?: {
    productId?: string;
    title?: string;
    brandName?: string;
    modelName?: string;
    price?: number;
    minimumTermMonths?: number | null;
    maximumTermMonths?: number | null;
    selectedTermMonths?: number | null;
    minimumDownPaymentPercent?: number | null;
    downPaymentAmount?: number | null;
    financedAmount?: number | null;
    annualInterestRate?: number | null;
    administrativeFeePercent?: number | null;
    administrativeFeeAmount?: number | null;
    estimatedMonthlyPayment?: number | null;
  };
  customerSnapshot?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    monthlyIncomeNet?: number;
    employmentType?: string;
  };
  status?: string;
  requestedAmount?: number;
  requestedTermMonths?: number;
  estimatedMonthlyPayment?: number;
  createdAt?: string;
}

const statusMap: Record<string, FinancingApplicationStatus> = {
  SUBMITTED: "SUBMITTED",
  AI_REVIEW: "AI_REVIEW",
  PRE_APPROVED: "PRE_APPROVED",
  MANUAL_REVIEW: "MANUAL_REVIEW",
  ADDITIONAL_INFORMATION_REQUIRED: "ADDITIONAL_INFORMATION_REQUIRED",
  FINAL_APPROVED: "FINAL_APPROVED",
  ERROR_REVIEW: "ERROR_REVIEW",
  PENDING_PAYMENT: "SUBMITTED",
  PAID: "AI_REVIEW",
  ROUTED: "MANUAL_REVIEW",
  IN_REVIEW: "MANUAL_REVIEW",
  NO_MATCHES: "MANUAL_REVIEW",
  APPROVED: "FINAL_APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapApplication = (
  application: ApiApplication,
  defaults?: Partial<FinancingApplication>,
): FinancingApplication => {
  const productObject =
    typeof application.product === "object" ? application.product : undefined;
  const snapshot = application.productSnapshot;

  const productId =
    snapshot?.productId ||
    productObject?._id ||
    (typeof application.product === "string" ? application.product : "") ||
    defaults?.productId ||
    "";

  const productName =
    snapshot?.title ||
    [snapshot?.brandName, snapshot?.modelName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    productObject?.name ||
    defaults?.productName ||
    "Producto";

  return {
    id: application.applicationCode || application._id || defaults?.id || "",
    productId,
    productName,
    productSlug: productObject?.slug || defaults?.productSlug || productId,
    price: toNumber(
      application.requestedAmount ?? snapshot?.price,
      defaults?.price || 0,
    ),
    term: toNumber(
      snapshot?.selectedTermMonths ?? application.requestedTermMonths,
      defaults?.term || 0,
    ),
    minimumTermMonths: toNumber(
      snapshot?.minimumTermMonths,
      defaults?.minimumTermMonths || 0,
    ),
    maximumTermMonths: toNumber(
      snapshot?.maximumTermMonths,
      defaults?.maximumTermMonths || 0,
    ),
    minimumDownPaymentPercent: toNumber(
      snapshot?.minimumDownPaymentPercent,
      defaults?.minimumDownPaymentPercent || 0,
    ),
    downPaymentAmount: toNumber(
      snapshot?.downPaymentAmount,
      defaults?.downPaymentAmount || 0,
    ),
    financedAmount: toNumber(
      snapshot?.financedAmount,
      defaults?.financedAmount || 0,
    ),
    annualInterestRate: toNumber(
      snapshot?.annualInterestRate,
      defaults?.annualInterestRate || 0,
    ),
    administrativeFeePercent: toNumber(
      snapshot?.administrativeFeePercent,
      defaults?.administrativeFeePercent || 0,
    ),
    administrativeFeeAmount: toNumber(
      snapshot?.administrativeFeeAmount,
      defaults?.administrativeFeeAmount || 0,
    ),
    estimatedMonthlyPayment: toNumber(
      snapshot?.estimatedMonthlyPayment ?? application.estimatedMonthlyPayment,
      defaults?.estimatedMonthlyPayment || 0,
    ),
    customerName:
      application.customerSnapshot?.name || defaults?.customerName || "",
    email: application.customerSnapshot?.email || defaults?.email || "",
    phone: application.customerSnapshot?.phoneNumber || defaults?.phone || "",
    identificationType: defaults?.identificationType,
    identificationNumber: defaults?.identificationNumber,
    addressSummary: defaults?.addressSummary,
    approximateIncome: toNumber(
      application.customerSnapshot?.monthlyIncomeNet,
      defaults?.approximateIncome || 0,
    ),
    employmentStatus:
      application.customerSnapshot?.employmentType ||
      defaults?.employmentStatus ||
      "",
    financialReference: defaults?.financialReference,
    notes: defaults?.notes,
    status: statusMap[application.status || ""] || "SUBMITTED",
    createdAt:
      application.createdAt || defaults?.createdAt || new Date().toISOString(),
  };
};

export async function listApplications(): Promise<FinancingApplication[]> {
  const response = await apiRequest<{ applications: ApiApplication[] }>(
    "/financing-applications/mine",
  );

  return response.applications.map((application) => mapApplication(application));
}

export async function createApplication(
  payload: CreateFinancingApplicationPayload,
): Promise<FinancingApplication> {
  const response = await apiRequest<{ application: ApiApplication }>(
    "/financing-applications",
    {
      method: "POST",
      body: JSON.stringify({
        productId: payload.productId,
        selectedTermMonths: payload.term,
        minimumTermMonths: payload.minimumTermMonths,
        maximumTermMonths: payload.maximumTermMonths,
        minimumDownPaymentPercent: payload.minimumDownPaymentPercent,
        downPaymentAmount: payload.downPaymentAmount,
        financedAmount: payload.financedAmount,
        annualInterestRate: payload.annualInterestRate,
        administrativeFeePercent: payload.administrativeFeePercent,
        administrativeFeeAmount: payload.administrativeFeeAmount,
        estimatedMonthlyPayment: payload.estimatedMonthlyPayment,
        notes: payload.notes || "",
      }),
    },
  );

  return mapApplication(response.application, {
    ...payload,
    id: "",
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
  });
}
