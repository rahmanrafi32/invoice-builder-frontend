import { useState, useEffect, type ReactNode } from "react";
import { isAuthenticated, getCurrentUser, isTokenExpiringSoon, refreshToken } from "@/lib/auth";
import { AuthContext } from "@/lib/contexts/AuthContextType";

interface User {
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
    createdAt: string;
    updatedAt: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = () => {
            if (isAuthenticated()) {
                const currentUser = getCurrentUser();
                setUser(currentUser);
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // Set up token refresh interval
    useEffect(() => {
        if (!isAuthenticated()) {
            return;
        }

        // Check and refresh token if needed every minute
        const interval = setInterval(async () => {
            if (isTokenExpiringSoon()) {
                const newToken = await refreshToken();
                if (newToken) {
                    console.log("Token refreshed successfully");
                }
            }
        }, 60000); // Check every minute


        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: isAuthenticated(),
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


