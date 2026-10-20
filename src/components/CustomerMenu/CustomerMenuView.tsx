import React, { useState } from 'react';
import { 
  MenuItem, 
  PromoOffer, 
  Category, 
  OrderItem, 
  Order 
} from '../../types/restaurant';
import { 
  Tag, 
  Clock, 
  Percent, 
  Search, 
  Info, 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  Star,
  ChevronRight,
  Send
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface CustomerMenuViewProps {
  menuItems: MenuItem[];
  offers: PromoOffer[];
  onCustomerPlaceOrder: (order: Order) => void;
  seniorMode: boolean;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  menuItems,
  offers,
  onCustomerPlaceOrder,
  seniorMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [onlyDiscounts, setOnlyDiscounts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  
  // Tray
  const [customerTray, setCustomerTray] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Table 3');
  const [isTrayDrawerOpen, setIsTrayDrawerOpen] = useState<boolean>(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState<boolean>(false);

  // Available items
  const availableItems = menuItems.filter((i) => i.isAvailable !== false);

  const filteredItems = availableItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscount = onlyDiscounts ? Boolean(item.discountPercent || item.originalPrice) : true;
    return matchesCat && matchesSearch && matchesDiscount;
  });

  const addToTray = (item: MenuItem) => {
    setCustomerTray((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const newItem: OrderItem = {
          id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: 1
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromTray = (menuItemId: string) => {
    setCustomerTray((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i);
      } else {
        return prev.filter((i) => i.menuItemId !== menuItemId);
      }
    });
  };

  const traySubtotal = customerTray.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const traySavedAmount = customerTray.reduce((acc, i) => {
    if (i.originalPrice && i.originalPrice > i.price) {
      return acc + (i.originalPrice - i.price) * i.quantity;
    }
    return acc;
  }, 0);
  const trayCount = customerTray.reduce((acc, i) => acc + i.quantity, 0);

  const handleSendDinerOrder = () => {
    if (customerTray.length === 0) return;

    const newOrder: Order = {
      id: `ord-cust-${Date.now()}`,
      orderNumber: Math.floor(100 + Math.random() * 899),
      tableNumber: selectedTable,
      customerName: 'Diner Guest',
      items: [...customerTray],
      subtotal: Number(traySubtotal.toFixed(2)),
      discountTotal: Number(traySavedAmount.toFixed(2)),
      tax: Number((traySubtotal * 0.08).toFixed(2)),
      grandTotal: Number((traySubtotal + traySubtotal * 0.08).toFixed(2)),
      status: 'pending',
      priority: 'normal',
      notes: 'Customer placed via Digital Menu',
      createdAt: Date.now(),
      calledChefCount: 1,
      lastChefCallMessage: `Diner order received from ${selectedTable}`
    };

    onCustomerPlaceOrder(newOrder);
    audioService.playKitchenBell();
    audioService.speakOrderToChef(`New order from ${selectedTable} placed via digital menu!`);

    setOrderSentSuccess(true);
    setCustomerTray([]);
    setTimeout(() => {
      setIsTrayDrawerOpen(false);
      setOrderSentSuccess(false);
    }, 2000);
  };

  const activeOffers = offers.filter((o) => o.active);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clean Minimal Offers Bar */}
      {activeOffers.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-orange-50 border border-orange-200 text-orange-950 px-3.5 py-2 rounded-2xl flex items-center gap-2 shrink-0 shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-extrabold text-xs text-orange-600">{offer.badge}</span>
              <span className="text-stone-400">·</span>
              <span className="font-medium text-xs text-stone-800">{offer.title}</span>
              <span className="text-3xs uppercase font-mono bg-white px-2 py-0.5 rounded-md border border-orange-200 text-orange-800">
                {offer.code}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Categories & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'specials', label: 'Specials' },
            { id: 'mains', label: 'Mains' },
            { id: 'combos', label: 'Combos' },
            { id: 'starters', label: 'Starters' },
            { id: 'drinks', label: 'Drinks' },
            { id: 'desserts', label: 'Desserts' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick Filter: Discounts only */}
          <button
            onClick={() => setOnlyDiscounts(!onlyDiscounts)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              onlyDiscounts
                ? 'bg-orange-600 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-orange-50'
            }`}
          >
            Discounts Only
          </button>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Spacious, Minimal Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((dish) => {
          const itemInTray = customerTray.find((i) => i.menuItemId === dish.id);

          return (
            <div
              key={dish.id}
              className="bg-white border border-stone-200 hover:border-orange-300 rounded-2xl overflow-hidden shadow-2xs transition-all flex flex-col justify-between"
            >
              {/* Image & Clean Badges */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                />

                {dish.discountPercent && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-3xs font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                    {dish.discountLabel || `${dish.discountPercent}% OFF`}
                  </div>
                )}

                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-white text-3xs font-bold">
                  {dish.prepTimeMinutes}m prep
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-stone-900 text-base leading-snug">
                    {dish.name}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                {/* Price and Add Control */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading font-black text-lg text-orange-600">
                        ${dish.price.toFixed(2)}
                      </span>
                      {dish.originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ${dish.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveModalItem(dish)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                      title="Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {itemInTray ? (
                      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                        <button
                          onClick={() => removeFromTray(dish.id)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-stone-700 hover:bg-white rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{itemInTray.quantity}</span>
                        <button
                          onClick={() => addToTray(dish)}
                          className="w-6 h-6 flex items-center justify-center font-bold bg-orange-500 text-white rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToTray(dish)}
                        className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tray Bottom Bar */}
      {trayCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl border border-stone-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-black text-xs">
              {trayCount}
            </span>
            <div className="text-xs font-bold">
              <span>Total: ${traySubtotal.toFixed(2)}</span>
              {traySavedAmount > 0 && (
                <span className="text-green-400 ml-2 font-medium">
                  (Saved ${traySavedAmount.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsTrayDrawerOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Review & Order
          </button>
        </div>
      )}

      {/* Dish Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-stone-200 shadow-xl rounded-3xl w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="font-heading font-extrabold text-xl text-stone-900">
                  {activeModalItem.name}
                </h3>
                <span className="font-heading font-black text-xl text-orange-600">
                  ${activeModalItem.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {activeModalItem.description}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
              <span className="text-3xs font-bold text-stone-600 uppercase">Ingredients:</span>
              <div className="flex flex-wrap gap-1 text-2xs text-stone-700">
                {activeModalItem.ingredients.join(', ')}
              </div>
            </div>

            <button
              onClick={() => {
                addToTray(activeModalItem);
                setActiveModalItem(null);
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Add to Tray (${activeModalItem.price.toFixed(2)})
            </button>
          </div>
        </div>
      )}

      {/* Review Customer Order Drawer Modal */}
      {isTrayDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-stone-200 shadow-xl rounded-3xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-base text-stone-900">
                Review Table Order
              </h3>
              <button onClick={() => setIsTrayDrawerOpen(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderSentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-stone-900 text-sm">Order Sent to Kitchen!</h4>
                <p className="text-xs text-stone-500">The counter bell just rang for your chef.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-bold">Table:</span>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-bold"
                  >
                    {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {customerTray.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-stone-100">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-stone-500 ml-1.5">x{item.quantity}</span>
                      </div>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">${(traySubtotal * 1.08).toFixed(2)}</span>
                </div>

                <button
                  onClick={handleSendDinerOrder}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Confirm & Ring Kitchen Bell 🔔
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
