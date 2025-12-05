import React, { useState } from "react";
import { type RoomShape } from "../../types/apiTypes";

interface RoomEditModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { name: string; capacity: number; type: string }
  ) => void;
}

const RoomEditModal: React.FC<RoomEditModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
}) => {
  // FIX: Initialize state directly from props.
  // We rely on the Parent component passing a unique 'key' to reset this component.
  const [name, setName] = useState(room?.name || "");
  const [capacity, setCapacity] = useState(10); // Default, or add this to RoomShape later
  const [type, setType] = useState("meeting_room");

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(room.id, { name, capacity, type });
    onClose();
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>Edit Room Details</h3>
        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontSize: "14px" }}
            >
              Room Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Capacity Input */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontSize: "14px" }}
            >
              Capacity (People):
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Type Select */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontSize: "14px" }}
            >
              Type:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="meeting_room">Meeting Room</option>
              <option value="lab">Computer Lab</option>
              <option value="auditorium">Auditorium</option>
              <option value="office">Shared Office</option>
              <option value="hall">Hall/Corridor</option>
            </select>
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 12px",
                background: "transparent",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                backgroundColor: "#2c3e50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomEditModal;
