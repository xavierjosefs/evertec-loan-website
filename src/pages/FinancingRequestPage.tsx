import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
  FileText,
  Landmark,
  Upload,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ApiRequestError, type ApiMissingField } from "../services/apiClient";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import EstimatePanel from "../components/EstimatePanel";
import LoadingState from "../components/LoadingState";
import ProductVisual from "../components/ProductVisual";
import { useAuth } from "../hooks/useAuth";
import { createApplication } from "../services/applicationService";
import { getCustomerProfile } from "../services/customerProfileService";
import { getProductById } from "../services/productService";
import type {
  CustomerProfile,
  ProfileRequirement,
} from "../types/customerProfile";
import type { Product } from "../types/product";
import { calculateFinancingEstimate } from "../utils/financing";
import { formatMoney } from "../utils/format";
import { calculateProfileCompletion } from "../utils/profileCompletion";

const employmentLabels: Record<string, string> = {
  PRIVATE_EMPLOYEE: "Empleado privado",
  PUBLIC_EMPLOYEE: "Empleado público",
  SELF_EMPLOYED: "Independiente",
  MERCHANT: "Comerciante",
  RETIRED: "Pensionado",
  OTHER: "Otro",
};

function getEmploymentLabel(value: string) {
  return employmentLabels[value] ?? "";
}

const fieldClassName = `
  mt-2 min-h-12 w-full rounded-xl border border-slate-200
  bg-white px-4 text-sm text-slate-900 outline-none
  transition-all duration-200 placeholder:text-slate-400
  hover:border-slate-300
  focus:border-brand-500 focus:ring-4 focus:ring-brand-100
`;

const textareaClassName = `
  mt-2 w-full resize-y rounded-xl border border-slate-200
  bg-white px-4 py-3 text-sm leading-6 text-slate-900
  outline-none transition-all duration-200
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-brand-500 focus:ring-4 focus:ring-brand-100
`;

