import React, { useState } from 'react';
import { 
  MenuItem, 
  OrderItem, 
  Order, 
  PromoOffer, 
  Category, 
  OrderPriority 
} from '../../types/restaurant';
import { 
  Plus, 
  Minus, 
  Trash2, 
  BellRing, 
  Flame, 
  Clock, 
  Percent, 
  Mic, 
  Search,
  Sparkles,
  Tag
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface OwnerPOSViewProps {
  menuItems: MenuItem[];
  offers: PromoOffer[];
  orders: Order[];
  onCreateOrder: (newOrder: Order) => void;
  onCallChefAgain: (orderId: string, customNote?: string) => void;
  onOpenIntercom: () => void;
  seniorMode: boolean;
}

export const OwnerPOSView: React.FC<OwnerPOSViewProps> = ({
  menuItems,
  offers,
  orders,
  onCreateOrder,
  onCallChefAgain,
  onOpenIntercom,
  seniorMode
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('Table 1');
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<PromoOffer | null>(offers.find((o) => o.active) || null);
  const [priority, setPriority] = useState<OrderPriority>('normal');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Bar', 'Takeout'];

  // Only show available items or items without explicit isAvailable: false
  const availableItems = menuItems.filter((i) => i.isAvailable !== false);

  const filteredItems = availableItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => 
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const newItem: OrderItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: 1,
          checkedInKitchen: false
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) => 
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        return prev.filter((i) => i.menuItemId !== menuItemId);
      }
    });
  };

  const deleteFromCart = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setOrderNotes('');
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountTotal = 0;
  if (appliedOffer && subtotal > 0 && appliedOffer.active) {
    if (appliedOffer.discountType === 'percent') {
      discountTotal = (subtotal * appliedOffer.discountValue) / 100;
    } else {
      discountTotal = Math.min(appliedOffer.discountValue, subtotal);
    }
  }

  const tax = Number(((subtotal - discountTotal) * 0.08).toFixed(2));
  const grandTotal = Math.max(0, Number((subtotal - discountTotal + tax).toFixed(2)));

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) return;

    const nextOrderNumber = orders.length > 0 
      ? Math.max(...orders.map((o) => o.orderNumber)) + 1 
      : 101;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNumber,
      tableNumber: selectedTable,
      customerName: customerName.trim() || undefined,
      items: [...cartItems],
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      discountCodeApplied: appliedOffer ? appliedOffer.code : undefined,
      tax,
      grandTotal,
      status: 'pending',
      priority,
      notes: orderNotes.trim() || undefined,
      createdAt: Date.now(),
      calledChefCount: 1,
      lastChefCallMessage: `New ticket ${selectedTable} sent by Papaw`
    };

    audioService.playKitchenBell();

    const itemCountSummary = cartItems.map((i) => `${i.quantity} ${i.name}`).join(', ');
    const verbalAnnouncement = priority === 'rush'
      ? `Attention Kitchen: Rush order for ${selectedTable}! Prepare ${itemCountSummary} now!`
      : `Chef! New order for ${selectedTable}: ${itemCountSummary}.`;

    setTimeout(() => {
      audioService.speakOrderToChef(verbalAnnouncement);
    }, 500);

    onCreateOrder(newOrder);
    clearCart();
    setCustomerName('');
  };

  const activeOrders = orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled');

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Non-Congested, Minimal POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table Selector + Menu Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Table Chips Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700">Select Dining Table:</span>
              <span className="text-stone-500 font-medium">Selected: <strong className="text-orange-600">{selectedTable}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {tables.map((tbl) => {
                const isSelected = selectedTable === tbl;
                return (
                  <button
                    key={tbl}
                    onClick={() => setSelectedTable(tbl)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {tbl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'specials', label: 'Specials' },
                  { id: 'mains', label: 'Mains' },
                  { id: 'combos', label: 'Combos' },
                  { id: 'starters', label: 'Starters' },
                  { id: 'drinks', label: 'Drinks' },
                  { id: 'desserts', label: 'Desserts' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as Category)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Minimal Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            {/* Menu Catalog Grid - Clean, Spacious, Minimal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredItems.map((dish) => {
                const inCart = cartItems.find((i) => i.menuItemId === dish.id);
                return (
                  <div
                    key={dish.id}
                    className={`border rounded-2xl p-3 flex gap-3 transition-all ${
                      inCart
                        ? 'border-orange-400 bg-orange-50/40 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {dish.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-extrabold text-orange-600 text-sm">
                            ${dish.price.toFixed(2)}
                          </span>
                          {dish.originalPrice && (
                            <span className="text-stone-400 line-through text-xs">
                              ${dish.originalPrice.toFixed(2)}
                            </span>
                          )}
                          {dish.discountPercent && (
                            <span className="text-3xs font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded-sm">
                              {dish.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                        <span className="text-3xs text-stone-400">
                          {dish.prepTimeMinutes}m prep
                        </span>

                        {inCart ? (
                          <div className="flex items-center gap-1 bg-white border border-orange-500 rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => removeFromCart(dish.id)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-orange-600 hover:bg-orange-50 rounded-sm cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-bold text-stone-900 text-xs">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(dish)}
                              className="w-5 h-5 flex items-center justify-center font-bold bg-orange-500 text-white rounded-sm cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Order Ticket & Action Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-4">
            {/* Header Ticket */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-orange-600">
                  Current Ticket
                </span>
                <h3 className="font-heading font-extrabold text-lg text-stone-900">
                  {selectedTable}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <span className="bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-lg text-xs">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 min-h-[140px] max-h-[220px] overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No items in ticket. Tap items on the left to add.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div className="flex-1 truncate mr-2">
                      <div className="font-bold text-stone-900 truncate">{item.name}</div>
                      <div className="text-stone-500 text-2xs">${item.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-stone-200 rounded-md font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const found = menuItems.find((m) => m.id === item.menuItemId);
                          if (found) addToCart(found);
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-md font-bold cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => deleteFromCart(item.menuItemId)}
                        className="text-stone-400 hover:text-red-500 ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discounts and Notes */}
            <div className="pt-3 border-t border-stone-100 space-y-3">
              {/* Promo Offers Selector */}
              <div className="space-y-1.5">
                <span className="text-2xs font-bold text-stone-600 uppercase">Apply Discount:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {offers.filter((o) => o.active).map((off) => {
                    const isSelected = appliedOffer?.id === off.id;
                    return (
                      <button
                        key={off.id}
                        onClick={() => setAppliedOffer(isSelected ? null : off)}
                        className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {off.badge} ({off.code})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kitchen Note & Rush */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Notes (e.g. No salt, extra crispy)..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden"
                />
                <button
                  onClick={() => setPriority(priority === 'rush' ? 'normal' : 'rush')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                    priority === 'rush'
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 inline mr-1" />
                  <span>{priority === 'rush' ? 'RUSH' : 'Normal'}</span>
                </button>
              </div>

              {/* Financial Totals */}
              <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-orange-600 font-bold">
                    <span>Discount ({appliedOffer?.code}):</span>
                    <span>-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                  <span className="font-heading font-extrabold text-base text-stone-900">Total:</span>
                  <span className="font-heading font-black text-xl text-orange-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Send to Kitchen & Ring Bell CTA */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSendToKitchen}
                disabled={cartItems.length === 0}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>SEND TO KITCHEN & RING BELL 🔔</span>
              </button>

              <button
                onClick={onOpenIntercom}
                className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-orange-500" />
                <span>Voice Call Chef</span>
              </button>
            </div>
          </div>

          {/* Minimal Kitchen Feed */}
          {activeOrders.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>Active Kitchen Tickets ({activeOrders.length})</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-stone-900">
                      #{ord.orderNumber} · {ord.tableNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-3xs font-extrabold uppercase ${
                          ord.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : ord.status === 'cooking'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <button
                        onClick={() => onCallChefAgain(ord.id)}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Ring again"
                      >
                        <BellRing className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
