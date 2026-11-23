import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Package, Plus, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type ProductCategory, type ProductItem } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/products')({
  head: () => pageHead('Product Categories', 'Manage branch spa consumables, retail oils, and inventory categories.'),
  component: ProductsPage,
});

function ProductsPage() {
  const { productCategories, products, manager, updateProductCategory, createProductCategory } = useSpa();
  const [modal, setModal] = useState<'' | 'add' | 'edit'>('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);

  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  if (!manager) return null;

  const openCreate = () => {
    setName('');
    setActive(true);
    setItemCount(0);
    setActiveCategory(null);
    setModal('add');
  };

  const openEdit = (cat: ProductCategory) => {
    setActiveCategory(cat);
    setName(cat.name);
    setActive(cat.active);
    setItemCount(cat.itemCount);
    setModal('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name required');
      return;
    }

    const payload: ProductCategory = {
      id: activeCategory ? activeCategory.id : `prod-cat-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      active,
      itemCount: Number(itemCount),
    };

    if (activeCategory) {
      updateProductCategory(payload);
      toast.success('Product category updated');
    } else {
      createProductCategory(payload);
      toast.success('New product category created');
    }
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Product Categories"
        description="Consumables, retail herbal products, and operational stock categories."
      >
        <Button onClick={openCreate}>
          <Plus /> Add Product Category
        </Button>
      </PageHeading>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="panel lg:col-span-2">
          <div className="panel-heading">
            <h2>Product Categories ({productCategories.length})</h2>
            <Package size={20} className="text-gold" />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Configured Items</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <strong className="text-sm block">{cat.name}</strong>
                    </td>
                    <td>
                      <span className="source">{cat.itemCount} items</span>
                    </td>
                    <td>
                      <span className={`badge ${cat.active ? 'completed' : 'cancelled'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(cat)}
                        className="gap-1 text-xs"
                      >
                        <Edit2 size={13} /> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Retail Showcase */}
        <section className="panel p-5 lg:col-span-1">
          <div className="panel-heading !p-0 !mb-4">
            <h2>Branch Retail Products</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Sample retail items available at {manager.branchId.toUpperCase()} branch counter:
          </p>
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-3 border border-border rounded-lg bg-card flex justify-between items-center">
                <div>
                  <strong className="text-xs block">{p.name}</strong>
                  <span className="text-[10px] text-muted-foreground">In Stock: {p.stock} units</span>
                </div>
                <span className="text-xs font-bold text-primary">{money(p.price)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {modal && (
        <Modal
          title={modal === 'edit' ? `Edit Category · ${name}` : 'Add Product Category'}
          onClose={() => setModal('')}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="prod-cat-name">Category Name *</label>
              <input
                id="prod-cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kama Ayurveda Organic"
                required
              />
            </div>

            <div>
              <label htmlFor="prod-cat-count">Items Count</label>
              <input
                id="prod-cat-count"
                type="number"
                min="0"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Active Status</strong>
                <span className="text-[10px] text-muted-foreground">Enable category for branch billing</span>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Category
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
