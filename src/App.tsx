import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, Order } from './types/restaurant';
import { Header } from './components/Header';
import { OwnerPOSView } from './components/OwnerPOS/OwnerPOSView';
import { ChefKDSView } from './components/ChefKDS/ChefKDSView';
import { CustomerMenuView } from './components/CustomerMenu/CustomerMenuView';
import { CMSView } from './components/CMS/CMSView';
import { auth, orders, notifications, menu, discounts } from './services/api';
import { Shield, ChefHat, Layout, LogOut, Flame, Bell } from 'lucide-react';
import { audioService } from './services/audioService';

export type AppView = 'pos' | 'kds' | 'menu' | 'cms';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'chef' | 'customer';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('pos');
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const lastOrderCount = useRef<number>(0);
  const lastNotifCount = useRef<number>(0);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const roleViews: Record<'owner' | 'chef' | 'customer', AppView[]> = {
    owner: ['pos', 'kds', 'cms'],
    chef: ['kds'],
    customer: ['menu']
  };

  const allowedViews = roleViews[user?.role ?? 'customer'];

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, notifData, menuData] = await Promise.all([
        orders.list(),
        notifications.list(),
        menu.list()
      ]);
      setOrdersList(ordersData);
      setNotificationsList(notifData);
      setUnreadCount(notifData.filter((n: any) => !n.read).length);
      setMenuItems(menuData);

      // Ring bell + alert when a NEW order arrives (owner/chef side)
      if (ordersData.length > lastOrderCount.current && lastOrderCount.current > 0) {
        audioService.playKitchenBell();
      }
      lastOrderCount.current = ordersData.length;

      // Bell when a NEW notification arrives
      if (notifData.length > lastNotifCount.current && lastNotifCount.current > 0) {
        audioService.playKitchenBell();
      }
      lastNotifCount.current = notifData.length;
    } catch {
      // data load failed; views show empty
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { user: u } = await auth.me();
        if (mounted) setUser(u as User);
      } catch {
        // not authenticated
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchData();

    // Poll every 3 seconds so updates appear without refreshing
    pollInterval.current = setInterval(fetchData, 3000);
    return () => {
      mounted = false;
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [user, fetchData]);

  const handleLogin = useCallback(async (name: string, email: string, password: string, role: 'owner' | 'chef' | 'customer') => {
    const { user: u } = await auth.login({ email, password });
    setUser(u as User);
    setCurrentView(roleViews[role as 'owner' | 'chef' | 'customer'][0]);
    lastOrderCount.current = 0;
    lastNotifCount.current = 0;
    await fetchData();
  }, [fetchData]);

  const handleSignup = useCallback(async (name: string, email: string, password: string, role: 'owner' | 'chef' | 'customer') => {
    const { user: u } = await auth.signup({ name, email, password, role });
    setUser(u as User);
    setCurrentView(roleViews[role as 'owner' | 'chef' | 'customer'][0]);
    lastOrderCount.current = 0;
    lastNotifCount.current = 0;
    await fetchData();
  }, [fetchData]);

  const handleLogout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    setCurrentView('pos');
    setOrdersList([]);
    setNotificationsList([]);
    setUnreadCount(0);
    lastOrderCount.current = 0;
    lastNotifCount.current = 0;
    if (pollInterval.current) clearInterval(pollInterval.current);
  }, []);

  const handleCreateOrder = useCallback(async (newOrder: Omit<Order, 'id' | 'order_number' | 'status' | 'created_at'>, fromCustomer = false) => {
    const created = await orders.create({
      table_number: newOrder.table_number,
      customer_name: newOrder.customer_name,
      items: newOrder.items.map((i) => ({ menu_item_id: i.menu_item_id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal: newOrder.subtotal,
      tax: newOrder.tax,
      grand_total: newOrder.grand_total,
      notes: newOrder.notes,
      priority: newOrder.priority
    });
    await fetchData();
    return created.order;
  }, [fetchData]);

  const handleApproveOrder = useCallback(async (id: string) => {
    await orders.approve(id);
    await fetchData();
  }, [fetchData]);

  const handleRejectOrder = useCallback(async (id: string) => {
    await orders.reject(id);
    await fetchData();
  }, [fetchData]);

  const handleUpdateOrderStatus = useCallback(async (id: string, status: 'cooking' | 'ready' | 'served') => {
    await orders.status(id, status);
    await fetchData();
  }, [fetchData]);

  const handleMenuCreate = useCallback(async (body: any) => {
    const item = await menu.create(body);
    await fetchData();
    return item;
  }, [fetchData]);

  const handleMenuUpdate = useCallback(async (id: string | number, body: any) => {
    const item = await menu.update(id, body);
    await fetchData();
    return item;
  }, [fetchData]);

  const handleMenuDelete = useCallback(async (id: string | number) => {
    await menu.delete(id);
    await fetchData();
  }, [fetchData]);

  const handleDiscountApply = useCallback(async (body: { menu_item_id: number; discount_percent: number }) => {
    await discounts.apply(body);
    await fetchData();
  }, [fetchData]);

  const handleDiscountRemove = useCallback(async (id: string | number) => {
    await discounts.remove(id);
    await fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginSignup onLogin={handleLogin} onSignup={handleSignup} />;
  }

  if (!allowedViews?.includes(currentView)) {
    setCurrentView(allowedViews[0]);
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        allowedViews={allowedViews}
        userRole={user.role}
        userName={user.name}
        unreadCount={unreadCount}
        notifications={notificationsList}
        onMarkRead={(id) => {
          notifications.markRead(id);
          setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read: 1 } : n)));
          setUnreadCount((c) => (c > 0 ? c - 1 : 0));
        }}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentView === 'pos' && (
          <OwnerPOSView
            menuItems={menuItems}
            orders={ordersList}
            user={user}
            onCreateOrder={handleCreateOrder}
            onApproveOrder={handleApproveOrder}
            onRejectOrder={handleRejectOrder}
          />
        )}

        {currentView === 'kds' && (
          <ChefKDSView
            orders={ordersList}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentView === 'cms' && (
          <CMSView
            menuItems={menuItems}
            orders={ordersList}
            user={user}
            onMenuCreate={handleMenuCreate}
            onMenuUpdate={handleMenuUpdate}
            onMenuDelete={handleMenuDelete}
            onDiscountApply={handleDiscountApply}
            onDiscountRemove={handleDiscountRemove}
          />
        )}

        {currentView === 'menu' && (
          <CustomerMenuView
            menuItems={menuItems}
            orders={ordersList}
            user={user}
            onCustomerPlaceOrder={(o) => handleCreateOrder(o, true)}
          />
        )}
      </main>
    </div>
  );
}

