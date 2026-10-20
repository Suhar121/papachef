import React, { useState } from 'react';
import { 
  MenuItem, 
  PromoOffer, 
  Order, 
  Category, 
  OrderStatus 
} from '../../types/restaurant';
import { 
  Utensils, 
  DollarSign, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Tag, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Percent,
  Sparkles
} from 'lucide-react';

interface CMSViewProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  offers: PromoOffer[];
  onAddOffer: (offer: PromoOffer) => void;
  onToggleOffer: (id: string) => void;
  onDeleteOffer: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddManualSale: (order: Order) => void;
  seniorMode: boolean;
}

export const CMSView: React.FC<CMSViewProps> = ({
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  offers,
  onAddOffer,
  onToggleOffer,
  onDeleteOffer,
  orders,
  onUpdateOrderStatus,
  onAddManualSale,
  seniorMode
}) => {
  const [activeTab, setActiveTab] = useState<'food' | 'sales' | 'offers'>('food');
  const [searchFood, setSearchFood] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  // Food Form Modal state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuItem['category']>('mains');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formDiscountPercent, setFormDiscountPercent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('12');
  const [formSpicyLevel, setFormSpicyLevel] = useState<0 | 1 | 2 | 3>(0);
  const [formIsVeg, setFormIsVeg] = useState(false);
  const [formIngredients, setFormIngredients] = useState('');

  // Sales Ledger state
  const [searchSales, setSearchSales] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState<'all' | OrderStatus>('all');
  const [isManualSaleOpen, setIsManualSaleOpen] = useState(false);
  const [manualTable, setManualTable] = useState('Table 1');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerTagline, setOfferTagline] = useState('');
  const [offerDiscountType, setOfferDiscountType] = useState<'percent' | 'flat'>('percent');
  const [offerValue, setOfferValue] = useState('20');
  const [offerBadge, setOfferBadge] = useState('20% OFF');

  // Filter food items
  const filteredFood = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchFood.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFood.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter sales
  const filteredSales = orders.filter((o) => {
    const matchesStatus = salesStatusFilter === 'all' || o.status === salesStatusFilter;
    const matchesQuery = o.orderNumber.toString().includes(searchSales) ||
      o.tableNumber.toLowerCase().includes(searchSales.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchSales.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const openAddFoodModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('mains');
    setFormDescription('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormDiscountPercent('');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setFormPrepTime('12');
    setFormSpicyLevel(0);
    setFormIsVeg(false);
    setFormIngredients('Fresh produce, Herbs, Olive oil');
    setIsFoodModalOpen(true);
  };

  const openEditFoodModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPrice(item.price.toString());
    setFormOriginalPrice(item.originalPrice ? item.originalPrice.toString() : '');
    setFormDiscountPercent(item.discountPercent ? item.discountPercent.toString() : '');
    setFormImageUrl(item.imageUrl);
    setFormPrepTime(item.prepTimeMinutes.toString());
    setFormSpicyLevel(item.spicyLevel || 0);
    setFormIsVeg(Boolean(item.isVegetarian));
    setFormIngredients(item.ingredients ? item.ingredients.join(', ') : '');
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const parsedPrice = parseFloat(formPrice) || 0;
    const parsedOriginalPrice = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;
    const parsedDiscountPercent = formDiscountPercent ? parseInt(formDiscountPercent, 10) : undefined;
    const ingredientsArray = formIngredients
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated: MenuItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        discountPercent: parsedDiscountPercent,
        discountLabel: parsedDiscountPercent ? `${parsedDiscountPercent}% OFF` : undefined,
        imageUrl: formImageUrl.trim() || editingItem.imageUrl,
        prepTimeMinutes: parseInt(formPrepTime, 10) || 10,
        spicyLevel: formSpicyLevel,
        isVegetarian: formIsVeg,
        ingredients: ingredientsArray.length > 0 ? ingredientsArray : editingItem.ingredients
      };
      onUpdateMenuItem(updated);
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        discountPercent: parsedDiscountPercent,
        discountLabel: parsedDiscountPercent ? `${parsedDiscountPercent}% OFF` : undefined,
        imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        prepTimeMinutes: parseInt(formPrepTime, 10) || 12,
        spicyLevel: formSpicyLevel,
        isVegetarian: formIsVeg,
        ingredients: ingredientsArray.length > 0 ? ingredientsArray : ['Fresh ingredients'],
        isAvailable: true
      };
      onAddMenuItem(newItem);
    }

    setIsFoodModalOpen(false);
  };

  const handleToggleStock = (item: MenuItem) => {
    const isAvail = item.isAvailable !== false; // default true
    onUpdateMenuItem({
      ...item,
      isAvailable: !isAvail
    });
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerCode.trim() || !offerValue) return;

    const newOffer: PromoOffer = {
      id: `off-${Date.now()}`,
      title: offerTitle.trim(),
      code: offerCode.trim().toUpperCase(),
      tagline: offerTagline.trim() || `${offerBadge} Special Promo`,
      discountType: offerDiscountType,
      discountValue: parseFloat(offerValue) || 10,
      badge: offerBadge.trim() || `${offerValue}% OFF`,
      active: true,
      expiresInText: 'Active in CMS',
      colorScheme: 'orange'
    };

    onAddOffer(newOffer);
    setIsOfferModalOpen(false);
    setOfferTitle('');
    setOfferCode('');
    setOfferTagline('');
  };

  const handleCreateManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(manualAmount);
    if (!amount || amount <= 0) return;

    const newSaleOrder: Order = {
      id: `ord-man-${Date.now()}`,
      orderNumber: orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber)) + 1 : 101,
      tableNumber: manualTable,
      customerName: 'Walk-in / Direct Cash',
      items: [
        {
          id: `mi-${Date.now()}`,
          menuItemId: 'custom-sale',
          name: manualNote.trim() || 'Custom Order / Walk-in Sale',
          price: amount,
          quantity: 1,
          checkedInKitchen: true
        }
      ],
      subtotal: amount,
      discountTotal: 0,
      tax: Number((amount * 0.08).toFixed(2)),
      grandTotal: Number((amount * 1.08).toFixed(2)),
      status: 'served',
      priority: 'normal',
      notes: `Manual sale entered via CMS: ${manualNote}`,
      createdAt: Date.now(),
      completedAt: Date.now(),
      calledChefCount: 0
    };

    onAddManualSale(newSaleOrder);
    setIsManualSaleOpen(false);
    setManualAmount('');
    setManualNote('');
  };

  const exportSalesCSV = () => {
    const headers = ['Order #', 'Table', 'Customer', 'Items Count', 'Subtotal ($)', 'Discount ($)', 'Grand Total ($)', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.tableNumber}"`,
      `"${o.customerName || 'Guest'}"`,
      o.items.reduce((acc, i) => acc + i.quantity, 0),
      o.subtotal.toFixed(2),
      o.discountTotal.toFixed(2),
      o.grandTotal.toFixed(2),
      o.status,
      new Date(o.createdAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clean, Non-Congested Top CMS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-stone-900 tracking-tight">
            Restaurant CMS & Operations
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Manage your food catalog, live stock, discount promotions, and sales transactions.
          </p>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab('food')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'food'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food & Menu ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Discounts & Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Sales & Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: FOOD MANAGEMENT CMS ----------------- */}
      {activeTab === 'food' && (
        <div className="space-y-5">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search food item to edit or toggle stock..."
                  value={searchFood}
                  onChange={(e) => setSearchFood(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="bg-white border border-stone-200 rounded-2xl px-3 py-2 text-xs font-medium text-stone-700"
              >
                <option value="all">All Categories</option>
                <option value="specials">Specials</option>
                <option value="mains">Mains</option>
                <option value="combos">Combos</option>
                <option value="starters">Starters</option>
                <option value="drinks">Drinks</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>

            <button
              onClick={openAddFoodModal}
              className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          {/* Minimal, Spacious Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFood.map((dish) => {
              const inStock = dish.isAvailable !== false;
              return (
                <div
                  key={dish.id}
                  className={`bg-white border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                    inStock ? 'border-stone-200 shadow-2xs hover:border-orange-300' : 'border-stone-200 bg-stone-50/60 opacity-60'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-sm truncate">
                          {dish.name}
                        </h4>
                      </div>
                      <span className="text-3xs uppercase font-bold text-stone-400">
                        {dish.category}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-orange-600 text-sm">
                          ${dish.price.toFixed(2)}
                        </span>
                        {dish.originalPrice && (
                          <span className="text-stone-400 line-through text-xs">
                            ${dish.originalPrice.toFixed(2)}
                          </span>
                        )}
                        {dish.discountPercent && (
                          <span className="text-3xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                            {dish.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-3">
                    {dish.description}
                  </p>

                  {/* Stock Toggle & Edit Actions */}
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStock(dish)}
                      className={`text-2xs font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                        inStock
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {inStock ? '● In Stock' : '✕ Out of Stock'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditFoodModal(dish)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMenuItem(dish.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: OFFERS & DISCOUNTS CMS ----------------- */}
      {activeTab === 'offers' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Active Discounts & Offers</h3>
              <p className="text-stone-500 text-xs">These discounts automatically reflect on the Customer Menu and Owner POS.</p>
            </div>
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Promo Offer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-lg">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => onToggleOffer(offer.id)}
                      className={`text-2xs font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        offer.active ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {offer.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm mt-2">{offer.title}</h4>
                  <p className="text-xs text-stone-500 mt-1">{offer.tagline}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-2xs">
                  <span className="font-extrabold text-orange-600 text-xs">{offer.badge}</span>
                  <button
                    onClick={() => onDeleteOffer(offer.id)}
                    className="text-stone-400 hover:text-red-500 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: SALES & TRANSACTIONS CMS ----------------- */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #, table, customer..."
                  value={searchSales}
                  onChange={(e) => setSearchSales(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-hidden"
                />
              </div>

              <select
                value={salesStatusFilter}
                onChange={(e) => setSalesStatusFilter(e.target.value as 'all' | OrderStatus)}
                className="bg-white border border-stone-200 rounded-2xl px-3 py-2 text-xs font-medium text-stone-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="cooking">Cooking</option>
                <option value="ready">Ready</option>
                <option value="served">Served / Paid</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsManualSaleOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Manual / Cash Sale</span>
              </button>

              <button
                onClick={exportSalesCSV}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Clean, Minimal Sales Ledger Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-2xs">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Table / Guest</th>
                    <th className="py-3 px-4">Dishes Ordered</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredSales.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        <div>{ord.tableNumber}</div>
                        <div className="text-3xs text-stone-400">{ord.customerName || 'Diner Guest'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.discountTotal > 0 ? (
                          <span className="font-bold text-orange-600">
                            -${ord.discountTotal.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-stone-900">
                        ${ord.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-2xs font-extrabold uppercase ${
                            ord.status === 'served'
                              ? 'bg-green-100 text-green-800'
                              : ord.status === 'ready'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.status !== 'served' && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'served')}
                            className="text-2xs font-bold text-green-700 hover:text-green-800 hover:underline cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: ADD / EDIT FOOD ITEM ----------------- */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-stone-200 shadow-xl rounded-3xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-lg text-stone-900">
                {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Crispy Honey Garlic Ribs"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuItem['category'])}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                  >
                    <option value="specials">Specials & Deals</option>
                    <option value="mains">Mains</option>
                    <option value="combos">Combos</option>
                    <option value="starters">Starters</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="16.99"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              {/* Discounts & Original Price */}
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <div>
                  <label className="block font-bold text-orange-900 mb-1">Original Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="21.00 (shows strikethrough)"
                    className="w-full bg-white border border-orange-200 rounded-xl px-3 py-1.5 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-orange-900 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(e.target.value)}
                    placeholder="20 (shows 20% OFF tag)"
                    className="w-full bg-white border border-orange-200 rounded-xl px-3 py-1.5 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mouthwatering description for guests..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-900"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="veg-check"
                    checked={formIsVeg}
                    onChange={(e) => setFormIsVeg(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="veg-check" className="font-bold text-stone-700 cursor-pointer">
                    Vegetarian Dish
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE MANUAL SALE ----------------- */}
      {isManualSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-stone-200 shadow-xl rounded-3xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-base text-stone-900">
                Log Direct / Walk-in Cash Sale
              </h3>
              <button onClick={() => setIsManualSaleOpen(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualSale} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Table / Counter</label>
                <input
                  type="text"
                  value={manualTable}
                  onChange={(e) => setManualTable(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sale Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="35.00"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Lunch Combos cash payment"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualSaleOpen(false)}
                  className="flex-1 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-stone-900 text-white font-bold rounded-xl"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE NEW PROMO OFFER ----------------- */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-stone-200 shadow-xl rounded-3xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-base text-stone-900">
                Create Discount Offer
              </h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Family Special"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="WEEKEND20"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="20% OFF"
                    value={offerBadge}
                    onChange={(e) => setOfferBadge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Discount Value</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={offerValue}
                    onChange={(e) => setOfferValue(e.target.value)}
                    className="w-24 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                  <select
                    value={offerDiscountType}
                    onChange={(e) => setOfferDiscountType(e.target.value as 'percent' | 'flat')}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                  >
                    <option value="percent">% Percent Discount</option>
                    <option value="flat">$ Flat Dollar Off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off all main platters"
                  value={offerTagline}
                  onChange={(e) => setOfferTagline(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="flex-1 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-xl"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
