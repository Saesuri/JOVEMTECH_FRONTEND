import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";

// 1. Define the Shape
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

// 2. Create the Context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// 3. Create the Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
