import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useState } from "react";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between border-b bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 sm:px-8 py-4">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Invoice Builder
            </h1>

            <div className="flex items-center gap-2 sm:gap-3">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Generate Invoice</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Generate Invoice</DialogTitle>
                        </DialogHeader>
                        <InvoiceForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                    }
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
            </div>
        </div>
    );
}