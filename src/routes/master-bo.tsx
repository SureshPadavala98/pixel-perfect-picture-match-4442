import { createFileRoute, Link } from '@tanstack/react-router';
import { Database, Shield, Layers, Package, Award, Gift, Megaphone, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, pageHead } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';

export const Route = createFileRoute('/master-bo')({
  head: () => pageHead('Master Backoffice', 'Central operational switchboard and master entity oversight for BODE branches.'),
  component: MasterBOPage,
});

function MasterBOPage() {
  const { serviceCategories, productCategories, memberships, giftCards, packages, staff, manager } = useSpa();

  if (!manager) return null;

  const modules = [
    { title: 'Service Categories', count: `${serviceCategories.length} categories`, to: '/services' as const, icon: Layers, desc: 'Therapy groupings & staff service eligibility' },
    { title: 'Product Inventory Categories', count: `${productCategories.length} categories`, to: '/products' as const, icon: Package, desc: 'Consumables & retail wellness items' },
    { title: 'Membership Plans', count: `${memberships.length} active plans`, to: '/memberships' as const, icon: Award, desc: 'Fixed, Percentage, Hourly and Hybrid plans' },
    { title: 'Gift Cards', count: `${giftCards.length} denominations`, to: '/gift-cards' as const, icon: Gift, desc: 'Festive & celebration passes' },
    { title: 'Ritual Packages', count: `${packages.length} bundled rituals`, to: '/packages' as const, icon: Database, desc: 'Multi-service treatment combinations' },
    { title: 'Campaign Studio', count: 'Active promotions', to: '/campaigns' as const, icon: Megaphone, desc: 'Social & WhatsApp marketing assets' },
  ];

  return (
    <>
      <PageHeading
        title="Master Backoffice"
        description="Operational registry and master configuration switchboard for your branch."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <div key={m.title} className="panel p-6 flex flex-col justify-between hover:border-gold transition-colors">
            <div>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                <m.icon size={22} />
              </div>
              <h2 className="text-lg font-display">{m.title}</h2>
              <span className="source mt-1 inline-block">{m.count}</span>
              <p className="text-xs text-muted-foreground mt-3">{m.desc}</p>
            </div>

            <Button asChild variant="outline" size="sm" className="w-full mt-6 gap-1">
              <Link to={m.to}>
                Open Configuration <ArrowUpRight size={14} />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
