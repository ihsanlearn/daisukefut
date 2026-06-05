export type OrderStatus =
  | "waiting_for_payment"
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  menu_item: {
    id: number;
    name: string;
    price: number;
    category?: string;
    image_url?: string;
  };
}

export interface Order {
  id: number;
  user_id: number;
  canteen_id: number;
  delivery_point_id: number;
  status: OrderStatus;
  total_price: number;
  notes?: string;
  ordered_at: string;
  delivered_at?: string;
  items: OrderItem[];
}

export interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface DeliveryPoint {
  id: number;
  user_id: number;
  name: string;
  address: string;
}