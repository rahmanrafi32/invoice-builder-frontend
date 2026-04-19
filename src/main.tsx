import ReactDOM from "react-dom/client";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./lib/query-client";
import {ThemeProvider} from "next-themes";
import { AuthProvider } from "./lib/AuthContext";
import App from "./App";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThemeProvider attribute="class" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App/>
            </AuthProvider>
            <Analytics />
        </QueryClientProvider>
    </ThemeProvider>
);