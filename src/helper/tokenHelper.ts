
// ✅ Save token in cookies 
export const setToken = (token: string) => {
  document.cookie = `auth_token=${token}; path=/; SameSite=Strict; ${
    process.env.NODE_ENV === "production" ? "Secure" : ""
  }`;
};

export const setUserRole = (role: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `auth_role=${role}; path=/; SameSite=Strict; ${
    process.env.NODE_ENV === "production" ? "Secure" : ""
  }`;
};

export const getUserRole = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )auth_role=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
};

// ✅ Get token from cookies
export const getToken = (): string | null => {
  if (typeof document === "undefined") return null; // SSR safety
  const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
  return match ? match[2] : null;
};

// ✅ Remove token
export const removeToken = () => {
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";
  document.cookie =
    "auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";
};

export function getMeUrl(role?: string | null): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const r = role || getUserRole();
  if (r === "seller") return `${base}/ecart/seller/user/getme`;
  return `${base}/ecart/admin/user/getme`;
}
