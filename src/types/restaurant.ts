export type Category = 'all' | 'starters' | 'mains' | 'combos' | 'drinks' | 'desserts';

export interface MenuItem {
  id: number;
  name: string;
  category: 'starters' | 'mains' | 'combos' | 'specials' | 'drinks' | 'desserts';
  description: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  image_url: string;
  is_available: number;
  prep_time_minutes: number;
  ingredients?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number | null;
  name: string;
  price: number;
  quantity: number;
  checked_in_kitchen: number;
}

export type OrderStatus = 'awaiting_approval' | 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
export type OrderPriority = 'normal' | 'rush';

export interface Order {
  id: number;
  order_number: number;
  table_number: string;
  customer_name?: string;
  customer_user_id?: number;
  guest_count?: number;
  items: OrderItem[];
  subtotal: number;
  discount_total: number;
  tax: number;
  grand_total: number;
  status: OrderStatus;
  priority: OrderPriority;
  notes?: string;
  created_at: string;
  cooking_started_at?: string;
  ready_at?: string;
  served_at?: string;
  created_by?: string;
}
