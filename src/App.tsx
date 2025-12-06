import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Theme & UI
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "./components/Navbar";

// Pages
import AdminEditor from "./pages/AdminEditor";
import AdminBookings from "./pages/AdminBookings"; // <--- NEW IMPORT
import UserBooking from "./pages/UserBooking";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";

// Auth Logic
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import { HelpBtn } from "./components/HelpBtn";

/**
 * Wrapper to protect routes based on auth status and role
 */
const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactElement;
  requireAdmin?: boolean;
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg animate-pulse">Loading CajuHub...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Navigate to="/book" />
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          {/* Global Toaster for notifications */}
          <Toaster position="top-right" richColors />

          {/* Navigation Bar (visible on all pages if logged in) */}
          <Navbar />

          <main className="flex-1 bg-background">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* --- ADMIN ROUTES --- */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />

              {/* --- USER ROUTES --- */}
              <Route
                path="/book"
                element={
                  <ProtectedRoute>
                    <UserBooking />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/book" />} />
            </Routes>
            <HelpBtn />
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
