"use client";

import { SupabaseClient } from "@supabase/supabase-js";
import React, { createContext, useContext } from "react";

import { supabase } from "@/services/supabase";

type SupabaseContextType = SupabaseClient | null;

const SupabaseContext = createContext<SupabaseContextType>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
}
