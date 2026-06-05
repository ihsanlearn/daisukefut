export type Role = "admin" | "canteen" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}
