import { fetchJson } from "@/lib/api";
import type { User } from "@/lib/types";

// Base URL for Django API – falls back to empty string (same origin) if not set
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Helper to build the full URL
const apiUrl = (path: string) => `${API_BASE}${path}`;

export const AUTH_ENDPOINTS = {
  me: "/api/auth/me/",
  profile: "/api/auth/profile/",
  requestSmsCode: "/api/auth/request-sms-code/",
  signIn: "/api/auth/login/",
  signUp: "/api/auth/register/",
  signOut: "/api/auth/logout/",
  refresh: "/api/auth/refresh/",
  changeEmail: "/api/auth/change-email/",
  changePhone: "/api/auth/change-phone/",
  changePassword: "/api/auth/change-password/",
  requestPasswordReset: "/api/auth/request-password-reset/",
} as const;

export type SmsPurpose = "register" | "sensitive";

type UserEnvelope = { user: User };
type OkEnvelope = { ok: boolean };

export const authApi = {
  async me(): Promise<User> {
    const res = await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.me), {
      method: "GET",
      credentials: "include",
    });
    return res.user;
  },

  async updateProfile(input: { first_name?: string; last_name?: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.profile), {
      method: "PATCH",
      body: input,
      csrf: true,
      credentials: "include",
    });
    return res.user;
  },

  async requestSmsCode(input: { purpose: SmsPurpose; phone?: string }): Promise<void> {
    await fetchJson<OkEnvelope>(apiUrl(AUTH_ENDPOINTS.requestSmsCode), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
  },

  async signIn(input: { phone: string; password: string }): Promise<void> {
    await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.signIn), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
      retryOn401: false,
    });
  },

  async signUp(input: {
    phone?: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<void> {
    await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.signUp), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
  },

  async signOut(): Promise<void> {
    await fetchJson<OkEnvelope>(apiUrl(AUTH_ENDPOINTS.signOut), {
      method: "POST",
      body: {},
      csrf: true,
      credentials: "include",
    });
  },

  async refresh(): Promise<void> {
    await fetchJson<OkEnvelope>('/api/auth/refresh/', {
      method: 'POST',
      body: {},
      csrf: true,
      credentials: 'include',
    });
  },

  async changeEmail(input: { email?: string; code?: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.changeEmail), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
    return res.user;
  },

  async changePhone(input: { new_phone: string; code?: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(apiUrl(AUTH_ENDPOINTS.changePhone), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
    return res.user;
  },

  async requestPasswordReset(input: { email: string }): Promise<void> {
    await fetchJson<OkEnvelope>(apiUrl(AUTH_ENDPOINTS.requestPasswordReset), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
  },

  async changePassword(input: { new_password: string; code?: string }): Promise<OkEnvelope> {
    return fetchJson<OkEnvelope>(apiUrl(AUTH_ENDPOINTS.changePassword), {
      method: "POST",
      body: input,
      csrf: true,
      credentials: "include",
    });
  },
};
