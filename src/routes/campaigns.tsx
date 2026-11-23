import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Megaphone, Plus, Share2, Copy, Check, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type Campaign } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/campaigns')({
  head: () => pageHead('Campaigns', 'Design, preview, and share seasonal marketing campaigns via WhatsApp and social channels.'),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { campaigns, manager, updateCampaign, createCampaign } = useSpa();
  const [activeGroup, setActiveGroup] = useState<'All' | 'Large' | 'Square' | 'Small'>('All');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modal, setModal] = useState<'' | 'share' | 'create'>('');
  const [copied, setCopied] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState<'Large' | 'Square' | 'Small'>('Large');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sendWithLink, setSendWithLink] = useState(true);
  const [showOnCatalogue, setShowOnCatalogue] = useState(true);

  if (!manager) return null;

  const filtered = campaigns.filter((c) => activeGroup === 'All' || c.group === activeGroup);

  const openShare = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setModal('share');
  };

  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Campaign share link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Unable to copy share link');
    }
  };

  const shareOnWhatsApp = (camp: Campaign) => {
    const text = `🌸 *${camp.title}* at BODE Wellness Spa (${manager.branchId.toUpperCase()})\n\n${camp.description}\n\nView details and reserve: ${camp.shareLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('WhatsApp sharing window opened');
  };

  const shareOnFacebook = (camp: Campaign) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(camp.shareLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Facebook sharing window opened');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Title and image URL required');
      return;
    }

    const payload: Campaign = {
      id: `camp-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      title: title.trim(),
      group,
      imageUrl: imageUrl.trim(),
      description: description.trim(),
      sendWithLink,
      shareLink: `https://bodespa.in/offers/${title.toLowerCase().replace(/\s+/g, '-')}?branch=${manager.branchId}`,
      showOnCatalogue,
      createdAt: new Date().toISOString().split('T')[0],
    };

    createCampaign(payload);
    toast.success('New campaign created');
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Campaign Management"
        description="Seasonal promotions, aesthetic visual flyers, and direct WhatsApp sharing with your branch guests."
      >
        <Button
          onClick={() => {
            setTitle('');
            setGroup('Large');
            setImageUrl('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80');
            setDescription('');
            setSendWithLink(true);
            setShowOnCatalogue(true);
            setModal('create');
          }}
        >
          <Plus /> Create Campaign
        </Button>
      </PageHeading>

      {/* Filter Tabs: Large, Square, Small */}
      <div className="flex gap-2 mb-6">
        {(['All', 'Large', 'Square', 'Small'] as const).map((g) => (
          <Button
            key={g}
            variant={activeGroup === g ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveGroup(g)}
          >
            {g === 'All' ? 'All Formats' : `${g} Banner`}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((camp) => (
          <div
            key={camp.id}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:border-gold transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 bg-primary/20 overflow-hidden">
                <img
                  src={camp.imageUrl}
                  alt={camp.title}
                  className="w-full h-full object-cover"
                />
                <span className="source absolute top-3 left-3 bg-black/60 text-white border-0 text-[10px]">
                  {camp.group} Format
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-lg font-display">{camp.title}</h2>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{camp.description}</p>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Created {camp.createdAt}</span>
                  <span className={camp.showOnCatalogue ? 'text-primary font-medium' : ''}>
                    {camp.showOnCatalogue ? 'On Catalogue' : 'Private'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Button
                className="w-full gap-2 text-xs"
                variant="outline"
                onClick={() => openShare(camp)}
              >
                <Share2 size={13} /> Share with Guests
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Dialog */}
      {modal === 'share' && selectedCampaign && (
        <Modal title={`Share Campaign · ${selectedCampaign.title}`} onClose={() => setModal('')}>
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-border h-48 relative">
              <img
                src={selectedCampaign.imageUrl}
                alt={selectedCampaign.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-base font-display">{selectedCampaign.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedCampaign.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <strong className="text-xs block">Send with Link</strong>
                  <span className="text-[10px] text-muted-foreground">Includes direct booking link in message</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedCampaign.sendWithLink}
                  onChange={(e) => {
                    const updated = { ...selectedCampaign, sendWithLink: e.target.checked };
                    setSelectedCampaign(updated);
                    updateCampaign(updated);
                  }}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <strong className="text-xs block">Show on Digital Catalogue</strong>
                  <span className="text-[10px] text-muted-foreground">Visible on mobile guest portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedCampaign.showOnCatalogue}
                  onChange={(e) => {
                    const updated = { ...selectedCampaign, showOnCatalogue: e.target.checked };
                    setSelectedCampaign(updated);
                    updateCampaign(updated);
                  }}
                  className="w-4 h-4"
                />
              </div>

              {selectedCampaign.sendWithLink && (
                <div className="p-3 border border-border rounded-lg bg-card">
                  <span className="text-[10px] text-muted-foreground block mb-1">Generated Campaign URL</span>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={selectedCampaign.shareLink}
                      className="text-xs bg-muted flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyShareLink(selectedCampaign.shareLink)}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-xs font-semibold mb-2 block">Direct Channels</span>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#25D366] hover:bg-[#1ebd5a] text-white border-0 text-xs"
                  onClick={() => shareOnWhatsApp(selectedCampaign)}
                >
                  <Send size={14} /> Share on WhatsApp
                </Button>
                <Button
                  className="flex-1 bg-[#1877F2] hover:bg-[#166fe5] text-white border-0 text-xs"
                  onClick={() => shareOnFacebook(selectedCampaign)}
                >
                  <ExternalLink size={14} /> Facebook
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <Modal title="Create Campaign Banner" onClose={() => setModal('')}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="camp-title">Campaign Title *</label>
              <input
                id="camp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monsoon Rejuvenation Festival"
                required
              />
            </div>

            <div>
              <label>Banner Dimension Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Large', 'Square', 'Small'] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={group === g ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGroup(g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="camp-img">Banner Image URL *</label>
              <input
                id="camp-img"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label htmlFor="camp-desc">Campaign Description / Promotion Details</label>
              <textarea
                id="camp-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Discounts, free upgrades, and terms…"
              />
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Create & Save Campaign
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
