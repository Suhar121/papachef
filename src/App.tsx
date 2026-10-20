import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  PromoOffer, 
  Order, 
  OrderStatus, 
  SalesAnalytics 
} from './types/restaurant';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_OFFERS, 
  INITIAL_ORDERS, 
  INITIAL_ANALYTICS 
} from './data/mockData';
import { Header, AppView } from './components/Header';
import { OwnerPOSView } from './components/OwnerPOS/OwnerPOSView';
import { ChefKDSView } from './components/ChefKDS/ChefKDSView';
import { CustomerMenuView } from './components/CustomerMenu/CustomerMenuView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { CMSView } from './components/CMS/CMSView';
import { IntercomModal } from './components/IntercomModal';
import { audioService } from './services/audioService';
import { BellRing, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('pos');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [offers, setOffers] = useState<PromoOffer[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [analytics, setAnalytics] = useState<SalesAnalytics>(INITIAL_ANALYTICS);
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isIntercomOpen, setIsIntercomOpen] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<{ message: string; from: 'owner' | 'chef' } | null>(null);

  useEffect(() => {
    audioService.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
    if (next) {
      audioService.playKitchenBell();
    }
  };

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => !prev);
  };

  // Add new order
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActiveAlert({
      message: `🔔 New order #${newOrder.orderNumber} for ${newOrder.tableNumber} sent to kitchen with bell ring!`,
      from: 'owner'
    });
    setTimeout(() => setActiveAlert(null), 5000);
  };

  // Order status transition
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updated: Order = { ...order, status };
        if (status === 'cooking' && !order.cookingStartedAt) {
          updated.cookingStartedAt = Date.now();
        } else if (status === 'ready') {
          updated.readyAt = Date.now();
        } else if (status === 'served') {
          updated.completedAt = Date.now();
        }
        return updated;
      })
    );

    if (status === 'ready') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setActiveAlert({
          message: `🍽️ Order #${order.orderNumber} (${order.tableNumber}) is READY for pickup!`,
          from: 'chef'
        });
        setTimeout(() => setActiveAlert(null), 6000);
      }
    }
  };

  const handleToggleItemChecked = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((i) =>
            i.id === itemId ? { ...i, checkedInKitchen: !i.checkedInKitchen } : i
          )
        };
      })
    );
  };

  const handleCallChefAgain = (orderId: string, customNote?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    audioService.playKitchenBell();
    const shoutMsg = customNote || `Chef! Table ${order.tableNumber} is asking for update on order ${order.orderNumber}!`;
    audioService.speakOrderToChef(shoutMsg);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              calledChefCount: o.calledChefCount + 1,
              lastChefCallMessage: shoutMsg
            }
          : o
      )
    );

    setActiveAlert({
      message: `🔔 Called chef for Order #${order.orderNumber} (${order.tableNumber})!`,
      from: 'owner'
    });
    setTimeout(() => setActiveAlert(null), 4000);
  };

  const handleChefCallCounter = (message: string) => {
    setActiveAlert({
      message: `👨‍🍳 ${message}`,
      from: 'chef'
    });
    setTimeout(() => setActiveAlert(null), 6000);
  };

  const handleBroadcastMessage = (message: string) => {
    setActiveAlert({
      message: `📢 Broadcast: "${message}"`,
      from: 'owner'
    });
    setTimeout(() => setActiveAlert(null), 5000);
  };

  // CMS Handlers
  const handleAddMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [item, ...prev]);
    setActiveAlert({
      message: `✓ Added "${item.name}" to menu catalog!`,
      from: 'owner'
    });
    setTimeout(() => setActiveAlert(null), 4000);
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) => prev.map((i) => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddOffer = (newOffer: PromoOffer) => {
    setOffers((prev) => [newOffer, ...prev]);
  };

  const handleToggleOffer = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const handleDeleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const handleAddManualSale = (newSaleOrder: Order) => {
    setOrders((prev) => [newSaleOrder, ...prev]);
    setActiveAlert({
      message: `✓ Recorded manual sale of $${newSaleOrder.grandTotal.toFixed(2)}`,
      from: 'owner'
    });
    setTimeout(() => setActiveAlert(null), 4000);
  };

  const pendingKitchenCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className={`min-h-screen bg-[#faf8f5] text-stone-900 transition-all ${seniorMode ? 'text-base font-medium' : 'text-sm'}`}>
      {/* Minimal Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingKitchenCount={pendingKitchenCount}
        seniorMode={seniorMode}
        onToggleSeniorMode={toggleSeniorMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenIntercom={() => setIsIntercomOpen(true)}
      />

      {/* Floating Announcement Banner */}
      {activeAlert && (
        <div className="fixed top-16 right-4 z-50 max-w-sm bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl border border-orange-400 flex items-start gap-2.5 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-3xs uppercase font-extrabold text-orange-400">
              {activeAlert.from === 'chef' ? 'Kitchen Notice' : 'Counter Notice'}
            </div>
            <div className="text-xs font-bold text-white mt-0.5 leading-snug line-clamp-2">
              {activeAlert.message}
            </div>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-stone-400 hover:text-white p-1 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'pos' && (
          <OwnerPOSView
            menuItems={menuItems}
            offers={offers}
            orders={orders}
            onCreateOrder={handleCreateOrder}
            onCallChefAgain={handleCallChefAgain}
            onOpenIntercom={() => setIsIntercomOpen(true)}
            seniorMode={seniorMode}
          />
        )}

        {currentView === 'kds' && (
          <ChefKDSView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleItemChecked={handleToggleItemChecked}
            onChefCallCounter={handleChefCallCounter}
            seniorMode={seniorMode}
          />
        )}

        {currentView === 'menu' && (
          <CustomerMenuView
            menuItems={menuItems}
            offers={offers}
            onCustomerPlaceOrder={handleCreateOrder}
            seniorMode={seniorMode}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            orders={orders}
            seniorMode={seniorMode}
          />
        )}

        {currentView === 'cms' && (
          <CMSView
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            offers={offers}
            onAddOffer={handleAddOffer}
            onToggleOffer={handleToggleOffer}
            onDeleteOffer={handleDeleteOffer}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddManualSale={handleAddManualSale}
            seniorMode={seniorMode}
          />
        )}
      </main>

      {/* Intercom Voice Modal */}
      <IntercomModal
        isOpen={isIntercomOpen}
        onClose={() => setIsIntercomOpen(false)}
        onBroadcastMessage={handleBroadcastMessage}
        seniorMode={seniorMode}
      />
    </div>
  );
}
