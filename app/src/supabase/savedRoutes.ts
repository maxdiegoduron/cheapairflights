import { supabase } from "./client";

export interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
  flight_date: string;
  /** Set only for round trips. */
  return_date: string | null;
  price: number;
  currency: string;
  airline: string | null;
  created_at: string;
}

export async function listSavedRoutes(): Promise<SavedRoute[]> {
  const { data, error } = await supabase
    .from("saved_routes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveRoute(
  userId: string,
  route: Omit<SavedRoute, "id" | "created_at">
): Promise<SavedRoute> {
  const { data, error } = await supabase
    .from("saved_routes")
    .insert({ ...route, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSavedRoute(id: string): Promise<void> {
  const { error } = await supabase.from("saved_routes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
