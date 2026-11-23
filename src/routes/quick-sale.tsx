import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ShoppingBag, Plus, UserPlus, Check, Trash2, Calendar, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, Initials, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { today, type SaleType, type SaleItem, type SaleRecord, type Customer } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/quick-sale')({
  head: () => pageHead('Quick Sale', 'Instant branch point of sale for orders, memberships, packages and gift cards.'),
  component: QuickSale,
});

function QuickSale() {
  const { customers, catalogue, memberships, packages, giftCards, products, manager, createSale, createCustomer, activity } = useSpa();
  const navigate = useNavigate();

  const [date, setDate] = useState(today());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modal, setModal] = useState<'' | 'selectCustomer' | 'addGuest' | 'addItem' | 'checkout'>('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [saleType, setSaleType] = useState<SaleType>('Orders');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  // Customer search & Add Guest state
  const [custQuery, setCustQuery] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestGender, setGuestGender] = useState<'Female' | 'Male'>('Female');

  if (!manager) return null;

  const totalAmount = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  const addItem = (name: string, price: number, category?: string) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.name === name);
      if (existing) {
        return prev.map((it) => (it.name === name ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { name, price, qty: 1, category }];
    });
    toast.success(`Added ${name}`);
    setModal('');
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((it) => it.name !== name));
  };

  const updateQty = (name: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => (it.name === name ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !/^\d{10}$/.test(guestMobile)) {
      toast.error('Enter valid customer name and 10-digit mobile');
      return;
    }
    const newCust: Customer = {
      id: `${manager.branchId}-c-${Date.now()}`,
      branchId: manager.branchId,
      name: guestName.trim(),
      mobile: guestMobile,
      whatsapp: guestMobile,
      email: guestEmail,
      gender: guestGender,
    };
    createCustomer(newCust);
    setSelectedCustomer(newCust);
    setModal('');
    toast.success(`Guest ${newCust.name} added`);
  };

  const handleCheckout = () => {
    if (!selectedCustomer) {
      toast.error('Select or add a guest first');
      return;
    }
    if (items.length === 0) {
      toast.error('Add at least one service, product or plan');
      return;
    }

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      reference: `SL-${manager.branchId.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      branchId: manager.branchId,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      type: saleType,
      items,
      quantity: items.reduce((n, it) => n + it.qty, 0),
      totalAmount,
      date,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed',
      paymentMethod,
    };

    createSale(newSale);
    activity(`Quick Sale ${newSale.reference} recorded for ${selectedCustomer.name} (${money(totalAmount)})`);
    toast.success('Sale successfully completed!');
    navigate({ to: '/sales-dashboard' });
  };

  return (
    <>
      <PageHeading title="Quick Sale" description="Fast counter sales and checkout for walk-in purchases." />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Details */}
        <div className="lg:col-span-1 space-y-5">
          <section className="panel p-5">
            <div className="panel-heading !p-0 !mb-4">
              <h2>Selected Date</h2>
              <Calendar size={18} className="text-gold" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs"
              aria-label="Sale date"
            />
          </section>

          <section className="panel p-5">
            <div className="panel-heading !p-0 !mb-4">
              <h2>Guest Information</h2>
              <UserPlus size={18} className="text-gold" />
            </div>

            {selectedCustomer ? (
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Initials name={selectedCustomer.name} />
                  <div>
                    <strong className="text-sm block">{selectedCustomer.name}</strong>
                    <span className="text-xs text-muted-foreground block">{selectedCustomer.mobile}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change Guest
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Select a returning guest or add a new customer.</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => setModal('selectCustomer')}
                  >
                    Select Guest
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      setGuestName('');
                      setGuestMobile('');
                      setGuestEmail('');
                      setModal('addGuest');
                    }}
                  >
                    <Plus /> Add Guest
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="panel p-5">
            <div className="panel-heading !p-0 !mb-4">
              <h2>Sale Category</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['Orders', 'Memberships', 'Packages', 'Gift Cards'] as SaleType[]).map((t) => (
                <Button
                  key={t}
                  variant={saleType === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSaleType(t)}
                  className="text-xs"
                >
                  {t}
                </Button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Items and Cart */}
        <div className="lg:col-span-2 space-y-5">
          <section className="panel p-5">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
              <div>
                <h2>Selected Items</h2>
                <span className="text-xs text-muted-foreground">{items.length} items added</span>
              </div>
              <Button size="sm" onClick={() => setModal('addItem')}>
                <Plus /> Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="empty !py-12 border border-dashed border-border rounded-lg">
                <ShoppingBag size={42} className="mx-auto text-muted-foreground/30 mb-3" />
                <h3>Service/Product Not Added</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click 'Add Item' above to select treatments, retail products, memberships, or gift cards.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setModal('addItem')}>
                  <Plus /> Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-border">
                  {items.map((it) => (
                    <div key={it.name} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <strong className="text-sm block truncate">{it.name}</strong>
                        <span className="text-xs text-muted-foreground">{money(it.price)} each</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => updateQty(it.name, -1)}
                        >
                          -
                        </Button>
                        <span className="text-xs font-semibold px-2">{it.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => updateQty(it.name, 1)}
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-bold">{money(it.price * it.qty)}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(it.name)}
                        aria-label={`Remove ${it.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Summary & Checkout */}
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="bg-secondary p-4 rounded-lg space-y-2 mb-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Items Total</span>
                      <span>{money(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Taxes & Surcharges</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                      <span>Total Payable</span>
                      <span className="text-primary">{money(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-xs font-semibold mb-2 block">Payment Method</label>
                    <div className="flex gap-2">
                      {(['UPI', 'Card', 'Cash'] as const).map((m) => (
                        <Button
                          key={m}
                          variant={paymentMethod === m ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setPaymentMethod(m)}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full h-11 text-sm font-semibold"
                    disabled={items.length === 0 || !selectedCustomer}
                    onClick={handleCheckout}
                  >
                    <Check /> Complete Sale ({money(totalAmount)})
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Select Guest Modal */}
      {modal === 'selectCustomer' && (
        <Modal title="Select Guest" onClose={() => setModal('')}>
          <input
            placeholder="Search name, phone or email…"
            value={custQuery}
            onChange={(e) => setCustQuery(e.target.value)}
            className="mb-4 text-xs"
            aria-label="Search guest"
          />
          <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-border">
            {customers
              .filter((c) => `${c.name} ${c.mobile}`.toLowerCase().includes(custQuery.toLowerCase()))
              .map((c) => (
                <div
                  key={c.id}
                  className="pt-2 flex justify-between items-center cursor-pointer hover:bg-secondary p-2 rounded"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setModal('');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Initials name={c.name} />
                    <div>
                      <strong className="text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-muted-foreground">{c.mobile}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">Select</Button>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {/* Add Guest Modal */}
      {modal === 'addGuest' && (
        <Modal title="Add New Guest" onClose={() => setModal('')}>
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div>
              <label htmlFor="guest-name">Guest Name *</label>
              <input
                id="guest-name"
                placeholder="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="guest-mobile">Mobile Number *</label>
              <input
                id="guest-mobile"
                placeholder="10-digit mobile number"
                value={guestMobile}
                onChange={(e) => setGuestMobile(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
              />
            </div>
            <div>
              <label htmlFor="guest-email">Email Address</label>
              <input
                id="guest-email"
                type="email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Gender</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={guestGender === 'Female' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGuestGender('Female')}
                >
                  Female
                </Button>
                <Button
                  type="button"
                  variant={guestGender === 'Male' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGuestGender('Male')}
                >
                  Male
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full mt-5">
              <Check /> Save & Select Guest
            </Button>
          </form>
        </Modal>
      )}

      {/* Add Item Modal */}
      {modal === 'addItem' && (
        <Modal title={`Add Item (${saleType})`} onClose={() => setModal('')}>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {saleType === 'Orders' && (
              <>
                <div className="eyebrow mt-1">SPA TREATMENTS</div>
                {catalogue
                  .filter((s) => s.branchId === manager.branchId)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary cursor-pointer"
                      onClick={() => addItem(s.name, s.price, 'Treatment')}
                    >
                      <div>
                        <strong className="text-xs block">{s.name}</strong>
                        <span className="text-[10px] text-muted-foreground">{s.duration} mins · {s.category}</span>
                      </div>
                      <span className="font-bold text-xs">{money(s.price)}</span>
                    </div>
                  ))}

                <div className="eyebrow mt-4">RETAIL PRODUCTS</div>
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary cursor-pointer"
                    onClick={() => addItem(p.name, p.price, 'Product')}
                  >
                    <div>
                      <strong className="text-xs block">{p.name}</strong>
                      <span className="text-[10px] text-muted-foreground">Stock: {p.stock} units</span>
                    </div>
                    <span className="font-bold text-xs">{money(p.price)}</span>
                  </div>
                ))}
              </>
            )}

            {saleType === 'Memberships' &&
              memberships.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary cursor-pointer"
                  onClick={() => addItem(m.name, m.fees, 'Membership')}
                >
                  <div>
                    <strong className="text-xs block">{m.name} ({m.type})</strong>
                    <span className="text-[10px] text-muted-foreground">Validity: {m.validityDays} days</span>
                  </div>
                  <span className="font-bold text-xs">{money(m.fees)}</span>
                </div>
              ))}

            {saleType === 'Packages' &&
              packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary cursor-pointer"
                  onClick={() => addItem(pkg.name, pkg.price, 'Package')}
                >
                  <div>
                    <strong className="text-xs block">{pkg.name}</strong>
                    <span className="text-[10px] text-muted-foreground">{pkg.duration} mins</span>
                  </div>
                  <span className="font-bold text-xs">{money(pkg.price)}</span>
                </div>
              ))}

            {saleType === 'Gift Cards' &&
              giftCards.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary cursor-pointer"
                  onClick={() => addItem(g.name, g.amount, 'Gift Card')}
                >
                  <div>
                    <strong className="text-xs block">{g.name}</strong>
                    <span className="text-[10px] text-muted-foreground">{g.description}</span>
                  </div>
                  <span className="font-bold text-xs">{money(g.amount)}</span>
                </div>
              ))}
          </div>
        </Modal>
      )}
    </>
  );
}
