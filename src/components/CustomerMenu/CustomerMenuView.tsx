import React, { useState } from 'react';
import { MenuItem, Order, OrderItem } from '../../types/restaurant';
import { Plus } from 'lucide-react';

interface CustomerMenuViewProps {
  menuItems: MenuItem[];
  orders: Order[];
  user: { role: string; name: string };
  onCustomerPlaceOrder: (newOrder: Omit<Order, 'id' | 'order_number' | 'status' | 'created_at'>, fromCustomer: boolean) => Promise<any>;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  menuItems,
  orders,
  user,
  onCustomerPlaceOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mains' | 'starters' | 'combos' | 'drinks' | 'desserts'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerTray, setCustomerTray] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableError, setTableError] = useState<boolean>(false);
  const [orderSent, setOrderSent] = useState<boolean>(false);
  const [sending, setSending] = useState(false);

  const availableItems = menuItems.filter((i) => i.is_available !== 0);

  const filteredItems = availableItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  const addToTray = (item: MenuItem) => {
    setCustomerTray((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) return prev.map((i) => (i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, {
        id: Date.now(),
        order_id: 0,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        checked_in_kitchen: 0
      } as OrderItem];
    });
  };

  const removeFromTray = (menuItemId: number) => {
    setCustomerTray((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItemId);
      if (!existing) return prev;
      if (existing.quantity > 1) return prev.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i));
      return prev.filter((i) => i.menu_item_id !== menuItemId);
    });
  };

  const traySubtotal = customerTray.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const trayCount = customerTray.reduce((acc, i) => acc + i.quantity, 0);

  const handleSendForApproval = async () => {
    if (customerTray.length === 0) return;
    if (!selectedTable) { setTableError(true); return; }
    setTableError(false);
    setSending(true);
    try {
      await onCustomerPlaceOrder({
        table_number: selectedTable,
        customer_name: 'Diner Guest',
        items: (customerTray.map((i) => ({ menu_item_id: i.menu_item_id, name: i.name, price: i.price, quantity: i.quantity })) as any) as OrderItem[],
        subtotal: traySubtotal,
        tax: Number((traySubtotal * 0.08).toFixed(2)),
        grand_total: Number((traySubtotal + traySubtotal * 0.08).toFixed(2)),
        discount_total: 0,
        notes: 'Customer order via menu',
        priority: 'normal'
      }, true);
      setCustomerTray([]);
      setSelectedTable('');
      setOrderSent(true);
      setTableError(false);
    } finally {
      setSending(false);
    }
    setTimeout(() => setOrderSent(false), 3000);
  };

  const categoryLabels: Record<string, string> = { all: 'All', mains: 'Mains', starters: 'Starters', combos: 'Combos', drinks: 'Drinks', desserts: 'Desserts' };

  return (
    <div className="space-y-3 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-stone-900 text-sm sm:text-base">Menu</h2>
        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">Order Food</span>
      </div>

      {/* Table Selector */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-700 text-[10px]">Table Number</span>
          {tableError && <span className="text-[10px] font-bold text-red-600">Select a table first</span>}
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Bar', 'Takeout'].map((t) => {
            const isSelected = selectedTable === t;
            return (
              <button key={t} onClick={() => { setSelectedTable(t); setTableError(false); }}
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
                  isSelected ? 'bg-orange-500 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {orderSent ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center font-bold text-sm">🕒</div>
          <h4 className="font-bold text-stone-900 text-sm">Sent for Approval</h4>
          <p className="text-[10px] text-stone-500">The owner will review and send your order to the kitchen.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'mains', 'starters', 'combos', 'drinks', 'desserts']).map((c) => (
                <button key={c} onClick={() => setSelectedCategory(c as any)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
                      selectedCategory === c ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" placeholder="Search dishes..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((dish) => {
              const inTray = customerTray.find((i) => i.menu_item_id === dish.id);
              return (
                <div key={dish.id} className={`border-2 rounded-3xl p-4 flex gap-3 transition-colors shadow-sm hover:shadow-lg ${
                  inTray ? 'border-orange-400 bg-orange-50/40' : 'border-stone-200 bg-white hover:border-orange-500'
                }`}>
                  <div className="relative shrink-0">
                    <img src={dish.image_url} alt={dish.name} className="w-28 h-28 rounded-2xl object-cover shrink-0 border border-stone-200" />
                    {dish.discount_percent && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black rounded-lg px-2 py-0.5 shadow-lg border-2 border-white">
                        -{dish.discount_percent}%
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate leading-tight">{dish.name}</h4>
                      <div className="mt-1 text-[10px] text-stone-500">{dish.category.charAt(0).toUpperCase() + dish.category.slice(1)}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {dish.discount_percent ? (
                          <>
                            <span className="text-red-600 font-black text-base">${((dish.price) * (1 - dish.discount_percent / 100)).toFixed(2)}</span>
                            <span className="text-stone-400 line-through text-xs">${dish.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-orange-600 font-black text-sm">${dish.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100">
                      {inTray ? (
                        <div className="flex items-center gap-2 bg-white border border-orange-500 rounded-xl px-3 py-1.5 shadow-sm">
                          <button onClick={() => removeFromTray(dish.id)} className="w-7 h-7 flex items-center justify-center bg-orange-50 text-orange-600 font-black text-sm rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">−</button>
                          <span className="w-6 text-center font-black text-sm">{inTray.quantity}</span>
                          <button onClick={() => addToTray(dish)} className="w-7 h-7 flex items-center justify-center bg-orange-600 text-white font-black text-sm rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToTray(dish)} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tray Summary */}
      {trayCount > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-700 uppercase tracking-wider">
            <span>Your Order ({trayCount})</span>
            <span className="text-orange-600 font-black">${(traySubtotal * 1.08).toFixed(2)}</span>
          </div>
          <div className="max-h-[140px] overflow-y-auto space-y-1">
            {customerTray.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50 border border-stone-100 text-[10px]">
                <div className="flex-1 truncate mr-2">
                  <div className="font-bold text-stone-900 truncate">{item.name}</div>
                  <div className="text-stone-500">${item.price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => removeFromTray(item.menu_item_id!)} className="w-4 h-4 flex items-center justify-center bg-white border border-stone-200 rounded text-stone-900 font-bold text-[10px]">-</button>
                  <span className="w-4 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => {
                    const found = item.menu_item_id != null && menuItems.find((m) => m.id === item.menu_item_id);
                    if (found) addToTray(found);
                  }} className="w-4 h-4 flex items-center justify-center bg-orange-500 text-white rounded text-[10px] font-bold">+</button>
                  <button onClick={() => removeFromTray(item.menu_item_id!)} className="text-stone-400 hover:text-red-500">×</button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-stone-100 space-y-1 text-[10px] text-stone-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-stone-900">${traySubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${(traySubtotal * 0.08).toFixed(2)}</span></div>
          </div>
          <button onClick={handleSendForApproval} disabled={!selectedTable || sending}
            className={`w-full py-2 font-bold rounded-lg text-[10px] transition-transform active:scale-[0.99] ${
              !selectedTable || sending ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
            }`}
          >
            {sending ? 'Sending...' : selectedTable ? 'Send for Owner Approval' : 'Select a Table First'}
          </button>
        </div>
      )}
    </div>
  );
};
