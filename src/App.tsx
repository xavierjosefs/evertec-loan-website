import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import MainLayout from "./layouts/MainLayout";
import FinancingRequestPage from "./pages/FinancingRequestPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

const DEFAULT_AUTHENTICATED_ROUTE = "/";

function getSafeRedirect(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login") ||
    value.startsWith("/registro")
  ) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  return value;
}

function RouteEffects() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;

    let title = "Evertec | Financiamiento para tu hogar";

    if (pathname === "/productos") {
      title = "Productos | Evertec";
    } else if (pathname.startsWith("/productos/")) {
      title = "Detalle del producto | Evertec";
    } else if (pathname === "/login") {
      title = "Iniciar sesión | Evertec";
    } else if (pathname === "/registro") {
      title = "Crear cuenta | Evertec";
    } else if (pathname === "/mi-cuenta") {
      title = "Mi cuenta | Evertec";
    } else if (pathname === "/mis-solicitudes") {
      title = "Mis solicitudes | Evertec";
    } else if (pathname === "/financiamiento/solicitar") {
      title = "Solicitud de financiamiento | Evertec";
    } else if (pathname !== "/") {
      title = "Página no encontrada | Evertec";
    }

    document.title = title;
  }, [location.pathname]);

  return null;
}

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return useRoutes([
    {
      element: (
        <>
          <RouteEffects />
          <MainLayout />
        </>
      ),
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "productos",
          element: <ProductsPage />,
        },
        {
          path: "productos/:id",
          element: <ProductDetailPage />,
        },
        {
          element: <GuestOnly />,
          children: [
            {
              path: "login",
              element: <LoginPage />,
            },
            {
              path: "registro",
              element: <RegisterPage />,
            },
          ],
        },
        {
          element: <RequireAuth />,
          children: [
            {
              path: "financiamiento/solicitar",
              element: <FinancingRequestPage />,
            },
            {
              path: "mis-solicitudes",
              element: <MyApplicationsPage />,
            },
            {
              path: "mi-cuenta",
              element: <ProfilePage />,
            },
          ],
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
  ]);
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        limit={3}
        theme="light"
      />
    </AuthProvider>
  );
}
