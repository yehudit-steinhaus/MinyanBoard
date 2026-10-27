import { api } from "./client";
import type { BoardFilters, Minyan, MinyanStatus, SaveMinyanRequest } from "../types";

// הופך { prayer: "Mincha", days: "" } ל- "?prayer=Mincha" (מדלג על ריקים)
function toQuery(params: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.append(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

// GET api/minyanim?prayer=&days=&synagogueId= - לוח ציבורי (כולם)
export const getBoard = (filters: BoardFilters) =>
  api.get<Minyan[]>(`minyanim${toQuery(filters)}`);

// GET api/minyanim/mine - המניינים של הגבאי
export const getMine = () => api.get<Minyan[]>("minyanim/mine");

// GET api/minyanim/all?status= - כל המניינים (מנהל)
export const getAllMinyanim = (status: MinyanStatus | "") =>
  api.get<Minyan[]>(`minyanim/all${toQuery({ status })}`);

// POST / PUT / DELETE - גבאי
export const createMinyan = (data: SaveMinyanRequest) => api.post<Minyan>("minyanim", data);
export const updateMinyan = (id: number, data: SaveMinyanRequest) =>
  api.put<Minyan>(`minyanim/${id}`, data);
export const deleteMinyan = (id: number) => api.delete(`minyanim/${id}`);

// PATCH api/minyanim/{id}/status - אישור/דחייה (מנהל)
export const updateMinyanStatus = (id: number, status: MinyanStatus) =>
  api.patch<Minyan>(`minyanim/${id}/status`, { status });