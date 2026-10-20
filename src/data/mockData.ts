import { MenuItem, PromoOffer, Order, SalesAnalytics } from '../types/restaurant';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- SIGNATURE SPECIALS & OFFERS ---
  {
    id: 'm1',
    name: "Papaw's Smokehouse Double Burger",
    category: 'specials',
    description: 'Double Angus beef patties, melted aged cheddar, smoked bacon, caramelized onions & secret orange house sauce on brioche.',
    price: 15.99,
    originalPrice: 19.99,
    discountPercent: 20,
    discountLabel: '20% OFF TODAY',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isChefsSpecial: true,
    spicyLevel: 1,
    prepTimeMinutes: 12,
    calories: 780,
    ingredients: ['Angus Beef', 'Aged Cheddar', 'Smoked Bacon', 'Brioche Bun', 'Orange BBQ Glaze', 'Crispy Shallots'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'm2',
    name: 'Butter Chicken Masala & Garlic Naan',
    category: 'mains',
    description: 'Tender tandoori chicken simmered in rich creamy tomato butter gravy, paired with hot clay-oven garlic naan.',
    price: 17.50,
    originalPrice: 22.00,
    discountPercent: 20,
    discountLabel: 'CHEF SPECIAL 20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isChefsSpecial: true,
    spicyLevel: 2,
    prepTimeMinutes: 14,
    calories: 820,
    ingredients: ['Tandoori Chicken', 'Creamy Tomato Makhani', 'Fenugreek', 'Garlic Butter Naan', 'Basmati Rice'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'm3',
    name: 'Artisan Truffle & Wild Mushroom Pizza',
    category: 'mains',
    description: 'Hand-stretched sourdough crust with roasted garlic white cream, fontina, sautéed portobello, and fresh black truffle oil.',
    price: 18.00,
    originalPrice: 22.50,
    discountPercent: 20,
    discountLabel: '20% OFF PROMO',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isVegetarian: true,
    spicyLevel: 0,
    prepTimeMinutes: 15,
    calories: 690,
    ingredients: ['Slow Fermented Sourdough', 'Fontina Cheese', 'Portobello & Cremini', 'Truffle Glaze', 'Fresh Basil'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'm4',
    name: 'Ultimate Grand Family Feast Combo',
    category: 'combos',
    description: '2 Smokehouse Burgers, 1 Large Artisan Pizza, 2 Golden Fries, and 4 Fountain Beverages. Best value for dining in.',
    price: 44.99,
    originalPrice: 59.99,
    discountPercent: 25,
    discountLabel: 'SAVE $15 COMBO',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    spicyLevel: 1,
    prepTimeMinutes: 18,
    calories: 1850,
    ingredients: ['2x Burgers', '1x 12-inch Pizza', '2x Large Golden Fries', '4x Soda of Choice'],
    allergens: ['Dairy', 'Gluten']
  },

  // --- STARTERS ---
  {
    id: 'm5',
    name: 'Crispy Calamari with Tangy Paprika Aioli',
    category: 'starters',
    description: 'Tender sea calamari dusted in seasoned semolina, flash-fried to golden crisp, served with charred lemon and garlic paprika dip.',
    price: 11.50,
    originalPrice: 14.00,
    discountPercent: 18,
    discountLabel: '18% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    spicyLevel: 1,
    prepTimeMinutes: 8,
    calories: 420,
    ingredients: ['Fresh Calamari Rings', 'Smoked Paprika', 'Garlic Aioli', 'Lemon Wedges'],
    allergens: ['Seafood', 'Eggs']
  },
  {
    id: 'm6',
    name: 'Honey Citrus Glazed Chicken Wings (8 pcs)',
    category: 'starters',
    description: 'Crispy oven-baked wings tossed in Papaw’s signature orange honey glaze with toasted sesame and scallions.',
    price: 12.99,
    originalPrice: 15.99,
    discountPercent: 19,
    discountLabel: 'SPECIAL DEAL',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    spicyLevel: 2,
    prepTimeMinutes: 10,
    calories: 580,
    ingredients: ['Crispy Wings', 'Orange Blossom Honey', 'Chili Flakes', 'Toasted Sesame', 'Scallions'],
    allergens: ['Sesame']
  },
  {
    id: 'm7',
    name: 'Loaded Cheddar & Bacon Potato Crisps',
    category: 'starters',
    description: 'Golden hand-cut fries smothered in molten cheddar sauce, chopped crispy bacon, sour cream and chives.',
    price: 8.99,
    originalPrice: 10.50,
    discountPercent: 14,
    discountLabel: '14% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    spicyLevel: 0,
    prepTimeMinutes: 7,
    calories: 520,
    ingredients: ['Russet Potatoes', 'Cheddar Melt', 'Smoked Bacon', 'Sour Cream', 'Fresh Chives'],
    allergens: ['Dairy']
  },

  // --- MAINS ---
  {
    id: 'm8',
    name: 'Creamy Garlic Shrimp Tagliatelle',
    category: 'mains',
    description: 'Pan-seared jumbo tiger prawns in a rich white wine parmesan cream with blistered cherry tomatoes and herbs.',
    price: 19.50,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    spicyLevel: 1,
    prepTimeMinutes: 14,
    calories: 740,
    ingredients: ['Jumbo Prawns', 'Tagliatelle Egg Pasta', 'Parmesan Reggiano', 'Garlic White Wine Cream'],
    allergens: ['Shellfish', 'Dairy', 'Gluten']
  },
  {
    id: 'm9',
    name: 'Grilled Salmon with Citrus Herb Butter',
    category: 'mains',
    description: 'Pan-seared Atlantic salmon fillet on a bed of roasted baby potatoes and asparagus with orange-dill reduction.',
    price: 21.90,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    spicyLevel: 0,
    prepTimeMinutes: 16,
    calories: 610,
    ingredients: ['Atlantic Salmon', 'Citrus Herb Butter', 'Roasted Asparagus', 'Rosemary Potatoes'],
    allergens: ['Fish', 'Dairy']
  },

  // --- COMBOS ---
  {
    id: 'm10',
    name: 'Quick Chef Lunch Express Combo',
    category: 'combos',
    description: 'Any classic sandwich or mini pasta + seasoned herb fries + iced tea or lemonade.',
    price: 13.99,
    originalPrice: 17.50,
    discountPercent: 20,
    discountLabel: 'LUNCH VALUE 20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    spicyLevel: 0,
    prepTimeMinutes: 9,
    calories: 640,
    ingredients: ['Sandwich of Choice', 'Side Herb Fries', 'Cold Brew Iced Tea'],
    allergens: ['Gluten']
  },

  // --- DRINKS ---
  {
    id: 'm11',
    name: 'Fresh Squeezed Valencia Orange Mint Cooler',
    category: 'drinks',
    description: 'Hand-pressed sweet Valencia oranges, sparkling soda, crushed mint leaves and cane sugar.',
    price: 5.50,
    originalPrice: 6.50,
    discountPercent: 15,
    discountLabel: '15% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    spicyLevel: 0,
    prepTimeMinutes: 4,
    calories: 140,
    ingredients: ['Fresh Orange Juice', 'Sparkling Water', 'Mint Sprigs', 'Organic Cane Sugar']
  },
  {
    id: 'm12',
    name: 'Cold Brew Vanilla Foam Coffee',
    category: 'drinks',
    description: '18-hour steeped smooth Arabica cold brew crowned with silky Madagascar vanilla sweet cream.',
    price: 5.95,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    spicyLevel: 0,
    prepTimeMinutes: 3,
    calories: 180,
    ingredients: ['Arabica Cold Brew', 'Sweet Cream', 'Vanilla Bean']
  },

  // --- DESSERTS ---
  {
    id: 'm13',
    name: 'Warm Belgian Chocolate Lava Cake',
    category: 'desserts',
    description: 'Decadent dark chocolate molten center served warm with Madagascar vanilla bean ice cream and berry coulis.',
    price: 8.50,
    originalPrice: 10.00,
    discountPercent: 15,
    discountLabel: 'SWEET TREAT 15% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isVegetarian: true,
    spicyLevel: 0,
    prepTimeMinutes: 7,
    calories: 490,
    ingredients: ['Belgian Dark Chocolate', 'Vanilla Ice Cream', 'Raspberry Coulis', 'Fresh Mint'],
    allergens: ['Dairy', 'Eggs', 'Gluten']
  }
];

export const INITIAL_OFFERS: PromoOffer[] = [
  {
    id: 'off-1',
    title: 'Daily Lunch Flash Deal',
    code: 'LUNCH20',
    tagline: '20% OFF on all Signature Burgers & Mains between 11 AM - 3 PM',
    discountType: 'percent',
    discountValue: 20,
    badge: '20% OFF',
    applicableCategory: 'mains',
    active: true,
    expiresInText: 'Ends at 3:00 PM today',
    colorScheme: 'orange'
  },
  {
    id: 'off-2',
    title: 'Senior Guest Courtesy Discount',
    code: 'SENIOR15',
    tagline: '15% OFF your entire bill anytime for guests 60+',
    discountType: 'percent',
    discountValue: 15,
    badge: '15% OFF TOTAL',
    active: true,
    expiresInText: 'Always Active (Papaw’s Honor)',
    colorScheme: 'amber'
  },
  {
    id: 'off-3',
    title: 'Family Feast Combo Saver',
    code: 'FEAST15',
    tagline: 'Flat $15 Instant Rebate when ordering the Grand Family Platter',
    discountType: 'flat',
    discountValue: 15,
    badge: 'SAVE $15',
    applicableCategory: 'combos',
    minOrderAmount: 40,
    active: true,
    expiresInText: 'Available all week',
    colorScheme: 'rose'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 101,
    tableNumber: 'Table 4',
    customerName: 'Robert M.',
    guestCount: 3,
    items: [
      {
        id: 'oi-1',
        menuItemId: 'm1',
        name: "Papaw's Smokehouse Double Burger",
        price: 15.99,
        quantity: 2,
        specialInstructions: 'Extra napkins, 1 without onions',
        checkedInKitchen: true
      },
      {
        id: 'oi-2',
        menuItemId: 'm7',
        name: 'Loaded Cheddar & Bacon Potato Crisps',
        price: 8.99,
        quantity: 1,
        specialInstructions: 'Extra sour cream on side',
        checkedInKitchen: true
      },
      {
        id: 'oi-3',
        menuItemId: 'm11',
        name: 'Fresh Squeezed Valencia Orange Mint Cooler',
        price: 5.50,
        quantity: 2,
        checkedInKitchen: true
      }
    ],
    subtotal: 51.97,
    discountTotal: 7.80,
    discountCodeApplied: 'SENIOR15',
    tax: 3.53,
    grandTotal: 47.70,
    status: 'cooking',
    priority: 'normal',
    notes: 'Older gentleman with family. Asked for well done burger.',
    createdAt: Date.now() - 1000 * 60 * 8, // 8 mins ago
    cookingStartedAt: Date.now() - 1000 * 60 * 6,
    calledChefCount: 1,
    lastChefCallMessage: 'Order 101 sent with senior discount note'
  },
  {
    id: 'ord-102',
    orderNumber: 102,
    tableNumber: 'Table 2',
    customerName: 'Sarah Jenkins',
    guestCount: 2,
    items: [
      {
        id: 'oi-4',
        menuItemId: 'm2',
        name: 'Butter Chicken Masala & Garlic Naan',
        price: 17.50,
        quantity: 2,
        specialInstructions: 'Medium spicy please, extra crispy naan',
        checkedInKitchen: false
      },
      {
        id: 'oi-5',
        menuItemId: 'm6',
        name: 'Honey Citrus Glazed Chicken Wings (8 pcs)',
        price: 12.99,
        quantity: 1,
        checkedInKitchen: false
      }
    ],
    subtotal: 47.99,
    discountTotal: 9.60,
    discountCodeApplied: 'LUNCH20',
    tax: 3.07,
    grandTotal: 41.46,
    status: 'pending',
    priority: 'rush',
    notes: 'RUSH: Guests have a movie in 40 minutes!',
    createdAt: Date.now() - 1000 * 60 * 2, // 2 mins ago
    calledChefCount: 2,
    lastChefCallMessage: 'RUSH order! Chef please prioritize Table 2!'
  },
  {
    id: 'ord-103',
    orderNumber: 103,
    tableNumber: 'Table 7',
    customerName: 'Dr. Harris',
    guestCount: 1,
    items: [
      {
        id: 'oi-6',
        menuItemId: 'm8',
        name: 'Creamy Garlic Shrimp Tagliatelle',
        price: 19.50,
        quantity: 1,
        checkedInKitchen: true
      },
      {
        id: 'oi-7',
        menuItemId: 'm13',
        name: 'Warm Belgian Chocolate Lava Cake',
        price: 8.50,
        quantity: 1,
        checkedInKitchen: true
      }
    ],
    subtotal: 28.00,
    discountTotal: 0,
    tax: 2.24,
    grandTotal: 30.24,
    status: 'ready',
    priority: 'normal',
    notes: 'Hot food ready on counter for pickup.',
    createdAt: Date.now() - 1000 * 60 * 18,
    cookingStartedAt: Date.now() - 1000 * 60 * 16,
    readyAt: Date.now() - 1000 * 60 * 1,
    calledChefCount: 1
  }
];

export const INITIAL_ANALYTICS: SalesAnalytics = {
  totalRevenue: 1482.40,
  orderCount: 38,
  averageTicket: 39.01,
  totalDiscountsGiven: 218.50,
  averageCookTimeMinutes: 12.8,
  hourlySales: [
    { hour: '11:00 AM', sales: 142.50, orders: 4 },
    { hour: '12:00 PM', sales: 385.00, orders: 11 },
    { hour: '1:00 PM', sales: 410.20, orders: 10 },
    { hour: '2:00 PM', sales: 198.70, orders: 5 },
    { hour: '3:00 PM', sales: 94.00, orders: 2 },
    { hour: '4:00 PM', sales: 72.00, orders: 2 },
    { hour: '5:00 PM', sales: 180.00, orders: 4 }
  ],
  categorySales: [
    { category: 'Main Courses', sales: 620.00, count: 32 },
    { category: 'Specials & Combos', sales: 480.40, count: 18 },
    { category: 'Starters', sales: 212.00, count: 20 },
    { category: 'Beverages', sales: 98.00, count: 22 },
    { category: 'Desserts', sales: 72.00, count: 9 }
  ],
  topDishes: [
    { name: "Papaw's Smokehouse Double Burger", quantity: 24, revenue: 383.76, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
    { name: 'Butter Chicken Masala & Garlic Naan', quantity: 19, revenue: 332.50, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
    { name: 'Artisan Truffle & Wild Mushroom Pizza', quantity: 15, revenue: 270.00, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ultimate Grand Family Feast Combo', quantity: 7, revenue: 314.93, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Honey Citrus Glazed Chicken Wings', quantity: 14, revenue: 181.86, imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=400&q=80' }
  ],
  promoUsage: [
    { code: 'LUNCH20', title: 'Daily Lunch Flash Deal (20% Off)', timesUsed: 14, totalSaved: 112.00 },
    { code: 'SENIOR15', title: 'Senior Guest Courtesy (15% Off)', timesUsed: 8, totalSaved: 68.50 },
    { code: 'FEAST15', title: 'Family Feast Combo Saver ($15 Off)', timesUsed: 3, totalSaved: 45.00 }
  ]
};
