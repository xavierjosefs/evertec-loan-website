import type { FinancialInformation } from "../types/customerProfile";

export interface FinancialSummary {
  totalIncome: number;
  totalMonthlyCommitments: number;
  approximateAvailableIncome: number;
}

export function calculateFinancialSummary(
  financial: FinancialInformation,
): FinancialSummary {
  const totalIncome =
    Number(financial.mainMonthlyIncome || 0) +
    Number(financial.otherMonthlyIncome || 0);

  const totalMonthlyCommitments =
    Number(financial.approximateMonthlyExpenses || 0) +
    Number(financial.existingLoanPayments || 0) +
    Number(financial.creditCardPayments || 0) +
    Number(financial.rentOrMortgagePayment || 0);

  return {
    totalIncome,
    totalMonthlyCommitments,
    approximateAvailableIncome: totalIncome - totalMonthlyCommitments,
  };
}
