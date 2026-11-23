import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type SpaPackage } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/packages')({
  head: () => pageHead('Spa Packages', 'Bundled therapy rituals and multi-service packages for guests.'),
  component: PackagesPage,
});

function PackagesPage() {
  const { packages, catalogue, manager, createPackage } = useSpa();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(120);
  const [price, setPrice] = useState(3999);
  const [validityDays, setValidityDays] = useState(60);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  if (!manager) return null;

  const branchServices = catalogue.filter((s) => s.branchId === manager.branchId);

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((x) => x !== srv) : [...prev, srv]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Package name is required');
      return;
    }
    const payload: SpaPackage = {
      id: `pkg-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      services: selectedServices,
      duration: Number(duration),
      price: Number(price),
      validityDays: Number(validityDays),
      active: true,
    };
    createPackage(payload);
    toast.success('New spa package added');
    setModal(false);
  };

  return (
    <>
      <PageHeading title="Packages" description="Curated multi-treatment rituals and wellness day packages.">
        <Button onClick={() => setModal(true)}>
          <Plus /> Create Package
        </Button>
      </PageHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border border-border rounded-xl p-6 bg-card flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="source font-medium">{pkg.duration} Mins</span>
                <span className="badge completed">Active</span>
              </div>
              <h2 className="text-xl font-display mt-2">{pkg.name}</h2>
              <div className="text-2xl font-bold text-primary mt-1">{money(pkg.price)}</div>

              <div className="mt-4 pt-3 border-t border-border space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Included Therapies</span>
                <div className="flex flex-wrap gap-1">
                  {pkg.services.map((srv) => (
                    <span key={srv} className="badge">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
              <span>Validity: {pkg.validityDays} days</span>
              <span>Branch: {manager.branchId.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Create Spa Package" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="pkg-name">Package Name *</label>
              <input
                id="pkg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Total Serenity Ritual"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pkg-price">Package Price (₹) *</label>
                <input
                  id="pkg-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label htmlFor="pkg-duration">Duration (Minutes)</label>
                <input
                  id="pkg-duration"
                  type="number"
                  min="30"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block">Select Included Services</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-lg">
                {branchServices.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs !mb-0 font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.name)}
                      onChange={() => toggleService(s.name)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Package
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
