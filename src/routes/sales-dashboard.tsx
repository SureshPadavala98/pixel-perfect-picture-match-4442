import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ShoppingBag, Plus, ArrowUpRight, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Status, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { today, type SaleType, type SaleStatus } from '@/lib/spa-model';

export const Route = createFileRoute('/sales-dashboard')({
  head: () => pageHead('Sales Dashboard', 'Track branch orders, memberships, packages, and gift cards.'),
  component: SalesDashboard,
});

function SalesDashboard() {
  const { sales, manager } = useSpa();
  const [tab, setTab] = useState<'All' | SaleStatus>('All');
  const [type, setType] = useState<'All' | SaleType>('All');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');

  if (!manager) return null;

  const filtered = sales.filter((s) => {
    const matchTab = tab === 'All' || s.status === tab;
    const matchType = type === 'All' || s.type === type;
    const matchDate = !date || s.date === date;
    const matchQuery = `${s.reference} ${s.customerName} ${s.customerMobile}`.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchType && matchDate && matchQuery;
  });

  const acceptedCount = sales.filter((s) => s.status === 'Accepted').length;
  const rejectedCount = sales.filter((s) => s.status === 'Rejected').length;
  const completedCount = sales.filter((s) => s.status === 'Completed').length;
  const totalCount = sales.length;

  return (
    <>
      <PageHeading title="Sales Dashboard" description="Orders, memberships, packages and gift cards for your branch.">
        <Button asChild>
          <Link to="/quick-sale">
            <Plus /> New Sale
          </Link>
        </Button>
      </PageHeading>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Accepted', count: acceptedCount, status: 'Accepted' as SaleStatus },
            { label: 'Rejected', count: rejectedCount, status: 'Rejected' as SaleStatus },
            { label: 'Completed', count: completedCount, status: 'Completed' as SaleStatus },
            { label: 'Total', count: totalCount, status: 'All' as const },
          ].map((t) => (
            <Button
              key={t.label}
              variant={tab === t.status ? 'default' : 'outline'}
              size="sm"
              className="h-9 gap-2"
              onClick={() => setTab(t.status)}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${tab === t.status ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {t.count}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            className="text-xs h-9 py-1 px-3 !w-auto"
            value={type}
            onChange={(e) => setType(e.target.value as 'All' | SaleType)}
            aria-label="Filter by sale type"
          >
            <option value="All">All Sale Types</option>
            <option value="Orders">Orders</option>
            <option value="Memberships">Memberships</option>
            <option value="Packages">Packages</option>
            <option value="Gift Cards">Gift Cards</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs h-9 py-1 px-3 !w-auto"
            aria-label="Filter by sale date"
          />
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Sales Records ({filtered.length})</h2>
          <ShoppingBag size={20} className="text-gold" />
        </div>

        <div className="filters">
          <input
            placeholder="Search reference, customer name or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sales records"
          />
        </div>

        <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="border border-border rounded-lg p-5 bg-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="font-mono text-xs font-semibold text-primary">{s.reference}</span>
                  <Status status={s.status} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="source">{s.type}</span>
                  <span className="text-[10px] text-muted-foreground">{s.date} at {s.time}</span>
                </div>
                <strong className="text-sm block mt-2">{s.customerName}</strong>
                <p className="text-xs text-muted-foreground">{s.customerMobile}</p>

                <div className="mt-4 pt-3 border-t border-border space-y-1">
                  {s.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{it.qty} × {it.name}</span>
                      <span className="font-medium">{money(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total Amount</span>
                  <span className="text-base font-bold text-primary">{money(s.totalAmount)}</span>
                </div>
                <span className="source">{s.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty">
            <ShoppingBag size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p>No sales records found matching the selected filters.</p>
          </div>
        )}
      </section>
    </>
  );
}
