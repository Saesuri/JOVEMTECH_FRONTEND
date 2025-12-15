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

  // Helper to set auth headers in Axios globally
  const setApiAuth = (
    userId: string | undefined,
    accessToken: string | undefined
  ) => {
    if (userId && accessToken) {
      api.defaults.headers.common["x-user-id"] = userId;
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["x-user-id"];
      delete api.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setApiAuth(session.user.id, session.access_token); // Set auth headers
        void checkRole(session.user.id);
      } else {
        setApiAuth(undefined, undefined); // Clear auth headers
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
          setApiAuth(session.user.id, session.access_token); // Set auth headers
          void checkRole(session.user.id);
        } else {
          setApiAuth(undefined, undefined); // Clear auth headers
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
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setApiAuth(undefined, undefined);
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
