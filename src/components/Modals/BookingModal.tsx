import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { type RoomShape } from "../../types/apiTypes";
import { bookingService } from "../../services/api";
// IMPORT AUTH CONTEXT
import { useAuth } from "../../context/AuthContext";

interface BookingModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BackendErrorResponse {
  error: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
}) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  // 1. GET THE REAL USER FROM CONTEXT
  const { user } = useAuth();

  if (!isOpen || !room) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. CHECK IF USER IS LOGGED IN
    if (!user) {
      setIsError(true);
      setStatus("Error: You must be logged in to book.");
      return;
    }

    setStatus("Checking availability...");
    setIsError(false);

    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();

    try {
      await bookingService.create({
        space_id: room.id,
        // 3. SEND THE REAL USER ID INSTEAD OF THE DUMMY ID
        user_id: user.id,
        start_time: startIso,
        end_time: endIso,
      });

      setStatus("Booking Confirmed! ✅");
      setTimeout(() => {
        setStatus("");
        onClose();
      }, 1500);
    } catch (error: unknown) {
      setIsError(true);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BackendErrorResponse>;
        if (axiosError.response?.status === 409) {
          setStatus("❌ Conflict: This time is already booked.");
        } else {
          const msg = axiosError.response?.data?.error || "Failed to book";
          setStatus(`❌ Error: ${msg}`);
        }
      } else {
        setStatus("❌ An unexpected error occurred.");
        console.error(error);
      }
    }
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "350px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginTop: 0 }}>Book {room.name}</h2>

        <form onSubmit={handleBook}>
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Date:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Start:
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                End:
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          </div>

          {status && (
            <div
              style={{
                marginBottom: 15,
                padding: "10px",
                backgroundColor: isError ? "#ffebee" : "#e8f5e9",
                color: isError ? "#c62828" : "#2e7d32",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {status}
            </div>
          )}

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 15px",
                border: "1px solid #ddd",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
