import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Save,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AddressForm from "../components/profile/AddressForm";
import ConsentSection from "../components/profile/ConsentSection";
import DocumentChecklist from "../components/profile/DocumentChecklist";
import EmploymentForm from "../components/profile/EmploymentForm";
import FinancialInformationForm from "../components/profile/FinancialInformationForm";
import PersonalInformationForm from "../components/profile/PersonalInformationForm";
import PersonalReferencesForm from "../components/profile/PersonalReferencesForm";
import ProfileCompletionCard from "../components/profile/ProfileCompletionCard";
import { useAuth } from "../hooks/useAuth";
import {
  getCustomerProfile,
  removeDocumentMetadata,
  saveCustomerProfile,
  saveDocumentMetadata,
} from "../services/customerProfileService";
import type {
  CustomerDocument,
  CustomerProfile,
  EmploymentInformation,
  FinancialInformation,
  PersonalReference,
} from "../types/customerProfile";
import { calculateFinancialSummary } from "../utils/financialSummary";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import {
  hasErrors,
  validateAddressInformation,
  validateEmploymentInformation,
  validateFinancialInformation,
  validatePersonalInformation,
  validateReference,
} from "../utils/profileValidation";

const tabs = [
  { id: "summary", label: "Resumen", icon: ClipboardList },
  { id: "personal", label: "Información personal", icon: IdCard },
  { id: "address", label: "Dirección y residencia", icon: Home },
  { id: "employment", label: "Información laboral", icon: BriefcaseBusiness },
  { id: "financial", label: "Información financiera", icon: WalletCards },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "references", label: "Referencias personales", icon: UsersRound },
  { id: "consents", label: "Consentimientos", icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]["id"];
type ProfileErrors = {
  personal: ReturnType<typeof validatePersonalInformation>;
  address: ReturnType<typeof validateAddressInformation>;
  employment: ReturnType<typeof validateEmploymentInformation>;
  financial: ReturnType<typeof validateFinancialInformation>;
  references: Record<string, Partial<Record<keyof PersonalReference, string>>>;
};

const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 5 * 1024 * 1024;

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  if (value.startsWith("/login") || value.startsWith("/registro")) return "";
  return value;
}

