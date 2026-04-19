import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {loginUser, storeAuthData} from "@/lib/auth";
import {toast} from "sonner";
import {Loader2} from "lucide-react";

interface LoginFormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}


export function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginUser(formData);

            // Store auth data
            storeAuthData(response);

            toast.success("Login successful!");
            navigate("/");
        } catch (error: unknown) {
            console.error("Login error:", error);
            // Error toast is already shown by loginUser function
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Branding Section */}
                <div className="text-center space-y-3 mb-8">
                    <h2 className="text-4xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-muted-foreground text-base">
                        Access your Invoice Builder account to manage your professional invoicing and payments
                    </p>
                </div>

                {/* Login Form */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="space-y-2 pb-4">
                        <CardTitle className="text-lg">Sign In</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.email}
                                    className="h-10"
                                />
                                {errors.email && (
                                    <p className="text-xs sm:text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.password}
                                    className="h-10"
                                />
                                {errors.password && (
                                    <p className="text-xs sm:text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 text-base font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-background text-muted-foreground">New to Invoice Builder?</span>
                                </div>
                            </div>

                            <Link to="/register">
                                <Button variant="outline" className="w-full h-10 text-base font-medium">
                                    Create Account
                                </Button>
                            </Link>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Info */}
                <div className="text-center text-xs text-muted-foreground space-y-2 mt-8">
                    <p>Secure access to your invoicing platform</p>
                    <p>© 2026 Invoice Builder. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}



