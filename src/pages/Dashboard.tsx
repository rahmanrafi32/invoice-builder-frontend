import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";

export default function Dashboard() {
    return (
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            <InvoiceForm />
            <InvoiceTable />
        </div>
    );
}