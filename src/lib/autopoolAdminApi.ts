import { getBaseUrl } from '@/lib/apiBase';
import { getToken } from '@/helper/tokenHelper';
import axios from 'axios';

export async function autopoolAdmin(path: string, options: { method?: string; data?: any } = {}) {
  const token = getToken();
  const url = `${getBaseUrl()}/autopool/admin${path}`;
  const res = await axios({
    url,
    method: options.method || 'GET',
    data: options.data,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
