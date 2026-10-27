import { api } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

// POST api/auth/login
export const login = (data: LoginRequest) => api.post<AuthResponse>("auth/login", data);

// POST api/auth/register
export const registerGabbai = (data: RegisterRequest) =>
  api.post<AuthResponse>("auth/register", data);