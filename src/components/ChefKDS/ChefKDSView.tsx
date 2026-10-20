import React, { useState, useEffect } from 'react';
import { 
  Order, 
  OrderStatus 
} from '../../types/restaurant';
import { 
  ChefHat, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Check, 
  BellRing, 
  Volume2, 
  AlertCircle, 
  Sparkles,
  Utensils,
  CookingPot,
  ArrowRight
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

interface ChefKDSViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onToggleItemChecked: (orderId: string, itemId: string) => void;
  onChefCallCounter: (message: string) => void;
  seniorMode: boolean;
}

export const ChefKDSView: React.FC<ChefKDSViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onToggleItemChecked,
  onChefCallCounter,
  seniorMode
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'cooking' | 'ready'>('all');
  const [now, setNow] = useState<number>(Date.now());

  // Keep live timers accurate every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled');

  const filteredOrders = activeOrders.filter((o) => {
    if (filterTab === 'all') return true;
    return o.status === filterTab;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  const handleStartCooking = (order: Order) => {
    onUpdateOrderStatus(order.id, 'cooking');
    audioService.playKitchenBell();
  };

  const handleMarkReady = (order: Order) => {
    onUpdateOrderStatus(order.id, 'ready');
    // Ring front of house bell & announce
    audioService.playOrderReadyChime();
    const readyMsg = `Order number ${order.orderNumber} for ${order.tableNumber} is ready to serve!`;
    audioService.speakOrderToChef(readyMsg);
    onChefCallCounter(readyMsg);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.4 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleCompleteServe = (order: Order) => {
    onUpdateOrderStatus(order.id, 'served');
  };

  const getElapsedTimeText = (startTime: number) => {
    const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Chef Station Top Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white border-2 border-orange-500/30 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-2xl tracking-tight text-white">
                Chef's Kitchen Display System (KDS)
              </h2>
              <span className="bg-red-500/90 text-white font-extrabold text-2xs uppercase px-2 py-0.5 rounded-full animate-pulse">
                Live Kitchen Feed
              </span>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm">
              Tickets arrive here with auto-chime from Papaw's counter. Check off items as they finish!
            </p>
          </div>
        </div>

        {/* Quick Chef Shouts back to Papaw */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const msg = 'Chef: Kitchen is working on orders, everything is on schedule!';
              audioService.speakOrderToChef(msg);
              onChefCallCounter(msg);
            }}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>"All On Schedule!"</span>
          </button>

          <button
            onClick={() => audioService.playOrderReadyChime()}
            className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>Ring Front Bell 🔔</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for Chef */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-stone-100 border border-stone-200 rounded-2xl">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Active Tickets ({activeOrders.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>⏳ New Waiting</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-2xs px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('cooking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'cooking'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🍳 On The Stove</span>
            {cookingCount > 0 && (
              <span className="bg-amber-500 text-white text-2xs px-1.5 py-0.2 rounded-full font-bold">
                {cookingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('ready')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'ready'
                ? 'bg-green-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🔔 Ready for Pickup</span>
            {readyCount > 0 && (
              <span className="bg-green-500 text-white text-2xs px-1.5 py-0.2 rounded-full font-bold">
                {readyCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Tip: Tap any item on a ticket to cross it off as you plate it.
        </div>
      </div>

      {/* Tickets Board Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-stone-900 text-xl">
            Kitchen Rail is Clean!
          </h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            No active orders waiting in this category. New tickets created by Papaw at the counter will appear here with an alert chime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isRush = order.priority === 'rush';
            const isCooking = order.status === 'cooking';
            const isReady = order.status === 'ready';
            const isPending = order.status === 'pending';
            const allItemsChecked = order.items.every((i) => i.checkedInKitchen);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-3 shadow-md flex flex-col justify-between overflow-hidden transition-all ${
                  isRush
                    ? 'border-red-500 ring-4 ring-red-400/20'
                    : isReady
                    ? 'border-green-500 ring-4 ring-green-400/20'
                    : isCooking
                    ? 'border-amber-400'
                    : 'border-orange-300'
                }`}
              >
                {/* Ticket Top Header */}
                <div
                  className={`p-4 border-b-2 flex items-center justify-between ${
                    isRush
                      ? 'bg-red-50 border-red-200'
                      : isReady
                      ? 'bg-green-50 border-green-200'
                      : isCooking
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-orange-50/70 border-orange-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-stone-900 text-xl">
                        #{order.orderNumber}
                      </span>
                      <span className="font-extrabold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg text-xs border border-orange-200">
                        {order.tableNumber}
                      </span>
                      {isRush && (
                        <span className="bg-red-600 text-white font-black text-2xs uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce">
                          <Flame className="w-3 h-3" />
                          RUSH
                        </span>
                      )}
                    </div>
                    {order.customerName && (
                      <span className="text-xs text-stone-500 font-medium">
                        Guest: {order.customerName} ({order.guestCount || 2} ppl)
                      </span>
                    )}
                  </div>

                  {/* Timer Badge */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-mono font-bold text-stone-800 text-sm bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      <span>
                        {order.cookingStartedAt
                          ? getElapsedTimeText(order.cookingStartedAt)
                          : getElapsedTimeText(order.createdAt)}
                      </span>
                    </div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">
                      {isCooking ? 'Cooking Time' : 'Waiting Time'}
                    </span>
                  </div>
                </div>

                {/* Special Kitchen Notes Banner */}
                {order.notes && (
                  <div className="mx-4 mt-3 p-2.5 bg-yellow-50 border border-yellow-300 rounded-2xl flex items-start gap-2 text-xs text-yellow-950 font-semibold">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <span>Chef Note: {order.notes}</span>
                  </div>
                )}

                {/* Ticket Items List with interactive plating checkboxes */}
                <div className="p-4 flex-1 space-y-2.5">
                  <div className="text-2xs font-extrabold text-stone-400 uppercase tracking-wider">
                    Plating Checklist ({order.items.filter((i) => i.checkedInKitchen).length}/{order.items.length}):
                  </div>

                  {order.items.map((item) => {
                    const isChecked = item.checkedInKitchen;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onToggleItemChecked(order.id, item.id)}
                        className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-stone-50 border-stone-200 text-stone-400 line-through opacity-70'
                            : 'bg-white border-orange-100 hover:border-orange-300 text-stone-900 shadow-2xs'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-orange-300 bg-orange-50 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-stone-900">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                          {item.specialInstructions && (
                            <span className="text-2xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-1">
                              👉 {item.specialInstructions}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Action Footer */}
                <div className="p-4 bg-stone-50/80 border-t border-stone-200 space-y-2">
                  {isPending && (
                    <button
                      onClick={() => handleStartCooking(order)}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CookingPot className="w-4 h-4" />
                      <span>START COOKING ORDER</span>
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => handleMarkReady(order)}
                      className={`w-full py-3.5 font-black rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] cursor-pointer ${
                        allItemsChecked
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/30 ring-2 ring-green-400 animate-pulse'
                          : 'bg-stone-800 hover:bg-stone-900 text-white'
                      }`}
                    >
                      <BellRing className="w-4 h-4 text-amber-300" />
                      <span>MARK READY & RING PAPAW 🔔</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => handleCompleteServe(order)}
                      className="w-full py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Delivered / Served to Table</span>
                    </button>
                  )}

                  {/* Re-announce button if chef needs Papaw */}
                  <div className="flex items-center justify-between text-2xs text-stone-500 pt-1">
                    <span>Calls from Papaw: {order.calledChefCount}</span>
                    <button
                      onClick={() => {
                        const callMsg = `Counter, Table ${order.tableNumber} order ${order.orderNumber} is on the way!`;
                        audioService.speakOrderToChef(callMsg);
                      }}
                      className="text-orange-600 hover:underline font-bold cursor-pointer"
                    >
                      Broadcast Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
