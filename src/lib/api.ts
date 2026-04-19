import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_API_URL;

console.log(baseURL);

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Set authorization header if token exists
const token = localStorage.getItem("token");
if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
    onSuccess: (token: string) => void;
    onFailed: () => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.onFailed();
        } else if (token) {
            prom.onSuccess(token);
        }
    });

    failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        const response = await axios.post(
            `${baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            {
                baseURL: baseURL,
            }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("token", access_token);
        if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update default header
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        return access_token;
    } catch (error) {
        console.error("Token refresh failed:", error);
        // Clear auth data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        window.location.href = "/login";
        return null;
    }
};

// Request interceptor to add authorization header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Token is already being refreshed, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        onSuccess: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        onFailed: () => {
                            reject(error);
                        },
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other error responses
        const message =
            (error.response?.data as any)?.message ||
            error.message ||
            "Something went wrong";

        // Don't show error toast for auth endpoints during token refresh
        if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        toast.error(message);

        return Promise.reject(error);
    }
);