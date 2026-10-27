import React, { useState } from 'react';
import { MenuItem, OrderItem, Order } from '../../types/restaurant';
import { Plus, Minus, Trash2, BellRing, Flame, X } from 'lucide-react';

interface OwnerPOSViewProps {
  menuItems: MenuItem[];
  orders: Order[];
  user: { role: string; name: string };
  onCreateOrder: (newOrder: Omit<Order, 'id' | 'order_number' | 'status' | 'created_at'>, fromCustomer?: boolean) => Promise<any>;
  onApproveOrder: (id: string) => void;
  onRejectOrder: (id: string) => void;
}

export const OwnerPOSView: React.FC<OwnerPOSViewProps> = ({
  menuItems,
  orders,
  user,
  onCreateOrder,
  onApproveOrder,
  onRejectOrder
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'mains' | 'starters' | 'combos' | 'drinks' | 'desserts'>('all');
  const [sending, setSending] = useState(false);

  // Send modal (table selection before sending)
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTable, setSendTable] = useState<string>('Table 1');

  // Order detail modal
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Bar', 'Takeout'];

  const availableItems = menuItems.filter((i) => i.is_available !== 0);

  const filteredItems = availableItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) {
        return prev.map((i) => (i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
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

  const removeFromCart = (menuItemId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.menu_item_id !== menuItemId);
    });
  };

  const clearCart = () => { setCartItems([]); setOrderNotes(''); setCustomerName(''); };

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number((subtotal + tax).toFixed(2));

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) return;
    setSendTable('Table 1');
    setSendModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      await onCreateOrder({
        table_number: sendTable,
        customer_name: customerName.trim() || 'Guest',
        items: (cartItems.map((i) => ({ menu_item_id: i.menu_item_id, name: i.name, price: i.price, quantity: i.quantity })) as any) as OrderItem[],
        subtotal,
        tax,
        grand_total: grandTotal,
        discount_total: 0,
        notes: orderNotes.trim() || undefined,
        priority: 'normal'
      });
      clearCart();
      setSendModalOpen(false);
    } finally {
      setSending(false);
    }
  };

  const awaitingApproval = orders.filter((o) => o.status === 'awaiting_approval');
  const activeOrders = orders.filter((o) => o.status === 'cooking');

  const categoryLabels: Record<string, string> = { all: 'All', mains: 'Mains', starters: 'Starters', combos: 'Combos', drinks: 'Drinks', desserts: 'Desserts' };

  return (
    <div className="space-y-4 max-w-full">
      {/* Orders Awaiting Owner Approval */}
      {awaitingApproval.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Awaiting Approval ({awaitingApproval.length})</span>
          </div>
          <div className="space-y-1.5">
            {awaitingApproval.map((ord) => (
              <div key={ord.id} className="p-2 rounded-xl bg-white border border-orange-100 flex items-center justify-between text-[10px] cursor-pointer" onClick={() => { setSelectedOrder(ord); setOrderDetailOpen(true); }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900 truncate">#{ord.order_number} &middot; {ord.table_number}</div>
                  {ord.customer_name && (
                    <div className="text-stone-500 truncate">Guest: {ord.customer_name}</div>
                  )}
                  <div className="text-stone-400 mt-0.5 flex items-center gap-1">
                    <span>${ord.grand_total.toFixed(2)}</span><span>&middot;</span><span>{ord.items.length} item(s)</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); onApproveOrder(String(ord.id)); }} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] shadow-sm">
                    Approve
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onRejectOrder(String(ord.id)); }} className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] shadow-sm">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Menu only (no table selector at top) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm space-y-2">
            <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">Guest Name (optional)</label>
            <input
              type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500"
            />

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'mains', 'starters', 'combos', 'drinks', 'desserts']).map((c) => (
                <button key={c} onClick={() => setActiveCategory(c as any)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
                      activeCategory === c ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredItems.map((dish) => {
                const inCart = cartItems.find((i) => i.menu_item_id === dish.id);
                return (
                  <div key={dish.id} className={`border rounded-xl p-2 flex gap-2 transition-colors ${
                    inCart ? 'border-orange-400 bg-orange-50/40' : 'border-stone-200 bg-white hover:border-orange-300'
                  }`}>
                    <div className="relative">
                      <img src={dish.image_url} alt={dish.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200" />
                      {dish.discount_percent && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black rounded-md px-1 py-0.5 shadow-lg">
                          -{dish.discount_percent}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{dish.name}</h4>
                        <div className="flex items-center gap-1">
                          {dish.discount_percent ? (
                            <>
                              <span className="text-red-600 font-bold text-[10px]">${((dish.price) * (1 - dish.discount_percent / 100)).toFixed(2)}</span>
                              <span className="text-stone-400 line-through text-[9px]">${dish.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-orange-600 font-bold text-[10px] sm:text-sm">${dish.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {inCart ? (
                          <div className="flex items-center gap-1 bg-white border border-orange-500 rounded p-0.5 shadow-xs">
                            <button onClick={() => removeFromCart(dish.id)} className="w-4 h-4 flex items-center justify-center font-bold text-orange-600 text-[10px]">-</button>
                            <span className="w-4 text-center font-bold text-stone-900 text-[10px]">{inCart.quantity}</span>
                            <button onClick={() => addToCart(dish)} className="w-4 h-4 flex items-center justify-center font-bold bg-orange-500 text-white text-[10px] rounded">+</button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(dish)} className="px-2 py-1 bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer">
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

        {/* Right: Ticket + Active Orders */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Ticket</span>
              </div>
              <span className="bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
              </span>
            </div>

            <div className="min-h-[120px] max-h-[160px] overflow-y-auto space-y-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-3 text-[10px] text-stone-400">Tap items to add</div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50 border border-stone-100 text-[10px]">
                    <div className="flex-1 truncate mr-2">
                      <div className="font-bold text-stone-900 truncate">{item.name}</div>
                      <div className="text-stone-500">${item.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => removeFromCart(item.menu_item_id!)} className="w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded text-stone-900 font-bold text-[10px]">-</button>
                      <span className="w-4 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => {
                        const found = item.menu_item_id != null && menuItems.find((m) => m.id === item.menu_item_id);
                        if (found) addToCart(found);
                      }} className="w-4 h-4 flex items-center justify-center bg-orange-500 text-white rounded text-[10px] font-bold">+</button>
                      <button onClick={() => removeFromCart(item.menu_item_id!)} className="text-stone-400 hover:text-red-500">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1 text-[10px] text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-stone-900">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between items-baseline pt-1 border-t border-stone-200">
                <span className="font-bold text-stone-900">Total</span>
                <span className="font-black text-orange-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <input
                type="text"
                placeholder="Kitchen note (optional)..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500"
              />
              <button onClick={handleSendToKitchen} disabled={cartItems.length === 0 || sending}
                className={`w-full py-2.5 font-bold rounded-lg text-[10px] transition-transform active:scale-[0.99] ${
                  cartItems.length === 0 || sending ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" /> <span>{sending ? 'Sending...' : 'Send to Kitchen'}</span>
              </button>
            </div>
          </div>

          {/* Active Kitchen Tickets (owner oversight) - clickable for detail */}
          {activeOrders.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-800">
                <span>Active Tickets ({activeOrders.length})</span>
              </div>
              <div className="space-y-1">
                {activeOrders.map((ord) => (
                  <div key={ord.id} onClick={() => { setSelectedOrder(ord); setOrderDetailOpen(true); }}
                    className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-[10px] cursor-pointer hover:bg-orange-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-900 truncate">#{ord.order_number} &middot; {ord.table_number}</div>
                      <div className="text-stone-500">Cooking</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">Cooking</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Order Modal (table selection) */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSendModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md mx-4 transform scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm">Confirm Order</h3>
              <button onClick={() => setSendModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Table Number</label>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {tables.map((tbl) => {
                    const isSelected = sendTable === tbl;
                    return (
                      <button key={tbl} onClick={() => setSendTable(tbl)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
                          isSelected ? 'bg-orange-500 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {tbl}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 space-y-1 text-[10px] text-stone-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-stone-900">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between items-baseline pt-1 border-t border-stone-200">
                  <span className="font-bold text-stone-900">Total</span>
                  <span className="font-black text-orange-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={handleConfirmSend} disabled={sending}
                className={`w-full py-2.5 font-bold rounded-lg text-[10px] transition-transform active:scale-[0.99] ${
                  sending ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                }`}
              >
                {sending ? 'Sending...' : 'Confirm & Send'}
              </button>
              <button onClick={() => setSendModalOpen(false)} className="w-full py-2 text-[10px] font-bold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOrderDetailOpen(false)}>
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-md mx-4 transform scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm">Order #{selectedOrder.order_number}</h3>
              <button onClick={() => setOrderDetailOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-stone-700">Table</span>
                <span className="text-orange-600 font-bold">{selectedOrder.table_number}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-stone-700">Status</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                  selectedOrder.status === 'cooking' ? 'bg-amber-100 text-amber-800' :
                  selectedOrder.status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              {selectedOrder.customer_name && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-stone-700">Guest</span>
                  <span className="text-stone-600">{selectedOrder.customer_name}</span>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-stone-700">Notes</span>
                  <span className="text-stone-600 truncate max-w-[150px]">{selectedOrder.notes}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] border-t border-stone-100 pt-2 mt-2">
                <span className="font-bold text-stone-900">Total</span>
                <span className="font-black text-orange-600">${selectedOrder.grand_total.toFixed(2)}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-stone-100 mt-2">
                <div className="text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Items ({selectedOrder.items.length})</div>
                <div className="space-y-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-stone-900 truncate">{item.quantity}x {item.name}</span>
                      <span className="text-stone-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => setOrderDetailOpen(false)} className="w-full py-2 text-[10px] font-bold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
