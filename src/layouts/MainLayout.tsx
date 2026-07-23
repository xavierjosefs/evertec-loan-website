import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../hooks/useAuth";
import { getCustomerProfile } from "../services/customerProfileService";
import type { ProfileCompletion } from "../types/customerProfile";
import {
  calculateProfileCompletion,
  profileStatusLabels,
} from "../utils/profileCompletion";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Productos", to: "/productos" },
];

const accountItems = [
  { label: "Mi cuenta", to: "/mi-cuenta", icon: UserRound },
  { label: "Mis solicitudes", to: "/mis-solicitudes", icon: ClipboardList },
];

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletion | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);
  const closeProfile = () => setProfileOpen(false);

  const handleLogout = () => {
    closeMenu();
    closeProfile();
    logout();
    window.location.replace("/");
  };

  useEffect(() => {
    let mounted = true;

    if (!user) {
      setProfileCompletion(null);
      return;
    }

    getCustomerProfile(user).then((profile) => {
      if (!mounted) return;
      setProfileCompletion(calculateProfileCompletion(profile));
    });

    return () => {
      mounted = false;
    };
  }, [location.pathname, user]);

  const isItemActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(to);
  };

  useEffect(() => {
    closeMenu();
    closeProfile();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen && !profileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        closeProfile();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, profileOpen]);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        profileButtonRef.current?.contains(target) ||
        profileMenuRef.current?.contains(target)
      ) {
        return;
      }

      closeProfile();
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "Usuario";
  const initial = firstName.charAt(0).toUpperCase() || "U";
  const currentYear = new Date().getFullYear();
  const accountPath =
    profileCompletion && profileCompletion.percentage < 100
      ? "/mi-cuenta?focus=pending"
      : "/mi-cuenta";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            aria-label="Ir al inicio de Evertec"
          >
            <BrandLogo size="sm" />

            <span className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-slate-950">
                Evertec
              </span>

              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-600">
                Compra financiada
              </span>
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = isItemActive(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}

                  {isActive ? (
                    <span
                      className="absolute -bottom-[17px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-600"
                      aria-hidden="true"
                    />
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  ref={profileButtonRef}
                  type="button"
                  aria-expanded={profileOpen}
                  aria-controls="profile-menu"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                    {initial}
                  </span>
                  <span className="max-w-24 truncate">{firstName}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {profileOpen ? (
                  <div
                    ref={profileMenuRef}
                    id="profile-menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.55)]"
                  >
                    <div className="px-3 py-3">
                      <span className="block truncate text-sm font-semibold text-slate-950">
                        {user?.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {user?.email}
                      </span>
                      {profileCompletion ? (
                        <span
                          className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            profileCompletion.percentage === 100
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {profileCompletion.percentage}% ·{" "}
                          {profileStatusLabels[profileCompletion.status]}
                        </span>
                      ) : null}
                    </div>

                    <div className="border-t border-slate-100 py-2">
                      {accountItems.map(({ label, to, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to === "/mi-cuenta" ? accountPath : to}
                          onClick={closeProfile}
                          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden min-h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(245,110,37,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 sm:inline-flex"
              >
                Iniciar sesión
              </Link>
            )}

            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 top-[72px] z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          />

          <nav
            id="mobile-navigation"
            className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200 bg-white px-5 pb-6 pt-5 shadow-2xl"
            aria-label="Navegación móvil"
          >
            {isAuthenticated ? (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                  {initial}
                </span>

                <div className="min-w-0">
                  <span className="block text-xs font-medium text-brand-600">
                    Sesión iniciada
                  </span>
                  <strong className="block truncate text-sm font-semibold text-slate-900">
                    {user?.name}
                  </strong>
                  <span className="block truncate text-xs text-slate-500">
                    {user?.email}
                  </span>
                  {profileCompletion ? (
                    <span className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold text-brand-700">
                      {profileCompletion.percentage}% completado
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = isItemActive(item.to);

                return (
                  <NavLink
                    key={`mobile-${item.to}`}
                    to={item.to}
                    onClick={closeMenu}
                    className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    <ChevronRight
                      className={`h-4 w-4 ${isActive ? "text-brand-600" : "text-slate-400"}`}
                      aria-hidden="true"
                    />
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              {isAuthenticated ? (
                <div className="space-y-1">
                  {accountItems.map(({ label, to, icon: Icon }) => (
                    <Link
                      key={`mobile-account-${to}`}
                      to={to === "/mi-cuenta" ? accountPath : to}
                      onClick={closeMenu}
                      className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    onClick={closeMenu}
                    className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="mt-auto border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.6fr] lg:px-8 lg:py-14">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
            >
              <BrandLogo size="sm" />
              <strong className="text-xl tracking-tight">Evertec</strong>
            </Link>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
              Encuentra productos para tu hogar y solicita el financiamiento que
              mejor se adapte a ti.
            </p>

            <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500">
              Las cuotas mostradas son estimaciones y están sujetas a evaluación
              y aprobación.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Explorar
            </span>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/productos"
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Ver todos los productos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <Link
                to="/mis-solicitudes"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Mis solicitudes
              </Link>

              <Link
                to="/mi-cuenta"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Mi cuenta
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© {currentYear} Evertec. Todos los derechos reservados.</span>
            <span>MVP con información demostrativa.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
