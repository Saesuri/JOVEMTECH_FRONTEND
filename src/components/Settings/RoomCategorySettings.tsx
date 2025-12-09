import { useEffect, useState } from "react";
import { configService } from "../../services/api";
import type { RoomType } from "../../types/apiTypes";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Tags, Loader2 } from "lucide-react";

export function RoomCategorySettings() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  // State for Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const data = await configService.getRoomTypes();
        setTypes(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load room categories");
      }
    };
    loadTypes();
  }, []);

  const handleCreate = async () => {
    if (!newLabel || !newValue) return toast.error("Fill both fields");
    try {
      const created = await configService.createRoomType({
        label: newLabel,
        value: newValue,
      });
      setTypes([...types, created]);
      setNewLabel("");
      setNewValue("");
      toast.success("Category added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create type (Value must be unique)");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await configService.deleteRoomType(deleteId);
      setTypes(types.filter((t) => t.id !== deleteId));
      toast.success("Category deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleLabelChange = (val: string) => {
    setNewLabel(val);
    setNewValue(
      val
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" /> Room Categories
          </CardTitle>
          <CardDescription>
            Define the types of spaces available (e.g. Meeting Room, Lab).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ADD FORM */}
          <div className="flex gap-4 items-end bg-muted/40 p-4 rounded-lg border">
            <div className="space-y-2 flex-1">
              <Label>Display Name</Label>
              <Input
                placeholder="e.g. Podcast Studio"
                value={newLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Internal ID</Label>
              <Input
                placeholder="e.g. podcast_studio"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          {/* LIST */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Internal ID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.label}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {t.value}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be permanently removed from the list of
              options. Existing rooms with this type will keep their current
              value but may not match filters correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
