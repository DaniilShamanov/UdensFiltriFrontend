export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message = "API request failed") {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type FetchJsonOpts = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
  csrf?: boolean;
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1")}=(.*?)($|;)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function fetchJson<T>(path: string, opts: FetchJsonOpts = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(opts.headers ?? {}),
  };

  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Django-friendly CSRF support (works for session auth and cookie-based JWT).
  if (opts.csrf) {
    const token = getCookie("csrftoken") || getCookie("csrf") || getCookie("csrf_token");
    if (token) headers["X-CSRFToken"] = token;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: opts.credentials ?? "include",
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data, `Request failed: ${res.status}`);
  }

  return data as T;
}
