import { createContext } from "react";
import type { MockUser, RegisterPayload } from "../types/auth";

export interface AuthContextValue {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
