import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import { floorService } from "../../services/api";

interface FloorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFloorId: string;
  currentFloorName: string;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const FloorManagerModal: React.FC<FloorManagerModalProps> = ({
  isOpen,
  onClose,
  currentFloorId,
  currentFloorName,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [newFloorName, setNewFloorName] = useState("");
  const [renameValue, setRenameValue] = useState(currentFloorName);

  // Alert Dialog State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fix: Sync state with props when modal opens or floor changes
  useEffect(() => {
    if (isOpen) {
      setRenameValue(currentFloorName);
      setNewFloorName("");
    }
  }, [isOpen, currentFloorName]);

  const handleCreate = async () => {
    if (!newFloorName) return toast.error("Enter a name");
    await onCreate(newFloorName);
    setNewFloorName("");
    onClose();
  };

  const handleRename = async () => {
    if (!renameValue) return toast.error("Enter a name");
    await onRename(currentFloorId, renameValue);
    onClose();
  };

  // 1. CHECK STATS BEFORE OPENING ALERT
  const initiateDelete = async () => {
    setStatsLoading(true);
    try {
      const stats = await floorService.getStats(currentFloorId);

      if (stats.bookingCount > 0) {
        setAlertMessage(
          `⚠️ WARNING: This floor contains ${stats.spaceCount} rooms and ${stats.bookingCount} ACTIVE BOOKINGS. Deleting it will cancel all these bookings immediately.`
        );
      } else if (stats.spaceCount > 0) {
        setAlertMessage(
          `This floor contains ${stats.spaceCount} rooms. They will all be deleted.`
        );
      } else {
        setAlertMessage(
          "This floor is empty. Are you sure you want to delete it?"
        );
      }

      setIsAlertOpen(true);
    } catch (error) {
      console.error(error); 
      toast.error("Failed to check floor stats");
    } finally {
      setStatsLoading(false);
    }
  };

  // 2. ACTUAL DELETE ACTION
  const confirmDelete = async () => {
    await onDelete(currentFloorId);
    setIsAlertOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Floors</DialogTitle>
            <DialogDescription>
              Add new levels or manage the current one.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="edit">Edit Current</TabsTrigger>
            </TabsList>

            {/* CREATE TAB */}
            <TabsContent value="create" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>New Floor Name</Label>
                <Input
                  placeholder="e.g., 2nd Floor, Rooftop"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Floor
              </Button>
            </TabsContent>

            {/* EDIT TAB */}
            <TabsContent value="edit" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rename "{currentFloorName}"</Label>
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleRename}
                  variant="outline"
                  className="flex-1"
                >
                  Rename
                </Button>
                <Button
                  onClick={initiateDelete}
                  variant="destructive"
                  disabled={statsLoading}
                >
                  {statsLoading ? "Checking..." : "Delete Floor"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* SHADCN ALERT DIALOG */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              {alertMessage}
            </AlertDialogDescription>
            <div className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FloorManagerModal;
