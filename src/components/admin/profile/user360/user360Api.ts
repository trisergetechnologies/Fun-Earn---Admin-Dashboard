import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import type {
  User360LogsResponse,
  User360SearchQuery,
  User360Summary,
  User360LogType,
} from "./types";

const BASE = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin`;

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function parseSearchInput(raw: string): User360SearchQuery | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const serialMatch = trimmed.replace(/^#/, "");
  if (/^\d+$/.test(serialMatch)) {
    return { serialNumber: serialMatch };
  }

  return { email: trimmed };
}

export async function fetchUser360Summary(
  query: User360SearchQuery
): Promise<User360Summary> {
  const params = new URLSearchParams();
  if ("email" in query) params.set("email", query.email);
  if ("serialNumber" in query) params.set("serialNumber", query.serialNumber);
  if ("userId" in query) params.set("userId", query.userId);

  const res = await axios.get(`${BASE()}/getcompleteinfo?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to load user");
  }

  return res.data.data as User360Summary;
}

export async function fetchUser360Logs(
  userId: string,
  logType: User360LogType,
  page: number,
  limit = 20
): Promise<User360LogsResponse> {
  const params = new URLSearchParams({
    userId,
    logType,
    page: String(page),
    limit: String(limit),
  });

  const res = await axios.get(
    `${BASE()}/getcompleteinfo/logs?${params.toString()}`,
    { headers: authHeaders() }
  );

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to load logs");
  }

  return res.data.data as User360LogsResponse;
}
