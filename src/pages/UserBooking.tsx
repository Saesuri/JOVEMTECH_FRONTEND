import { useState, useEffect } from "react";
import { toast } from "sonner";

// Services & Utils
import {
  floorService,
  spaceService,
  bookingService,
  configService,
} from "../services/api";
import { mapSpacesToShapes } from "../utils/mapHelpers";
import { toLocalISOString, getTodayDateString } from "../utils/dateUtils";
import type { Floor, RoomShape, RoomType } from "../types/apiTypes";

// Components
import GridCanvas from "../components/MapEditor/GridCanvas";
import BookingModal from "../components/Modals/BookingModal";

// Libraries
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Shadcn UI & Icons
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
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Users,
  CalendarClock,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function UserBooking() {
  // --- Data State ---
  const [rooms, setRooms] = useState<RoomShape[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  // --- Availability State ---
  const [occupiedIds, setOccupiedIds] = useState<string[]>([]);
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Filter State ---
  const [minCapacity, setMinCapacity] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dimmedIds, setDimmedIds] = useState<string[]>([]);

  // --- Modal State ---
  const [selectedRoom, setSelectedRoom] = useState<RoomShape | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Load Initial Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [floorsData, typesData] = await Promise.all([
          floorService.getAll(),
          configService.getRoomTypes(),
        ]);

        setRoomTypes(typesData);

        if (floorsData.length > 0) {
          setFloors(floorsData);
          setSelectedFloorId(floorsData[0].id);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load configuration");
      }
    };
    initData();
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
        const startIso = toLocalISOString(date, startTime);
        const endIso = toLocalISOString(date, endTime);
        if (startIso >= endIso) return;

        const busyIds = await bookingService.getOccupied(startIso, endIso);
        setOccupiedIds(busyIds);
      } catch (error) {
        console.error("Error checking occupancy:", error);
      }
    };
    fetchOccupancy();
  }, [date, startTime, endTime, selectedFloorId, refreshKey]);

  // 4. Handle Filters
  useEffect(() => {
    const idsToDim: string[] = [];
    const capacityNum = parseInt(minCapacity) || 0;

    rooms.forEach((room) => {
      let matches = true;
      const r = room as any;

      if (r.capacity < capacityNum) matches = false;
      if (filterType !== "all" && r.type !== filterType) matches = false;

      if (!matches) idsToDim.push(room.id);
    });

    setDimmedIds(idsToDim);
  }, [minCapacity, filterType, rooms]);

  const handleRoomClick = (room: RoomShape) => {
    if (dimmedIds.includes(room.id)) return;

    if (occupiedIds.includes(room.id)) {
      toast.warning("This room is occupied during the selected time.");
      return;
    }

    if ((room as any).is_active === false) {
      toast.info("Room under maintenance.");
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
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* CONTROL PANEL */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-primary" />
                Book a Space
              </CardTitle>
              <CardDescription>
                Select a floor, date, and filters to find the perfect room.
              </CardDescription>
            </div>

            <div className="flex items-center gap-4 text-sm bg-muted/30 p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-200 border border-green-600"></div>
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-200 border border-red-600"></div>
                <span className="text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-100 border border-slate-300 opacity-50"></div>
                <span className="text-muted-foreground">Filtered</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Map className="h-3 w-3" /> Floor
                </Label>
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
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
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

            <div className="space-y-4 lg:col-span-2 border-l pl-0 lg:pl-6">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {roomTypes.map((t) => (
                        <SelectItem key={t.id} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-3 w-3" /> Min Capacity
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAP AREA */}
      <div className="flex justify-center border rounded-xl bg-slate-50 dark:bg-slate-900/50 p-1 shadow-inner overflow-hidden relative h-[600px] group">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-background/95 backdrop-blur shadow-md border rounded-md p-1 transition-opacity opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomIn()}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomOut()}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => resetTransform()}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <GridCanvas
                  width={800}
                  height={600}
                  rectangles={rooms}
                  setRectangles={() => {}}
                  tool="select"
                  readOnly={true}
                  onRoomClick={handleRoomClick}
                  occupiedIds={occupiedIds}
                  dimmedIds={dimmedIds} // <--- CORRECTED: Single prop
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full border backdrop-blur">
          Scroll to zoom • Drag to pan
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
