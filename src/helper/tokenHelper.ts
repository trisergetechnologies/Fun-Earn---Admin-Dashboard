const ACCESS_COOKIE = "auth_token";
const REFRESH_COOKIE = "auth_refresh";
const ROLE_COOKIE = "auth_role";

/** 30 days — JWT expiry is enforced by the API; cookie just persists the value. */
const REFRESH_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function cookieFlags(maxAgeSec?: number): string {
  const parts = ["path=/", "SameSite=Strict"];
  if (typeof maxAgeSec === "number") parts.push(`Max-Age=${maxAgeSec}`);
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec?: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieFlags(maxAgeSec)}`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;`;
}

/** Save access token used as Bearer on API calls. */
export const setToken = (token: string) => {
  writeCookie(ACCESS_COOKIE, token, REFRESH_MAX_AGE_SEC);
};

export const getToken = (): string | null => readCookie(ACCESS_COOKIE);

export const setRefreshToken = (refreshToken: string) => {
  writeCookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE_SEC);
};

export const getRefreshToken = (): string | null => readCookie(REFRESH_COOKIE);

export const setUserRole = (role: string) => {
  writeCookie(ROLE_COOKIE, role, REFRESH_MAX_AGE_SEC);
};

export const getUserRole = (): string | null => readCookie(ROLE_COOKIE);

export type AuthTokensInput = {
  /** Prefer short-lived access JWT when present. */
  accessToken?: string | null;
  /** Legacy / session JWT from `data.token`. */
  token?: string | null;
  refreshToken?: string | null;
};

/** Persist access (+ optional refresh) from login/refresh responses. */
export const saveAuthTokens = (tokens: AuthTokensInput) => {
  const access = tokens.accessToken || tokens.token;
  if (access) setToken(access);
  if (tokens.refreshToken) setRefreshToken(tokens.refreshToken);
};

export const removeToken = () => {
  clearCookie(ACCESS_COOKIE);
  clearCookie(REFRESH_COOKIE);
  clearCookie(ROLE_COOKIE);
};

export function getMeUrl(role?: string | null): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const r = role || getUserRole();
  if (r === "seller") return `${base}/ecart/seller/user/getme`;
  return `${base}/ecart/admin/user/getme`;
}

export function getRefreshUrl(): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`;
}
