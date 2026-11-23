import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Layers, Plus, Edit2, Check, X, Eye, EyeOff, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Modal, Initials, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { type ServiceCategory, type Staff } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/services')({
  head: () => pageHead('Service Categories', 'Configure branch service categories, assigned therapists, and catalogue visibility.'),
  component: ServicesPage,
});

function ServicesPage() {
  const { serviceCategories, staff, catalogue, manager, updateServiceCategory, createServiceCategory } = useSpa();
  const [modal, setModal] = useState<'' | 'add' | 'edit'>('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [position, setPosition] = useState(1);
  const [group, setGroup] = useState<'Both' | 'Female' | 'Male'>('Both');
  const [hideFromCatalogue, setHideFromCatalogue] = useState(false);
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [bothImg, setBothImg] = useState('');
  const [femaleImg, setFemaleImg] = useState('');
  const [maleImg, setMaleImg] = useState('');

  if (!manager) return null;

  const branchStaff = staff.filter((s) => s.branchId === manager.branchId);

  const openCreate = () => {
    setName('');
    setActive(true);
    setPosition(serviceCategories.length + 1);
    setGroup('Both');
    setHideFromCatalogue(false);
    setAssignedStaffIds(branchStaff.map((s) => s.id));
    setBothImg('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80');
    setFemaleImg('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80');
    setMaleImg('https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80');
    setActiveCategory(null);
    setModal('add');
  };

  const openEdit = (cat: ServiceCategory) => {
    setActiveCategory(cat);
    setName(cat.name);
    setActive(cat.active);
    setPosition(cat.position);
    setGroup(cat.group);
    setHideFromCatalogue(cat.hideFromCatalogue);
    setAssignedStaffIds(cat.assignedStaffIds ?? []);
    setBothImg(cat.images?.both ?? '');
    setFemaleImg(cat.images?.female ?? '');
    setMaleImg(cat.images?.male ?? '');
    setModal('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const payload: ServiceCategory = {
      id: activeCategory ? activeCategory.id : `cat-${manager.branchId}-${Date.now()}`,
      branchId: manager.branchId,
      name: name.trim(),
      active,
      position: Number(position),
      group,
      hideFromCatalogue,
      images: {
        both: bothImg,
        female: femaleImg,
        male: maleImg,
      },
      assignedStaffIds,
    };

    if (activeCategory) {
      updateServiceCategory(payload);
      toast.success('Category updated successfully');
    } else {
      createServiceCategory(payload);
      toast.success('New service category added');
    }
    setModal('');
  };

  const toggleStaff = (staffId: string) => {
    setAssignedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  };

  return (
    <>
      <PageHeading
        title="Service Categories"
        description="Organize treatments, allocate therapist eligibility, and configure guest catalogue display."
      >
        <Button onClick={openCreate}>
          <Plus /> Add Category
        </Button>
      </PageHeading>

      <section className="panel">
        <div className="panel-heading">
          <h2>Active Categories ({serviceCategories.length})</h2>
          <Layers size={20} className="text-gold" />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Audience</th>
                <th>Assigned Staff</th>
                <th>Catalogue Visibility</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {serviceCategories
                .sort((a, b) => a.position - b.position)
                .map((cat) => {
                  const eligibleStaff = branchStaff.filter((s) => cat.assignedStaffIds?.includes(s.id));
                  return (
                    <tr key={cat.id}>
                      <td className="font-mono text-xs">{cat.position}</td>
                      <td>
                        <strong className="text-sm block">{cat.name}</strong>
                      </td>
                      <td>
                        <span className="source">{cat.group}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {eligibleStaff.map((s) => (
                            <span key={s.id} className="badge">
                              {s.name}
                            </span>
                          ))}
                          {eligibleStaff.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">None assigned</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {cat.hideFromCatalogue ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <EyeOff size={14} /> Hidden
                          </span>
                        ) : (
                          <span className="text-xs text-primary font-medium flex items-center gap-1">
                            <Eye size={14} /> Visible
                          </span>
                        )}
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
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit / Add Modal */}
      {modal && (
        <Modal
          title={modal === 'edit' ? `Edit Category · ${name}` : 'Add Service Category'}
          onClose={() => setModal('')}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Massages"
                  required
                />
              </div>
              <div>
                <label htmlFor="cat-position">Display Position</label>
                <input
                  id="cat-position"
                  type="number"
                  min="1"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label>Audience / Group</label>
              <div className="flex gap-2">
                {(['Both', 'Female', 'Male'] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={group === g ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setGroup(g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Active Status</strong>
                <span className="text-[10px] text-muted-foreground">Category available for booking</span>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <strong className="text-xs block">Hide from Digital Catalogue</strong>
                <span className="text-[10px] text-muted-foreground">Only accessible internally by managers</span>
              </div>
              <input
                type="checkbox"
                checked={hideFromCatalogue}
                onChange={(e) => setHideFromCatalogue(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {/* Assigned Staff Multiselect Chips */}
            <div>
              <label className="mb-2 block">Assigned Staff Eligibility</label>
              <p className="text-[10px] text-muted-foreground mb-2">
                Select therapists from {manager.branchId.toUpperCase()} branch eligible to perform these services:
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {branchStaff.map((s) => {
                  const isSelected = assignedStaffIds.includes(s.id);
                  return (
                    <Button
                      key={s.id}
                      type="button"
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className="text-xs h-7 gap-1"
                      onClick={() => toggleStaff(s.id)}
                    >
                      {s.name}
                      {isSelected ? <X size={12} /> : <Plus size={12} />}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Image URLs */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="eyebrow">CATEGORY BANNER IMAGES</div>
              <div>
                <label className="text-[11px]">Image URL (Both)</label>
                <input
                  value={bothImg}
                  onChange={(e) => setBothImg(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px]">Female Banner</label>
                  <input
                    value={femaleImg}
                    onChange={(e) => setFemaleImg(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px]">Male Banner</label>
                  <input
                    value={maleImg}
                    onChange={(e) => setMaleImg(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-5">
              <Check /> Save Category Configuration
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
