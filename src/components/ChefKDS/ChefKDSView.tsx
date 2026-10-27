import React, { useState, useEffect } from 'react';
import { Order } from '../../types/restaurant';
import { ChefHat, Clock, CheckCircle2, Check, BellRing, Volume2, AlertCircle, Utensils } from 'lucide-react';
import { orders } from '../../services/api';
import confetti from 'canvas-confetti';

interface ChefKDSViewProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'cooking' | 'ready' | 'served') => void;
}

export const ChefKDSView: React.FC<ChefKDSViewProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const [filterTab, setFilterTab] = useState<'cooking' | 'ready'>('cooking');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter((o) => o.status === 'cooking' || o.status === 'ready');
  const filteredOrders = activeOrders.filter((o) => (filterTab === 'cooking' ? o.status === 'cooking' : o.status === 'ready'));

  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  const handleMarkReady = async (order: Order) => {
    await onUpdateOrderStatus(String(order.id), 'ready');
    try { confetti({ particleCount: 50, spread: 70, origin: { y: 0.4 } }); } catch {}
  };

  const handleCompleteServe = async (order: Order) => {
    await onUpdateOrderStatus(String(order.id), 'served');
  };

  const getElapsedText = (start: number) => {
    const s = Math.max(0, Math.floor((now - start) / 1000));
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white border-2 border-orange-500/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-black text-stone-50 text-xl tracking-tight">Chef's Kitchen</h2>
            <p className="text-stone-300 text-[10px]">Approved tickets appear here. Plate items, then mark ready.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => {}} className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-600 rounded-xl font-bold text-[10px] flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> "On Schedule"
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 rounded-xl">
          <button onClick={() => setFilterTab('cooking')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            filterTab === 'cooking' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-200'
          }`}>
            🍳 Cooking ({cookingCount})
          </button>
          <button onClick={() => setFilterTab('ready')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            filterTab === 'ready' ? 'bg-green-600 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-200'
          }`}>
            🔔 Ready ({readyCount})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-10 text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Kitchen Rail Clean</h3>
          <p className="text-[10px] text-stone-500 max-w-md mx-auto">No active tickets. Approved orders from the counter appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOrders.map((order) => {
            const isCooking = order.status === 'cooking';
            const isReady = order.status === 'ready';
            const allChecked = order.items.every((i) => i.checked_in_kitchen);
            return (
              <div key={order.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                isReady ? 'border-green-500 ring-2 ring-green-400/20' : isCooking ? 'border-amber-400' : 'border-orange-300'
              }`}>
                <div className={`p-3 border-b flex items-center justify-between ${
                  isReady ? 'bg-green-50 border-green-200' : isCooking ? 'bg-amber-50 border-amber-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-stone-900 text-sm">#{order.order_number}</span>
                      <span className="text-orange-600 font-bold text-[10px] bg-orange-100 px-2 py-0.5 rounded border border-orange-200">{order.table_number}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{order.items.length} item(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-stone-800 text-[10px] bg-white px-2 py-1 rounded border border-stone-200">
                      {getElapsedText(order.cooking_started_at ? new Date(order.cooking_started_at).getTime() : new Date(order.created_at).getTime())}
                    </div>
                  </div>
                </div>

                <div className="p-3 flex-1 space-y-1.5">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Items ({order.items.filter((i) => i.checked_in_kitchen).length}/{order.items.length})
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      item.checked_in_kitchen ? 'bg-stone-50 border-stone-200 text-stone-400 line-through opacity-70' : 'bg-white border-orange-100 hover:border-orange-300 text-stone-900 shadow-xs'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          item.checked_in_kitchen ? 'bg-green-600 border-green-600 text-white' : 'border-orange-300 bg-orange-50'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="font-bold text-[10px] truncate">{item.quantity}x {item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-stone-50/60 border-t border-stone-200 space-y-1">
                  {isCooking && (
                    <button onClick={() => handleMarkReady(order)}
                      className={`w-full py-2 font-bold rounded-lg text-[10px] transition-all active:scale-[0.98] ${
                        allChecked ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30 ring-1 ring-green-400 animate-pulse' : 'bg-stone-800 hover:bg-stone-900 text-white'
                      }`}
                    >
                      <BellRing className="w-3 h-3 text-amber-300" /> <span>Mark Ready</span>
                    </button>
                  )}
                  {isReady && (
                    <button onClick={() => handleCompleteServe(order)}
                      className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-600" /> <span>Served</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
