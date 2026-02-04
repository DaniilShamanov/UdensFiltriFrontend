import { fetchJson } from "@/lib/api";
import type { User } from "@/lib/types";

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
} as const;

export type SmsPurpose = "register" | "sensitive";

type UserEnvelope = { user: User };

type OkEnvelope = { ok: boolean };

export const authApi = {
  async me(): Promise<User> {
    const res = await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.me, { method: "GET" });
    return res.user;
  },

  async updateProfile(input: { first_name?: string; last_name?: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.profile, {
      method: "PATCH",
      body: input,
      csrf: true,
    });
    return res.user;
  },

  async requestSmsCode(input: { purpose: SmsPurpose; phone?: string }): Promise<void> {
    await fetchJson<OkEnvelope>(AUTH_ENDPOINTS.requestSmsCode, {
      method: "POST",
      body: input,
      csrf: true,
    });
  },

  async signIn(input: { phone: string; password: string }): Promise<void> {
    await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.signIn, {
      method: "POST",
      body: input,
      csrf: true,
    });
  },

  async signUp(input: {
    phone: string;
    password: string;
    code: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<void> {
    await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.signUp, {
      method: "POST",
      body: input,
      csrf: true,
    });
  },

  async signOut(): Promise<void> {
    await fetchJson<OkEnvelope>(AUTH_ENDPOINTS.signOut, {
      method: "POST",
      body: {},
      csrf: true,
    });
  },

  async refresh(): Promise<void> {
    await fetchJson<OkEnvelope>(AUTH_ENDPOINTS.refresh, {
      method: "POST",
      body: {},
      csrf: true,
    });
  },

  async changeEmail(input: { email?: string; code: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.changeEmail, {
      method: "POST",
      body: input,
      csrf: true,
    });
    return res.user;
  },

  async changePhone(input: { new_phone: string; code: string }): Promise<User> {
    const res = await fetchJson<UserEnvelope>(AUTH_ENDPOINTS.changePhone, {
      method: "POST",
      body: input,
      csrf: true,
    });
    return res.user;
  },

  async changePassword(input: { new_password: string; code: string }): Promise<OkEnvelope> {
    return fetchJson<OkEnvelope>(AUTH_ENDPOINTS.changePassword, {
      method: "POST",
      body: input,
      csrf: true,
    });
  },
};
