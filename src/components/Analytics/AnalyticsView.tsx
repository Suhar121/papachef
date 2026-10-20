import React, { useState } from 'react';
import { SalesAnalytics, Order } from '../../types/restaurant';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Tag, 
  Clock, 
  Percent, 
  Award, 
  BarChart, 
  Printer, 
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: SalesAnalytics;
  orders: Order[];
  seniorMode: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  orders,
  seniorMode
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Calculate live dynamic metrics from current session orders
  const servedOrders = orders.filter((o) => o.status === 'served');
  const sessionTotal = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalRevenue = analytics.totalRevenue + sessionTotal;
  const totalOrdersCount = analytics.orderCount + orders.length;
  const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const totalDiscounts = analytics.totalDiscountsGiven + orders.reduce((acc, o) => acc + o.discountTotal, 0);

  // Max value for bar chart scaling
  const maxHourlySales = Math.max(...analytics.hourlySales.map((h) => h.sales), 450);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`font-heading font-black text-stone-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Papaw's Sales & Offer Analytics
            </h2>
            <span className="bg-green-100 text-green-800 text-2xs font-extrabold px-2.5 py-0.5 rounded-full border border-green-200">
              Live Register
            </span>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Monitor daily gross revenue, discount redemption impact, and kitchen cook speeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe switch */}
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-2xs">
            {(['today', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeRange === t
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Daily Register Report</span>
          </button>
        </div>
      </div>

      {/* 5 Big KPI Metric Cards (Around rounded cards with warm orange accents) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1: Total Gross Sales */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`font-heading font-black text-stone-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-2xs text-green-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs last Tuesday</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`font-heading font-black text-stone-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              {totalOrdersCount}
            </div>
            <div className="text-2xs text-stone-500 font-medium mt-1">
              {servedOrders.length} completed this session
            </div>
          </div>
        </div>

        {/* Metric 3: Average Ticket */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500">
              Avg Ticket
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`font-heading font-black text-stone-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              ${avgTicket.toFixed(2)}
            </div>
            <div className="text-2xs text-stone-500 font-medium mt-1">Per table party</div>
          </div>
        </div>

        {/* Metric 4: Discounts & Offers Given */}
        <div className="bg-white border-2 border-orange-200 rounded-3xl p-4 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/50">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-orange-700">
              Offers Given
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`font-heading font-black text-orange-600 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              ${totalDiscounts.toFixed(2)}
            </div>
            <div className="text-2xs text-stone-500 font-medium mt-1">
              Boosted order rate by 24%
            </div>
          </div>
        </div>

        {/* Metric 5: Average Cook Time */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-4 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500">
              Avg Cook Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`font-heading font-black text-stone-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              {analytics.averageCookTimeMinutes}m
            </div>
            <div className="text-2xs text-green-600 font-bold mt-1">
              ✓ Fast kitchen turnaround
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hourly Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Sales Visual Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg">
                Hourly Rush & Sales Velocity
              </h3>
              <p className="text-xs text-stone-500">
                Peak hours clearly indicate when Papaw needs extra prep in the kitchen
              </p>
            </div>
            <span className="text-2xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              Peak: 12 PM - 1 PM Lunch Rush
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-56 flex items-end justify-between gap-2 border-b-2 border-orange-100 pb-2">
              {analytics.hourlySales.map((h, i) => {
                const heightPercent = Math.max(12, Math.round((h.sales / maxHourlySales) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-stone-900 text-white text-3xs font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-10">
                      ${h.sales.toFixed(2)} ({h.orders} orders)
                    </div>

                    <div className="w-full max-w-[42px] bg-stone-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-44">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110 ${
                          i === 1 || i === 2
                            ? 'bg-gradient-to-t from-orange-600 to-amber-400'
                            : 'bg-gradient-to-t from-orange-400 to-amber-300'
                        }`}
                      ></div>
                    </div>

                    <span className="text-3xs font-bold text-stone-500 truncate w-full text-center">
                      {h.hour.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-2xs text-stone-400 pt-2 font-medium">
              <span>Morning Shift (11 AM)</span>
              <span>Afternoon Prep</span>
              <span>Dinner Shift (5 PM)</span>
            </div>
          </div>
        </div>

        {/* Category Share & Kitchen Efficiency (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-stone-900 text-base">
            Sales by Category
          </h3>

          <div className="space-y-3">
            {analytics.categorySales.map((cat, idx) => {
              const totalCatSales = analytics.categorySales.reduce((a, b) => a + b.sales, 0);
              const percent = Math.round((cat.sales / totalCatSales) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">{cat.category}</span>
                    <span className="text-stone-900 font-bold">${cat.sales.toFixed(2)} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-orange-100 bg-orange-50/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Papaw's Sales Insight:</span>
            </div>
            <p className="text-2xs text-stone-600 mt-1 leading-relaxed">
              Main Courses + Combos make up over 70% of total revenue. Promoting the <strong>20% Lunch Deal</strong> increased overall beverage add-on sales by 16%!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Dishes + Promotion ROI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Top 5 Best-Selling Dishes</span>
            </h3>
            <span className="text-2xs text-stone-500">Ranked by revenue</span>
          </div>

          <div className="space-y-3">
            {analytics.topDishes.map((dish, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-stone-100 hover:border-orange-200 hover:bg-orange-50/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
                    #{i + 1}
                  </span>
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900 line-clamp-1">{dish.name}</div>
                    <div className="text-2xs text-stone-500">{dish.quantity} plates served</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-heading font-extrabold text-sm text-orange-600">
                    ${dish.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Promo Code ROI Tracker */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Percent className="w-5 h-5 text-orange-600" />
              <span>Discount Campaign Performance</span>
            </h3>
            <span className="text-2xs text-stone-500">ROI of Offers</span>
          </div>

          <div className="space-y-3">
            {analytics.promoUsage.map((promo, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                    {promo.code}
                  </span>
                  <span className="text-xs font-extrabold text-green-700">
                    {promo.timesUsed} Redemptions
                  </span>
                </div>
                <div className="font-bold text-xs text-stone-900">{promo.title}</div>
                <div className="flex items-center justify-between text-2xs text-stone-600 pt-1 border-t border-amber-200">
                  <span>Customer Savings: ${promo.totalSaved.toFixed(2)}</span>
                  <span className="font-semibold text-orange-700">Status: Active & Generating Orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Register Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-orange-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="text-center pb-4 border-b border-stone-200">
              <div className="text-lg font-heading font-black text-stone-900">
                PAPAW'S BISTRO & GRILL
              </div>
              <div className="text-xs text-stone-500">Official Daily Sales Register Summary</div>
              <div className="text-2xs text-stone-400 mt-1">
                Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Total Register Sales:</span>
                <span className="font-bold">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Orders Processed:</span>
                <span className="font-bold">{totalOrdersCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Total Discounts Given:</span>
                <span className="font-bold">-${totalDiscounts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Estimated Sales Tax (8%):</span>
                <span className="font-bold">${(totalRevenue * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm text-stone-900 border-t-2 border-stone-900">
                <span>NET REGISTER TOTAL:</span>
                <span>${(totalRevenue * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
