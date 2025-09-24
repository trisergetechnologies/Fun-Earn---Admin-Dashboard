import axios from "axios";
import { getToken} from "@/helper/tokenHelper";

// 👇 Pass in logout function once from context
export function setupAxiosInterceptors(logout: () => void) {
  // Attach token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Global 401/403 error handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout(); // 👈 This will redirect and clean token
      }
      return Promise.reject(error);
    }
  );
}
