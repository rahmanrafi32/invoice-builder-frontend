import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center justify-between border-b bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60 px-8 py-4">
            <h1 className="text-xl font-semibold tracking-tight">
                Invoice Builder
            </h1>

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
    );
}