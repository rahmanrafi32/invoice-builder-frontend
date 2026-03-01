import {useState} from "react";
import dayjs from "dayjs";
import {Calendar} from "@/components/ui/calendar";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";

interface MonthPickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function MonthPicker({
                                value,
                                onChange,
                                placeholder = "Select month",
                                className,
                                disabled = false,
                            }: MonthPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
        onChange?.(date);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-60 justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {value ? dayjs(value).format("MMMM YYYY") : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
}