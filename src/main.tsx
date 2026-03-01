import ReactDOM from "react-dom/client";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./lib/query-client";
import {ThemeProvider} from "next-themes";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThemeProvider attribute="class" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    </ThemeProvider>
);