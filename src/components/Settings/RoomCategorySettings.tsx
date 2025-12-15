import { useEffect, useState } from "react";
import { configService } from "../../services/api";
import type { RoomType, Amenity } from "../../types/apiTypes";
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
import { IconPicker, DynamicIcon } from "@/components/ui/IconPicker";
import { Trash2, Plus, Tags, Sparkles, Loader2 } from "lucide-react";

// =====================================
// Room Categories Section
// =====================================
function RoomTypesSection() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    if (!newLabel.trim()) return toast.error("Please enter a name");
    setIsCreating(true);
    try {
      const created = await configService.createRoomType({ label: newLabel });
      setTypes([...types, created]);
      setNewLabel("");
      toast.success("Category added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create category");
    } finally {
      setIsCreating(false);
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
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Podcast Studio"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </div>

          {/* LIST */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-8"
                    >
                      No categories yet. Add one above.
                    </TableCell>
                  </TableRow>
                ) : (
                  types.map((t) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing rooms with this type will keep their value but may not
              match filters correctly.
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
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =====================================
// Amenities Section
// =====================================
function AmenitiesSection() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const data = await configService.getAmenities();
        setAmenities(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load amenities");
      }
    };
    loadAmenities();
  }, []);

  const handleCreate = async () => {
    if (!newLabel.trim()) return toast.error("Please enter a name");
    setIsCreating(true);
    try {
      const created = await configService.createAmenity({
        label: newLabel,
        icon: newIcon,
      });
      setAmenities([...amenities, created]);
      setNewLabel("");
      setNewIcon(undefined);
      toast.success("Amenity added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create amenity");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await configService.deleteAmenity(deleteId);
      setAmenities(amenities.filter((a) => a.id !== deleteId));
      toast.success("Amenity deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete amenity");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Amenities
          </CardTitle>
          <CardDescription>
            Define the amenities and equipment available in rooms (e.g. Wi-Fi,
            Projector).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ADD FORM */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-4 items-end bg-muted/40 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Amenity Name</Label>
              <Input
                placeholder="e.g. Smart TV"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (optional)</Label>
              <IconPicker
                value={newIcon}
                onChange={setNewIcon}
                placeholder="Choose icon..."
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="h-10"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </div>

          {/* LIST */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amenities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No amenities yet. Add one above.
                    </TableCell>
                  </TableRow>
                ) : (
                  amenities.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <DynamicIcon
                          name={a.icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{a.label}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {a.value}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(a.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Amenity?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing rooms with this amenity will keep their value but it
              won't appear in the selection list.
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
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =====================================
// Main Export: Combined Categories Settings
// =====================================
export function RoomCategorySettings() {
  return (
    <div className="space-y-6">
      <RoomTypesSection />
      <AmenitiesSection />
    </div>
  );
}
