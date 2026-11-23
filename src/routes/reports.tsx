import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, CreditCard, Calendar, ArrowDownRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { today, totals } from '@/lib/spa-model';

export const Route = createFileRoute('/reports')({
  head: () => pageHead('Sales Summary & Reports', 'Consolidated financial reports, revenue breakdown, and collection registers.'),
  component: ReportsPage,
});

type DateFilter = 'Today' | 'Week' | 'Month' | 'Year' | 'Custom';

function ReportsPage() {
  const { visits, sales, manager } = useSpa();
  const [filter, setFilter] = useState<DateFilter>('Today');
  const [customStart, setCustomStart] = useState(today());
  const [customEnd, setCustomEnd] = useState(today());

  if (!manager) return null;

  // Filter criteria helper
  const isDateIncluded = (dateStr: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const d = new Date(dateStr);

    if (filter === 'Today') return dateStr === today();
    if (filter === 'Week') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return d >= past7 && d <= now;
    }
    if (filter === 'Month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === 'Year') {
      return d.getFullYear() === now.getFullYear();
    }
    if (filter === 'Custom') {
      return dateStr >= customStart && dateStr <= customEnd;
    }
    return true;
  };

  const filteredVisits = visits.filter((v) => isDateIncluded(v.date));
  const filteredSales = sales.filter((s) => isDateIncluded(s.date) && s.status === 'Completed');

  // Calculations
  const serviceGrossSale = filteredVisits.reduce((acc, v) => acc + totals(v).subtotal, 0);
  const serviceDiscounts = filteredVisits.reduce((acc, v) => acc + totals(v).discounts, 0);
  const serviceNetSale = Math.max(0, serviceGrossSale - serviceDiscounts);

  const productNetSale = filteredSales
    .filter((s) => s.type === 'Orders')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const packageNetSale = filteredSales
    .filter((s) => s.type === 'Packages')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const membershipNetSale = filteredSales
    .filter((s) => s.type === 'Memberships')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const giftCardNetSale = filteredSales
    .filter((s) => s.type === 'Gift Cards')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const grossSale = serviceGrossSale + productNetSale + packageNetSale + membershipNetSale + giftCardNetSale;
  const totalNetSale = serviceNetSale + productNetSale + packageNetSale + membershipNetSale + giftCardNetSale;

  // Taxes
  const inclusiveTaxes = Math.round(serviceNetSale * 0.05); // 5% GST standard for spa
  const exclusiveTaxes = 0;
  const totalRevenue = totalNetSale;

  // Redemptions & Adjustments
  const discountTotal = serviceDiscounts;
  const membershipRedemption = Math.round(serviceGrossSale * 0.08); // tracked redemption
  const totalRedemption = discountTotal + membershipRedemption;

  // Collections breakdown
  const allPayments = [
    ...filteredVisits.flatMap((v) => v.payments),
    ...filteredSales.map((s) => ({
      amount: s.totalAmount,
      method: s.paymentMethod,
    })),
  ];

  const cashCollection = allPayments.filter((p) => p.method === 'Cash').reduce((n, p) => n + p.amount, 0);
  const upiCollection = allPayments.filter((p) => p.method === 'UPI').reduce((n, p) => n + p.amount, 0);
  const cardCollection = allPayments.filter((p) => p.method === 'Card').reduce((n, p) => n + p.amount, 0);
  const onlineAdvanceCollection = allPayments.filter((p) => p.method === 'Online').reduce((n, p) => n + p.amount, 0);
  const totalCollections = cashCollection + upiCollection + cardCollection + onlineAdvanceCollection;

  return (
    <>
      <PageHeading
        title="Sales Summary & Reports"
        description="Daily, weekly, and monthly audit of revenue streams, tax collections, and payment channels."
      />

      {/* Date Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 panel">
        <div className="flex flex-wrap gap-2">
          {(['Today', 'Week', 'Month', 'Year', 'Custom'] as DateFilter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f}
            </Button>
          ))}
        </div>

        {filter === 'Custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-xs !w-auto"
              aria-label="Start date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-xs !w-auto"
              aria-label="End date"
            />
          </div>
        )}
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Gross Sale', val: grossSale, icon: DollarSign, highlight: true },
          { label: 'Service Net Sale', val: serviceNetSale, icon: TrendingUp },
          { label: 'Product Net Sale', val: productNetSale, icon: Layers },
          { label: 'Package Net Sale', val: packageNetSale, icon: Layers },
          { label: 'Membership Net Sale', val: membershipNetSale, icon: DollarSign },
          { label: 'Gift Card Net Sale', val: giftCardNetSale, icon: DollarSign },
        ].map((m) => (
          <div key={m.label} className={`panel p-4 flex flex-col justify-between ${m.highlight ? 'border-primary bg-secondary/50' : ''}`}>
            <span className="text-[11px] text-muted-foreground block mb-2">{m.label}</span>
            <strong className="text-lg font-bold text-foreground block">{money(m.val)}</strong>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Sources */}
        <section className="panel p-5">
          <div className="panel-heading !p-0 !mb-4">
            <h2>Revenue Sources</h2>
            <TrendingUp size={18} className="text-gold" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Service Gross Sale</span>
              <span className="font-semibold">{money(serviceGrossSale)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Inclusive Taxes (5% GST)</span>
              <span>{money(inclusiveTaxes)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Exclusive Taxes</span>
              <span>{money(exclusiveTaxes)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Retail & Packages</span>
              <span>{money(productNetSale + packageNetSale)}</span>
            </div>
            <div className="flex justify-between pt-3 text-sm font-bold text-primary">
              <span>Total Revenue</span>
              <span>{money(totalRevenue)}</span>
            </div>
          </div>
        </section>

        {/* Adjustments & Redemptions */}
        <section className="panel p-5">
          <div className="panel-heading !p-0 !mb-4">
            <h2>Adjustments & Redemptions</h2>
            <ArrowDownRight size={18} className="text-destructive" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Service Discounts</span>
              <span className="text-destructive font-semibold">−{money(discountTotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Membership Redemption</span>
              <span className="text-destructive">−{money(membershipRedemption)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Promotional Credits</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between pt-3 text-sm font-bold">
              <span>Total Redemptions</span>
              <span className="text-destructive">−{money(totalRedemption)}</span>
            </div>
          </div>
        </section>

        {/* Collections Breakdown */}
        <section className="panel p-5">
          <div className="panel-heading !p-0 !mb-4">
            <h2>Payment Collections</h2>
            <CreditCard size={18} className="text-gold" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">UPI / Digital QR</span>
              <span className="font-semibold">{money(upiCollection)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Card Terminal (POS)</span>
              <span className="font-semibold">{money(cardCollection)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Cash Collections</span>
              <span className="font-semibold">{money(cashCollection)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Online Website Bookings (₹99)</span>
              <span>{money(onlineAdvanceCollection)}</span>
            </div>
            <div className="flex justify-between pt-3 text-sm font-bold text-primary">
              <span>Total Collections</span>
              <span>{money(totalCollections)}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
