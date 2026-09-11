/**
 * Single source for admin API base URL.
 * Always returns a non-empty URL so pages never call `undefined/...`.
 */
export const PROD_API_URL = 'https://amp-api.mpdreams.in/api/v1';
export const LOCAL_API_URL = 'http://localhost:5000/api/v1';

export function getBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
  if (fromEnv && /^https?:\/\/.+/i.test(fromEnv)) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === 'development') {
    return LOCAL_API_URL;
  }
  return PROD_API_URL;
}

/** Convenience alias used across the dashboard */
export const API_BASE_URL = getBaseUrl();
