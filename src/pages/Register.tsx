import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { registerUser, storeAuthData } from "@/lib/auth";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderCountry: string;
    senderTaxId: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingCode: string;
    swiftCode: string;
    branchName: string;
    invoicePrefix: string;
    defaultCurrency: string;
    defaultPaymentTermsDays: number;
}

const initialFormData: FormData = {
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: "",
    senderCity: "",
    senderCountry: "",
    senderTaxId: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    routingCode: "",
    swiftCode: "",
    branchName: "",
    invoicePrefix: "INV",
    defaultCurrency: "USD",
    defaultPaymentTermsDays: 7,
};

interface FormErrors {
    [key: string]: string;
}

const STEPS = [
    { id: 1, title: "Account", description: "Account Credentials" },
    { id: 2, title: "Business", description: "Business Details" },
    { id: 3, title: "Banking", description: "Banking Information" },
    { id: 4, title: "Settings", description: "Invoice Preferences" },
];

export function Register() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!formData.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }

            if (!formData.password.trim()) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            } else if (!/(?=.*[a-z])/.test(formData.password)) {
                newErrors.password = "Password must contain at least one lowercase letter";
            } else if (!/(?=.*[A-Z])/.test(formData.password)) {
                newErrors.password = "Password must contain at least one uppercase letter";
            } else if (!/(?=.*\d)/.test(formData.password)) {
                newErrors.password = "Password must contain at least one number";
            } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
                newErrors.password = "Password must contain at least one special character (!@#$%^&*)";
            }

            if (!formData.confirmPassword.trim()) {
                newErrors.confirmPassword = "Please confirm your password";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }

            if (!formData.name.trim()) {
                newErrors.name = "Name is required";
            } else if (formData.name.trim().length < 2) {
                newErrors.name = "Name must be at least 2 characters";
            }
        }

        if (step === 2) {
            if (!formData.senderPhone.trim()) newErrors.senderPhone = "Business phone is required";
            if (!formData.senderAddress.trim()) newErrors.senderAddress = "Address is required";
            if (!formData.senderCity.trim()) newErrors.senderCity = "City is required";
            if (!formData.senderCountry.trim()) newErrors.senderCountry = "Country is required";
        }

        if (step === 3) {
            if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
            if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
            if (!formData.accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required";
            if (!formData.branchName.trim()) newErrors.branchName = "Branch name is required";
        }

        if (step === 4) {
            if (!formData.invoicePrefix?.trim()) newErrors.invoicePrefix = "Invoice prefix is required";
            if (!formData.defaultCurrency?.trim()) newErrors.defaultCurrency = "Default currency is required";
            if (!formData.defaultPaymentTermsDays || formData.defaultPaymentTermsDays <= 0) {
                newErrors.defaultPaymentTermsDays = "Payment terms must be greater than 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: name === "defaultPaymentTermsDays" ? (value ? parseInt(value) : 0) : value,
            };
            if (name === "name") updated.senderName = value;
            if (name === "email") updated.senderEmail = value;
            return updated;
        });

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((s) => s + 1);
            window.scrollTo(0, 0);
        } else {
            toast.error("Please fix the errors in this step");
        }
    };

    const handlePrevious = () => {
        setCurrentStep((s) => s - 1);
        window.scrollTo(0, 0);
    };

    const handleRegister = async () => {
        if (!validateStep(4)) {
            toast.error("Please fix the errors in this step");
            return;
        }

        setIsLoading(true);

        try {
            const registrationData = { ...formData };
            delete (registrationData as Partial<FormData>).confirmPassword;
            const response = await registerUser(registrationData);
            storeAuthData(response);
            toast.success("Registration successful! Logging you in...");
            navigate("/");
        } catch (error: unknown) {
            console.error("Registration error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Create Your Account</CardTitle>
                    <CardDescription>
                        Set up your Invoice Builder account to start creating professional invoices in minutes
                    </CardDescription>
                </CardHeader>

                {/* Progress Indicator */}
                <div className="px-6 pt-4 pb-2">
                    <p className="text-xs text-muted-foreground mb-3">
                        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].description}
                    </p>
                    <div className="flex gap-2">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex-1">
                                <div
                                    className={`h-2 rounded-full transition-colors ${
                                        step.id <= currentStep ? "bg-primary" : "bg-muted"
                                    }`}
                                />
                                <p className="text-xs mt-1 text-center text-muted-foreground">
                                    {step.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <CardContent>
                    <div className="space-y-6">
                        {/* Step 1: Account Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    {formData.password && <PasswordRequirements password={formData.password} />}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.confirmPassword}
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Business Information */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="senderPhone">Business Phone *</Label>
                                    <Input
                                        id="senderPhone"
                                        name="senderPhone"
                                        type="tel"
                                        placeholder="+1-555-0123"
                                        value={formData.senderPhone}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.senderPhone}
                                    />
                                    {errors.senderPhone && <p className="text-sm text-destructive">{errors.senderPhone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="senderTaxId">Tax ID</Label>
                                    <Input
                                        id="senderTaxId"
                                        name="senderTaxId"
                                        type="text"
                                        placeholder="12-3456789"
                                        value={formData.senderTaxId}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="senderAddress">Address *</Label>
                                    <Input
                                        id="senderAddress"
                                        name="senderAddress"
                                        type="text"
                                        placeholder="123 Main Street, Suite 100"
                                        value={formData.senderAddress}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.senderAddress}
                                    />
                                    {errors.senderAddress && <p className="text-sm text-destructive">{errors.senderAddress}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="senderCity">City *</Label>
                                        <Input
                                            id="senderCity"
                                            name="senderCity"
                                            type="text"
                                            placeholder="New York"
                                            value={formData.senderCity}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.senderCity}
                                        />
                                        {errors.senderCity && <p className="text-sm text-destructive">{errors.senderCity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="senderCountry">Country *</Label>
                                        <Input
                                            id="senderCountry"
                                            name="senderCountry"
                                            type="text"
                                            placeholder="USA"
                                            value={formData.senderCountry}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.senderCountry}
                                        />
                                        {errors.senderCountry && <p className="text-sm text-destructive">{errors.senderCountry}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Information */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name *</Label>
                                        <Input
                                            id="bankName"
                                            name="bankName"
                                            type="text"
                                            placeholder="Chase Bank"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.bankName}
                                        />
                                        {errors.bankName && <p className="text-sm text-destructive">{errors.bankName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branchName">Branch Name *</Label>
                                        <Input
                                            id="branchName"
                                            name="branchName"
                                            type="text"
                                            placeholder="Main Branch"
                                            value={formData.branchName}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.branchName}
                                        />
                                        {errors.branchName && <p className="text-sm text-destructive">{errors.branchName}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number *</Label>
                                    <Input
                                        id="accountNumber"
                                        name="accountNumber"
                                        type="text"
                                        placeholder="9876543210"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.accountNumber}
                                    />
                                    {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                    <Input
                                        id="accountHolderName"
                                        name="accountHolderName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.accountHolderName}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.accountHolderName}
                                    />
                                    {errors.accountHolderName && <p className="text-sm text-destructive">{errors.accountHolderName}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="routingCode">Routing Code (Optional)</Label>
                                        <Input
                                            id="routingCode"
                                            name="routingCode"
                                            type="text"
                                            placeholder="021000021"
                                            value={formData.routingCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                                        <Input
                                            id="swiftCode"
                                            name="swiftCode"
                                            type="text"
                                            placeholder="CHASUS33"
                                            value={formData.swiftCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Invoice Settings */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invoicePrefix">Invoice Prefix *</Label>
                                    <Input
                                        id="invoicePrefix"
                                        name="invoicePrefix"
                                        type="text"
                                        placeholder="INV"
                                        value={formData.invoicePrefix}
                                        onChange={handleChange}
                                    />
                                    {errors.invoicePrefix && <p className="text-sm text-destructive">{errors.invoicePrefix}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="defaultCurrency">Default Currency *</Label>
                                    <Input
                                        id="defaultCurrency"
                                        name="defaultCurrency"
                                        type="text"
                                        placeholder="USD"
                                        value={formData.defaultCurrency}
                                        onChange={handleChange}
                                    />
                                    {errors.defaultCurrency && <p className="text-sm text-destructive">{errors.defaultCurrency}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="defaultPaymentTermsDays">Payment Terms (Days) *</Label>
                                    <Input
                                        id="defaultPaymentTermsDays"
                                        name="defaultPaymentTermsDays"
                                        type="number"
                                        placeholder="7"
                                        value={formData.defaultPaymentTermsDays}
                                        onChange={handleChange}
                                    />
                                    {errors.defaultPaymentTermsDays && <p className="text-sm text-destructive">{errors.defaultPaymentTermsDays}</p>}
                                </div>

                                <p className="text-sm text-muted-foreground pt-4">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary hover:underline font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button type="button" onClick={handleNext} className="ml-auto gap-2">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="ml-auto gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}