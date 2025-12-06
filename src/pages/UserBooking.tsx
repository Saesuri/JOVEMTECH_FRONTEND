import { useState, useEffect } from "react";
import GridCanvas from "../components/MapEditor/GridCanvas";
import BookingModal from "../components/Modals/BookingModal";
import { floorService, spaceService, bookingService } from "../services/api";
import { mapSpacesToShapes } from "../utils/mapHelpers";
import type { Floor, RoomShape } from "../types/apiTypes";

// SHADCN IMPORTS
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function UserBooking() {
  // Data State
  const [rooms, setRooms] = useState<RoomShape[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  // Availability State
  const [occupiedIds, setOccupiedIds] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [selectedRoom, setSelectedRoom] = useState<RoomShape | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Load Floors
  useEffect(() => {
    const initFloors = async () => {
      try {
        const existingFloors = await floorService.getAll();
        if (existingFloors.length > 0) {
          setFloors(existingFloors);
          setSelectedFloorId(existingFloors[0].id);
        }
      } catch (error) {
        console.error("Error loading floors:", error);
      }
    };
    initFloors();
  }, []);

  // 2. Load Spaces
  useEffect(() => {
    if (!selectedFloorId) return;
    const loadSpaces = async () => {
      try {
        const dbSpaces = await spaceService.getAll(selectedFloorId);
        setRooms(mapSpacesToShapes(dbSpaces));
      } catch (error) {
        console.error("Error loading spaces:", error);
      }
    };
    loadSpaces();
  }, [selectedFloorId]);

  // 3. Check Availability
  useEffect(() => {
    const fetchOccupancy = async () => {
      if (!date || !startTime || !endTime) return;
      try {
        const startIso = new Date(`${date}T${startTime}:00`).toISOString();
        const endIso = new Date(`${date}T${endTime}:00`).toISOString();
        if (startIso >= endIso) return;

        const busyIds = await bookingService.getOccupied(startIso, endIso);
        setOccupiedIds(busyIds);
      } catch (error) {
        console.error("Error checking occupancy:", error);
      }
    };
    fetchOccupancy();
  }, [date, startTime, endTime, selectedFloorId, refreshKey]);

  const handleRoomClick = (room: RoomShape) => {
    if (occupiedIds.includes(room.id)) {
      // We can use a Toast here instead of alert if we want, but visually red is enough usually
      return;
    }
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 1. CONTROL PANEL CARD */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Book a Space</CardTitle>
              <CardDescription>
                Select a floor, date, and time to find available rooms.
              </CardDescription>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-200 border border-green-600"></div>
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-200 border border-red-600"></div>
                <span className="text-muted-foreground">Occupied</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Floor Select (Shadcn) */}
            <div className="space-y-2">
              <Label>Floor Level</Label>
              <Select
                onValueChange={setSelectedFloorId}
                value={selectedFloorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time Inputs */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. MAP AREA */}
      <div className="flex justify-center border rounded-lg bg-card p-4 shadow-sm overflow-hidden relative">
        {/* We center the canvas inside this container */}
        <GridCanvas
          width={800}
          height={600}
          rectangles={rooms}
          setRectangles={() => {}}
          tool="select"
          readOnly={true}
          onRoomClick={handleRoomClick}
          occupiedIds={occupiedIds}
        />

        {/* Helper text overlay at bottom */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 p-2 rounded backdrop-blur">
          Click a green room to book
        </div>
      </div>

      <BookingModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default UserBooking;
