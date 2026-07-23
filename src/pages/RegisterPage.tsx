import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Mail,
  LockKeyhole,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
  WalletCards,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../hooks/useAuth";

const fieldClassName = `
  min-h-12 w-full rounded-xl border border-slate-200
  bg-white py-3 pl-12 pr-4 text-sm text-slate-900
  outline-none transition-all duration-200
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-brand-500 focus:ring-4 focus:ring-brand-100
`;

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      toast.success("Tu cuenta fue creada correctamente.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos crear la cuenta. Inténtalo nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-slate-50">
      <div
        className="
          pointer-events-none absolute -left-40 -top-48
          h-[500px] w-[500px] rounded-full
          bg-brand-200/40 blur-[120px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute -bottom-60 -right-40
          h-[560px] w-[560px] rounded-full
          bg-brand-100/60 blur-[130px]
        "
        aria-hidden="true"
      />

      <div
        className="
          relative mx-auto grid min-h-[calc(100vh-72px)]
          w-full max-w-[1440px] items-stretch
          lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]
        "
      >
        <section
          className="
            relative hidden overflow-hidden bg-slate-950
            px-12 py-16 text-white lg:flex lg:flex-col
            lg:justify-between xl:px-16
          "
        >
          <div
            className="
              pointer-events-none absolute -left-32 -top-40
              h-96 w-96 rounded-full bg-brand-600/25
              blur-[100px]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none absolute -bottom-48 -right-32
              h-[480px] w-[480px] rounded-full
              bg-brand-500/10 blur-[120px]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)]
              [background-size:46px_46px]
            "
            aria-hidden="true"
          />

          <Link
            to="/"
            className="
              relative inline-flex w-fit items-center gap-3
              rounded-xl focus-visible:outline-none
              focus-visible:ring-4 focus-visible:ring-brand-500/40
            "
          >
            <BrandLogo size="sm" />

            <span className="text-xl font-bold tracking-tight">Evertec</span>
          </Link>

          <div className="relative max-w-xl py-12">
            <span
              className="
                inline-flex items-center gap-2 rounded-full
                border border-brand-400/20 bg-brand-500/10
                px-3.5 py-2 text-xs font-semibold uppercase
                tracking-[0.14em] text-brand-300
              "
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Crea tu cuenta
            </span>

            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.035em] xl:text-5xl">
              Empieza a financiar lo que necesitas para tu hogar.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
              Regístrate para iniciar solicitudes y darle seguimiento a cada
              paso desde tu cuenta.
            </p>

            <div className="mt-9 space-y-4">
              {[
                {
                  icon: WalletCards,
                  text: "Consulta cuotas estimadas para cada producto",
                },
                {
                  icon: ClipboardList,
                  text: "Completa solicitudes de financiamiento",
                },
                {
                  icon: ShieldCheck,
                  text: "Consulta el estado desde tu cuenta",
                },
              ].map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.text}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span
                      className="
                        flex h-8 w-8 shrink-0 items-center
                        justify-center rounded-full
                        bg-emerald-400/10 text-emerald-300
                      "
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>

                    {benefit.text}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="
              relative flex items-start gap-3 rounded-2xl
              border border-white/10 bg-white/5 p-4
              backdrop-blur-sm
            "
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />

            <p className="text-xs leading-6 text-slate-400">
              El registro se procesa directamente en la API de Evertec Loan.
            </p>
          </div>
        </section>

        <section
          className="
            flex items-center justify-center px-4 py-12
            sm:px-6 lg:px-12 lg:py-16 xl:px-20
          "
        >
          <div className="w-full max-w-lg">
            <Link
              to="/"
              className="
                mb-10 inline-flex items-center gap-3 rounded-xl
                focus-visible:outline-none focus-visible:ring-4
                focus-visible:ring-brand-100 lg:hidden
              "
            >
              <BrandLogo size="sm" />

              <span className="text-lg font-bold tracking-tight text-slate-950">
                Evertec
              </span>
            </Link>

            <div
              className="
                overflow-hidden rounded-3xl border border-slate-200
                bg-white shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)]
              "
            >
              <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-2xl bg-brand-50 text-brand-600
                  "
                >
                  <UserPlus className="h-6 w-6" aria-hidden="true" />
                </div>

                <span
                  className="
                    mt-6 inline-flex rounded-full bg-brand-50
                    px-3 py-1 text-[11px] font-semibold uppercase
                    tracking-[0.14em] text-brand-700
                  "
                >
                  Registro seguro
                </span>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Crear cuenta
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Completa tus datos básicos para acceder a solicitudes y
                  opciones de financiamiento.
                </p>

                <form onSubmit={onSubmit} className="mt-7 space-y-5">
                  <label
                    htmlFor="register-name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nombre completo
                    <div className="relative mt-2">
                      <UserRound
                        className="
                          pointer-events-none absolute left-4 top-1/2
                          h-5 w-5 -translate-y-1/2 text-slate-400
                        "
                        aria-hidden="true"
                      />

                      <input
                        id="register-name"
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Nombre y apellido"
                        className={fieldClassName}
                      />
                    </div>
                  </label>

                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Correo electrónico
                    <div className="relative mt-2">
                      <Mail
                        className="
                          pointer-events-none absolute left-4 top-1/2
                          h-5 w-5 -translate-y-1/2 text-slate-400
                        "
                        aria-hidden="true"
                      />

                      <input
                        id="register-email"
                        autoComplete="email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          update("email", event.target.value)
                        }
                        placeholder="nombre@correo.com"
                        className={fieldClassName}
                      />
                    </div>
                  </label>

                  <label
                    htmlFor="register-phone"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Teléfono
                    <div className="relative mt-2">
                      <Phone
                        className="
                          pointer-events-none absolute left-4 top-1/2
                          h-5 w-5 -translate-y-1/2 text-slate-400
                        "
                        aria-hidden="true"
                      />

                      <input
                        id="register-phone"
                        required
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) =>
                          update("phone", event.target.value)
                        }
                        placeholder="809-000-0000"
                        className={fieldClassName}
                      />
                    </div>
                  </label>

                  <label
                    htmlFor="register-password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Contraseña
                    <div className="relative mt-2">
                      <LockKeyhole
                        className="
                          pointer-events-none absolute left-4 top-1/2
                          h-5 w-5 -translate-y-1/2 text-slate-400
                        "
                        aria-hidden="true"
                      />

                      <input
                        id="register-password"
                        required
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        value={form.password}
                        onChange={(event) =>
                          update("password", event.target.value)
                        }
                        placeholder="Mínimo 6 caracteres, una mayúscula y un número"
                        className={fieldClassName}
                      />
                    </div>
                  </label>

                  <div
                    className="
                      flex items-start gap-3 rounded-2xl
                      border border-brand-100 bg-brand-50/70
                      px-4 py-3.5
                    "
                  >
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      aria-hidden="true"
                    />

                    <p className="text-xs leading-5 text-brand-900">
                      Usa una contraseña segura. La sesión se conservará
                      temporalmente en este navegador.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      group inline-flex min-h-12 w-full
                      items-center justify-center gap-2
                      rounded-xl bg-brand-600 px-6
                      text-sm font-semibold text-white
                      shadow-[0_14px_30px_-16px_rgba(245,110,37,0.9)]
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:bg-brand-700
                      disabled:cursor-not-allowed disabled:opacity-60
                      disabled:hover:translate-y-0
                      focus-visible:outline-none focus-visible:ring-4
                      focus-visible:ring-brand-200
                    "
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />

                    {submitting ? "Creando cuenta..." : "Crear mi cuenta"}

                    {!submitting ? (
                      <ArrowRight
                        className="
                          h-4 w-4 transition-transform
                          group-hover:translate-x-1
                        "
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </form>
              </div>

              <div
                className="
                  border-t border-slate-100 bg-slate-50/70
                  px-6 py-5 text-center sm:px-8
                "
              >
                <p className="text-sm text-slate-600">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="
                      font-semibold text-brand-700
                      transition-colors hover:text-brand-800
                      focus-visible:rounded focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-brand-500
                    "
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </div>

            <p
              className="
                mt-6 flex items-center justify-center gap-2
                text-center text-xs text-slate-400
              "
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Tus datos se envían de forma segura a Evertec Loan
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
