import {resolve} from "path";
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (['react', 'react-dom', 'react-router-dom'].some(pkg => id.includes(`/node_modules/${pkg}/`))) {
                        return 'vendor-react';
                    }

                    if (id.includes('/node_modules/@radix-ui/')) {
                        return 'vendor-radix';
                    }

                    if (id.includes('/node_modules/')) {
                        const name = id.split('/node_modules/')[1].split('/')[0];
                        return `vendor-${name.replace('@', '')}`;
                    }
                },
            },
        },
    },
})