import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InvoiceResponse } from "@/types/invoice";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import dayjs from "dayjs";
import { X, Download, Eye, Trash2, Filter } from "lucide-react";
import months from "@/utils/months.ts";

const TABLE_SKELETON_ROWS = 5;

interface Client {
    id: string;
    name: string;
    email: string;
}

export function InvoiceTable() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [tempMonth, setTempMonth] = useState<string>("");
    const [tempYear, setTempYear] = useState<string>("");
    const [appliedMonth, setAppliedMonth] = useState<string>("");
    const [appliedYear, setAppliedYear] = useState<string>("");
    const [appliedClientId, setAppliedClientId] = useState<string>("");

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const limit = 10;

    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 2025 + 1 },
        (_, i) => (2025 + i).toString()
    );

    const currentMonth = new Date().getMonth() + 1;

    const availableMonths = tempYear === currentYear.toString()
        ? months.filter((m) => parseInt(m.value) <= currentMonth)
        : months;

    // Fetch clients
    const { data: clientsData, isLoading: clientsLoading } = useQuery<Client[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            try {
                const response = await api.get<Client[] | { data: Client[] }>("/clients");
                if (Array.isArray(response.data)) {
                    return response.data;
                } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                    return (response.data as { data: Client[] }).data;
                }
                return [];
            } catch (error) {
                console.error("Failed to fetch clients:", error);
                return [];
            }
        },
    });

    const handleYearChange = (year: string) => {
        setTempYear(year);
        if (year === currentYear.toString() && tempMonth) {
            if (parseInt(tempMonth) > currentMonth) {
                setTempMonth("");
            }
        }
    };

    const month = appliedMonth && appliedYear
        ? `${appliedYear}-${appliedMonth}`
        : "";

    const handleApplyFilter = () => {
        setAppliedMonth(tempMonth);
        setAppliedYear(tempYear);
        setAppliedClientId(selectedClientId);
        setPage(1);
    };

    const handleReset = () => {
        setSelectedClientId("");
        setTempMonth("");
        setTempYear("");
        setAppliedMonth("");
        setAppliedYear("");
        setAppliedClientId("");
        setPage(1);
    };

    const hasActiveFilters = selectedClientId !== "" || appliedMonth !== "" || appliedYear !== "";
    const canApplyFilter = tempYear !== "" && (tempMonth !== appliedMonth || tempYear !== appliedYear || selectedClientId !== appliedClientId);

    const { data, isFetching } = useQuery<InvoiceResponse>({
        queryKey: ["invoices", page, appliedClientId, month],
        queryFn: async () => {
            const res = await api.get("/invoices", {
                params: { page, limit, clientId: appliedClientId || undefined, month },
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

    const safePage = page > totalPages && totalPages > 0 ? totalPages : page;
    if (safePage !== page && totalPages > 0) {
        Promise.resolve().then(() => setPage(safePage));
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={clientsLoading}>
                        <SelectTrigger className="flex-1 text-sm sm:text-base">
                            <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select client"} />
                        </SelectTrigger>
                        <SelectContent>
                            {(clientsData || []).map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={tempYear} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={tempMonth}
                        onValueChange={setTempMonth}
                        disabled={!tempYear}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleApplyFilter}
                        disabled={!canApplyFilter}
                        className="gap-2 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filter
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="gap-2 text-sm sm:text-base w-full sm:w-auto"
                        >
                            <X className="h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Active Filter Badge */}
                {(appliedMonth || appliedYear || appliedClientId) && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>Filtered by:</span>
                        <div className="flex flex-wrap gap-2">
                            {appliedClientId && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                                    {clientsData?.find(c => c.id === appliedClientId)?.name}
                                </span>
                            )}
                            {appliedYear && appliedMonth && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                                    {months.find(m => m.value === appliedMonth)?.label} {appliedYear}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block rounded-xl border overflow-hidden relative">
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
                        {isFetching ? (
                            // Skeleton Rows for Desktop
                            Array.from({ length: TABLE_SKELETON_ROWS }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Skeleton className="h-8 w-20 inline-block" />
                                        <Skeleton className="h-8 w-24 inline-block" />
                                        <Skeleton className="h-8 w-20 inline-block" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : data?.data?.length ? (
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
                {isFetching ? (
                    // Skeleton Cards for Mobile
                    Array.from({ length: TABLE_SKELETON_ROWS }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16 ml-auto" />
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Skeleton className="h-8 flex-1" />
                                <Skeleton className="h-8 flex-1" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ))
                ) : data?.data?.length ? (
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
                                    className="flex-1 min-w-25 gap-1 text-xs sm:text-sm"
                                >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => window.open(invoice.pdfDownloadUrl, "_blank")}
                                    className="flex-1 min-w-25 gap-1 text-xs sm:text-sm"
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