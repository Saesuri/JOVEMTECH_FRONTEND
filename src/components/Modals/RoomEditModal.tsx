import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  type RoomShape,
  type RoomType,
  type Amenity,
} from "../../types/apiTypes";
import { configService } from "../../services/api";
import { DynamicIcon } from "@/components/ui/IconPicker";

// SHADCN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface RoomEditModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: {
      name: string;
      description: string;
      capacity: number;
      type: string;
      amenities: string[];
    }
  ) => void;
  onDelete: (id: string) => void;
}

const RoomEditModal: React.FC<RoomEditModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();

  // Dynamic data from API
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<Amenity[]>([]);

  // Form state
  const [name, setName] = useState(room?.name || "");
  const [description, setDescription] = useState(
    (room as any)?.description || ""
  );
  const [capacity, setCapacity] = useState(10);
  const [type, setType] = useState("meeting_room");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch room types and amenities from API
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [types, amen] = await Promise.all([
          configService.getRoomTypes(),
          configService.getAmenities(),
        ]);
        setRoomTypes(types);
        setAmenityOptions(amen);
      } catch (e) {
        console.error("Failed to load room options", e);
      }
    };
    if (isOpen) loadOptions();
  }, [isOpen]);

  // Update form state when room changes
  useEffect(() => {
    if (room) {
      setName(room.name);
      setDescription((room as any).description || "");
      setCapacity(room.capacity || 10);
      setType(room.type || "meeting_room");
      setAmenities(room.amenities || []);
    }
  }, [room]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      onSave(room.id, { name, description, capacity, type, amenities });
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (room) {
      onDelete(room.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (!room) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("roomEdit.title")}</DialogTitle>
            <DialogDescription>
              {t("roomEdit.subtitle", { name: room.name })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Name & Capacity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("roomEdit.name")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("roomEdit.capacity")}</Label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("roomEdit.description")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("roomEdit.descriptionPlaceholder")}
                rows={2}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>{t("roomEdit.type")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.length === 0 ? (
                    <SelectItem value="meeting_room" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    roomTypes.map((rt) => (
                      <SelectItem key={rt.id} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* AMENITIES GRID */}
            <div className="space-y-3">
              <Label>{t("roomEdit.amenitiesLabel")}</Label>
              <div className="grid grid-cols-2 gap-3 border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50 max-h-48 overflow-y-auto">
                {amenityOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                    No amenities configured
                  </p>
                ) : (
                  amenityOptions.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${item.id}`}
                        checked={amenities.includes(item.value)}
                        onCheckedChange={() => toggleAmenity(item.value)}
                      />
                      <label
                        htmlFor={`amenity-${item.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
                      >
                        <DynamicIcon
                          name={item.icon}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        {item.label}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-between w-full mt-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("common.save")}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("roomEdit.deleteTitle", "Excluir Espaço")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("roomEdit.confirmDelete", { name: room.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.delete", "Excluir")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoomEditModal;
