import axios from "axios";
import {toast} from "sonner";

const baseURL = import.meta.env.VITE_API_URL;

console.log(baseURL);

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";

        toast.error(message);

        return Promise.reject(error);
    }
);