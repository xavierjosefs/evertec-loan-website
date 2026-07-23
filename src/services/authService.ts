import type { MockUser, RegisterPayload } from "../types/auth";
import { apiRequest, getAccessToken, setAccessToken } from "./apiClient";

const SESSION_KEY = "evertec_customer_session";
const DEVICE_ID_KEY = "evertec_customer_device_id";

interface StoredSession {
  isAuthenticated: boolean;
  user: MockUser;
}

interface AuthResponse {
  ok: boolean;
  token: string;
  user: MockUser & {
    _id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export function getStoredSession(): StoredSession | null {
  try {
    const token = getAccessToken();
    const raw = localStorage.getItem(SESSION_KEY);

    if (!token || !raw) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    const session = JSON.parse(raw) as StoredSession;

    if (
      session?.isAuthenticated !== true ||
      !session.user?.id ||
      !session.user?.email
    ) {
      localStorage.removeItem(SESSION_KEY);
      setAccessToken(null);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    setAccessToken(null);
    return null;
  }
}

function getDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const next = `web-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function persistSession(user: MockUser) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      isAuthenticated: true,
      user,
    }),
  );
}

function normalizeUser(user: AuthResponse["user"]): MockUser {
  return {
    id: user.id || user._id || "",
    name:
      user.name ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.email,
    phone: user.phone || user.phoneNumber || "",
  };
}

export async function loginCustomer(email: string, password: string): Promise<MockUser> {
  const response = await apiRequest<AuthResponse>("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      deviceId: getDeviceId(),
      platform: "web",
    }),
  });
  setAccessToken(response.token);
  const user = normalizeUser(response.user);
  persistSession(user);
  return user;
}

export async function registerCustomer(payload: RegisterPayload): Promise<MockUser> {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phone,
      password: payload.password,
      deviceId: getDeviceId(),
      platform: "web",
    }),
  });
  setAccessToken(response.token);
  const user = normalizeUser(response.user);
  persistSession(user);
  return user;
}

export function logoutCustomer() {
  localStorage.removeItem(SESSION_KEY);
  setAccessToken(null);
}
