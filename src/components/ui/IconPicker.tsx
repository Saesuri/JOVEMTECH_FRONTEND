import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type IconsRecord = Record<string, LucideIcon>;

// Get all icon names from lucide-react (excluding utility exports)
const iconsRecord = LucideIcons as unknown as IconsRecord;

const allIconNames = Object.keys(LucideIcons).filter(
  (key) =>
    key !== "createLucideIcon" &&
    key !== "default" &&
    key !== "icons" &&
    typeof iconsRecord[key] === "function" &&
    key[0] === key[0].toUpperCase()
);

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string | undefined) => void;
  placeholder?: string;
}

export function IconPicker({
  value,
  onChange,
  placeholder = "Select icon...",
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search.trim()) {
      // Show popular icons first when no search
      const popular = [
        "Wifi",
        "Tv",
        "Monitor",
        "Projector",
        "Mic",
        "Video",
        "Wind",
        "PenTool",
        "Phone",
        "Coffee",
        "Printer",
        "Speaker",
        "Headphones",
        "Camera",
        "Laptop",
        "Keyboard",
        "Mouse",
        "Usb",
      ];
      return popular.filter((name) => allIconNames.includes(name));
    }
    return allIconNames
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 48); // Limit for performance
  }, [search]);

  const SelectedIcon = value ? iconsRecord[value] : null;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          {value && (
            <X
              className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredIcons.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No icons found
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.map((iconName) => {
                const Icon = iconsRecord[iconName];
                if (!Icon) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors",
                      value === iconName && "bg-accent ring-1 ring-primary"
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {!search && (
          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Type to search {allIconNames.length.toLocaleString()}+ icons
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render an icon by name
export function DynamicIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  if (!name) return null;
  const Icon = iconsRecord[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
