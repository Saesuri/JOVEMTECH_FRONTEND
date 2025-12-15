import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { type RoomShape } from "../../types/apiTypes";
import { AMENITY_OPTIONS } from "../../utils/roomUtils";

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

  // Init State
  const [name, setName] = useState(room?.name || "");
  const [description, setDescription] = useState(
    (room as any)?.description || ""
  );
  const [capacity, setCapacity] = useState(10);
  const [type, setType] = useState("meeting_room");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update state when room changes
  React.useEffect(() => {
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting_room">
                    {t("roomEdit.types.meetingRoom")}
                  </SelectItem>
                  <SelectItem value="lab">{t("roomEdit.types.lab")}</SelectItem>
                  <SelectItem value="auditorium">
                    {t("roomEdit.types.auditorium")}
                  </SelectItem>
                  <SelectItem value="office">
                    {t("roomEdit.types.office")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AMENITIES GRID */}
            <div className="space-y-3">
              <Label>{t("roomEdit.amenitiesLabel")}</Label>
              <div className="grid grid-cols-2 gap-3 border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
                {AMENITY_OPTIONS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={amenities.includes(item.id)}
                      onCheckedChange={() => toggleAmenity(item.id)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      {item.icon && (
                        <item.icon className="h-3 w-3 text-muted-foreground" />
                      )}
                      {t(item.labelKey)}
                    </label>
                  </div>
                ))}
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
