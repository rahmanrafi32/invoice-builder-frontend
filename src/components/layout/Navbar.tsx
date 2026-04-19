import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus, Menu, User, LogOut, Users } from "lucide-react";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useState, useEffect } from "react";
import { logoutUser, getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserInfo {
    name?: string;
    email: string;
}

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch current user info from localStorage
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="flex items-center justify-between border-b bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 sm:px-8 py-4">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
            >
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-sm font-bold text-primary">IB</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Invoice Builder
                </h1>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
                {user && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Generate Invoice</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-125">
                            <DialogHeader>
                                <DialogTitle>Generate Invoice</DialogTitle>
                            </DialogHeader>
                            <InvoiceForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {user && (
                            <>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                            </>
                        )}

                        {user && (
                            <DropdownMenuItem onClick={() => navigate("/profile")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                        )}

                        {user && (
                            <DropdownMenuItem onClick={() => navigate("/clients")}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Manage Clients</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </DropdownMenuItem>

                        {user && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}