import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";
import MainPage from "@/components/MainPage";


type SearchParamProps = {
  searchParams: Record<string, string> | null | undefined;
};

export default async function Index({ searchParams }: SearchParamProps) {
  const cookieStore = cookies();

  const canInitSupabaseClient = () => {
    try {
      createClient(cookieStore);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <MainPage isSupabaseConnected={isSupabaseConnected} />
  );
}