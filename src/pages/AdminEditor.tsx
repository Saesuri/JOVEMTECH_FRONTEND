import { useState, useEffect } from "react";
import GridCanvas from "../components/MapEditor/GridCanvas";
import RoomEditModal from "../components/Modals/RoomEditModal";
import { floorService, spaceService } from "../services/api";
import { mapSpacesToShapes } from "../utils/mapHelpers";
import type { Floor, CreateSpaceDTO, RoomShape } from "../types/apiTypes";

function AdminEditor() {
  // State
  const [rooms, setRooms] = useState<RoomShape[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  // Modal State
  const [selectedRoom, setSelectedRoom] = useState<RoomShape | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI State
  const [activeTool, setActiveTool] = useState<"select" | "rect" | "polygon">(
    "select"
  );
  const [status, setStatus] = useState<string>("");

  // 1. Load Floors
  useEffect(() => {
    const initFloors = async () => {
      try {
        const existingFloors = await floorService.getAll();
        if (existingFloors.length > 0) {
          setFloors(existingFloors);
          setSelectedFloorId(existingFloors[0].id);
        } else {
          const newFloor = await floorService.create({
            name: "Ground Floor",
            width: 800,
            height: 600,
          });
          setFloors([newFloor]);
          setSelectedFloorId(newFloor.id);
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

  // 3. Handle Click to Edit
  const handleRoomClick = (room: RoomShape) => {
    if (activeTool === "select") {
      setSelectedRoom(room);
      setIsModalOpen(true);
    }
  };

  // 4. Handle Update Save
  const handleUpdateRoom = async (
    id: string,
    updates: { name: string; capacity: number; type: string }
  ) => {
    try {
      // Attempt backend update
      await spaceService.update(id, updates);

      // Update local state
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: updates.name } : r))
      );
      setStatus("Room details updated!");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      // No variable declared, so no linter error
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: updates.name } : r))
      );
    }
  };

  // 5. Save Layout Logic
  const handleSave = async () => {
    if (!selectedFloorId) return alert("No Floor Selected!");
    setStatus("Saving...");
    try {
      const promises = rooms.map((room) => {
        const payload: CreateSpaceDTO = {
          floor_id: selectedFloorId,
          name: room.name,
          type: "meeting_room",
          capacity: 10,
          coordinates: room.data,
        };
        return spaceService.create(payload);
      });
      await Promise.all(promises);
      const dbSpaces = await spaceService.getAll(selectedFloorId);
      setRooms(mapSpacesToShapes(dbSpaces));
      setStatus("Saved successfully!");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error(error);
      setStatus("Error saving.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* HEADER & TOOLBAR */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 10px 0" }}>Map Editor (Admin)</h2>
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            style={{ padding: "5px" }}
          >
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTool("select")}
            style={{
              padding: "8px 16px",
              background: activeTool === "select" ? "#333" : "#ddd",
              color: activeTool === "select" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            👆 Select/Edit
          </button>
          <button
            onClick={() => setActiveTool("rect")}
            style={{
              padding: "8px 16px",
              background: activeTool === "rect" ? "#333" : "#ddd",
              color: activeTool === "rect" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ⬜ Rectangle
          </button>
          <button
            onClick={() => setActiveTool("polygon")}
            style={{
              padding: "8px 16px",
              background: activeTool === "polygon" ? "#333" : "#ddd",
              color: activeTool === "polygon" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📐 Polygon
          </button>
        </div>

        <div>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save Layout
          </button>
          <div
            style={{
              fontSize: "12px",
              marginTop: 5,
              textAlign: "right",
              minHeight: "18px",
            }}
          >
            {status}
          </div>
        </div>
      </div>

      {/* CANVAS */}
      <GridCanvas
        width={800}
        height={600}
        snapSize={20}
        rectangles={rooms}
        setRectangles={setRooms}
        tool={activeTool}
        readOnly={false}
        onRoomClick={handleRoomClick}
      />

      {/* EDIT MODAL */}
      {/* FIX: The 'key' prop ensures the modal resets when a new room is selected */}
      <RoomEditModal
        key={selectedRoom?.id || "empty"}
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateRoom}
      />

      <div style={{ marginTop: 10, color: "#666", fontSize: "14px" }}>
        <strong>Admin Instructions:</strong>
        <ul style={{ margin: "5px 0" }}>
          <li>
            **Select/Edit:** Click a room to rename it or change capacity.
          </li>
          <li>**Rectangle:** Click and drag to create a room.</li>
          <li>
            **Polygon:** Click points to draw walls. Double-click to close.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminEditor;
