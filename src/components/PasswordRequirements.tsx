import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
    password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const requirements = [
        {
            label: "At least 8 characters",
            regex: /.{8,}/,
        },
        {
            label: "At least one lowercase letter",
            regex: /(?=.*[a-z])/,
        },
        {
            label: "At least one uppercase letter",
            regex: /(?=.*[A-Z])/,
        },
        {
            label: "At least one number",
            regex: /(?=.*\d)/,
        },
        {
            label: "At least one special character (!@#$%^&*)",
            regex: /(?=.*[!@#$%^&*])/,
        },
    ];

    return (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-foreground">Password Requirements:</p>
            <div className="space-y-1.5">
                {requirements.map((requirement, index) => {
                    const isMet = requirement.regex.test(password);
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-xs transition-colors"
                        >
                            {isMet ? (
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                                <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span
                                className={`transition-colors ${
                                    isMet
                                        ? "text-green-600 font-medium"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {requirement.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

