import { MenuItem } from "./menu";

export interface Canteen {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  location?: string;
  is_open: boolean;
  image_url?: string | null;
  qris_image_url?: string | null;
  created_at: string;
  menu_items?: MenuItem[];
}
