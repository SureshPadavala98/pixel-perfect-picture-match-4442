import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Award, Plus, Edit2, Check, Clock, Users, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type MembershipPlan, type MembershipType } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/memberships')({
  head: () => pageHead('Memberships', 'Manage VIP wellness subscriptions, tiered privileges, and sharing limits.'),
  component: MembershipsPage,
});

function MembershipsPage() {
  const { memberships, catalogue, manager, updateMembership, createMembership } = useSpa();
  const [modal, setModal] = useState<'' | 'add' | 'edit' | 'view'>('');
  const [activePlan, setActivePlan] = useState<MembershipPlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<MembershipType>('Fixed');
  const [fees, setFees] = useState(10000);
  const [validityDays, setValidityDays] = useState(365);
  const [renewalReminder, setRenewalReminder] = useState(15);
  const [totalHours, setTotalHours] = useState(10);
  const [shareable, setShareable] = useState(true);
  const [maxShareCount, setMaxShareCount] = useState(2);
  const [specificServices, setSpecificServices] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  if (!manager) return null;

  const branchServices = catalogue.filter((s) => s.branchId === manager.branchId);

  const openCreate = () => {
    setName('');
    setType('Fixed');
    setFees(10000);
    setValidityDays(365);
    setRenewalReminder(15);
    setTotalHours(10);
    setShareable(true);
    setMaxShareCount(2);
    setSpecificServices(['Swedish Massage', 'Classic Facial']);
    setActive(true);
    setDescription('');
    setActivePlan(null);
    setModal('add');
  };

  const openEdit = (plan: MembershipPlan) => {
    setActivePlan(plan);
    setName(plan.name);
    setType(plan.type);
    setFees(plan.fees);
    setValidityDays(plan.validityDays);
    setRenewalReminder(plan.renewalReminder);
    setTotalHours(plan.totalHours ?? 10);
    setShareable(plan.shareable);
    setMaxShareCount(plan.maxShareCount);
    setSpecificServices(plan.specificServices ?? []);
    setActive(plan.active);
    setDescription(plan.description ?? '');
    setModal('edit');
  };

  const toggleService = (srvName: string) => {
    setSpecificServices((prev) =>
      prev.includes(srvName) ? prev.filter((s) => s !== srvName) : [...prev, srvName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    const payload: MembershipPlan = {
      id: activePlan ? activePlan.id : `mem-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      type,
      active,
      fees: Number(fees),
      validityDays: Number(validityDays),
      renewalReminder: Number(renewalReminder),
      totalHours: type === 'Hourly' || type === 'Hybrid' ? Number(totalHours) : undefined,
      shareable,
      maxShareCount: shareable ? Number(maxShareCount) : 1,
      specificServices,
      totalToPay: Number(fees),
      description: description.trim(),
    };

    if (activePlan) {
      updateMembership(payload);
      toast.success('Membership plan updated');
    } else {
      createMembership(payload);
      toast.success('New membership plan created');
    }
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Membership Management"
        description="Configure tier structures, validity durations, shareable privileges, and included therapies."
      >
        <Button onClick={openCreate}>
          <Plus /> Create New Plan
        </Button>
      </PageHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map((plan) => (
          <div
            key={plan.id}
            className="border border-border rounded-lg p-6 bg-card flex flex-col justify-between relative shadow-sm hover:border-gold transition-colors"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="source font-medium">{plan.type} Plan</span>
                <span className={`badge ${plan.active ? 'completed' : 'cancelled'}`}>
                  {plan.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h2 className="text-xl font-display mt-2">{plan.name}</h2>
              <div className="text-2xl font-bold text-primary mt-1">{money(plan.fees)}</div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{plan.description || 'Exclusive membership privileges and wellness rituals.'}</p>

              <div className="mt-5 pt-4 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity</span>
                  <span className="font-semibold">{plan.validityDays} Days</span>
                </div>
                {(plan.type === 'Hourly' || plan.type === 'Hybrid') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Included Hours</span>
                    <span className="font-semibold">{plan.totalHours} Hours</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shareable</span>
                  <span>{plan.shareable ? `Yes (Up to ${plan.maxShareCount} persons)` : 'Non-shareable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renewal Notice</span>
                  <span>{plan.renewalReminder} days prior</span>
                </div>
              </div>

              {plan.specificServices?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase mb-1">Applicable Services</span>
                  <div className="flex flex-wrap gap-1">
                    {plan.specificServices.map((srv) => (
                      <span key={srv} className="badge">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Payable: <strong>{money(plan.totalToPay)}</strong></span>
              <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                <Edit2 size={13} /> Edit Plan
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {modal && (
        <Modal
          title={modal === 'edit' ? `Edit Plan · ${name}` : 'Create Membership Plan'}
          onClose={() => setModal('')}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="plan-name">Plan Name *</label>
              <input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Platinum Plan"
                required
              />
            </div>

            <div>
              <label>Membership Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Fixed', 'Percentage', 'Hourly', 'Hybrid'] as MembershipType[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={type === t ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setType(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan-fees">Plan Fees (₹) *</label>
                <input
                  id="plan-fees"
                  type="number"
                  min="0"
                  value={fees}
                  onChange={(e) => setFees(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label htmlFor="plan-validity">Validity (Days) *</label>
                <input
                  id="plan-validity"
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {(type === 'Hourly' || type === 'Hybrid') && (
              <div>
                <label htmlFor="plan-hours">Total Therapy Hours</label>
                <input
                  id="plan-hours"
                  type="number"
                  min="1"
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan-reminder">Renewal Reminder (Days Before)</label>
                <input
                  id="plan-reminder"
                  type="number"
                  min="1"
                  value={renewalReminder}
                  onChange={(e) => setRenewalReminder(Number(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="plan-shares">Max Share Count</label>
                <input
                  id="plan-shares"
                  type="number"
                  min="1"
                  max="10"
                  disabled={!shareable}
                  value={maxShareCount}
                  onChange={(e) => setMaxShareCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Shareable with Family / Friends</strong>
                <span className="text-[10px] text-muted-foreground">Allows primary guest to share privileges</span>
              </div>
              <input
                type="checkbox"
                checked={shareable}
                onChange={(e) => setShareable(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Active Plan</strong>
                <span className="text-[10px] text-muted-foreground">Available for counter sales</span>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div>
              <label className="mb-2 block">Specific Eligible Services</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-lg">
                {branchServices.map((s) => {
                  const checked = specificServices.includes(s.name);
                  return (
                    <label key={s.id} className="flex items-center gap-2 text-xs !mb-0 font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(s.name)}
                      />
                      <span>{s.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="plan-desc">Description</label>
              <textarea
                id="plan-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Benefits and guest privileges…"
              />
            </div>

            <div className="bg-secondary p-4 rounded-lg flex justify-between items-center">
              <span className="text-xs font-semibold">Total to Pay:</span>
              <strong className="text-base text-primary">{money(fees)}</strong>
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Plan
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
