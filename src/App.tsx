import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import AdminEditor from "./pages/AdminEditor";
import UserBooking from "./pages/UserBooking";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import React from "react"; // Ensure React is imported for types
import MyBookings from "./pages/MyBookings";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactElement;
  requireAdmin?: boolean;
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Access Denied: Admins only.
      </div>
    );
  }

  return children;
};

const NavBar = () => {
  const { user, signOut, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <nav
      style={{
        padding: "15px 20px",
        background: "#2c3e50",
        color: "white",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>CAJUHUB</div>

        {isAdmin && (
          <Link
            to="/admin"
            style={{ color: "#ecf0f1", textDecoration: "none" }}
          >
            🛠️ Admin Editor
          </Link>
        )}
        <Link to="/book" style={{ color: "#ecf0f1", textDecoration: "none" }}>
          📅 User Booking
        </Link>
        <Link
          to="/my-bookings"
          style={{ color: "#ecf0f1", textDecoration: "none" }}
        >
          👤 My Bookings
        </Link>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>{user.email}</span>
        <button
          onClick={() => void signOut()} // Explicit void return
          style={{
            padding: "5px 10px",
            background: "transparent",
            border: "1px solid white",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <UserBooking />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/book" />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
