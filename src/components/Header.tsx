import React from 'react';
import { 
  Store, 
  ChefHat, 
  UtensilsCrossed, 
  BarChart3, 
  BellRing, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  Mic, 
  Settings2,
  Flame
} from 'lucide-react';
import { audioService } from '../services/audioService';

export type AppView = 'pos' | 'kds' | 'menu' | 'analytics' | 'cms';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  pendingKitchenCount: number;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenIntercom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  pendingKitchenCount,
  seniorMode,
  onToggleSeniorMode,
  soundEnabled,
  onToggleSound,
  onOpenIntercom
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Minimal Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg tracking-tight leading-none">
                  Papaw's Bistro
                </h1>
                <span className="text-3xs uppercase font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                  Smart POS & CMS
                </span>
              </div>
            </div>
          </div>

          {/* Clean, Spacious Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
            <button
              onClick={() => onViewChange('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer whitespace-nowrap ${
                currentView === 'pos'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>POS & Bell</span>
            </button>

            <button
              onClick={() => onViewChange('kds')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer whitespace-nowrap relative ${
                currentView === 'kds'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen (KDS)</span>
              {pendingKitchenCount > 0 && (
                <span className="bg-red-500 text-white text-3xs px-1.5 py-0.2 rounded-full font-bold">
                  {pendingKitchenCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer whitespace-nowrap ${
                currentView === 'menu'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Customer Menu</span>
            </button>

            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sales & Reports</span>
            </button>

            <button
              onClick={() => onViewChange('cms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer whitespace-nowrap ${
                currentView === 'cms'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Food & Sales CMS</span>
            </button>
          </nav>

          {/* Minimal Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenIntercom}
              title="Speak or call chef"
              className="p-2 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold"
            >
              <Mic className="w-4 h-4 text-orange-500" />
              <span className="hidden lg:inline">Intercom</span>
            </button>

            <button
              onClick={() => audioService.playKitchenBell()}
              title="Ring Counter Bell"
              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl border border-orange-200 text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bell 🔔</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleSeniorMode}
              title="Toggle Large Text Mode"
              className={`p-2 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                seniorMode ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
