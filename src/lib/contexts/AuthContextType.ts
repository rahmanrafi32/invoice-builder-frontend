import { createContext } from "react";

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

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