function emptyErrors(): ProfileErrors {
  return {
    personal: {},
    address: {},
    employment: {},
    financial: {},
    references: {},
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [draft, setDraft] = useState<CustomerProfile | null>(null);
  const requestedFocus = params.get("focus");

  const validTabIds: TabId[] = [
    "summary",
    "personal",
    "address",
    "employment",
    "financial",
    "documents",
    "references",
    "consents",
  ];

  const initialTab: TabId =
    requestedFocus && validTabIds.includes(requestedFocus as TabId)
      ? (requestedFocus as TabId)
      : "summary";

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>(() => emptyErrors());
  const returnTo = safeReturnTo(params.get("returnTo"));

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    getCustomerProfile(user).then((loaded) => {
      if (!mounted) return;
      setProfile(loaded);
      setDraft(loaded);
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!editing || JSON.stringify(profile) === JSON.stringify(draft)) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [draft, editing, profile]);

  const current = draft ?? profile;
  const completion = useMemo(
    () => (current ? calculateProfileCompletion(current) : null),
    [current],
  );
  const financialSummary = useMemo(
    () => (current ? calculateFinancialSummary(current.financial) : null),
    [current],
  );

  if (!user || !current || !completion || !financialSummary || !profile) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Preparando tu expediente...
        </div>
      </main>
    );
  }

  const displayName =
    `${current.personal.firstNames} ${current.personal.lastNames}`.trim() ||
    user.name;

  const updateDraft = (
    updater: (profile: CustomerProfile) => CustomerProfile,
  ) => {
    setDraft((value) => (value ? updater(value) : value));
  };

  const validateAll = (value: CustomerProfile): ProfileErrors => {
    const referenceErrors = value.references.reduce<
      ProfileErrors["references"]
    >((acc, reference) => {
      const next = validateReference(reference);
      if (Object.keys(next).length) acc[reference.id] = next;
      return acc;
    }, {});

    return {
      personal: validatePersonalInformation(value.personal),
      address: validateAddressInformation(value.address),
      employment: validateEmploymentInformation(value.employment),
      financial: validateFinancialInformation(value.financial),
      references: referenceErrors,
    };
  };

  const handleSave = async () => {
    if (saving || !draft) return;

    const nextErrors = validateAll(draft);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      toast.error("Revisa los campos señalados antes de guardar.");
      return;
    }

    setSaving(true);
    try {
      const saved = await saveCustomerProfile(draft);
      setProfile(saved);
      setDraft(saved);
      setEditing(false);
      toast.success("Expediente actualizado correctamente.");
    } catch {
      toast.error("No pudimos guardar los cambios. Inténtalo nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(profile) !== JSON.stringify(draft)) {
      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Deseas descartarlos?",
      );
      if (!confirmed) return;
    }
    setDraft(profile);
    setErrors(emptyErrors());
    setEditing(false);
  };

  const handleFileUpload = async (document: CustomerDocument, file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("El archivo debe ser PDF, JPG, JPEG o PNG.");
      return;
    }
    if (file.size > maxFileSize) {
      toast.error("El archivo no puede superar 5 MB.");
      return;
    }

    const saved = await saveDocumentMetadata(
      current,
      document.requirementKey,
      file,
    );
    setProfile(saved);
    setDraft(saved);
    toast.success("Documento cargado como metadato local.");
  };

  const handleDocumentRemove = async (document: CustomerDocument) => {
    const saved = await removeDocumentMetadata(
      current,
      document.requirementKey,
    );
    setProfile(saved);
    setDraft(saved);
    toast.success("Documento eliminado del expediente local.");
  };

  const addReference = () => {
    if (current.references.length >= 3) return;
    const timestamp = new Date().toISOString();
    updateDraft((value) => ({
      ...value,
      references: [
        ...value.references,
        {
          id: `reference-${Date.now()}`,
          fullName: "",
          relationship: "",
          phone: "",
          knownFor: "",
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  return (
    <main className="min-h-[70vh] bg-slate-50 pb-16 lg:pb-24">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Expediente financiero
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Mi cuenta
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                Completa tu información para agilizar futuras solicitudes de
                financiamiento.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {returnTo ? (
                <Link
                  to={returnTo}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Volver a la solicitud
                </Link>
              ) : null}
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1440px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24">
          <label className="sr-only" htmlFor="profile-tab-select">
            Sección del expediente
          </label>
          <select
            id="profile-tab-select"
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as TabId)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:hidden"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>

          <nav className="mt-3 hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm lg:block">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition-colors ${
                  activeTab === id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {activeTab === "summary" ? (
            <ProfileCompletionCard
              profile={current}
              completion={completion}
              displayName={displayName}
              onContinue={() => {
                const next = completion.pendingRequirements[0]?.section;
                if (next === "Documentos") setActiveTab("documents");
                else if (next === "Dirección") setActiveTab("address");
                else if (next === "Información laboral")
                  setActiveTab("employment");
                else if (next === "Información financiera")
                  setActiveTab("financial");
                else if (next === "Consentimientos") setActiveTab("consents");
                else setActiveTab("personal");
                setEditing(true);
              }}
            />
          ) : null}

          {activeTab !== "summary" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_65px_-45px_rgba(15,23,42,0.35)] sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Puedes modificar esta información y guardar los cambios."
                      : "Activa el modo de edición para actualizar esta sección."}
                  </p>
                </div>
                {completion.requirements.some((item) => item.completed) ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : null}
              </div>

              {activeTab === "personal" ? (
                <PersonalInformationForm
                  value={current.personal}
                  errors={errors.personal}
                  editing={editing}
                  onChange={(key, value) =>
                    updateDraft((profile) => ({
                      ...profile,
                      personal: { ...profile.personal, [key]: value },
                    }))
                  }
                />
              ) : null}

              {activeTab === "address" ? (
                <AddressForm
                  value={current.address}
                  errors={errors.address}
                  editing={editing}
                  onChange={(key, value) =>
                    updateDraft((profile) => ({
                      ...profile,
                      address: { ...profile.address, [key]: value },
                    }))
                  }
                />
              ) : null}

              {activeTab === "employment" ? (
                <EmploymentForm
                  value={current.employment}
                  errors={errors.employment}
                  editing={editing}
                  onChange={(key, value) =>
                    updateDraft((profile) => ({
                      ...profile,
                      employment: {
                        ...profile.employment,
                        [key]: value,
                      } as EmploymentInformation,
                      financial: {
                        ...profile.financial,
                        mainMonthlyIncome:
                          key === "monthlyIncome"
                            ? Number(value)
                            : profile.financial.mainMonthlyIncome,
                      },
                    }))
                  }
                />
              ) : null}

              {activeTab === "financial" ? (
                <FinancialInformationForm
                  value={current.financial}
                  errors={errors.financial}
                  summary={financialSummary}
                  editing={editing}
                  onChange={(key, value) =>
                    updateDraft((profile) => ({
                      ...profile,
                      financial: {
                        ...profile.financial,
                        [key]: value,
                      } as FinancialInformation,
                    }))
                  }
                />
              ) : null}

              {activeTab === "documents" ? (
                <DocumentChecklist
                  documents={current.documents}
                  onUpload={handleFileUpload}
                  onRemove={handleDocumentRemove}
                />
              ) : null}

              {activeTab === "references" ? (
                <PersonalReferencesForm
                  value={current.references}
                  errors={errors.references}
                  editing={editing}
                  onAdd={addReference}
                  onRemove={(id) =>
                    updateDraft((value) => ({
                      ...value,
                      references: value.references.filter(
                        (item) => item.id !== id,
                      ),
                    }))
                  }
                  onChange={(id, key, value) =>
                    updateDraft((profile) => ({
                      ...profile,
                      references: profile.references.map((reference) =>
                        reference.id === id
                          ? {
                              ...reference,
                              [key]: value,
                              updatedAt: new Date().toISOString(),
                            }
                          : reference,
                      ),
                    }))
                  }
                />
              ) : null}

              {activeTab === "consents" ? (
                <ConsentSection
                  value={current.consents}
                  editing={editing}
                  onChange={(key, accepted) =>
                    updateDraft((profile) => ({
                      ...profile,
                      consents: profile.consents.map((consent) =>
                        consent.key === key
                          ? {
                              ...consent,
                              accepted,
                              acceptedAt: accepted
                                ? new Date().toISOString()
                                : undefined,
                            }
                          : consent,
                      ),
                    }))
                  }
                />
              ) : null}
            </section>
          ) : null}

          {returnTo && completion.percentage === 100 ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-900">
                Tu expediente tiene los requisitos mínimos. Puedes regresar a la
                solicitud para continuar.
              </p>
              <button
                type="button"
                onClick={() => navigate(returnTo)}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Volver a la solicitud
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
