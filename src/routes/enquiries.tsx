import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { MessageSquare, Plus, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, Status, pageHead } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { today, type EnquiryItem } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/enquiries')({
  head: () => pageHead('Enquiries', 'Branch guest enquiries, consultation requests, and lead follow-ups.'),
  component: EnquiriesPage,
});

function EnquiriesPage() {
  const { enquiries, manager, createEnquiry, updateEnquiry } = useSpa();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [serviceInterest, setServiceInterest] = useState('');
  const [source, setSource] = useState('Website Enquiry');
  const [notes, setNotes] = useState('');

  if (!manager) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      toast.error('Name and mobile number are required');
      return;
    }
    const payload: EnquiryItem = {
      id: `enq-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      mobile: mobile.trim(),
      serviceInterest: serviceInterest.trim() || 'General Wellness',
      source,
      status: 'New',
      date: today(),
      notes: notes.trim(),
    };
    createEnquiry(payload);
    toast.success('Enquiry logged');
    setModal(false);
  };

  const updateStatus = (enq: EnquiryItem, status: EnquiryItem['status']) => {
    updateEnquiry({ ...enq, status });
    toast.success(`Status updated to ${status}`);
  };

  const openWhatsApp = (enq: EnquiryItem) => {
    const text = `Hello ${enq.name}, greetings from BODE Wellness Spa (${manager.branchId.toUpperCase()}). We received your enquiry regarding ${enq.serviceInterest}. How may we assist you today?`;
    window.open(`https://wa.me/91${enq.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <PageHeading title="Guest Enquiries" description="Manage treatment consultations, membership enquiries, and prospective guest follow-ups.">
        <Button onClick={() => setModal(true)}>
          <Plus /> New Enquiry
        </Button>
      </PageHeading>

      <section className="panel">
        <div className="panel-heading">
          <h2>Active Enquiries ({enquiries.length})</h2>
          <MessageSquare size={20} className="text-gold" />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Service Interest</th>
                <th>Source</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id}>
                  <td>
                    <strong className="text-sm block">{enq.name}</strong>
                    <span className="text-xs text-muted-foreground">{enq.mobile}</span>
                  </td>
                  <td>
                    <span className="font-medium text-xs">{enq.serviceInterest}</span>
                  </td>
                  <td>
                    <span className="source">{enq.source}</span>
                  </td>
                  <td className="text-xs text-muted-foreground">{enq.date}</td>
                  <td className="text-xs max-w-xs truncate text-muted-foreground">{enq.notes || '—'}</td>
                  <td>
                    <select
                      className="text-[11px] py-1 px-2 !w-auto"
                      value={enq.status}
                      onChange={(e) => updateStatus(enq, e.target.value as EnquiryItem['status'])}
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Converted</option>
                      <option>Closed</option>
                    </select>
                  </td>
                  <td>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => openWhatsApp(enq)}
                    >
                      <Send size={12} /> WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enquiries.length === 0 && <div className="empty">No guest enquiries logged.</div>}
        </div>
      </section>

      {modal && (
        <Modal title="Add Guest Enquiry" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="enq-name">Guest Name *</label>
              <input
                id="enq-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <label htmlFor="enq-mobile">Mobile Number *</label>
              <input
                id="enq-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                required
              />
            </div>

            <div>
              <label htmlFor="enq-interest">Service of Interest</label>
              <input
                id="enq-interest"
                value={serviceInterest}
                onChange={(e) => setServiceInterest(e.target.value)}
                placeholder="e.g. Deep Tissue Massage, Couple Spa, Platinum Plan"
              />
            </div>

            <div>
              <label>Enquiry Channel</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option>Website Enquiry</option>
                <option>Phone Call</option>
                <option>Walk-in Inquiry</option>
                <option>Instagram Ad</option>
                <option>Google Maps</option>
              </select>
            </div>

            <div>
              <label htmlFor="enq-notes">Notes / Special Requests</label>
              <textarea
                id="enq-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferred timing, specific requirements…"
              />
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Log Enquiry
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
