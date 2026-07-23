import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredSession,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "../services/authService";
import type { MockUser, RegisterPayload } from "../types/auth";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(
    () => getStoredSession()?.user ?? null,
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("evertec:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "evertec:session-expired",
        handleSessionExpired,
      );
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await loginCustomer(email, password);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const nextUser = await registerCustomer(payload);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    logoutCustomer();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
