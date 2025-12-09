import React, { useEffect, useState } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient";
import { AuthContext } from "./AuthContext";
import api from "../services/api"; // Import the axios instance

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper to set ID in Axios headers globally
  const setApiUser = (userId: string | undefined) => {
    if (userId) {
      // @ts-ignore - Axios types sometimes conflict with custom common headers
      api.defaults.headers.common["x-user-id"] = userId;
    } else {
      // @ts-ignore
      delete api.defaults.headers.common["x-user-id"];
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setApiUser(session.user.id); // Set Header
        void checkRole(session.user.id);
      } else {
        setApiUser(undefined); // Clear Header
        setLoading(false);
      }
    });

    // 2. Auth State Change Listener (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setApiUser(session.user.id); // Set Header
          void checkRole(session.user.id);
        } else {
          setApiUser(undefined); // Clear Header
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setIsAdmin(data?.role === "admin");
    } catch (error) {
      console.error("Error fetching role:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setApiUser(undefined);
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
