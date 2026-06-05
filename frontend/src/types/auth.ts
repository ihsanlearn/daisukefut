export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role: "customer" | "canteen";
}
