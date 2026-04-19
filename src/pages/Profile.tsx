import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Edit2, Loader2, Save, X} from "lucide-react";

interface UserProfile {
    id: string;
    email: string;
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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface FormErrors {
    [key: string]: string;
}

type EditableUserProfile = Omit<UserProfile, "id" | "email" | "isActive" | "createdAt" | "updatedAt">;

interface UpdateProfileError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editProfile, setEditProfile] = useState<EditableUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const initializeEditForm = (data: UserProfile) => {
        const editableData: EditableUserProfile = {
            name: data.name,
            senderName: data.senderName,
            senderEmail: data.senderEmail,
            senderPhone: data.senderPhone,
            senderAddress: data.senderAddress,
            senderCity: data.senderCity,
            senderCountry: data.senderCountry,
            senderTaxId: data.senderTaxId,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountHolderName: data.accountHolderName,
            routingCode: data.routingCode,
            swiftCode: data.swiftCode,
            branchName: data.branchName,
            invoicePrefix: data.invoicePrefix,
            defaultCurrency: data.defaultCurrency,
            defaultPaymentTermsDays: data.defaultPaymentTermsDays,
        };
        setEditProfile(editableData);
    };

    useEffect(() => {
        const initLoad = async () => {
            try {
                setIsLoading(true);
                const response = await api.get<UserProfile>("/auth/profile");
                setProfile(response.data);
                initializeEditForm(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };
        initLoad();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<UserProfile>("/auth/profile");
            setProfile(response.data);
            initializeEditForm(response.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };


    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!editProfile?.name?.trim()) {
            newErrors.name = "Name is required";
        }
        if (!editProfile?.senderName?.trim()) {
            newErrors.senderName = "Sender name is required";
        }
        if (!editProfile?.senderEmail?.trim()) {
            newErrors.senderEmail = "Sender email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editProfile.senderEmail)) {
            newErrors.senderEmail = "Please enter a valid email address";
        }
        if (!editProfile?.senderPhone?.trim()) {
            newErrors.senderPhone = "Sender phone is required";
        }
        if (!editProfile?.senderAddress?.trim()) {
            newErrors.senderAddress = "Sender address is required";
        }
        if (!editProfile?.senderCity?.trim()) {
            newErrors.senderCity = "Sender city is required";
        }
        if (!editProfile?.senderCountry?.trim()) {
            newErrors.senderCountry = "Sender country is required";
        }
        if (!editProfile?.senderTaxId?.trim()) {
            newErrors.senderTaxId = "Tax ID is required";
        }
        if (!editProfile?.bankName?.trim()) {
            newErrors.bankName = "Bank name is required";
        }
        if (!editProfile?.branchName?.trim()) {
            newErrors.branchName = "Branch name is required";
        }
        if (!editProfile?.accountNumber?.trim()) {
            newErrors.accountNumber = "Account number is required";
        }
        if (!editProfile?.accountHolderName?.trim()) {
            newErrors.accountHolderName = "Account holder name is required";
        }
        if (!editProfile?.routingCode?.trim()) {
            newErrors.routingCode = "Routing code is required";
        }
        if (!editProfile?.swiftCode?.trim()) {
            newErrors.swiftCode = "SWIFT code is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditChange = (field: keyof EditableUserProfile, value: string | number) => {
        setEditProfile((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: field === "defaultPaymentTermsDays" ? Number(value) : value,
            };
        });

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.put<UserProfile>("/auth/profile", editProfile);
            setProfile(response.data);
            initializeEditForm(response.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: unknown) {
            console.error("Failed to update profile:", error);
            const errorResponse = error as UpdateProfileError;
            const errorMessage =
                errorResponse?.response?.data?.message || "Failed to update profile";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            initializeEditForm(profile);
            setIsEditing(false);
            setErrors({});
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header Skeleton */}
                <div>
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-8 w-64"/>
                                <Skeleton className="h-4 w-96"/>
                            </div>
                            <Skeleton className="h-10 w-32"/>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                    {/* Personal Information Skeleton */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-48 mb-2"/>
                            <Skeleton className="h-4 w-64"/>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sender Information Skeleton */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-48 mb-2"/>
                            <Skeleton className="h-4 w-64"/>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-32"/>
                                        <Skeleton className="h-10 w-full"/>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Information Skeleton */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-48 mb-2"/>
                            <Skeleton className="h-4 w-64"/>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-32"/>
                                        <Skeleton className="h-10 w-full"/>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!profile || !editProfile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Could not load profile. Please try again.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={fetchProfile} className="w-full">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                                        {profile?.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Update your profile, billing information, and invoice preferences
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="gap-2 text-sm"
                                    >
                                        <X className="h-4 w-4"/>
                                        <span className="hidden sm:inline">Cancel</span>
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="gap-2 text-sm shadow-sm hover:shadow-md transition-all"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                <span className="hidden sm:inline">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4"/>
                                                <span className="hidden sm:inline">Save Changes</span>
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}
                                        className="gap-2 shadow-sm hover:shadow-md transition-all">
                                    <Edit2 className="h-4 w-4"/>
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">

                {/* Account Information Section */}
                    <Card className="mb-6 border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                            <CardDescription className="text-xs">
                                Your primary account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Email (Read-only) */}
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    {isEditing ? (
                                        <div className="px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground">
                                            {profile.email}
                                        </div>
                                    ) : (
                                        <div
                                            className="px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground">
                                            {profile.email}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <p className="text-xs text-muted-foreground">
                                            Please contact with admin to change the email
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="name"
                                                value={editProfile.name}
                                                onChange={(e) =>
                                                    handleEditChange("name", e.target.value)
                                                }
                                                aria-invalid={!!errors.name}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sender Information Section */}
                    <Card className="mb-6 border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Sender Information</CardTitle>
                            <CardDescription className="text-xs">
                                Your business information displayed on invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Sender Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderName">Sender Name *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderName"
                                                value={editProfile.senderName}
                                                onChange={(e) =>
                                                    handleEditChange("senderName", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderName}
                                            />
                                            {errors.senderName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderName}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderName}
                                        </div>
                                    )}
                                </div>

                                {/* Sender Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderEmail">Sender Email *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderEmail"
                                                type="email"
                                                value={editProfile.senderEmail}
                                                onChange={(e) =>
                                                    handleEditChange("senderEmail", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderEmail}
                                            />
                                            {errors.senderEmail && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderEmail}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderEmail}
                                        </div>
                                    )}
                                </div>

                                {/* Sender Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderPhone">Sender Phone *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderPhone"
                                                type="tel"
                                                value={editProfile.senderPhone}
                                                onChange={(e) =>
                                                    handleEditChange("senderPhone", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderPhone}
                                            />
                                            {errors.senderPhone && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderPhone}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderPhone}
                                        </div>
                                    )}
                                </div>

                                {/* Sender Tax ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderTaxId">Tax ID *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderTaxId"
                                                value={editProfile.senderTaxId}
                                                onChange={(e) =>
                                                    handleEditChange("senderTaxId", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderTaxId}
                                            />
                                            {errors.senderTaxId && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderTaxId}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderTaxId}
                                        </div>
                                    )}
                                </div>

                                {/* Sender Address */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="senderAddress">Address *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderAddress"
                                                value={editProfile.senderAddress}
                                                onChange={(e) =>
                                                    handleEditChange("senderAddress", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderAddress}
                                            />
                                            {errors.senderAddress && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderAddress}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderAddress}
                                        </div>
                                    )}
                                </div>

                                {/* Sender City */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderCity">City *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderCity"
                                                value={editProfile.senderCity}
                                                onChange={(e) =>
                                                    handleEditChange("senderCity", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderCity}
                                            />
                                            {errors.senderCity && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderCity}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderCity}
                                        </div>
                                    )}
                                </div>

                                {/* Sender Country */}
                                <div className="space-y-2">
                                    <Label htmlFor="senderCountry">Country *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="senderCountry"
                                                value={editProfile.senderCountry}
                                                onChange={(e) =>
                                                    handleEditChange("senderCountry", e.target.value)
                                                }
                                                aria-invalid={!!errors.senderCountry}
                                            />
                                            {errors.senderCountry && (
                                                <p className="text-sm text-destructive">
                                                    {errors.senderCountry}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.senderCountry}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Information Section */}
                    <Card className="mb-6 border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Banking Details</CardTitle>
                            <CardDescription className="text-xs">
                                Payment information for your invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="bankName"
                                                value={editProfile.bankName}
                                                onChange={(e) =>
                                                    handleEditChange("bankName", e.target.value)
                                                }
                                                aria-invalid={!!errors.bankName}
                                            />
                                            {errors.bankName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.bankName}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.bankName}
                                        </div>
                                    )}
                                </div>

                                {/* Branch Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="branchName">Branch Name *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="branchName"
                                                value={editProfile.branchName}
                                                onChange={(e) =>
                                                    handleEditChange("branchName", e.target.value)
                                                }
                                                aria-invalid={!!errors.branchName}
                                            />
                                            {errors.branchName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.branchName}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.branchName}
                                        </div>
                                    )}
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="accountNumber"
                                                value={editProfile.accountNumber}
                                                onChange={(e) =>
                                                    handleEditChange("accountNumber", e.target.value)
                                                }
                                                aria-invalid={!!errors.accountNumber}
                                            />
                                            {errors.accountNumber && (
                                                <p className="text-sm text-destructive">
                                                    {errors.accountNumber}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.accountNumber}
                                        </div>
                                    )}
                                </div>

                                {/* Account Holder Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="accountHolderName"
                                                value={editProfile.accountHolderName}
                                                onChange={(e) =>
                                                    handleEditChange("accountHolderName", e.target.value)
                                                }
                                                aria-invalid={!!errors.accountHolderName}
                                            />
                                            {errors.accountHolderName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.accountHolderName}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.accountHolderName}
                                        </div>
                                    )}
                                </div>

                                {/* Routing Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="routingCode">Routing Code *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="routingCode"
                                                value={editProfile.routingCode}
                                                onChange={(e) =>
                                                    handleEditChange("routingCode", e.target.value)
                                                }
                                                aria-invalid={!!errors.routingCode}
                                            />
                                            {errors.routingCode && (
                                                <p className="text-sm text-destructive">
                                                    {errors.routingCode}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.routingCode}
                                        </div>
                                    )}
                                </div>

                                {/* SWIFT Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="swiftCode">SWIFT Code *</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="swiftCode"
                                                value={editProfile.swiftCode}
                                                onChange={(e) =>
                                                    handleEditChange("swiftCode", e.target.value)
                                                }
                                                aria-invalid={!!errors.swiftCode}
                                            />
                                            {errors.swiftCode && (
                                                <p className="text-sm text-destructive">
                                                    {errors.swiftCode}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.swiftCode}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Settings Section */}
                    <Card className="mb-6 border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Invoice Defaults</CardTitle>
                            <CardDescription className="text-xs">
                                Default settings for your generated invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Invoice Prefix */}
                                <div className="space-y-2">
                                    <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                                    {isEditing ? (
                                        <Input
                                            id="invoicePrefix"
                                            value={editProfile.invoicePrefix}
                                            onChange={(e) =>
                                                handleEditChange("invoicePrefix", e.target.value)
                                            }
                                        />
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.invoicePrefix}
                                        </div>
                                    )}
                                </div>

                                {/* Default Currency */}
                                <div className="space-y-2">
                                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                                    {isEditing ? (
                                        <Input
                                            id="defaultCurrency"
                                            value={editProfile.defaultCurrency}
                                            onChange={(e) =>
                                                handleEditChange("defaultCurrency", e.target.value)
                                            }
                                        />
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.defaultCurrency}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Terms Days */}
                                <div className="space-y-2">
                                    <Label htmlFor="defaultPaymentTermsDays">
                                        Payment Terms (Days)
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="defaultPaymentTermsDays"
                                            type="number"
                                            value={editProfile.defaultPaymentTermsDays}
                                            onChange={(e) =>
                                                handleEditChange(
                                                    "defaultPaymentTermsDays",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    ) : (
                                        <div className="px-3 py-2 border border-input rounded-md">
                                            {profile.defaultPaymentTermsDays}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Status Section */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Account Overview</CardTitle>
                            <CardDescription className="text-xs">
                                Account status and creation date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="px-3 py-2 border border-input rounded-md flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-red-500'}`}/>
                                        <span>{profile.isActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <div className="px-3 py-2 border border-input rounded-md">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

