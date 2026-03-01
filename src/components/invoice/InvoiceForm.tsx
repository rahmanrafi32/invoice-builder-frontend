import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { MonthPicker } from "@/components/invoice/DatePicker.tsx";

export function InvoiceForm() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [amount, setAmount] = useState("");
    const queryClient = useQueryClient();

    const isValid = selectedDate !== undefined && Number(amount) > 0;

    const mutation = useMutation({
        mutationFn: async () => {
            const monthFormatted = selectedDate ? dayjs(selectedDate).format("YYYY-MM") : "";
            return api.post("/invoices", {
                month: monthFormatted,
                amount: Number(amount),
            });
        },
        onSuccess: () => {
            toast.success("Invoice generated successfully");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            setSelectedDate(undefined);
            setAmount("");
        },
    });

    return (
        <Card className="w-full max-w-lg mx-auto shadow-sm border-muted">
            <CardHeader className="pb-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-semibold">
                    Generate Invoice
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Month</Label>
                    <MonthPicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Pick a month"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Amount</Label>
                    <Input
                        type="number"
                        placeholder="50000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-sm sm:text-base"
                    />
                </div>

                <Button
                    className="w-full text-sm sm:text-base h-9 sm:h-10"
                    disabled={!isValid || mutation.isPending}
                    onClick={() => mutation.mutate()}
                >
                    {mutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate PDF
                </Button>
            </CardContent>
        </Card>
    );
}