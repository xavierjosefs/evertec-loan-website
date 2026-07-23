const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const TOKEN_KEY = "evertec_access_token";
const SESSION_KEY = "evertec_customer_session";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function clearExpiredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);

  window.dispatchEvent(new CustomEvent("evertec:session-expired"));
}

export interface ApiMissingField {
  field: string;
  label: string;
}

export class ApiRequestError extends Error {
  status: number;
  missingFields: ApiMissingField[];

  constructor(
    message: string,
    status: number,
    missingFields: ApiMissingField[] = [],
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.missingFields = missingFields;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    clearExpiredSession();
  }

  if (!response.ok || data.ok === false) {
    throw new ApiRequestError(
      data.mensaje || data.message || "No pudimos completar la solicitud.",
      response.status,
      Array.isArray(data.missingFields) ? data.missingFields : [],
    );
  }

  return data as T;
}
