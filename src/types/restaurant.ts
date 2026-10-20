export type Category = 'all' | 'starters' | 'mains' | 'combos' | 'specials' | 'drinks' | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: 'starters' | 'mains' | 'combos' | 'specials' | 'drinks' | 'desserts';
  description: string;
  price: number;
  originalPrice?: number; // if discounted, show original price
  discountPercent?: number; // e.g. 20%
  discountLabel?: string; // e.g. "20% OFF", "Chef's Special"
  imageUrl: string;
  isPopular?: boolean;
  isChefsSpecial?: boolean;
  isVegetarian?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3; // 0=none, 1=mild, 2=medium, 3=hot
  prepTimeMinutes: number;
  calories?: number;
  ingredients: string[];
  allergens?: string[];
  isAvailable?: boolean; // For CMS stock management
}

export interface PromoOffer {
  id: string;
  title: string;
  code: string;
  tagline: string;
  discountType: 'percent' | 'flat';
  discountValue: number; // e.g. 20 (for 20%) or 5 (for $5 off)
  badge: string;
  applicableCategory?: Category;
  minOrderAmount?: number;
  active: boolean;
  expiresInText: string;
  colorScheme: 'orange' | 'amber' | 'rose';
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  originalPrice?: number;
  specialInstructions?: string;
  checkedInKitchen?: boolean;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
export type OrderPriority = 'normal' | 'rush';

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: string; // e.g. "Table 4", "Takeout #1", "Bar 2"
  customerName?: string;
  guestCount?: number;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  discountCodeApplied?: string;
  tax: number;
  grandTotal: number;
  status: OrderStatus;
  priority: OrderPriority;
  notes?: string;
  createdAt: number; // timestamp
  cookingStartedAt?: number;
  readyAt?: number;
  completedAt?: number;
  calledChefCount: number;
  lastChefCallMessage?: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  orderCount: number;
  averageTicket: number;
  totalDiscountsGiven: number;
  averageCookTimeMinutes: number;
  hourlySales: { hour: string; sales: number; orders: number }[];
  categorySales: { category: string; sales: number; count: number }[];
  topDishes: { name: string; quantity: number; revenue: number; imageUrl: string }[];
  promoUsage: { code: string; title: string; timesUsed: number; totalSaved: number }[];
}
