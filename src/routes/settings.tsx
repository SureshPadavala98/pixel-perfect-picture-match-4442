import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Settings, Shield, MapPin, Bell, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, pageHead } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { branches } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/settings')({
  head: () => pageHead('Settings', 'Branch operational preferences, operating hours, and communication settings.'),
  component: SettingsPage,
});

function SettingsPage() {
  const { manager } = useSpa();
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [taxRate, setTaxRate] = useState(5);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  if (!manager) return null;

  const branch = branches[manager.branchId];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Branch settings saved successfully');
  };

  return (
    <>
      <PageHeading
        title="Branch Settings"
        description="Configuration for operating hours, invoice defaults, and notification preferences."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Branch Identity */}
            <section className="panel p-5">
              <div className="panel-heading !p-0 !mb-4">
                <h2>Assigned Branch</h2>
                <Shield size={18} className="text-primary" />
              </div>

              <div className="p-4 bg-secondary rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="branch-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong className="text-sm block">{branch.name}</strong>
                    <span className="text-xs text-muted-foreground">{branch.area} · Hyderabad</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  * Note: In accordance with BODE management policies, each manager account is permanently assigned to their respective branch. Branch switching is restricted to executive administrators.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label>Branch Address</label>
                  <input readOnly value={branch.address} className="bg-muted text-xs" />
                </div>
                <div>
                  <label>Contact Phone</label>
                  <input readOnly value={branch.contact} className="bg-muted text-xs" />
                </div>
              </div>
            </section>

            {/* Operating Hours */}
            <section className="panel p-5">
              <div className="panel-heading !p-0 !mb-4">
                <h2>Branch Operating Hours</h2>
                <Clock size={18} className="text-gold" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="open-time">Daily Opening Time</label>
                  <input
                    id="open-time"
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="close-time">Daily Closing Time</label>
                  <input
                    id="close-time"
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Billing & Taxes */}
            <section className="panel p-5">
              <div className="panel-heading !p-0 !mb-4">
                <h2>Billing & Taxes</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tax-rate">Standard GST Tax Rate (%)</label>
                  <input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="28"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Consolidated Invoice Prefix</label>
                  <input
                    readOnly
                    value={`BODE-${manager.branchId.toUpperCase()}-`}
                    className="bg-muted text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="panel p-5">
              <div className="panel-heading !p-0 !mb-4">
                <h2>Notifications & Communications</h2>
                <Bell size={18} className="text-gold" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">WhatsApp Invoice Dispatch</strong>
                    <span className="text-[10px] text-muted-foreground">Pre-format WhatsApp bills for guest delivery</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">SMS Booking Confirmation</strong>
                    <span className="text-[10px] text-muted-foreground">Send automated SMS for online bookings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </section>

            <Button type="submit" className="w-full">
              <Check /> Save Preferences
            </Button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-5">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold mb-2">Manager Session</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logged In Manager:</span>
                <span className="font-semibold">{manager.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono">{manager.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch Access:</span>
                <span className="font-semibold text-primary">{manager.branchId.toUpperCase()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
