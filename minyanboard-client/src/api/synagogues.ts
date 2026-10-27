import { api } from "./client";
import type { Synagogue } from "../types";

// GET api/synagogues - רשימת בתי הכנסת (פתוח לכולם)
export const getSynagogues = () => api.
get<Synagogue[]>("synagogues");
