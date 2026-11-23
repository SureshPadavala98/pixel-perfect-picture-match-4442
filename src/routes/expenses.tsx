import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ReceiptText, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { today, type ExpenseItem } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/expenses')({
  head: () => pageHead('Expenses', 'Branch operational costs, inventory procurement, and daily maintenance register.'),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, manager, createExpense } = useSpa();
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('Supplies');
  const [amount, setAmount] = useState(1000);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('UPI');
  const [date, setDate] = useState(today());

  if (!manager) return null;

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !paidTo.trim() || amount <= 0) {
      toast.error('Fill in all required expense fields');
      return;
    }
    const payload: ExpenseItem = {
      id: `exp-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      paidTo: paidTo.trim(),
      paymentMethod,
      approvedBy: manager.name,
    };
    createExpense(payload);
    toast.success('Expense recorded');
    setModal(false);
  };

  return (
    <>
      <PageHeading title="Branch Expenses" description="Record daily supplies, utility bills, maintenance, and petty cash outlays.">
        <Button onClick={() => setModal(true)}>
          <Plus /> Record Expense
        </Button>
      </PageHeading>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="panel p-5">
          <span className="text-xs text-muted-foreground block">Total Expenses Recorded</span>
          <strong className="text-2xl font-bold block mt-2 text-primary">{money(totalExpense)}</strong>
        </div>
        <div className="panel p-5">
          <span className="text-xs text-muted-foreground block">Expense Entries</span>
          <strong className="text-2xl font-bold block mt-2">{expenses.length} records</strong>
        </div>
        <div className="panel p-5">
          <span className="text-xs text-muted-foreground block">Branch Authorized By</span>
          <strong className="text-2xl font-bold block mt-2">{manager.name.split(' ')[0]}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Expense Register</h2>
          <ReceiptText size={20} className="text-gold" />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Expense Detail</th>
                <th>Category</th>
                <th>Paid To</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong className="text-sm block">{e.title}</strong>
                    <span className="text-[10px] text-muted-foreground">Approved by {e.approvedBy}</span>
                  </td>
                  <td>
                    <span className="source">{e.category}</span>
                  </td>
                  <td>{e.paidTo}</td>
                  <td className="text-xs text-muted-foreground">{e.date}</td>
                  <td>
                    <span className="badge">{e.paymentMethod}</span>
                  </td>
                  <td className="font-bold text-destructive">−{money(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && <div className="empty">No expenses recorded for this branch.</div>}
        </div>
      </section>

      {modal && (
        <Modal title="Record New Expense" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="exp-title">Expense Title / Description *</label>
              <input
                id="exp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Essential Oils Restock"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                >
                  <option>Supplies</option>
                  <option>Maintenance</option>
                  <option>Utilities</option>
                  <option>Staff</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="exp-amount">Amount (₹) *</label>
                <input
                  id="exp-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="exp-paidto">Paid To (Vendor / Person) *</label>
                <input
                  id="exp-paidto"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="e.g. Vendor Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="exp-date">Date</label>
                <input
                  id="exp-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label>Payment Method</label>
              <div className="flex gap-2">
                {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={paymentMethod === m ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Submit Expense Entry
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
