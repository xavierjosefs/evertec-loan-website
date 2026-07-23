import type { ProductFinancingRules } from "../types/product";

export interface FinancingEstimate {
  productPrice: number;
  term: number;
  minimumDownPaymentPercent: number;
  downPaymentAmount: number;
  financedAmount: number;
  annualInterestRate: number;
  administrativeFeePercent: number;
  administrativeFeeAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  totalCustomerCost: number;
}

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const clampFinancingTerm = (
  value: number,
  minimum: number,
  maximum: number,
): number => {
  const safeMinimum = Math.max(1, Math.trunc(toFiniteNumber(minimum, 1)));
  const safeMaximum = Math.max(
    safeMinimum,
    Math.trunc(toFiniteNumber(maximum, safeMinimum)),
  );

  return Math.min(
    safeMaximum,
    Math.max(safeMinimum, Math.trunc(toFiniteNumber(value, safeMinimum))),
  );
};

export function calculateFinancingEstimate(
  productPrice: number,
  term: number,
  financingRules: ProductFinancingRules = {},
): FinancingEstimate {
  const safePrice = Math.max(0, toFiniteNumber(productPrice, 0));
  const safeTerm = Math.max(1, Math.trunc(toFiniteNumber(term, 1)));

  const minimumDownPaymentPercent = Math.min(
    100,
    Math.max(0, toFiniteNumber(financingRules.minimumDownPaymentPercent, 0)),
  );

  const annualInterestRate = Math.max(
    0,
    toFiniteNumber(financingRules.annualInterestRate, 0),
  );

  const administrativeFeePercent = Math.max(
    0,
    toFiniteNumber(financingRules.administrativeFeePercent, 0),
  );

  const downPaymentAmount = roundMoney(
    safePrice * (minimumDownPaymentPercent / 100),
  );

  const financedAmount = roundMoney(Math.max(safePrice - downPaymentAmount, 0));

  const administrativeFeeAmount = roundMoney(
    financedAmount * (administrativeFeePercent / 100),
  );

  const monthlyRate = annualInterestRate / 100 / 12;

  let monthlyPayment = 0;

  if (financedAmount > 0) {
    if (monthlyRate > 0) {
      const growthFactor = Math.pow(1 + monthlyRate, safeTerm);
      monthlyPayment =
        (financedAmount * monthlyRate * growthFactor) / (growthFactor - 1);
    } else {
      monthlyPayment = financedAmount / safeTerm;
    }
  }

  monthlyPayment = roundMoney(monthlyPayment);

  const totalPayments = roundMoney(monthlyPayment * safeTerm);
  const totalInterest = roundMoney(Math.max(totalPayments - financedAmount, 0));
  const totalCustomerCost = roundMoney(
    downPaymentAmount + totalPayments + administrativeFeeAmount,
  );

  return {
    productPrice: safePrice,
    term: safeTerm,
    minimumDownPaymentPercent,
    downPaymentAmount,
    financedAmount,
    annualInterestRate,
    administrativeFeePercent,
    administrativeFeeAmount,
    monthlyPayment,
    totalInterest,
    totalPayments,
    totalCustomerCost,
  };
}

export const financingAssumption =
  "Esta estimación usa la tasa, la inicial mínima, el plazo y el cargo administrativo configurados para el producto. El resultado final está sujeto a validación y aprobación.";
