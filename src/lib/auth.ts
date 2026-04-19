import { api } from "./api";
import { toast } from "sonner";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderCountry: string;
    senderTaxId: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingCode: string;
    swiftCode: string;
    branchName: string;
    invoicePrefix: string;
    defaultCurrency: string;
    defaultPaymentTermsDays: number;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    user: {
        id: string;
        email: string;
        name: string;
        senderName: string;
        senderEmail: string;
        senderPhone: string;
        senderAddress: string;
        senderCity: string;
        senderCountry: string;
        senderTaxId: string;
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
        routingCode: string;
        swiftCode: string;
        branchName: string;
        invoicePrefix: string;
        defaultCurrency: string;
        defaultPaymentTermsDays: number;
        isActive: boolean;
        refreshTokenExpiresAt: string | null;
        createdAt: string;
        updatedAt: string;
    };
}

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    } catch (error: unknown) {
        const errorResponse = error as ErrorResponse;
        const errorMessage = errorResponse?.response?.data?.message || "Registration failed";
        toast.error(errorMessage);
        throw error;
    }
};

/**
 * Login user with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>("/auth/login", credentials);
        return response.data;
    } catch (error: unknown) {
        const errorResponse = error as ErrorResponse;
        const errorMessage = errorResponse?.response?.data?.message || "Login failed";
        toast.error(errorMessage);
        throw error;
    }
};

/**
 * Logout user - calls backend logout endpoint
 */
export const logoutUser = async (): Promise<void> => {
    try {
        await api.post("/auth/logout");
    } catch (error) {
        console.error("Logout API call failed:", error);
    } finally {
        // Clear all auth data regardless of API response
        clearAuthData();
    }
};

/**
 * Refresh the access token using refresh token
 */
export const refreshToken = async (): Promise<string | null> => {
    try {
        const refreshTokenValue = localStorage.getItem("refresh_token");

        if (!refreshTokenValue) {
            clearAuthData();
            return null;
        }

        const response = await api.post<{
            access_token: string;
            refresh_token?: string;
        }>("/auth/refresh", { refresh_token: refreshTokenValue });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Update tokens
        localStorage.setItem("token", access_token);
        if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update API header
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        return access_token;
    } catch (error) {
        console.error("Token refresh failed:", error);
        clearAuthData();
        return null;
    }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error("Failed to parse user data:", error);
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
};

/**
 * Store authentication data after successful login/register
 */
export const storeAuthData = (authResponse: AuthResponse): void => {
    const { access_token, refresh_token, user } = authResponse;

    localStorage.setItem("token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
};

/**
 * Get the expiration time of the current token
 */
export const getTokenExpirationTime = (): Date | null => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        // Decode JWT token (without verification - just for client-side use)
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        const payload = JSON.parse(jsonPayload);
        return new Date(payload.exp * 1000);
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};

/**
 * Check if token is about to expire (within 2 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
    const expirationTime = getTokenExpirationTime();

    if (!expirationTime) return false;

    const now = new Date();
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);

    return expirationTime <= twoMinutesFromNow;
};

