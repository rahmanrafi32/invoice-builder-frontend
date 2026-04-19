import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Edit2, Loader2, Plus, Trash2} from "lucide-react";

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
}

interface FormErrors {
    [key: string]: string;
}

const initialFormState = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    taxId: "",
    website: "",
};

export function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<Client[] | { data: Client[] }>("/clients");

            // Handle both array and object responses
            let clientsData: Client[] = [];
            if (Array.isArray(response.data)) {
                clientsData = response.data;
            } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                clientsData = (response.data as { data: Client[] }).data;
            }

            setClients(clientsData);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            toast.error("Failed to load clients");
            setClients([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Client name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }
        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }
        if (!formData.country.trim()) {
            newErrors.country = "Country is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(initialFormState);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleEdit = (client: Client) => {
        setIsEditing(true);
        setEditingId(client.id);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone || "",
            address: client.address || "",
            city: client.city || "",
            country: client.country || "",
            taxId: client.taxId || "",
            website: client.website || "",
        });
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing && editingId) {
                // Update client
                const response = await api.put<Client>(`/clients/${editingId}`, formData);
                setClients((prev) =>
                    prev.map((client) => (client.id === editingId ? response.data : client))
                );
                toast.success("Client updated successfully!");
            } else {
                // Create new client
                const response = await api.post<Client>("/clients", formData);
                setClients((prev) => [response.data, ...prev]);
                toast.success("Client created successfully!");
            }
            setIsDialogOpen(false);
            setFormData(initialFormState);
        } catch (error: unknown) {
            console.error("Failed to save client:", error);
            const errorResponse = error as { response?: { data?: { message?: string } } };
            const errorMessage =
                errorResponse?.response?.data?.message || "Failed to save client";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (clientId: string) => {
        setIsDeleting(clientId);
        try {
            await api.delete(`/clients/${clientId}`);
            setClients((prev) => prev.filter((client) => client.id !== clientId));
            toast.success("Client deleted successfully!");
        } catch (error: unknown) {
            console.error("Failed to delete client:", error);
            const errorResponse = error as { response?: { data?: { message?: string } } };
            const errorMessage =
                errorResponse?.response?.data?.message || "Failed to delete client";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setFormData(initialFormState);
        setErrors({});
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex-1">
                            <Skeleton className="h-8 w-48 mb-2"/>
                            <Skeleton className="h-4 w-64"/>
                        </div>
                        <Skeleton className="h-10 w-32"/>
                    </div>

                    {/* Client Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({length: 6}).map((_, i) => (
                            <Card key={i} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <Skeleton className="h-6 w-48 mb-2"/>
                                    <Skeleton className="h-4 w-64"/>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Skeleton className="h-4 w-16 mb-1"/>
                                        <Skeleton className="h-5 w-32"/>
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-1"/>
                                        <Skeleton className="h-5 w-40"/>
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-24 mb-1"/>
                                        <Skeleton className="h-5 w-48"/>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Skeleton className="h-10 flex-1"/>
                                        <Skeleton className="h-10 flex-1"/>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
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
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {clients.length > 0 ? `${clients.length} total` : 'New'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Manage and organize all your clients in one central place
                                </p>
                            </div>
                        </div>
                        {clients.length > 0 && (
                            <Button onClick={handleAdd} className="gap-2 shadow-sm hover:shadow-md transition-all">
                                <Plus className="h-4 w-4"/>
                                <span className="hidden sm:inline">New Client</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">

                {/* Add/Edit Client Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing ? "Edit Client" : "Add New Client"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Update the client information below."
                                    : "Fill in the client details to create a new client."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Client Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., ABC Corporation"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    aria-invalid={!!errors.phone}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    placeholder="Street address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    aria-invalid={!!errors.address}
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>

                            {/* City */}
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                    aria-invalid={!!errors.city}
                                />
                                {errors.city && (
                                    <p className="text-sm text-destructive">{errors.city}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    id="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange("country", e.target.value)}
                                    aria-invalid={!!errors.country}
                                />
                                {errors.country && (
                                    <p className="text-sm text-destructive">{errors.country}</p>
                                )}
                            </div>

                            {/* Tax ID */}
                            <div className="space-y-2">
                                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                                <Input
                                    id="taxId"
                                    placeholder="XX-XXXXXXX"
                                    value={formData.taxId}
                                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                                />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label htmlFor="website">Website (Optional)</Label>
                                <Input
                                    id="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange("website", e.target.value)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Client"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Clients List or Empty State */}
                {clients.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Card className="w-full max-w-md border-dashed">
                            <CardContent className="pt-12 text-center">
                                <div className="mb-6">
                                    <div
                                        className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                                        <Plus className="h-8 w-8 text-primary"/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No Clients Yet</h3>
                                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                                    Start by adding your first client. Clients store all the essential information
                                    you need to generate professional invoices quickly and efficiently.
                                </p>
                                <Button onClick={handleAdd} className="w-full gap-2" size="lg">
                                    <Plus className="h-4 w-4"/>
                                    Create Your First Client
                                </Button>
                                <p className="text-xs text-muted-foreground mt-4">
                                    💡 Tip: Keep your client information updated for accurate invoicing
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div>
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground">
                                Showing <span
                                className="font-semibold text-foreground">{clients.length}</span> {clients.length === 1 ? 'client' : 'clients'}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clients.map((client) => (
                                <Card key={client.id}
                                      className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base">{client.name}</CardTitle>
                                                <CardDescription
                                                    className="text-xs mt-1">{client.email}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 py-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                                                <p className="text-sm font-medium text-foreground">{client.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                                                <p className="text-sm font-medium text-foreground">{client.city}</p>
                                            </div>
                                        </div>
                                        {client.address && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                                                <p className="text-xs text-foreground line-clamp-2">{client.address}</p>
                                            </div>
                                        )}
                                        {client.website && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Website</p>
                                                <p className="text-xs text-primary hover:underline truncate">{client.website}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(client)}
                                                className="flex-1 text-xs h-9"
                                            >
                                                <Edit2 className="h-3.5 w-3.5 mr-1"/>
                                                Edit
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting === client.id}
                                                        className="flex-1 text-xs h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        {isDeleting === client.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="h-3.5 w-3.5 mr-1"/>
                                                                Delete
                                                            </>
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete <span
                                                            className="font-semibold text-foreground">{client.name}</span>?
                                                            This action cannot be undone and may affect existing
                                                            invoices.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="flex gap-3 justify-end">
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(client.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete Client
                                                        </AlertDialogAction>
                                                    </div>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}




