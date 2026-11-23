import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  seedData,
  managers,
  branchVisits,
  type SpaData,
  type Manager,
  type Visit,
  type Customer,
  type Staff,
  type ServiceCategory,
  type ProductCategory,
  type ProductItem,
  type MembershipPlan,
  type GiftCard,
  type SaleRecord,
  type Campaign,
  type HomepageConfig,
  type SpaPackage,
  type ExpenseItem,
  type EnquiryItem,
} from './spa-model';

interface SpaContextValue {
  data: SpaData;
  manager: Manager | null;
  ready: boolean;
  login: (username: string, password: string, remember: boolean) => boolean;
  logout: () => void;
  activity: (text: string) => void;

  // Branch-scoped entity getters
  visits: Visit[];
  customers: Customer[];
  staff: Staff[];
  serviceCategories: ServiceCategory[];
  productCategories: ProductCategory[];
  products: ProductItem[];
  memberships: MembershipPlan[];
  giftCards: GiftCard[];
  sales: SaleRecord[];
  campaigns: Campaign[];
  homepageConfig: HomepageConfig | null;
  packages: SpaPackage[];
  expenses: ExpenseItem[];
  enquiries: EnquiryItem[];

  // Mutations
  updateVisit: (visit: Visit) => void;
  createVisit: (visit: Visit, customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  createCustomer: (customer: Customer) => void;
  updateStaff: (staff: Staff) => void;
  createStaff: (staff: Staff) => void;
  updateServiceCategory: (category: ServiceCategory) => void;
  createServiceCategory: (category: ServiceCategory) => void;
  updateProductCategory: (category: ProductCategory) => void;
  createProductCategory: (category: ProductCategory) => void;
  updateMembership: (plan: MembershipPlan) => void;
  createMembership: (plan: MembershipPlan) => void;
  updateGiftCard: (giftCard: GiftCard) => void;
  createGiftCard: (giftCard: GiftCard) => void;
  createSale: (sale: SaleRecord) => void;
  updateSale: (sale: SaleRecord) => void;
  updateCampaign: (campaign: Campaign) => void;
  createCampaign: (campaign: Campaign) => void;
  updateHomepage: (config: HomepageConfig) => void;
  createPackage: (pkg: SpaPackage) => void;
  createExpense: (expense: ExpenseItem) => void;
  createEnquiry: (enquiry: EnquiryItem) => void;
  updateEnquiry: (enquiry: EnquiryItem) => void;
}

const SpaContext = createContext<SpaContextValue | null>(null);

export function SpaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SpaData>(() => seedData());
  const [manager, setManager] = useState<Manager | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bode-spa-data-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const fresh = seedData();
        // Merge so missing fields from older localStorage are populated
        setData({
          ...fresh,
          ...parsed,
          staff: parsed.staff?.length ? parsed.staff : fresh.staff,
          serviceCategories: parsed.serviceCategories?.length ? parsed.serviceCategories : fresh.serviceCategories,
          productCategories: parsed.productCategories?.length ? parsed.productCategories : fresh.productCategories,
          products: parsed.products?.length ? parsed.products : fresh.products,
          memberships: parsed.memberships?.length ? parsed.memberships : fresh.memberships,
          giftCards: parsed.giftCards?.length ? parsed.giftCards : fresh.giftCards,
          sales: parsed.sales?.length ? parsed.sales : fresh.sales,
          campaigns: parsed.campaigns?.length ? parsed.campaigns : fresh.campaigns,
          homepage: parsed.homepage ?? fresh.homepage,
          packages: parsed.packages?.length ? parsed.packages : fresh.packages,
          expenses: parsed.expenses?.length ? parsed.expenses : fresh.expenses,
          enquiries: parsed.enquiries?.length ? parsed.enquiries : fresh.enquiries,
        });
      }
      const id = sessionStorage.getItem('bode-manager') || localStorage.getItem('bode-manager');
      setManager(managers.find((m) => m.id === id) ?? null);
    } catch {
      localStorage.removeItem('bode-spa-data-v1');
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem('bode-spa-data-v1', JSON.stringify(data));
  }, [data, ready]);

  const login = (username: string, password: string, remember: boolean) => {
    const m = managers.find((m) => m.username === username && m.password === password);
    if (!m) return false;
    setManager(m);
    sessionStorage.setItem('bode-manager', m.id);
    if (remember) localStorage.setItem('bode-manager', m.id);
    else localStorage.removeItem('bode-manager');
    return true;
  };

  const logout = () => {
    setManager(null);
    sessionStorage.removeItem('bode-manager');
    localStorage.removeItem('bode-manager');
  };

  const activity = (text: string) => {
    if (!manager) return;
    setData((d) => ({
      ...d,
      activity: [
        {
          id: crypto.randomUUID(),
          branchId: manager.branchId,
          text,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...d.activity,
      ],
    }));
  };

  const updateVisit = (visit: Visit) => {
    if (!manager || visit.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      visits: d.visits.map((v) => (v.id === visit.id && v.branchId === manager.branchId ? visit : v)),
    }));
  };

  const createVisit = (visit: Visit, customer: Customer) => {
    if (!manager || visit.branchId !== manager.branchId || customer.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      customers: d.customers.some((c) => c.id === customer.id) ? d.customers : [...d.customers, customer],
      visits: [...d.visits, visit],
    }));
  };

  const updateCustomer = (customer: Customer) => {
    if (!manager || customer.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) => (c.id === customer.id && c.branchId === manager.branchId ? customer : c)),
    }));
  };

  const createCustomer = (customer: Customer) => {
    if (!manager || customer.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      customers: d.customers.some((c) => c.mobile === customer.mobile)
        ? d.customers.map((c) => (c.mobile === customer.mobile ? { ...c, ...customer } : c))
        : [...d.customers, customer],
    }));
  };

  const updateStaff = (s: Staff) => {
    if (!manager || s.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      staff: (d.staff ?? []).map((x) => (x.id === s.id && x.branchId === manager.branchId ? s : x)),
    }));
  };

  const createStaff = (s: Staff) => {
    if (!manager || s.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      staff: [...(d.staff ?? []), s],
    }));
  };

  const updateServiceCategory = (cat: ServiceCategory) => {
    if (!manager || cat.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      serviceCategories: (d.serviceCategories ?? []).map((c) => (c.id === cat.id && c.branchId === manager.branchId ? cat : c)),
    }));
  };

  const createServiceCategory = (cat: ServiceCategory) => {
    if (!manager || cat.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      serviceCategories: [...(d.serviceCategories ?? []), cat],
    }));
  };

  const updateProductCategory = (cat: ProductCategory) => {
    if (!manager || cat.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      productCategories: (d.productCategories ?? []).map((c) => (c.id === cat.id && c.branchId === manager.branchId ? cat : c)),
    }));
  };

  const createProductCategory = (cat: ProductCategory) => {
    if (!manager || cat.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      productCategories: [...(d.productCategories ?? []), cat],
    }));
  };

  const updateMembership = (plan: MembershipPlan) => {
    if (!manager || plan.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      memberships: (d.memberships ?? []).map((m) => (m.id === plan.id && m.branchId === manager.branchId ? plan : m)),
    }));
  };

  const createMembership = (plan: MembershipPlan) => {
    if (!manager || plan.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      memberships: [...(d.memberships ?? []), plan],
    }));
  };

  const updateGiftCard = (gc: GiftCard) => {
    if (!manager || gc.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      giftCards: (d.giftCards ?? []).map((g) => (g.id === gc.id && g.branchId === manager.branchId ? gc : g)),
    }));
  };

  const createGiftCard = (gc: GiftCard) => {
    if (!manager || gc.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      giftCards: [...(d.giftCards ?? []), gc],
    }));
  };

  const createSale = (sale: SaleRecord) => {
    if (!manager || sale.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      sales: [sale, ...(d.sales ?? [])],
    }));
  };

  const updateSale = (sale: SaleRecord) => {
    if (!manager || sale.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      sales: (d.sales ?? []).map((s) => (s.id === sale.id && s.branchId === manager.branchId ? sale : s)),
    }));
  };

  const updateCampaign = (camp: Campaign) => {
    if (!manager || camp.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      campaigns: (d.campaigns ?? []).map((c) => (c.id === camp.id && c.branchId === manager.branchId ? camp : c)),
    }));
  };

  const createCampaign = (camp: Campaign) => {
    if (!manager || camp.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      campaigns: [camp, ...(d.campaigns ?? [])],
    }));
  };

  const updateHomepage = (config: HomepageConfig) => {
    if (!manager) return;
    setData((d) => ({
      ...d,
      homepage: {
        ...d.homepage,
        [manager.branchId]: config,
      },
    }));
  };

  const createPackage = (pkg: SpaPackage) => {
    if (!manager || pkg.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      packages: [...(d.packages ?? []), pkg],
    }));
  };

  const createExpense = (expense: ExpenseItem) => {
    if (!manager || expense.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      expenses: [expense, ...(d.expenses ?? [])],
    }));
  };

  const createEnquiry = (enquiry: EnquiryItem) => {
    if (!manager || enquiry.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      enquiries: [enquiry, ...(d.enquiries ?? [])],
    }));
  };

  const updateEnquiry = (enquiry: EnquiryItem) => {
    if (!manager || enquiry.branchId !== manager.branchId) return;
    setData((d) => ({
      ...d,
      enquiries: (d.enquiries ?? []).map((e) => (e.id === enquiry.id && e.branchId === manager.branchId ? enquiry : e)),
    }));
  };

  return (
    <SpaContext.Provider
      value={{
        data,
        manager,
        ready,
        login,
        logout,
        activity,

        // Branch-scoped entities
        visits: manager ? branchVisits(data, manager.branchId) : [],
        customers: manager ? data.customers.filter((c) => c.branchId === manager.branchId) : [],
        staff: manager ? (data.staff ?? []).filter((s) => s.branchId === manager.branchId) : [],
        serviceCategories: manager ? (data.serviceCategories ?? []).filter((c) => c.branchId === manager.branchId) : [],
        productCategories: manager ? (data.productCategories ?? []).filter((c) => c.branchId === manager.branchId) : [],
        products: manager ? (data.products ?? []).filter((p) => p.branchId === manager.branchId) : [],
        memberships: manager ? (data.memberships ?? []).filter((m) => m.branchId === manager.branchId) : [],
        giftCards: manager ? (data.giftCards ?? []).filter((g) => g.branchId === manager.branchId) : [],
        sales: manager ? (data.sales ?? []).filter((s) => s.branchId === manager.branchId) : [],
        campaigns: manager ? (data.campaigns ?? []).filter((c) => c.branchId === manager.branchId) : [],
        homepageConfig: manager ? data.homepage?.[manager.branchId] ?? null : null,
        packages: manager ? (data.packages ?? []).filter((p) => p.branchId === manager.branchId) : [],
        expenses: manager ? (data.expenses ?? []).filter((e) => e.branchId === manager.branchId) : [],
        enquiries: manager ? (data.enquiries ?? []).filter((e) => e.branchId === manager.branchId) : [],

        // Mutations
        updateVisit,
        createVisit,
        updateCustomer,
        createCustomer,
        updateStaff,
        createStaff,
        updateServiceCategory,
        createServiceCategory,
        updateProductCategory,
        createProductCategory,
        updateMembership,
        createMembership,
        updateGiftCard,
        createGiftCard,
        createSale,
        updateSale,
        updateCampaign,
        createCampaign,
        updateHomepage,
        createPackage,
        createExpense,
        createEnquiry,
        updateEnquiry,
      }}
    >
      {children}
    </SpaContext.Provider>
  );
}

export function useSpa() {
  const context = useContext(SpaContext);
  if (!context) throw new Error('Spa provider missing');
  return context;
}

