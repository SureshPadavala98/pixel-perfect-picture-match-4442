import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  Search,
  Award,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Initials, Modal, Status, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { totals, type Customer, type MembershipPlan } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/customers')({
  head: () => pageHead('Customers & CRM', 'Branch guest directory, membership validation, and visit histories.'),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, visits, memberships, manager, createCustomer, updateCustomer } = useSpa();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'visits'>('recent');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [modal, setModal] = useState<'' | 'addGuest' | 'validateMember'>('');

  // Add Guest Form State (Screenshots 20 & 22)
  const [guestMobile, setGuestMobile] = useState('');
  const [guestAltMobile, setGuestAltMobile] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestDob, setGuestDob] = useState('');
  const [guestAnniversary, setGuestAnniversary] = useState('');
  const [guestGst, setGuestGst] = useState('');
  const [guestSource, setGuestSource] = useState('Walk-in');
  const [guestGender, setGuestGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // Membership validation state (Screenshot 25 & 26)
  const [validateId, setValidateId] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    plan?: MembershipPlan;
    customer?: Customer;
    message: string;
  } | null>(null);

  if (!manager) return null;

  const results = customers
    .filter((c) => `${c.name} ${c.mobile} ${c.email} ${c.gstNumber || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'visits') {
        const vA = visits.filter((v) => v.customerId === a.id).length;
        const vB = visits.filter((v) => v.customerId === b.id).length;
        return vB - vA;
      }
      // default: recent visit
      const lastA = visits.filter((v) => v.customerId === a.id).sort((x, y) => y.createdAt.localeCompare(x.createdAt))[0]?.createdAt ?? '';
      const lastB = visits.filter((v) => v.customerId === b.id).sort((x, y) => y.createdAt.localeCompare(x.createdAt))[0]?.createdAt ?? '';
      return lastB.localeCompare(lastA);
    });

  const openAddGuest = () => {
    setGuestMobile('');
    setGuestAltMobile('');
    setGuestName('');
    setGuestEmail('');
    setGuestDob('');
    setGuestAnniversary('');
    setGuestGst('');
    setGuestSource('Walk-in');
    setGuestGender('Female');
    setModal('addGuest');
  };

  const handleMobileLookup = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setGuestMobile(cleaned);
    if (cleaned.length === 10) {
      const existing = customers.find((c) => c.mobile === cleaned);
      if (existing) {
        setGuestName(existing.name);
        setGuestEmail(existing.email || '');
        setGuestAltMobile(existing.alternateMobile || '');
        setGuestDob(existing.dob || '');
        setGuestAnniversary(existing.anniversaryDate || '');
        setGuestGst(existing.gstNumber || '');
        setGuestGender(existing.gender || 'Female');
        setGuestSource(existing.source || 'Walk-in');
        toast.info(`Returning guest found: ${existing.name}. Details prefilled.`);
      }
    }
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !/^\d{10}$/.test(guestMobile)) {
      toast.error('Customer name and 10-digit mobile number are required');
      return;
    }

    const existing = customers.find((c) => c.mobile === guestMobile);
    const payload: Customer = {
      id: existing ? existing.id : `${manager.branchId}-c-${Date.now()}`,
      branchId: manager.branchId,
      name: guestName.trim(),
      mobile: guestMobile,
      whatsapp: guestMobile,
      email: guestEmail.trim(),
      alternateMobile: guestAltMobile.trim() || undefined,
      dob: guestDob || undefined,
      anniversaryDate: guestAnniversary || undefined,
      gstNumber: guestGst.trim().toUpperCase() || undefined,
      source: guestSource,
      gender: guestGender,
      membershipId: existing?.membershipId,
    };

    if (existing) {
      updateCustomer(payload);
      toast.success(`Customer ${payload.name} profile updated`);
    } else {
      createCustomer(payload);
      toast.success(`Guest ${payload.name} registered`);
    }
    setModal('');
  };

  const handleValidateMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateId.trim()) return;

    // Search by membership plan ID or by customer phone / membershipId
    const targetCust = customers.find(
      (c) => c.membershipId === validateId.trim() || c.mobile === validateId.trim()
    );

    const plan = memberships.find(
      (m) => m.id === validateId.trim() || m.id === targetCust?.membershipId
    );

    if (plan) {
      setValidationResult({
        valid: plan.active,
        plan,
        customer: targetCust,
        message: plan.active
          ? `Verified Active ${plan.name} (${plan.type})`
          : `Membership plan ${plan.name} is currently inactive or expired`,
      });
      toast.success('Membership verified');
    } else {
      setValidationResult({
        valid: false,
        message: 'No active membership found for the provided ID or customer number',
      });
      toast.error('Membership validation failed');
    }
  };

  return (
    <>
      <PageHeading
        title="CRM & Customer Management"
        description="Returning guests, client treatment preferences, VIP memberships, and complete visit histories."
      >
        <Button variant="outline" onClick={() => { setValidateId(''); setValidationResult(null); setModal('validateMember'); }}>
          <Award size={15} /> Validate Membership
        </Button>
        <Button onClick={openAddGuest}>
          <Plus size={15} /> Add Guest
        </Button>
      </PageHeading>

      <section className="panel">
        <div className="panel-heading">
          <h2>Branch Guests ({results.length})</h2>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-1 px-3 !w-auto"
              aria-label="Sort guests"
            >
              <option value="recent">Sort by: Recent Visit</option>
              <option value="name">Sort by: Name (A–Z)</option>
              <option value="visits">Sort by: Most Visits</option>
            </select>
          </div>
        </div>

        <div className="filters">
          <input
            placeholder="Search name, mobile number, email, or GST…"
            aria-label="Search customers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile & Contact</th>
                <th>Audience / Source</th>
                <th>Total Visits</th>
                <th>Last Visit</th>
                <th>Membership</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => {
                const history = visits
                  .filter((v) => v.customerId === c.id)
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                const last = history[0];
                const memberPlan = memberships.find((m) => m.id === c.membershipId);

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <Initials name={c.name} />
                        <div>
                          <strong className="block text-xs">{c.name}</strong>
                          <span className="text-[10px] text-muted-foreground">{c.gender || 'Guest'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="font-mono block">{c.mobile}</span>
                        {c.email && <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">{c.email}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="source text-[10px]">{c.source || 'Walk-in'}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-xs">{history.length}</span>
                    </td>
                    <td>
                      <span className="text-xs">{last?.date ?? '—'}</span>
                    </td>
                    <td>
                      {memberPlan ? (
                        <span className="badge font-medium text-gold bg-gold/10 border border-gold/30">
                          {memberPlan.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => setSelected(c)}
                      >
                        Profile <ArrowUpRight size={13} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {results.length === 0 && <div className="empty">No guests found matching your search.</div>}
        </div>
      </section>

      {/* Customer Full Profile Modal */}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              <Initials name={selected.name} />
              <div className="flex-1">
                <strong className="text-sm block">{selected.name}</strong>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📞 {selected.mobile} {selected.alternateMobile && `· Alt: ${selected.alternateMobile}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  ✉️ {selected.email || 'No email provided'}
                </p>
                {selected.gstNumber && (
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    GST: {selected.gstNumber}
                  </p>
                )}
              </div>
              {selected.membershipId && (
                <div className="text-right">
                  <span className="source text-gold font-bold">VIP MEMBER</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Gender</span>
                <strong className="text-xs">{selected.gender || 'Unspecified'}</strong>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Birth Date</span>
                <strong className="text-xs">{selected.dob || '—'}</strong>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Anniversary</span>
                <strong className="text-xs">{selected.anniversaryDate || '—'}</strong>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Acquisition</span>
                <strong className="text-xs">{selected.source || 'Walk-in'}</strong>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-sm font-semibold mb-3">Visit & Service History</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {visits
                  .filter((v) => v.customerId === selected.id)
                  .map((v) => (
                    <div key={v.id} className="p-3 border border-border rounded-lg bg-card">
                      <div className="flex justify-between items-center text-xs">
                        <strong>{v.date} at {v.time}</strong>
                        <Status status={v.status} />
                      </div>
                      <p className="text-xs mt-1 font-medium">{v.services.map((s) => s.name).join(', ')}</p>
                      <div className="mt-2 flex justify-between items-center text-[10px] text-muted-foreground border-t border-border pt-2">
                        <span>Invoice: {v.invoiceNumber || 'Draft'}</span>
                        <span>Paid: {money(totals(v).paid)} · Balance: {money(totals(v).balance)}</span>
                        <Link
                          to="/visits/$visitId"
                          params={{ visitId: v.id }}
                          className="text-primary font-bold hover:underline"
                        >
                          View Visit →
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Guest Modal (Screenshots 20 & 22) */}
      {modal === 'addGuest' && (
        <Modal title="Add New Guest" onClose={() => setModal('')}>
          <form onSubmit={handleSaveGuest} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crm-mobile">Mobile Number *</label>
                <input
                  id="crm-mobile"
                  value={guestMobile}
                  onChange={(e) => handleMobileLookup(e.target.value)}
                  placeholder="10-digit primary mobile"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label htmlFor="crm-altmobile">Alternate Mobile Number</label>
                <input
                  id="crm-altmobile"
                  value={guestAltMobile}
                  onChange={(e) => setGuestAltMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Secondary phone (optional)"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crm-name">Guest Name *</label>
                <input
                  id="crm-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="crm-email">Email Address</label>
                <input
                  id="crm-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crm-dob">Date of Birth</label>
                <input
                  id="crm-dob"
                  type="date"
                  value={guestDob}
                  onChange={(e) => setGuestDob(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="crm-anni">Anniversary Date</label>
                <input
                  id="crm-anni"
                  type="date"
                  value={guestAnniversary}
                  onChange={(e) => setGuestAnniversary(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crm-gst">GST Number (Optional)</label>
                <input
                  id="crm-gst"
                  value={guestGst}
                  onChange={(e) => setGuestGst(e.target.value.toUpperCase())}
                  placeholder="e.g. 36AABCU9603R1ZM"
                />
              </div>
              <div>
                <label>Guest Source</label>
                <select value={guestSource} onChange={(e) => setGuestSource(e.target.value)}>
                  <option>Walk-in</option>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Social Media</option>
                  <option>Phone Booking</option>
                </select>
              </div>
            </div>

            <div>
              <label>Gender</label>
              <div className="flex gap-2">
                {(['Female', 'Male', 'Other'] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={guestGender === g ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setGuestGender(g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              <CheckCircle2 /> Save Guest Record
            </Button>
          </form>
        </Modal>
      )}

      {/* Validate Membership Dialog (Screenshots 25 & 26) */}
      {modal === 'validateMember' && (
        <Modal title="Validate Membership" onClose={() => setModal('')}>
          <form onSubmit={handleValidateMembership} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Enter the guest's Membership ID or registered mobile number to confirm active benefits and privileges.
            </p>

            <div className="flex gap-2">
              <input
                placeholder="Enter Membership ID or 10-digit mobile…"
                value={validateId}
                onChange={(e) => setValidateId(e.target.value)}
                className="text-xs"
                required
              />
              <Button type="submit" size="sm">
                Apply / Validate
              </Button>
            </div>

            {validationResult && (
              <div className={`p-4 rounded-lg border mt-4 ${validationResult.valid ? 'bg-primary/10 border-primary/40' : 'bg-destructive/10 border-destructive/40'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.valid ? (
                    <CheckCircle2 className="text-primary" size={20} />
                  ) : (
                    <ShieldCheck className="text-destructive" size={20} />
                  )}
                  <strong className="text-sm">{validationResult.message}</strong>
                </div>

                {validationResult.plan && (
                  <div className="space-y-1.5 text-xs pt-2 border-t border-border mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan Name:</span>
                      <strong className="font-semibold">{validationResult.plan.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription Type:</span>
                      <span>{validationResult.plan.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validity:</span>
                      <span>{validationResult.plan.validityDays} Days</span>
                    </div>
                    {validationResult.plan.totalHours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Therapy Hours:</span>
                        <span>{validationResult.plan.totalHours} Hours</span>
                      </div>
                    )}
                    {validationResult.customer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Associated Guest:</span>
                        <span className="font-semibold text-primary">{validationResult.customer.name} ({validationResult.customer.mobile})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </Modal>
      )}
    </>
  );
}

