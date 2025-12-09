import { useEffect, useState } from "react";
import { spaceService, configService } from "../../services/api";
import type { SpaceWithFloor } from "../../types/apiTypes";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, Power, PowerOff } from "lucide-react";

export function RoomListSettings() {
  const [spaces, setSpaces] = useState<SpaceWithFloor[]>([]);

  // 1. Separate the Refresh Logic (for manual use)
  const refreshSpaces = async () => {
    try {
      const data = await spaceService.getAllGlobal();
      setSpaces(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to reload rooms");
    }
  };

  // 2. Initial Load Effect
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await spaceService.getAllGlobal();
        if (isMounted) {
          setSpaces(data);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          toast.error("Failed to load rooms");
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs exactly once on mount

  const toggleStatus = async (room: SpaceWithFloor) => {
    const newState = !room.is_active;

    // Optimistic Update
    setSpaces((prev) =>
      prev.map((s) => (s.id === room.id ? { ...s, is_active: newState } : s))
    );

    try {
      await configService.toggleRoomStatus(room.id, newState);
      toast.success(`Room ${newState ? "activated" : "set to maintenance"}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
      refreshSpaces(); // Revert changes on error using the helper
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Management</CardTitle>
        <CardDescription>
          Disable rooms for maintenance to prevent new bookings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell className="font-medium">{space.name}</TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {space.floors?.name}
                  </TableCell>
                  <TableCell className="capitalize">
                    {space.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {space.is_active ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Maintenance</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {space.is_active ? (
                        <Power className="h-4 w-4 text-green-600" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-red-500" />
                      )}
                      <Switch
                        checked={space.is_active}
                        onCheckedChange={() => toggleStatus(space)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
