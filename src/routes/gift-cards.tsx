import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Gift, Plus, Edit2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type GiftCard } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/gift-cards')({
  head: () => pageHead('Gift Cards', 'Create and configure festive and wellness gift cards for branch guests.'),
  component: GiftCardsPage,
});

function GiftCardsPage() {
  const { giftCards, manager, updateGiftCard, createGiftCard } = useSpa();
  const [modal, setModal] = useState<'' | 'add' | 'edit'>('');
  const [activeCard, setActiveCard] = useState<GiftCard | null>(null);

  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(2500);
  const [validityDays, setValidityDays] = useState(90);
  const [renewalReminder, setRenewalReminder] = useState(7);

  if (!manager) return null;

  const openCreate = () => {
    setName('');
    setActive(true);
    setDescription('The gift of bespoke serenity and revitalizing body care.');
    setAmount(2500);
    setValidityDays(90);
    setRenewalReminder(7);
    setActiveCard(null);
    setModal('add');
  };

  const openEdit = (gc: GiftCard) => {
    setActiveCard(gc);
    setName(gc.name);
    setActive(gc.active);
    setDescription(gc.description);
    setAmount(gc.amount);
    setValidityDays(gc.validityDays);
    setRenewalReminder(gc.renewalReminder);
    setModal('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Card name is required');
      return;
    }

    const payload: GiftCard = {
      id: activeCard ? activeCard.id : `gc-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      active,
      description: description.trim(),
      amount: Number(amount),
      validityDays: Number(validityDays),
      renewalReminder: Number(renewalReminder),
    };

    if (activeCard) {
      updateGiftCard(payload);
      toast.success('Gift card updated');
    } else {
      createGiftCard(payload);
      toast.success('New gift card created');
    }
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Gift Card Management"
        description="Gift cards, bespoke vouchers, and experiential wellness passes."
      >
        <Button onClick={openCreate}>
          <Plus /> Create New Gift Card
        </Button>
      </PageHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {giftCards.map((gc) => (
          <div
            key={gc.id}
            className="border border-border rounded-xl p-6 bg-gradient-to-br from-card via-card to-secondary flex flex-col justify-between shadow-sm hover:border-gold transition-colors"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-4">
                <span className="source flex items-center gap-1 font-mono text-[10px]">
                  <Sparkles size={11} className="text-gold" /> {manager.branchId.toUpperCase()} VOUCHER
                </span>
                <span className={`badge ${gc.active ? 'completed' : 'cancelled'}`}>
                  {gc.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-3">
                <Gift size={22} />
              </div>

              <h2 className="text-xl font-display">{gc.name}</h2>
              <div className="text-2xl font-bold text-primary mt-1">{money(gc.amount)}</div>
              <p className="text-xs text-muted-foreground mt-2">{gc.description}</p>

              <div className="mt-5 pt-4 border-t border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity Duration</span>
                  <span className="font-semibold">{gc.validityDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiry Reminder</span>
                  <span>{gc.renewalReminder} days before</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => openEdit(gc)}>
                <Edit2 size={13} /> Edit Gift Card
              </Button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal
          title={modal === 'edit' ? `Edit Gift Card · ${name}` : 'Create Gift Card'}
          onClose={() => setModal('')}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="gc-name">Card / Voucher Name *</label>
              <input
                id="gc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Celebration Voucher"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gc-amount">Denomination Amount (₹) *</label>
                <input
                  id="gc-amount"
                  type="number"
                  min="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label htmlFor="gc-validity">Validity (Days) *</label>
                <input
                  id="gc-validity"
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="gc-reminder">Renewal / Expiry Reminder (Days Before)</label>
              <input
                id="gc-reminder"
                type="number"
                min="1"
                value={renewalReminder}
                onChange={(e) => setRenewalReminder(Number(e.target.value))}
              />
            </div>

            <div>
              <label htmlFor="gc-desc">Description</label>
              <textarea
                id="gc-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of voucher redemption and conditions…"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Active Voucher</strong>
                <span className="text-[10px] text-muted-foreground">Eligible for purchase at counter</span>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {/* Summary preview */}
            <div className="bg-secondary p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground block">Customer pays:</span>
                <strong className="text-base text-primary">{money(amount)}</strong>
              </div>
              <span className="text-xs text-muted-foreground">Valid for {validityDays} days</span>
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Gift Card
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
