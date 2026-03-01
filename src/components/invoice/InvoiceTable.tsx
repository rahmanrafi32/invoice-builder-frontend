import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InvoiceResponse } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import dayjs from "dayjs";
import { MonthPicker } from "@/components/invoice/DatePicker.tsx";
import { X, Download, Eye, Trash2 } from "lucide-react";

export function InvoiceTable() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const limit = 5;

    // 🔥 Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Convert selected month to string format for API queries
    const month = selectedMonth ? dayjs(selectedMonth).format("YYYY-MM") : "";

    // Reset page when month changes
    useEffect(() => {
        setPage(1);
    }, [selectedMonth]);

    // Reset all filters
    const handleReset = () => {
        setSearchInput("");
        setSearch("");
        setSelectedMonth(undefined);
        setPage(1);
    };

    // Check if any filters are active
    const hasActiveFilters = searchInput !== "" || selectedMonth !== undefined;

    const { data, isFetching } = useQuery<InvoiceResponse>({
        queryKey: ["invoices", page, search, month],
        queryFn: async () => {
            const res = await api.get("/invoices", {
                params: { page, limit, search, month },
            });
            console.log("API Response:", res.data);
            return res.data;
        },
        placeholderData: (prev) => prev,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/invoices/${id}`);
        },
        onSuccess: () => {
            toast.success("Invoice deleted");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            setDeleteId(null);
        },
    });

    const totalPages = Math.max(
        1,
        Math.ceil((data?.total || 0) / limit)
    );

    // Adjust page if it exceeds totalPages
    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Input
                    placeholder="Search by client..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 text-sm sm:text-base"
                />

                <MonthPicker
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    placeholder="Pick a month"
                    className="w-full sm:w-[240px]"
                />

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="gap-2 text-sm sm:text-base"
                    >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block rounded-xl border overflow-hidden relative">
                {isFetching && (
                    <div className="absolute top-2 right-4 text-xs text-muted-foreground">
                        Updating...
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data?.data?.length ? (
                            data.data.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.clientName}</TableCell>
                                    <TableCell>
                                        {dayjs(invoice.month).format("MMMM YYYY")}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: invoice.currency,
                                        }).format(Number(invoice.amount))}
                                    </TableCell>
                                    <TableCell>
                                        {dayjs(invoice.issueDate).format("MMM DD, YYYY")}
                                    </TableCell>
                                    <TableCell>
                                        {dayjs(invoice.dueDate).format("MMM DD, YYYY")}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                console.log("Preview URL:", invoice.pdfPreviewUrl);
                                                setPreviewUrl(invoice.pdfPreviewUrl)
                                            }}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                console.log("Download URL:", invoice.pdfDownloadUrl);
                                                window.open(invoice.pdfDownloadUrl, "_blank");
                                            }}
                                        >
                                            Download
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setDeleteId(invoice.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-10 text-muted-foreground"
                                >
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
                {isFetching && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                        Updating...
                    </div>
                )}

                {data?.data?.length ? (
                    data.data.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="rounded-lg border bg-card p-4 space-y-3"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Invoice #{invoice.invoiceNumber}
                                    </div>
                                    <div className="font-semibold text-sm sm:text-base">
                                        {invoice.clientName}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">
                                        {dayjs(invoice.month).format("MMMM YYYY")}
                                    </div>
                                    <div className="font-semibold text-sm sm:text-base">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: invoice.currency,
                                        }).format(Number(invoice.amount))}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div>
                                    <div className="text-muted-foreground">Issue Date</div>
                                    <div>{dayjs(invoice.issueDate).format("MMM DD, YYYY")}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Due Date</div>
                                    <div>{dayjs(invoice.dueDate).format("MMM DD, YYYY")}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPreviewUrl(invoice.pdfPreviewUrl)}
                                    className="flex-1 min-w-[100px] gap-1 text-xs sm:text-sm"
                                >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => window.open(invoice.pdfDownloadUrl, "_blank")}
                                    className="flex-1 min-w-[100px] gap-1 text-xs sm:text-sm"
                                >
                                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteId(invoice.id)}
                                    className="w-full sm:w-auto gap-1 text-xs sm:text-sm"
                                >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No invoices found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                    Page {page} of {totalPages}
                </span>

                <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                        className="text-xs sm:text-sm"
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="text-xs sm:text-sm"
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* PDF Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[85vh] p-0">
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full rounded-lg"
                            title="Invoice Preview"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                    <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold">
                            Delete Invoice?
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            This action cannot be undone.
                        </p>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                            <AlertDialogCancel className="text-xs sm:text-sm">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteMutation.mutate(deleteId!)}
                                className="text-xs sm:text-sm"
                            >
                                Confirm Delete
                            </AlertDialogAction>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}