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

// Define the refresh endpoint (adjust to match your Django URL)
const REFRESH_ENDPOINT = '/api/auth/refresh/';

export async function fetchJson<T>(
  path: string,
  opts: FetchJsonOpts = {},
  // internal flag to prevent infinite refresh loops
  _isRetry = false
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers ?? {}),
  };

  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Django CSRF token handling
  if (opts.csrf) {
    const token = getCookie('csrftoken') || getCookie('csrf') || getCookie('csrf_token');
    if (token) headers['X-CSRFToken'] = token;
  }

  let res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: opts.credentials ?? 'include',
    cache: 'no-store',
  });

  // Handle 401 Unauthorized – attempt token refresh once
  if (res.status === 401 && !_isRetry) {
    try {
      // Call refresh endpoint (credentials: 'include' sends cookies automatically)
      const refreshRes = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        // Django's simplejwt expects an empty object? Your auth/api sends {}
        body: JSON.stringify({}),
      });

      if (refreshRes.ok) {
        // Retry the original request with a flag to prevent infinite loops
        return fetchJson(path, opts, true);
      } else {
        // Refresh failed – redirect to login (or throw a special error)
        // Option 1: Redirect (if you have access to router)
        // window.location.href = '/auth/sign-in';
        // Option 2: Throw a custom error that the caller can handle
        throw new ApiError(401, null, 'Authentication failed. Please log in again.');
      }
    } catch (error) {
      // Network error or refresh failure
      throw new ApiError(401, null, 'Unable to refresh authentication. Please log in again.');
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data, `Request failed: ${res.status}`);
  }

  return data as T;
}
