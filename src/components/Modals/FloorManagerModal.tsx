import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    if (!newFloorName) return toast.error(t("floorManager.messages.enterName"));
    await onCreate(newFloorName);
    setNewFloorName("");
    onClose();
  };

  const handleRename = async () => {
    if (!renameValue) return toast.error(t("floorManager.messages.enterName"));
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
          t("floorManager.alert.warningWithBookings", {
            rooms: stats.spaceCount,
            bookings: stats.bookingCount,
          })
        );
      } else if (stats.spaceCount > 0) {
        setAlertMessage(
          t("floorManager.alert.warningWithRooms", { rooms: stats.spaceCount })
        );
      } else {
        setAlertMessage(t("floorManager.alert.emptyFloor"));
      }

      setIsAlertOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(t("floorManager.messages.statsFailed"));
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
            <DialogTitle>{t("floorManager.title")}</DialogTitle>
            <DialogDescription>{t("floorManager.subtitle")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">
                {t("floorManager.tabs.createNew")}
              </TabsTrigger>
              <TabsTrigger value="edit">
                {t("floorManager.tabs.editCurrent")}
              </TabsTrigger>
            </TabsList>

            {/* CREATE TAB */}
            <TabsContent value="create" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("floorManager.newFloorName")}</Label>
                <Input
                  placeholder={t("floorManager.newFloorPlaceholder")}
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                {t("floorManager.createFloor")}
              </Button>
            </TabsContent>

            {/* EDIT TAB */}
            <TabsContent value="edit" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  {t("floorManager.renameLabel", { name: currentFloorName })}
                </Label>
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
                  {t("floorManager.rename")}
                </Button>
                <Button
                  onClick={initiateDelete}
                  variant="destructive"
                  disabled={statsLoading}
                >
                  {statsLoading
                    ? t("floorManager.checking")
                    : t("floorManager.deleteFloor")}
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
              {t("floorManager.alert.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              {alertMessage}
            </AlertDialogDescription>
            <div className="text-sm text-muted-foreground mt-2">
              {t("floorManager.alert.cannotUndo")}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t("floorManager.alert.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FloorManagerModal;
