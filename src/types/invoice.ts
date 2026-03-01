export interface Invoice {
    id: string;
    invoiceNumber: number;
    month: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    currency: string;
    clientName: string;
    pdfPath: string;
    pdfPreviewUrl: string;
    pdfDownloadUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceResponse {
    data: Invoice[];
    total: number;
    page: number;
    limit: number;
}