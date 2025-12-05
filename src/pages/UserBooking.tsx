import { useState, useEffect, type ChangeEvent } from "react";
import GridCanvas from "../components/MapEditor/GridCanvas";
import BookingModal from "../components/Modals/BookingModal";
import { floorService, spaceService, bookingService } from "../services/api";
import { mapSpacesToShapes } from "../utils/mapHelpers";
import type { Floor, RoomShape } from "../types/apiTypes";

function UserBooking() {
  // --- Data State ---
  const [rooms, setRooms] = useState<RoomShape[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  // --- Availability State ---
  const [occupiedIds, setOccupiedIds] = useState<string[]>([]);
  // Default to Today, 9:00 - 10:00
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // This state is used to force-reload the availability from the server
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Modal State ---
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

  // 3. Check Availability (Runs on Date change OR when refreshKey updates)
  useEffect(() => {
    const fetchOccupancy = async () => {
      if (!date || !startTime || !endTime) return;

      try {
        // Construct ISO timestamps
        const startIso = new Date(`${date}T${startTime}:00`).toISOString();
        const endIso = new Date(`${date}T${endTime}:00`).toISOString();

        if (startIso >= endIso) return; // Invalid range

        console.log("Checking occupancy...");
        const busyIds = await bookingService.getOccupied(startIso, endIso);
        setOccupiedIds(busyIds);
      } catch (error) {
        console.error("Error checking occupancy:", error);
      }
    };

    fetchOccupancy();
  }, [date, startTime, endTime, selectedFloorId, refreshKey]); // <--- Added refreshKey dependency

  const handleRoomClick = (room: RoomShape) => {
    if (occupiedIds.includes(room.id)) {
      alert("This room is occupied during the selected time.");
      return;
    }
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Incrementing this number forces the 'useEffect' above to run again,
    // refreshing the Red/Green colors immediately after booking.
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Filters Header */}
      <div
        style={{
          marginBottom: 20,
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "flex-end",
        }}
      >
        {/* Floor Select */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            Floor:
          </label>
          <select
            value={selectedFloorId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSelectedFloorId(e.target.value)
            }
            style={{ padding: "8px", fontSize: "16px", minWidth: "150px" }}
          >
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "8px", fontSize: "16px" }}
          />
        </div>

        {/* Time Filters */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            From:
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: "8px", fontSize: "16px" }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            To:
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: "8px", fontSize: "16px" }}
          />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "15px", marginLeft: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: 20,
                height: 20,
                background: "#ccffcc",
                border: "2px solid #009900",
              }}
            ></div>
            <span>Available</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: 20,
                height: 20,
                background: "#ffcccc",
                border: "2px solid #cc0000",
              }}
            ></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>

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

      {/* Booking Modal */}
      {isModalOpen && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default UserBooking;
