import React, { useState } from 'react';
import { MenuItem, Order } from '../../types/restaurant';
import { Plus, Trash2, Tag, Settings2, ArrowRight, CheckCircle2, Flame, Store, X } from 'lucide-react';
import { menu, discounts, orders } from '../../services/api';

interface CMSViewProps {
  menuItems: MenuItem[];
  orders: Order[];
  user: { role: string; name: string };
  onMenuCreate: (body: any) => Promise<any>;
  onMenuUpdate: (id: string | number, body: any) => Promise<any>;
  onMenuDelete: (id: string | number) => Promise<void>;
  onDiscountApply: (body: { menu_item_id: number; discount_percent: number }) => Promise<void>;
  onDiscountRemove: (id: string | number) => Promise<void>;
}

export const CMSView: React.FC<CMSViewProps> = ({
  menuItems,
  orders: allOrders,
  user,
  onMenuCreate,
  onMenuUpdate,
  onMenuDelete,
  onDiscountApply,
  onDiscountRemove
}) => {
  const [tab, setTab] = useState<'menu' | 'discounts' | 'orders'>('menu');

  // Add/Edit item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'mains',
    description: '',
    price: '',
    original_price: '',
    discount_percent: '',
    image_url: '',
    is_available: true,
    prep_time_minutes: '15',
    ingredients: ''
  });

  const categories = ['mains', 'starters', 'combos', 'drinks', 'desserts'];

  const handleSaveItem = async () => {
    const body = {
      name: formData.name,
      category: formData.category,
      description: formData.description || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      image_url: formData.image_url || null,
      is_available: formData.is_available,
      prep_time_minutes: parseInt(formData.prep_time_minutes),
      ingredients: formData.ingredients || null
    };
    if (editingItemId) {
      await onMenuUpdate(editingItemId, body);
    } else {
      await onMenuCreate(body);
    }
    setItemModalOpen(false);
    setEditingItemId(null);
    setFormData({ name: '', category: 'mains', description: '', price: '', original_price: '', discount_percent: '', image_url: '', is_available: true, prep_time_minutes: '15', ingredients: '' });
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price.toString(),
      original_price: item.original_price ? item.original_price.toString() : '',
      discount_percent: item.discount_percent ? item.discount_percent.toString() : '',
      image_url: item.image_url || '',
      is_available: item.is_available === 1,
      prep_time_minutes: item.prep_time_minutes.toString(),
      ingredients: item.ingredients || ''
    });
    setItemModalOpen(true);
  };

  const deleteItem = async (id: string | number) => {
    if (!confirm('Delete this menu item?')) return;
    await onMenuDelete(id);
  };

  const applyDiscount = async (item: MenuItem) => {
    const percent = prompt(`Discount % for "${item.name}" (e.g. 20):`);
    if (percent === null) return;
    const p = parseInt(percent);
    if (isNaN(p) || p < 1 || p > 100) { alert('Enter a valid percentage 1-100'); return; }
    await onDiscountApply({ menu_item_id: item.id, discount_percent: p });
  };

  const removeDiscount = async (id: string | number) => {
    if (!confirm('Remove discount from this item?')) return;
    await onDiscountRemove(id);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-orange-500" />
          <h2 className="font-bold text-stone-900 text-sm sm:text-base">CMS</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('menu')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
              tab === 'menu' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            📋 Menu
          </button>
          <button
            onClick={() => setTab('discounts')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
              tab === 'discounts' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            🏷️ Discounts
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
              tab === 'orders' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            📦 Orders
          </button>
        </div>
      </div>

      {/* MENU TAB */}
      {tab === 'menu' && (
        <div className="space-y-3">
          <div className="flex justify-between items-end gap-2">
            <h3 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Manage Menu Items</h3>
            <button onClick={() => { setEditingItemId(null); setFormData({ name: '', category: 'mains', description: '', price: '', original_price: '', discount_percent: '', image_url: '', is_available: true, prep_time_minutes: '15', ingredients: '' }); setItemModalOpen(true); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-[10px] shadow-sm transition-colors cursor-pointer">
              <Plus className="w-3 h-3" /> <span>Add Item</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <div key={item.id} className="border border-stone-200 rounded-2xl p-3 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    item.discount_percent ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.discount_percent ? `${item.discount_percent}% OFF` : 'Available'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEditItem(item); }} className="p-1 text-stone-400 hover:text-stone-600">
                      <Settings2 className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-1 text-stone-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <img src={item.image_url} alt={item.name} className="w-full h-28 object-cover rounded-xl border border-stone-200 mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</h4>
                <div className="text-[10px] text-stone-500 mb-1">{item.description}</div>
                <div className="flex items-center gap-1 text-stone-900 font-bold text-sm">
                  <span>${item.price.toFixed(2)}</span>
                  {item.original_price && <span className="text-stone-400 line-through text-[10px] ml-1">${item.original_price.toFixed(2)}</span>}
                </div>
                <div className="mt-2 text-[9px] text-stone-500 font-medium">
                  {item.category} &middot; {item.prep_time_minutes}m prep &middot; {item.is_available ? 'Available' : 'Unavailable'}
                </div>
                <div className="mt-2 flex gap-1">
                  {item.discount_percent ? (
                    <button onClick={(e) => { e.stopPropagation(); removeDiscount(item.id); }}
                      className="flex-1 py-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                      Remove Discount
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); applyDiscount(item); }}
                      className="flex-1 py-1 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      Add Discount
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openEditItem(item); }}
                    className="flex-1 py-1 text-[9px] font-bold text-stone-600 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISCOUNTS TAB */}
      {tab === 'discounts' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">Manage Discounts</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.filter((i) => i.discount_percent && i.discount_percent > 0).map((item) => (
              <div key={item.id} className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-3 shadow-sm">
                <img src={item.image_url} alt={item.name} className="w-full h-28 object-cover rounded-xl border border-stone-200 mb-2" />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</h4>
                  <span className="text-amber-600 font-black text-sm">{item.discount_percent}% OFF</span>
                </div>
                <div className="text-[10px] text-stone-600">${item.original_price || item.price} → ${((item.price || 0) * (1 - (item.discount_percent || 0) / 100)).toFixed(2)}</div>
                <button onClick={() => removeDiscount(item.id)} className="mt-2 w-full py-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                  Remove Discount
                </button>
              </div>
            ))}
            {menuItems.filter((i) => !i.discount_percent || i.discount_percent <= 0).map((item) => (
              <div key={item.id} className="border border-stone-200 rounded-2xl p-3 shadow-sm bg-white">
                <img src={item.image_url} alt={item.name} className="w-full h-28 object-cover rounded-xl border border-stone-200 mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</h4>
                <div className="text-[10px] text-stone-500">${item.price.toFixed(2)}</div>
                <button onClick={() => applyDiscount(item)} className="mt-2 w-full py-1 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  Add Discount
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">All Orders</h3>
          </div>
          <div className="space-y-2">
            {allOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-[10px] text-stone-400">No orders yet</div>
            ) : (
              allOrders.map((ord) => (
                <div key={ord.id} className="border border-stone-200 rounded-2xl p-3 shadow-sm bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-stone-900 text-xs">#{ord.order_number}</span>
                      <span className="text-stone-500 text-[9px] ml-2">{ord.table_number}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      ord.status === 'cooking' ? 'bg-amber-100 text-amber-800' :
                      ord.status === 'ready' ? 'bg-green-100 text-green-800' :
                      ord.status === 'awaiting_approval' ? 'bg-orange-100 text-orange-800' :
                      ord.status === 'served' ? 'bg-green-100 text-green-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  {ord.customer_name && <div className="text-[9px] text-stone-600 mb-2">Guest: {ord.customer_name}</div>}
                  <div className="text-[9px] text-stone-500 font-medium">${ord.grand_total.toFixed(2)} &middot; {ord.items.length} item(s)</div>
                  <div className="mt-2 flex gap-1">
                    {ord.status === 'awaiting_approval' && (
                      <>
                        <button onClick={() => { }} disabled className="flex-1 py-1.5 text-[9px] font-bold text-stone-500 bg-stone-100 border border-stone-200 rounded-lg cursor-not-allowed">Approve</button>
                        <button onClick={() => { }} disabled className="flex-1 py-1.5 text-[9px] font-bold text-stone-500 bg-stone-100 border border-stone-200 rounded-lg cursor-not-allowed">Decline</button>
                      </>
                    )}
                    {ord.status === 'cooking' && (
                      <button onClick={() => orders.status(ord.id, 'ready')} className="flex-1 py-1.5 text-[9px] font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm cursor-pointer">Mark Ready</button>
                    )}
                    {ord.status === 'ready' && (
                      <button onClick={() => orders.status(ord.id, 'served')} className="flex-1 py-1.5 text-[9px] font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg shadow-sm cursor-pointer">Mark Served</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setItemModalOpen(false)}>
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-md mx-4 transform scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm">{editingItemId ? 'Edit Item' : 'Add Item'}</h3>
              <button onClick={() => setItemModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Item Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smokehouse Burger"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500">
                    {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Original Price ($)</label>
                  <input type="number" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Prep Time (min)</label>
                  <input type="number" value={formData.prep_time_minutes} onChange={(e) => setFormData({ ...formData, prep_time_minutes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Juicy double beef patty..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-bold text-stone-700">Available</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Image URL</label>
                <input type="text" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/burger.svg"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[10px] focus:outline-hidden focus:border-orange-500" />
              </div>
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <button type="submit" className="w-full py-2 font-bold rounded-lg text-[10px] bg-orange-500 hover:bg-orange-600 text-white shadow-sm cursor-pointer">
                  {editingItemId ? 'Save Changes' : 'Create Item'}
                </button>
                <button type="button" onClick={() => setItemModalOpen(false)} className="w-full py-2 text-[10px] font-bold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
