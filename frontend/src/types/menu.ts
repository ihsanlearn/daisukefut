export interface MenuItem {
  id: number;
  canteen_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: number;
  category_rel?: {
    id: number;
    name: string;
    icon?: string;
  };
  is_available: boolean;
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: number | null;
  is_available: boolean;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: number | null;
  is_available?: boolean;
}
