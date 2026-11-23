import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { LayoutTemplate, QrCode, Sparkles, Copy, Check, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type HomepageConfig } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/homepage-management')({
  head: () => pageHead('Homepage Management', 'Configure promotional banners, trending services, and guest QR code catalogue.'),
  component: HomepageManagementPage,
});

function HomepageManagementPage() {
  const { homepageConfig, catalogue, manager, updateHomepage } = useSpa();
  const [modal, setModal] = useState<'' | 'banner' | 'trending'>('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [bannerUrl, setBannerUrl] = useState(homepageConfig?.bannerUrl ?? '');
  const [bannerTitle, setBannerTitle] = useState(homepageConfig?.bannerTitle ?? '');
  const [bannerActive, setBannerActive] = useState(homepageConfig?.bannerActive ?? true);
  const [trendingIds, setTrendingIds] = useState<string[]>(homepageConfig?.trendingServiceIds ?? []);

  if (!manager) return null;

  const branchCatalogue = catalogue.filter((s) => s.branchId === manager.branchId);
  const trendingServices = branchCatalogue.filter((s) => (homepageConfig?.trendingServiceIds ?? []).includes(s.id));
  const catalogueUrl = homepageConfig?.catalogueUrl ?? `https://bodespa.in/branches/${manager.branchId}/catalogue`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(catalogueUrl);
      setCopied(true);
      toast.success('Catalogue URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageConfig) return;
    updateHomepage({
      ...homepageConfig,
      bannerUrl,
      bannerTitle,
      bannerActive,
    });
    toast.success('Promotional banner updated');
    setModal('');
  };

  const toggleTrending = (id: string) => {
    setTrendingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveTrending = () => {
    if (!homepageConfig) return;
    updateHomepage({
      ...homepageConfig,
      trendingServiceIds: trendingIds,
    });
    toast.success('Trending services updated');
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Homepage Management"
        description="Curate public-facing promotional banners, highlight signature treatments, and export the digital QR catalogue."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Banner Section */}
        <section className="panel p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2>Promotional Banner</h2>
              <span className="text-xs text-muted-foreground">Featured hero presentation for {manager.branchId.toUpperCase()} guests</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBannerUrl(homepageConfig?.bannerUrl ?? '');
                setBannerTitle(homepageConfig?.bannerTitle ?? '');
                setBannerActive(homepageConfig?.bannerActive ?? true);
                setModal('banner');
              }}
            >
              Replace Banner
            </Button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-border h-64 bg-primary flex items-end">
            <img
              src={homepageConfig?.bannerUrl}
              alt="Promotional Banner Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 p-6 text-primary-foreground max-w-lg">
              <span className="source bg-gold/90 text-primary-foreground font-semibold uppercase text-[9px] mb-2 inline-block">
                {homepageConfig?.bannerActive ? 'LIVE PROMOTION' : 'OFFLINE DRAFT'}
              </span>
              <h2 className="text-2xl font-display text-white">{homepageConfig?.bannerTitle}</h2>
              <p className="text-xs text-white/80 mt-1">Available exclusively at {manager.branchId === 'amr' ? 'AMR Planet Mall, ECIL' : 'SVM Grand Hotel, Nagole'}</p>
            </div>
          </div>
        </section>

        {/* Digital QR Code */}
        <section className="panel p-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="panel-heading !p-0 !mb-4">
              <h2>Digital Catalogue QR</h2>
              <QrCode size={18} className="text-gold" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Place this QR code at your reception counter or treatment suites for guests to browse treatments on their phones.
            </p>

            <div className="bg-white p-6 rounded-xl border border-border flex flex-col items-center justify-center my-4">
              {/* SVG QR Code Simulation */}
              <div className="w-36 h-36 border-4 border-primary rounded-lg flex items-center justify-center p-2 relative bg-neutral-50">
                <QrCode size={110} className="text-primary" />
              </div>
              <span className="text-[10px] font-mono font-bold text-primary mt-2">BODE · {manager.branchId.toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full text-xs" onClick={copyUrl}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied Link!' : 'Copy Catalogue Link'}
            </Button>
            <Button
              className="w-full text-xs"
              onClick={() => {
                toast.success('Downloading high-resolution print QR code…');
              }}
            >
              <Download size={14} /> Download Print QR Code
            </Button>
          </div>
        </section>

        {/* Trending Services */}
        <section className="panel p-5 lg:col-span-3">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
            <div>
              <h2>Trending Services</h2>
              <span className="text-xs text-muted-foreground">Therapies prominently highlighted on the branch homepage</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTrendingIds(homepageConfig?.trendingServiceIds ?? []);
                setModal('trending');
              }}
            >
              Edit Selections ({trendingServices.length})
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {trendingServices.map((s, idx) => (
              <div key={s.id} className="p-4 border border-border rounded-lg bg-card flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-gold block mb-1">#{idx + 1} TRENDING</span>
                  <strong className="text-sm block">{s.name}</strong>
                  <span className="text-xs text-muted-foreground">{s.duration} mins · {s.category}</span>
                </div>
                <span className="text-sm font-bold text-primary">{money(s.price)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Banner Modal */}
      {modal === 'banner' && (
        <Modal title="Configure Promotional Banner" onClose={() => setModal('')}>
          <form onSubmit={handleSaveBanner} className="space-y-4">
            <div>
              <label htmlFor="banner-title">Promotion Headline *</label>
              <input
                id="banner-title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="banner-url">Banner Image URL *</label>
              <input
                id="banner-url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Active on Homepage</strong>
                <span className="text-[10px] text-muted-foreground">Visible to website visitors</span>
              </div>
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Banner
            </Button>
          </form>
        </Modal>
      )}

      {/* Trending Modal */}
      {modal === 'trending' && (
        <Modal title="Select Trending Services" onClose={() => setModal('')}>
          <p className="text-xs text-muted-foreground mb-4">
            Choose which signature therapies from your branch catalogue will be displayed in the trending section:
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {branchCatalogue.map((s) => {
              const selected = trendingIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${selected ? 'border-primary bg-secondary' : 'border-border'}`}
                  onClick={() => toggleTrending(s.id)}
                >
                  <div>
                    <strong className="text-xs block">{s.name}</strong>
                    <span className="text-[10px] text-muted-foreground">{s.duration} mins · {money(s.price)}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                </div>
              );
            })}
          </div>

          <Button className="w-full mt-5" onClick={handleSaveTrending}>
            <Check /> Save Trending Selections
          </Button>
        </Modal>
      )}
    </>
  );
}