export default function FinancingRequestPage() {
  const [params] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<ApiMissingField[]>(
    [],
  );
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileBlockers, setProfileBlockers] = useState<ProfileRequirement[]>(
    [],
  );

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedTerm = Number(params.get("cuotas") || 0);
  const [selectedTerm, setSelectedTerm] = useState(requestedTerm || 12);

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    approximateIncome: "45000",
    employmentStatus: "Empleado privado",
    notes: "",
    confirmed: false,
    acceptedTerms: false,
  });

  const addressSummary = useMemo(() => {
    if (!profile) return "";
    return [
      profile.address.street,
      profile.address.residenceNumber,
      profile.address.sector,
      profile.address.city,
      profile.address.province,
      profile.address.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [profile]);

  const profileCompletion = useMemo(
    () => (profile ? calculateProfileCompletion(profile) : null),
    [profile],
  );

  useEffect(() => {
    const productId = params.get("producto") || "";
    let mounted = true;

    setLoading(true);

    getProductById(productId).then((found) => {
      if (!mounted) {
        return;
      }

      setProduct(found);

      const minimumTerm = found?.financingTerms.minimum ?? 1;
      const maximumTerm = found?.financingTerms.maximum ?? minimumTerm;
      const defaultTerm = found?.financingTerms.default ?? minimumTerm;

      const validRequestedTerm =
        requestedTerm >= minimumTerm && requestedTerm <= maximumTerm
          ? Math.trunc(requestedTerm)
          : defaultTerm;

      setSelectedTerm(validRequestedTerm || minimumTerm);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [params, requestedTerm]);

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    getCustomerProfile(user).then((loaded) => {
      if (!mounted) return;
      setProfile(loaded);
      setForm((current) => ({
        ...current,
        customerName:
          `${loaded.personal.firstNames} ${loaded.personal.lastNames}`.trim() ||
          current.customerName,
        email: loaded.personal.email || current.email,
        phone: loaded.personal.primaryPhone || current.phone,
        approximateIncome: String(
          loaded.financial.mainMonthlyIncome ||
            loaded.employment.monthlyIncome ||
            current.approximateIncome,
        ),
        employmentStatus:
          getEmploymentLabel(loaded.employment.status) ||
          current.employmentStatus,
      }));
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  const price = useMemo(
    () => (product ? (product.salePrice ?? product.price) : 0),
    [product],
  );

  const financingRules = useMemo(
    () => product?.effectiveFinancingCriteria?.financingRules || {},
    [product],
  );

  const estimate = useMemo(
    () => calculateFinancingEstimate(price, selectedTerm, financingRules),
    [price, selectedTerm, financingRules],
  );

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product || submitting) {
      return;
    }

    if (!form.confirmed || !form.acceptedTerms) {
      toast.error("Confirma tus datos y acepta los términos para continuar.");
      return;
    }

    setProfileBlockers(profileCompletion?.pendingRequirements ?? []);

    setSubmitting(true);
    setMissingDocuments([]);

    try {
      const application = await createApplication({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        price,
        term: selectedTerm,
        minimumTermMonths: product.financingTerms.minimum,
        maximumTermMonths: product.financingTerms.maximum,
        minimumDownPaymentPercent: estimate.minimumDownPaymentPercent,
        downPaymentAmount: estimate.downPaymentAmount,
        financedAmount: estimate.financedAmount,
        annualInterestRate: estimate.annualInterestRate,
        administrativeFeePercent: estimate.administrativeFeePercent,
        administrativeFeeAmount: estimate.administrativeFeeAmount,
        estimatedMonthlyPayment: estimate.monthlyPayment,
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        identificationType: profile?.personal.identificationType,
        identificationNumber: profile?.personal.identificationNumber,
        addressSummary,
        approximateIncome: Number(form.approximateIncome),
        employmentStatus: form.employmentStatus,
        financialReference: profile?.financial.primaryBank,
        notes: form.notes,
      });

      setSubmittedId(application.id);
      toast.success("Tu solicitud fue enviada correctamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiRequestError && error.missingFields.length > 0) {
        setMissingDocuments(error.missingFields);

        toast.warning(
          "Debes completar los documentos requeridos antes de solicitar el financiamiento.",
        );

        window.setTimeout(() => {
          document.getElementById("documentos-requeridos")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);

        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar la solicitud. Inténtalo nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <LoadingState label="Preparando tu solicitud..." />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section
          className="
            relative w-full max-w-xl overflow-hidden rounded-3xl
            border border-slate-200 bg-white px-6 py-12 text-center
            shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]
            sm:px-10 sm:py-14
          "
        >
          <div
            className="
              pointer-events-none absolute left-1/2 top-0
              h-40 w-72 -translate-x-1/2 -translate-y-1/2
              rounded-full bg-brand-100 blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              relative mx-auto flex h-16 w-16 items-center
              justify-center rounded-2xl bg-brand-50 text-brand-600
            "
          >
            <ClipboardList className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="relative mt-6 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Selecciona un producto
          </h1>

          <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
            Para comenzar una solicitud de financiamiento, primero debes elegir
            el producto que deseas adquirir.
          </p>

          <Link
            to="/productos"
            className="
              relative mt-7 inline-flex min-h-12 items-center
              justify-center gap-2 rounded-xl bg-brand-600
              px-6 text-sm font-semibold text-white
              transition-all hover:-translate-y-0.5 hover:bg-brand-700
              focus-visible:outline-none focus-visible:ring-4
              focus-visible:ring-brand-200
            "
          >
            Explorar productos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  if (submittedId) {
    return (
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section
          className="
            relative w-full max-w-2xl overflow-hidden rounded-3xl
            border border-emerald-100 bg-white px-6 py-12
            text-center shadow-[0_30px_80px_-45px_rgba(5,150,105,0.4)]
            sm:px-12 sm:py-16
          "
        >
          <div
            className="
              pointer-events-none absolute left-1/2 top-0
              h-56 w-96 -translate-x-1/2 -translate-y-1/2
              rounded-full bg-emerald-100/80 blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              relative mx-auto flex h-20 w-20 items-center
              justify-center rounded-3xl border border-emerald-100
              bg-emerald-50 text-emerald-600
              shadow-[0_15px_35px_-20px_rgba(5,150,105,0.8)]
            "
          >
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>

          <span
            className="
              relative mt-6 inline-flex rounded-full bg-emerald-50
              px-3 py-1 text-xs font-semibold uppercase
              tracking-[0.14em] text-emerald-700
            "
          >
            Solicitud recibida
          </span>

          <h1 className="relative mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            ¡Todo listo!
          </h1>

          <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            Recibimos tu solicitud de financiamiento para{" "}
            <strong className="font-semibold text-slate-800">
              {product.name}
            </strong>
            . Puedes darle seguimiento desde tu cuenta.
          </p>

          <div
            className="
              relative mx-auto mt-7 max-w-sm rounded-2xl
              border border-slate-200 bg-slate-50 px-5 py-4
            "
          >
            <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Número de solicitud
            </span>

            <strong className="mt-1 block break-all text-lg font-bold text-slate-900">
              {submittedId}
            </strong>

            <span
              className="
                mt-3 inline-flex rounded-full bg-amber-100
                px-3 py-1 text-xs font-semibold text-amber-800
              "
            >
              Estado: Pendiente
            </span>
          </div>

          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/mis-solicitudes"
              className="
                inline-flex min-h-12 items-center justify-center
                gap-2 rounded-xl bg-brand-600 px-6 text-sm
                font-semibold text-white transition-colors
                hover:bg-brand-700 focus-visible:outline-none
                focus-visible:ring-4 focus-visible:ring-brand-200
              "
            >
              Ver mis solicitudes
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => navigate("/productos")}
              className="
                inline-flex min-h-12 items-center justify-center
                rounded-xl border border-slate-200 bg-white
                px-6 text-sm font-semibold text-slate-700
                transition-colors hover:border-slate-300
                hover:bg-slate-50 focus-visible:outline-none
                focus-visible:ring-4 focus-visible:ring-slate-100
              "
            >
              Seguir explorando
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pb-16 lg:pb-24">
      <section
        className="
          border-b border-slate-200 bg-white
          bg-[radial-gradient(circle_at_top_right,rgba(219,234,254,0.65),transparent_38%)]
        "
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
          <Link
            to={`/productos/${product.id}`}
            className="
              inline-flex items-center gap-2 rounded-lg text-sm
              font-semibold text-slate-500 transition-colors
              hover:text-brand-700 focus-visible:outline-none
              focus-visible:ring-4 focus-visible:ring-brand-100
            "
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al producto
          </Link>

          <div className="mt-6 max-w-3xl">
            <span
              className="
                inline-flex items-center gap-2 rounded-full
                border border-brand-100 bg-brand-50 px-3 py-1.5
                text-xs font-semibold uppercase tracking-[0.14em]
                text-brand-700
              "
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Solicitud de financiamiento
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Completa tu solicitud
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Confirma el producto, selecciona tus cuotas y completa tus datos
              para enviar la solicitud.
            </p>
            {profileCompletion ? (
              <div className="mt-5 max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-800">
                    Expediente del solicitante
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      profileCompletion.percentage === 100
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {profileCompletion.percentage}% completado
                  </span>
                </div>
                {profileCompletion.pendingRequirements.length ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Te mostraremos qué falta antes de enviar la solicitud.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-emerald-700">
                    Los requisitos mínimos del expediente están completos.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div
        className="
          mx-auto grid w-full max-w-[1440px] items-start
          gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]
          lg:gap-10 lg:px-8 lg:py-12
        "
      >
        <aside className="space-y-6 lg:sticky lg:top-24">
          <section
            className="
              overflow-hidden rounded-3xl border border-slate-200
              bg-white shadow-[0_22px_65px_-40px_rgba(15,23,42,0.35)]
            "
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-50">
              <ProductVisual product={product} />
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                {product.brand}
              </span>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                {product.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Modelo {product.model}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <span className="block text-xs font-medium text-slate-500">
                  Precio del producto
                </span>

                <strong className="mt-1 block text-2xl font-bold tracking-tight text-slate-950">
                  {formatMoney(price, product.currency)}
                </strong>
              </div>
            </div>
          </section>

          <EstimatePanel
            currency={product.currency}
            price={price}
            minimumTerm={product.financingTerms.minimum}
            maximumTerm={product.financingTerms.maximum}
            selectedTerm={selectedTerm}
            financingRules={financingRules}
            onTermChange={setSelectedTerm}
          />
        </aside>

        <form
          onSubmit={onSubmit}
          className="
            overflow-hidden rounded-3xl border border-slate-200
            bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)]
          "
        >
          <div className="border-b border-slate-100 px-5 py-6 sm:px-7 lg:px-8">
            <div className="flex items-start gap-4">
              <span
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-2xl bg-brand-50 text-brand-600
                "
              >
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Datos del solicitante
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ingresa información actualizada para poder contactarte.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <UserRound
                  className="h-4 w-4 text-brand-600"
                  aria-hidden="true"
                />
                Información personal
              </legend>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Nombre completo
                  <div className="relative">
                    <UserRound
                      className="
                        pointer-events-none absolute left-4 top-1/2
                        h-4 w-4 -translate-y-1/2 text-slate-400
                      "
                      aria-hidden="true"
                    />

                    <input
                      required
                      autoComplete="name"
                      value={form.customerName}
                      onChange={(event) =>
                        update("customerName", event.target.value)
                      }
                      className={`${fieldClassName} pl-11`}
                      placeholder="Nombre y apellido"
                    />
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Correo electrónico
                  <div className="relative">
                    <Mail
                      className="
                        pointer-events-none absolute left-4 top-1/2
                        h-4 w-4 -translate-y-1/2 text-slate-400
                      "
                      aria-hidden="true"
                    />

                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      className={`${fieldClassName} pl-11`}
                      placeholder="nombre@correo.com"
                    />
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Teléfono
                  <div className="relative">
                    <Phone
                      className="
                        pointer-events-none absolute left-4 top-1/2
                        h-4 w-4 -translate-y-1/2 text-slate-400
                      "
                      aria-hidden="true"
                    />

                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      className={`${fieldClassName} pl-11`}
                      placeholder="809-000-0000"
                    />
                  </div>
                </label>
              </div>
            </fieldset>

            {profile ? (
              <>
                <div className="h-px bg-slate-100" />
                <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <MapPin
                      className="h-4 w-4 text-brand-600"
                      aria-hidden="true"
                    />
                    Datos reutilizados del expediente
                  </h3>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Identificación
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {profile.personal.identificationNumber || "Pendiente"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Referencia financiera
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {profile.financial.primaryBank || "Pendiente"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        Dirección
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {addressSummary || "Pendiente"}
                      </dd>
                    </div>
                  </dl>
                </section>
              </>
            ) : null}

            <div className="h-px bg-slate-100" />

            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BriefcaseBusiness
                  className="h-4 w-4 text-brand-600"
                  aria-hidden="true"
                />
                Información laboral
              </legend>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Ingresos mensuales aproximados
                  <div className="relative">
                    <WalletCards
                      className="
                        pointer-events-none absolute left-4 top-1/2
                        h-4 w-4 -translate-y-1/2 text-slate-400
                      "
                      aria-hidden="true"
                    />

                    <input
                      min="0"
                      required
                      type="number"
                      inputMode="decimal"
                      value={form.approximateIncome}
                      onChange={(event) =>
                        update("approximateIncome", event.target.value)
                      }
                      className={`${fieldClassName} pl-11`}
                    />
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Situación laboral
                  <select
                    value={form.employmentStatus}
                    onChange={(event) =>
                      update("employmentStatus", event.target.value)
                    }
                    className={fieldClassName}
                  >
                    <option>Empleado privado</option>
                    <option>Empleado público</option>
                    <option>Independiente</option>
                    <option>Comerciante</option>
                    <option>Otro</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <div className="h-px bg-slate-100" />

            <label className="block text-sm font-medium text-slate-700">
              Comentarios adicionales{" "}
              <span className="font-normal text-slate-400">(opcional)</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Por ejemplo: horario preferido para ser contactado"
                className={textareaClassName}
              />
            </label>

            <div
              className="
                flex items-start gap-3 rounded-2xl
                border border-brand-100 bg-brand-50/70 px-4 py-4
              "
            >
              <Info
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                aria-hidden="true"
              />

              <p className="text-xs leading-5 text-brand-900">
                La información suministrada se utilizará para procesar esta
                solicitud de demostración. La estimación mostrada no representa
                una aprobación definitiva.
              </p>
            </div>

            {profileBlockers.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <h3 className="text-sm font-semibold text-amber-950">
                  Requisitos pendientes para enviar
                </h3>
                <ul className="mt-3 space-y-2">
                  {profileBlockers.map((requirement) => (
                    <li
                      key={requirement.key}
                      className="flex gap-2 text-sm text-amber-900"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {requirement.label}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/mi-cuenta?focus=pending&returnTo=${encodeURIComponent(
                    `${location.pathname}${location.search}`,
                  )}`}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  Completar mi perfil
                </Link>
              </div>
            ) : null}

            <fieldset className="space-y-3">
              <legend className="sr-only">Confirmaciones</legend>

              <label
                className="
                  flex cursor-pointer items-start gap-3 rounded-2xl
                  border border-slate-200 px-4 py-4
                  transition-colors hover:border-brand-200
                  hover:bg-brand-50/40
                "
              >
                <input
                  checked={form.confirmed}
                  onChange={(event) =>
                    update("confirmed", event.target.checked)
                  }
                  type="checkbox"
                  className="
                    mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300
                    text-brand-600 accent-brand-600
                    focus:ring-brand-500
                  "
                />

                <span className="text-sm leading-6 text-slate-600">
                  Confirmo que los datos ingresados son correctos y están
                  actualizados.
                </span>
              </label>

              <label
                className="
                  flex cursor-pointer items-start gap-3 rounded-2xl
                  border border-slate-200 px-4 py-4
                  transition-colors hover:border-brand-200
                  hover:bg-brand-50/40
                "
              >
                <input
                  checked={form.acceptedTerms}
                  onChange={(event) =>
                    update("acceptedTerms", event.target.checked)
                  }
                  type="checkbox"
                  className="
                    mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300
                    text-brand-600 accent-brand-600
                    focus:ring-brand-500
                  "
                />

                <span className="text-sm leading-6 text-slate-600">
                  Acepto los términos y condiciones aplicables a esta solicitud
                  de demostración.
                </span>
              </label>
            </fieldset>
          </div>

          <div
            className="
              border-t border-slate-100 bg-slate-50/70
              px-5 py-5 sm:px-7 lg:px-8
            "
          >
            {missingDocuments.length > 0 ? (
              <section
                id="documentos-requeridos"
                className="
  mb-6 overflow-hidden rounded-2xl
  border border-amber-200 bg-amber-50 shadow-sm
"
              >
                <div className="border-b border-amber-200 px-5 py-5">
                  <div className="flex items-start gap-4">
                    <span
                      className="
            flex h-11 w-11 shrink-0 items-center
            justify-center rounded-xl bg-amber-100
            text-amber-700
          "
                    >
                      <Upload className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <div>
                      <h3 className="text-base font-bold text-amber-950">
                        Faltan documentos para continuar
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-amber-900">
                        Para evaluar tu solicitud necesitamos validar tu
                        identidad y conocer tus movimientos bancarios.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-5 py-5">
                  {missingDocuments.map((document) => {
                    const isBankStatement =
                      document.field === "bankStatementsFiles";

                    const Icon = isBankStatement ? Landmark : FileText;

                    return (
                      <div
                        key={document.field}
                        className="
              flex items-start gap-3 rounded-xl border
              border-amber-200 bg-white px-4 py-4
            "
                      >
                        <span
                          className="
                flex h-9 w-9 shrink-0 items-center
                justify-center rounded-lg bg-amber-50
                text-amber-700
              "
                        >
                          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                        </span>

                        <div>
                          <strong className="block text-sm text-slate-900">
                            {document.label}
                          </strong>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {isBankStatement
                              ? "Carga al menos un estado de cuenta bancario reciente en formato PDF, JPG o PNG."
                              : "Carga una imagen clara de tu cédula o documento de identidad."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="
        flex flex-col gap-3 border-t border-amber-200
        bg-amber-100/60 px-5 py-4 sm:flex-row
        sm:items-center sm:justify-between
      "
                >
                  <p className="text-xs leading-5 text-amber-900">
                    Después de cargarlos, podrás regresar y enviar esta misma
                    solicitud.
                  </p>

                  <Link
                    to={`/mi-cuenta?focus=documents&returnTo=${encodeURIComponent(
                      `${location.pathname}${location.search}`,
                    )}`}
                    className="
          inline-flex min-h-11 shrink-0 items-center
          justify-center gap-2 rounded-xl bg-amber-700
          px-5 text-sm font-semibold text-white
          transition-colors hover:bg-amber-800
          focus-visible:outline-none focus-visible:ring-4
          focus-visible:ring-amber-200
        "
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Cargar documentos
                  </Link>
                </div>
              </section>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex min-h-12 w-full items-center
                justify-center gap-2 rounded-xl bg-brand-600
                px-6 text-sm font-semibold text-white
                shadow-[0_12px_28px_-14px_rgba(245,110,37,0.9)]
                transition-all duration-200
                hover:-translate-y-0.5 hover:bg-brand-700
                disabled:cursor-not-allowed disabled:opacity-60
                disabled:hover:translate-y-0
                focus-visible:outline-none focus-visible:ring-4
                focus-visible:ring-brand-200
              "
            >
              <ClipboardList className="h-5 w-5" aria-hidden="true" />

              {submitting
                ? "Enviando solicitud..."
                : "Enviar solicitud de financiamiento"}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              Podrás consultar el estado de la solicitud desde tu cuenta.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
