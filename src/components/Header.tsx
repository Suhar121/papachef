import React, { useState } from 'react';
import { Store, ChefHat, UtensilsCrossed, Menu, X, User, Shield, Layout, LogOut, Flame, Bell, Check, ChevronLeft, Settings2 } from 'lucide-react';
import { auth, notifications } from '../services/api';

export type AppView = 'pos' | 'kds' | 'menu' | 'cms';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  allowedViews: AppView[];
  userRole: 'owner' | 'chef' | 'customer';
  userName: string;
  unreadCount: number;
  notifications: any[];
  onMarkRead: (id: number) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.FC<any> }[] = [
  { id: 'pos', label: 'Add Order', icon: Store },
  { id: 'kds', label: 'Kitchen', icon: ChefHat },
  { id: 'menu', label: 'Order Food', icon: UtensilsCrossed },
  { id: 'cms', label: 'CMS', icon: Settings2 }
];

const ROLE_ICONS: Record<'owner' | 'chef' | 'customer', React.FC<any>> = {
  owner: Shield,
  chef: ChefHat,
  customer: Layout
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  allowedViews,
  userRole,
  userName,
  unreadCount,
  notifications,
  onMarkRead,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const closeMenu = () => setIsMenuOpen(false);
  const closeAccount = () => setIsAccountOpen(false);
  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const toggleAccount = () => setIsAccountOpen((p) => !p);
  const toggleNotif = () => setIsNotifOpen((p) => !p);

  const RoleIcon = ROLE_ICONS[userRole];
  const visibleNav = NAV_ITEMS.filter((i) => allowedViews.includes(i.id));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5 text-amber-200" />
              </div>
              <h1 className="font-heading font-black text-stone-900 text-sm sm:text-base tracking-tight">
                Papaw's Bistro
              </h1>
            </div>

            <nav className="hidden sm:flex items-center gap-1.5 overflow-x-auto p-1 bg-stone-100 rounded-2xl border border-stone-200/80 min-w-0">
              {visibleNav.map((item) => {
                const ActiveIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onViewChange(item.id); closeMenu(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer whitespace-nowrap transition-colors ${
                      currentView === item.id ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    <ActiveIcon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleNotif}
                className={`relative p-2 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <button
                onClick={toggleAccount}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border bg-stone-900 text-white"
              >
                <RoleIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{userName} &middot;</span>
                <span className="inline sm:hidden">{userRole}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end">
          <div className="w-full sm:w-80 mt-4 mr-2">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm">Notifications</h3>
                <button onClick={toggleNotif} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[10px] text-stone-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`px-4 py-3 border-b border-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors ${
                        !n.read ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                            {n.title}
                          </div>
                          <div className="text-sm text-stone-900 leading-snug line-clamp-2">{n.message}</div>
                          <div className="text-[9px] text-stone-400 mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 text-center text-[10px] text-stone-500 border-t border-stone-100">
                Mark as read to dismiss
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-stone-900 text-white" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-stone-100 text-lg">Papaw's Bistro</span>
            </div>
            <button onClick={closeMenu} className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-4">
            <h2 className="text-[10px] uppercase font-extrabold text-stone-500 tracking-wider mb-3">Station</h2>
            {visibleNav.map((item) => {
              const ActiveIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { onViewChange(item.id); closeMenu(); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-3 mb-1 ${
                    currentView === item.id ? 'bg-orange-600 text-white shadow-lg' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <ActiveIcon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto px-6 py-6 border-t border-stone-800">
            <button
              onClick={() => { onLogout(); closeMenu(); }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-50/30 transition-colors cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Dropdown */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end">
          <div className="w-full sm:w-60 mt-4 mr-2">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <button onClick={closeAccount} className="text-stone-400 hover:text-stone-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Signed in</p>
                  <p className="text-xs font-bold text-stone-900">{userName}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{userRole}</p>
                </div>
              </div>
              {(['owner', 'chef', 'customer'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => { onLogout(); closeAccount(); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold transition-colors cursor-pointer text-stone-700 hover:bg-stone-100"
                >
                  {role === 'owner' ? 'Owner' : role === 'chef' ? 'Chef' : 'Customer'}
                </button>
              ))}
              <button
                onClick={() => { onLogout(); closeAccount(); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 border-t border-stone-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
