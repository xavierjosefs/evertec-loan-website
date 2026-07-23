import type { FinancingApplicationStatus } from "../types/application";

export const statusLabels: Record<FinancingApplicationStatus, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviada",
  AI_REVIEW: "Evaluación automática",
  PRE_APPROVED: "Preaprobada",
  MANUAL_REVIEW: "Revisión manual",
  ADDITIONAL_INFORMATION_REQUIRED: "Información requerida",
  FINAL_APPROVED: "Aprobada",
  ERROR_REVIEW: "Revisión pendiente",
  PENDING: "Pendiente",
  UNDER_REVIEW: "En evaluacion",
  DOCUMENTS_REQUIRED: "Documentos requeridos",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const statusClassNames: Record<FinancingApplicationStatus, string> = {
  DRAFT: "status-neutral",
  SUBMITTED: "status-warning",
  AI_REVIEW: "status-info",
  PRE_APPROVED: "status-success",
  MANUAL_REVIEW: "status-info",
  ADDITIONAL_INFORMATION_REQUIRED: "status-warning",
  FINAL_APPROVED: "status-success",
  ERROR_REVIEW: "status-warning",
  PENDING: "status-warning",
  UNDER_REVIEW: "status-info",
  DOCUMENTS_REQUIRED: "status-warning",
  APPROVED: "status-success",
  REJECTED: "status-danger",
  CANCELLED: "status-neutral",
};
