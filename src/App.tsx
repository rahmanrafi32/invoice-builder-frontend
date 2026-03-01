import { Navbar } from "@/components/layout/Navbar";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "@/components/ui/sonner";

function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Dashboard />
            <Toaster richColors position="top-right" />
        </div>
    );
}

export default App;