import React, { useState } from "react";
import { type RoomShape } from "../../types/apiTypes";

// SHADCN IMPORTS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2 } from "lucide-react";

interface RoomEditModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { name: string; capacity: number; type: string }
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
  // Initialize state directly from props (relies on 'key' prop in parent to reset)
  const [name, setName] = useState(room?.name || "");
  const [capacity, setCapacity] = useState(10);
  const [type, setType] = useState("meeting_room");

  // State for the confirmation popup
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleOpenChange = (open: boolean) => {
    // Only close if we aren't showing the delete alert
    if (!open && !showDeleteAlert) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      onSave(room.id, { name, capacity, type });
      onClose();
    }
  };

  // 1. Triggered when clicking "Delete" button
  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  // 2. Triggered when clicking "Yes, Delete" in the alert
  const confirmDelete = () => {
    if (room) {
      onDelete(room.id);
      setShowDeleteAlert(false);
      onClose();
    }
  };

  if (!room) return null;

  return (
    <>
      {/* MAIN EDIT MODAL */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Room Details</DialogTitle>
            <DialogDescription>
              Modify properties or delete this space.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting_room">Meeting Room</SelectItem>
                    <SelectItem value="lab">Computer Lab</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="office">Shared Office</SelectItem>
                    <SelectItem value="hall">Hall/Corridor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between w-full mt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              room
              <strong> "{room.name}"</strong> and remove it from the floor plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoomEditModal;