function LoginSignup({ onLogin, onSignup }: { onLogin: any; onSignup: any }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'chef' | 'customer'>('customer');
  const [error, setError] = useState('');

  const roles = [
    { id: 'owner' as const, label: 'Owner', icon: Shield },
    { id: 'chef' as const, label: 'Chef', icon: ChefHat },
    { id: 'customer' as const, label: 'Customer', icon: Layout }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await onLogin(name, email, password, role);
      } else {
        await onSignup(name, email, password, role);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-4">
            <Flame className="w-9 h-9 text-amber-200" />
          </div>
          <h2 className="font-heading font-black text-stone-900 text-2xl tracking-tight">Papaw's Bistro</h2>
          <p className="text-stone-500 text-sm mt-1">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Your Name</label>
                <input
                  type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Papaw"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Select Your Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const RoleIcon = r.icon;
                    return (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl font-bold text-xs transition-all border ${
                          role === r.id
                            ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-md'
                            : 'border-stone-200 text-stone-600 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer'
                        }`}
                      >
                        <RoleIcon className="w-5 h-5" />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@papaws.com"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-hidden focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm shadow-xs transition-transform active:scale-[0.99]"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[10px] text-stone-500">
          Don&rsquo;t have an account?{' '}
          <button onClick={() => setMode('signup')} className="text-orange-600 font-bold underline underline-offset-4">Sign up</button>
        </p>
        <p className="text-center text-[10px] text-stone-400 uppercase tracking-wider">
          Default users: owner@papaws.com / chef@papaws.com / customer@papaws.com (password: same as prefix)
        </p>
      </div>
    </div>
  );
}
