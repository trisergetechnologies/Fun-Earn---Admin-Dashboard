import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getRefreshToken,
  getRefreshUrl,
  getToken,
  removeToken,
  saveAuthTokens,
} from "@/helper/tokenHelper";

type LogoutFn = () => void;

let logoutHandler: LogoutFn | null = null;
let interceptorsAttached = false;
let refreshPromise: Promise<string | null> | null = null;

function isAuthUrl(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post(
      getRefreshUrl(),
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = res.data?.data;
    if (!res.data?.success || !data) return null;

    const accessToken = data.accessToken || data.token;
    if (!accessToken) return null;

    saveAuthTokens({
      accessToken,
      refreshToken: data.refreshToken || refreshToken,
    });

    return accessToken as string;
  } catch {
    return null;
  }
}

/** Single-flight refresh so concurrent 401s share one request. */
export async function ensureFreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function expireSession() {
  removeToken();
  try {
    logoutHandler?.();
  } catch {
    // never throw from session expiry
  }
}

/**
 * Attach global axios interceptors once.
 * On 401: refresh access token and retry. Logout only if refresh fails.
 * 403 is not treated as session expiry.
 */
export function setupAxiosInterceptors(logout: LogoutFn) {
  logoutHandler = logout;
  if (interceptorsAttached) return;
  interceptorsAttached = true;

  axios.interceptors.request.use(
    (config) => {
      if (isAuthUrl(config.url)) return config;
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const status = error.response?.status;

      if (!original || status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      if (isAuthUrl(original.url)) {
        return Promise.reject(error);
      }

      const storedRefresh = getRefreshToken();
      if (!storedRefresh) {
        expireSession();
        return Promise.reject(error);
      }

      original._retry = true;

      const newAccess = await ensureFreshAccessToken();
      if (!newAccess) {
        expireSession();
        return Promise.reject(error);
      }

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return axios(original);
    }
  );
}
