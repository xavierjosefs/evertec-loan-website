import { Calculator, Info } from "lucide-react";
import type { ProductFinancingRules } from "../types/product";
import {
  calculateFinancingEstimate,
  clampFinancingTerm,
  financingAssumption,
} from "../utils/financing";
import { formatMoney } from "../utils/format";

interface EstimatePanelProps {
  price: number;
  currency: string;
  minimumTerm: number;
  maximumTerm: number;
  selectedTerm: number;
  financingRules: ProductFinancingRules;
  onTermChange: (term: number) => void;
}

export default function EstimatePanel({
  price,
  currency,
  minimumTerm,
  maximumTerm,
  selectedTerm,
  financingRules,
  onTermChange,
}: EstimatePanelProps) {
  const safeMinimumTerm = Math.max(1, Math.trunc(minimumTerm));
  const safeMaximumTerm = Math.max(safeMinimumTerm, Math.trunc(maximumTerm));
  const safeSelectedTerm = clampFinancingTerm(
    selectedTerm,
    safeMinimumTerm,
    safeMaximumTerm,
  );

  const estimate = calculateFinancingEstimate(
    price,
    safeSelectedTerm,
    financingRules,
  );

  const rangeSize = safeMaximumTerm - safeMinimumTerm;
  const progress =
    rangeSize === 0
      ? 100
      : ((safeSelectedTerm - safeMinimumTerm) / rangeSize) * 100;

  const handleTermChange = (value: number) => {
    onTermChange(clampFinancingTerm(value, safeMinimumTerm, safeMaximumTerm));
  };

  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]"
      aria-labelledby="financing-estimate-title"
    >
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Financiamiento
            </span>
            <h2
              id="financing-estimate-title"
              className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              Elige tus cuotas
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              La estimación utiliza las condiciones reales configuradas para
              este producto.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
            <Calculator className="h-6 w-6" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-5 sm:px-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Plazo seleccionado
              </span>
              <strong className="mt-1 block text-3xl font-bold tracking-tight text-slate-950">
                {safeSelectedTerm}
                <span className="ml-2 text-base font-semibold text-slate-500">
                  cuotas
                </span>
              </strong>
            </div>

            <label className="w-24">
              <span className="sr-only">Cantidad de cuotas</span>
              <input
                type="number"
                min={safeMinimumTerm}
                max={safeMaximumTerm}
                step={1}
                value={safeSelectedTerm}
                onChange={(event) =>
                  handleTermChange(Number(event.target.value))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-center text-sm font-bold text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>

          <div className="mt-6">
            <input
              type="range"
              min={safeMinimumTerm}
              max={safeMaximumTerm}
              step={1}
              value={safeSelectedTerm}
              onChange={(event) => handleTermChange(Number(event.target.value))}
              aria-label="Cantidad de cuotas"
              style={{
                background: `linear-gradient(to right, rgb(245 110 37) 0%, rgb(245 110 37) ${progress}%, rgb(226 232 240) ${progress}%, rgb(226 232 240) 100%)`,
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-600 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-600"
            />
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{safeMinimumTerm} cuotas</span>
              <span>{safeMaximumTerm} cuotas</span>
            </div>
          </div>
        </div>

        <dl className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between gap-5 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
            <dt className="text-sm text-slate-500">Precio del producto</dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {formatMoney(estimate.productPrice, currency)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
            <dt className="text-sm text-slate-500">
              Inicial mínima ({estimate.minimumDownPaymentPercent}%)
            </dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {formatMoney(estimate.downPaymentAmount, currency)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
            <dt className="text-sm text-slate-500">Monto a financiar</dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {formatMoney(estimate.financedAmount, currency)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
            <dt className="text-sm text-slate-500">Tasa anual</dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {estimate.annualInterestRate.toFixed(2)}%
            </dd>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
            <dt className="text-sm text-slate-500">
              Cargo administrativo ({estimate.administrativeFeePercent}%)
            </dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {formatMoney(estimate.administrativeFeeAmount, currency)}
            </dd>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-5 text-white sm:px-5">
            <div className="flex items-end justify-between gap-5">
              <dt>
                <span className="block text-xs font-medium uppercase tracking-[0.12em] text-brand-100">
                  Pago estimado
                </span>
                <span className="mt-1 block text-sm font-medium">
                  Cuota mensual
                </span>
              </dt>
              <dd className="text-right">
                <span className="block text-2xl font-bold tracking-tight sm:text-3xl">
                  {formatMoney(estimate.monthlyPayment, currency)}
                </span>
                <span className="mt-1 block text-xs text-brand-100">
                  durante {safeSelectedTerm} meses
                </span>
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-5">{financingAssumption}</p>
        </div>
      </div>
    </section>
  );
}
