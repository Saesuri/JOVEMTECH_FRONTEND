import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { getRoomTypeKey, getAmenityById } from "../utils/roomUtils";
import type { Floor, RoomShape, RoomType } from "../types/apiTypes";

// Components
import GridCanvas from "../components/MapEditor/GridCanvas";
import BookingModal from "../components/Modals/BookingModal";
import RoomCalendar from "../components/RoomCalendar";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Users,
  CalendarClock,
  Map,
  CheckCircle,
  XCircle,
  DoorOpen,
  Calendar,
  LayoutGrid,
} from "lucide-react";

function UserBooking() {
  const { t } = useTranslation();
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

  // --- View Mode State ---
  const [viewMode, setViewMode] = useState<"map" | "calendar">("map");
  const [calendarRoom, setCalendarRoom] = useState<RoomShape | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string>("");
  const [prefilledStartTime, setPrefilledStartTime] = useState<string>("");
  const [prefilledEndTime, setPrefilledEndTime] = useState<string>("");

  // Calculate canvas size from actual room positions (ensures all rooms fit)
  const canvasBounds = useMemo(() => {
    if (rooms.length === 0) return { width: 800, height: 600 };

    let maxX = 0;
    let maxY = 0;

    rooms.forEach((room) => {
      if (room.shapeType === "rect") {
        const rightEdge = room.data.x + room.data.width;
        const bottomEdge = room.data.y + room.data.height;
        if (rightEdge > maxX) maxX = rightEdge;
        if (bottomEdge > maxY) maxY = bottomEdge;
      } else {
        // Polygon: find max x and y from points array
        const points = room.data.points;
        for (let i = 0; i < points.length; i += 2) {
          if (points[i] > maxX) maxX = points[i];
          if (points[i + 1] > maxY) maxY = points[i + 1];
        }
      }
    });

    // Add padding and ensure minimum size
    return {
      width: Math.max(maxX + 100, 800),
      height: Math.max(maxY + 100, 600),
    };
  }, [rooms]);

  const canvasWidth = canvasBounds.width;
  const canvasHeight = canvasBounds.height;

  // Filter rooms for display in list (excluding dimmed ones)
  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => !dimmedIds.includes(room.id));
  }, [rooms, dimmedIds]);

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
        toast.error(t("booking.messages.configLoadFailed"));
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

    // In calendar mode, select room for calendar view
    if (viewMode === "calendar") {
      setCalendarRoom(room);
      return;
    }

    // In map mode, open booking modal
    if (occupiedIds.includes(room.id)) {
      toast.warning(t("booking.messages.roomOccupied"));
      return;
    }

    if ((room as any).is_active === false) {
      toast.info(t("booking.messages.roomMaintenance"));
      return;
    }

    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCalendarSlotClick = (
    dateStr: string,
    startTime: string,
    endTime: string
  ) => {
    if (!calendarRoom) return;

    // Set prefilled values and open modal
    setPrefilledDate(dateStr);
    setPrefilledStartTime(startTime);
    setPrefilledEndTime(endTime);
    setSelectedRoom(calendarRoom);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPrefilledDate("");
    setPrefilledStartTime("");
    setPrefilledEndTime("");
    setRefreshKey((prev) => prev + 1);
  };

  // Get room status for display
  const getRoomStatus = (room: RoomShape) => {
    if ((room as any).is_active === false) return "maintenance";
    if (occupiedIds.includes(room.id)) return "occupied";
    return "available";
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl">
      {/* CONTROL PANEL */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-primary" />
                {t("booking.title")}
              </CardTitle>
              <CardDescription>{t("booking.subtitle")}</CardDescription>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-sm bg-muted/30 p-2 rounded-lg border flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-200 border border-green-600"></div>
                <span className="text-muted-foreground">
                  {t("booking.legend.available")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-200 border border-red-600"></div>
                <span className="text-muted-foreground">
                  {t("booking.legend.occupied")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-100 border border-slate-300 opacity-50"></div>
                <span className="text-muted-foreground">
                  {t("booking.legend.filtered")}
                </span>
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
                  <Map className="h-3 w-3" /> {t("booking.floor")}
                </Label>
                <Select
                  onValueChange={setSelectedFloorId}
                  value={selectedFloorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("booking.selectFloor")} />
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
                <Label>{t("booking.date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("booking.startTime")}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("booking.endTime")}</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2 border-l pl-0 lg:pl-6">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                <Filter className="h-4 w-4" /> {t("booking.filters")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("booking.roomType")}</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("booking.allTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("booking.allTypes")}
                      </SelectItem>
                      {roomTypes.map((rt) => (
                        <SelectItem key={rt.id} value={rt.value}>
                          {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-3 w-3" /> {t("booking.minCapacity")}
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

      {/* View Mode Toggle - Between filters and content */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            {t("booking.viewMode.map")}
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            {t("booking.viewMode.calendar")}
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT - List + Grid/Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ROOM LIST - Left Side */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                {t("booking.roomList")}
                <Badge variant="secondary" className="ml-auto">
                  {visibleRooms.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="h-[500px]">
              <div className="p-3 space-y-2">
                {visibleRooms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {t("booking.noRoomsFound")}
                  </div>
                ) : (
                  visibleRooms.map((room) => {
                    const status = getRoomStatus(room);
                    const isAvailable = status === "available";
                    const isOccupied = status === "occupied";
                    const isSelectedForCalendar =
                      viewMode === "calendar" && calendarRoom?.id === room.id;

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleRoomClick(room)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${
                            isSelectedForCalendar
                              ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                              : isAvailable
                              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:border-green-400 hover:shadow-md"
                              : isOccupied
                              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 opacity-75"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-50"
                          }
                          ${
                            viewMode === "calendar"
                              ? ""
                              : isOccupied || status === "maintenance"
                              ? "cursor-not-allowed"
                              : ""
                          }
                        `}
                      >
                        {/* Room Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm truncate">
                            {room.name}
                          </span>
                          {isAvailable ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Room Info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{room.capacity || 0}</span>
                          </div>
                          {room.type && (
                            <Badge
                              variant="outline"
                              className="text-xs py-0 h-5"
                            >
                              {t(getRoomTypeKey(room.type))}
                            </Badge>
                          )}
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {room.amenities.slice(0, 3).map((amenityId) => {
                              const amenity = getAmenityById(amenityId);
                              if (!amenity) return null;
                              const Icon = amenity.icon;
                              return (
                                <span
                                  key={amenityId}
                                  className="flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                  {Icon && <Icon className="h-3 w-3" />}
                                </span>
                              );
                            })}
                            {room.amenities.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{room.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status Label */}
                        <div className="mt-2">
                          {isAvailable ? (
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">
                              {t("booking.clickToBook")}
                            </span>
                          ) : isOccupied ? (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              {t("booking.legend.occupied")}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500">
                              {t("booking.maintenance")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* RIGHT SIDE - Map or Calendar */}
        <div className="lg:col-span-8 xl:col-span-9">
          {viewMode === "map" ? (
            <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 shadow-inner overflow-x-auto">
              <div className="flex justify-center min-w-fit">
                <GridCanvas
                  width={canvasWidth}
                  height={canvasHeight}
                  rectangles={rooms}
                  setRectangles={() => {}}
                  tool="select"
                  readOnly={true}
                  onRoomClick={handleRoomClick}
                  occupiedIds={occupiedIds}
                  dimmedIds={dimmedIds}
                />
              </div>
            </div>
          ) : (
            <Card className="h-full p-4">
              {calendarRoom ? (
                <RoomCalendar
                  room={calendarRoom}
                  onSlotClick={handleCalendarSlotClick}
                  onBookRoom={() => {
                    setSelectedRoom(calendarRoom);
                    setIsModalOpen(true);
                  }}
                />
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {t("calendar.selectRoom")}
                  </p>
                  <p className="text-sm">{t("calendar.selectRoomHint")}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <BookingModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        prefilledDate={prefilledDate}
        prefilledStartTime={prefilledStartTime}
        prefilledEndTime={prefilledEndTime}
      />
    </div>
  );
}

export default UserBooking;
