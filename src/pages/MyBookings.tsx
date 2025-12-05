import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService, type BookingWithSpace } from "../services/api";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getByUser(user.id);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingService.cancel(id);
      // Remove from UI immediately
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      alert("Failed to cancel booking");
      console.error(error);
    }
  };

  // Helper to format date
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading)
    return <div style={{ padding: 20 }}>Loading your bookings...</div>;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p>You have no active bookings.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {bookings.map((booking) => {
            // Determine if booking is in the past
            const isPast = new Date(booking.end_time) < new Date();

            return (
              <div
                key={booking.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: isPast ? "#f9f9f9" : "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isPast ? 0.7 : 1,
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>
                    {booking.spaces?.name || "Unknown Room"}
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "#666",
                        fontWeight: "normal",
                        marginLeft: 10,
                      }}
                    >
                      ({booking.spaces?.type?.replace("_", " ")})
                    </span>
                  </h3>
                  <div style={{ color: "#555" }}>
                    <strong>Start:</strong> {formatDate(booking.start_time)}{" "}
                    <br />
                    <strong>End:</strong> {formatDate(booking.end_time)}
                  </div>
                </div>

                {!isPast && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </button>
                )}

                {isPast && (
                  <span style={{ color: "#888", fontStyle: "italic" }}>
                    Completed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
