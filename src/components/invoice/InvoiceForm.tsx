import { useState, useEffect, useCallback, useRef } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { MonthPicker } from "@/components/invoice/DatePicker.tsx";

interface Client {
    id: string;
    name: string;
    email: string;
}

interface InvoiceFormProps {
    onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [amount, setAmount] = useState("");
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const queryClient = useQueryClient();
    const hasInitialized = useRef(false);

    const fetchClients = useCallback(async () => {
        try {
            setIsLoadingClients(true);
            const response = await api.get<Client[] | { data: Client[] }>("/clients");

            let clientsData: Client[] = [];
            if (Array.isArray(response.data)) {
                clientsData = response.data;
            } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                clientsData = (response.data as { data: Client[] }).data;
            }

            setClients(clientsData);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setIsLoadingClients(false);
        }
    }, []);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchClients();
        }
    }, [fetchClients]);

    const isValid = selectedDate !== undefined && Number(amount) > 0 && selectedClient !== "";

    const mutation = useMutation({
        mutationFn: async () => {
            const monthFormatted = selectedDate ? dayjs(selectedDate).format("YYYY-MM") : "";
            return api.post("/invoices", {
                clientId: selectedClient,
                month: monthFormatted,
                amount: Number(amount),
            });
        },
        onSuccess: () => {
            toast.success("Invoice generated successfully");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            setSelectedDate(undefined);
            setAmount("");
            setSelectedClient("");
            onSuccess?.(); // Close the dialog
        },
    });

    return (
        <CardContent className="space-y-4 sm:space-y-6 px-0 sm:px-0 pt-4">
            <div className="space-y-2">
                <Label htmlFor="client" className="text-sm sm:text-base font-medium">Select Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={clients.length === 0 || isLoadingClients}>
                    <SelectTrigger id="client" className="w-full">
                        <SelectValue placeholder={isLoadingClients ? "Loading clients..." : (clients.length === 0 ? "No clients available" : "Select a client")} />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.length > 0 && clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {clients.length === 0 && !isLoadingClients && (
                    <p className="text-xs text-muted-foreground">
                        💡 Create a client first to generate invoices
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="month" className="text-sm sm:text-base font-medium">Month *</Label>
                <MonthPicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="Pick a month"
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm sm:text-base font-medium">Amount *</Label>
                <Input
                    id="amount"
                    type="number"
                    placeholder="50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-sm sm:text-base"
                />
            </div>

            <Button
                className="w-full text-sm sm:text-base h-9 sm:h-10"
                disabled={!isValid || mutation.isPending || isLoadingClients}
                onClick={() => mutation.mutate()}
            >
                {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate PDF
            </Button>
        </CardContent>
    );
}