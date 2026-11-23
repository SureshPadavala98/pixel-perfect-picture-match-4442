export type BranchId = 'amr' | 'svm';
export type TreatmentStatus = 'Added' | 'In Progress' | 'Completed' | 'Cancelled';
export type VisitStatus = 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Manager {
  id: string;
  name: string;
  username: string;
  password: string;
  branchId: BranchId;
}

export const managers: Manager[] = [
  { id: 'm1', name: 'Ananya Sharma', username: 'amr.manager', password: 'Bode@123', branchId: 'amr' },
  { id: 'm2', name: 'Rahul Verma', username: 'svm.manager', password: 'Bode@123', branchId: 'svm' },
];

export const branches = {
  amr: {
    name: 'AMR Planet Mall',
    area: 'ECIL / A.S. Rao Nagar',
    address: 'AMR Planet Mall, ECIL, Hyderabad',
    contact: '+91 91234 56780',
  },
  svm: {
    name: 'SVM Grand Hotel',
    area: 'Nagole',
    address: 'SVM Grand Hotel, Nagole, Hyderabad',
    contact: '+91 91234 56781',
  },
};

export interface CatalogueItem {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  branchId: BranchId;
  categoryId?: string;
  position?: number;
}

const baseCatalogue = [
  { name: 'Swedish Massage', category: 'Massage', duration: 60, price: 2500, description: 'A gentle full-body ritual to restore balance.' },
  { name: 'Deep Tissue Massage', category: 'Massage', duration: 90, price: 3500, description: 'Targeted pressure for deep muscle recovery.' },
  { name: 'Aromatherapy Massage', category: 'Massage', duration: 60, price: 2800, description: 'Essential oils and soothing restorative touch.' },
  { name: 'Classic Facial', category: 'Facial', duration: 60, price: 2499, description: 'Cleanse, replenish and reveal a natural glow.' },
  { name: 'Balinese Massage', category: 'Massage', duration: 90, price: 3800, description: 'An indulgent blend of stretching and acupressure.' },
  { name: 'Foot Reflexology', category: 'Wellness', duration: 30, price: 1200, description: 'Release tension and restore lightness.' },
  { name: 'Scrub Services', category: 'Body Care', duration: 45, price: 1999, description: 'Exfoliating botanical scrub for radiant skin.' },
  { name: 'Head Neck & Shoulder', category: 'Wellness', duration: 45, price: 1500, description: 'Targeted relief for upper body tension.' },
  { name: 'Pedicure & Manicure', category: 'Grooming', duration: 60, price: 1800, description: 'Deluxe hand and foot wellness treatment.' },
];

export const catalogue: CatalogueItem[] = (['amr', 'svm'] as const).flatMap((branchId) =>
  baseCatalogue.map((s, i) => ({ ...s, id: `${branchId}-${i}`, branchId, position: i + 1 }))
);

export interface Customer {
  id: string;
  branchId: BranchId;
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  alternateMobile?: string;
  dob?: string;
  anniversaryDate?: string;
  gstNumber?: string;
  source?: string;
  gender?: 'Female' | 'Male' | 'Other';
  membershipId?: string;
}

export interface Treatment {
  id: string;
  catalogueId: string;
  name: string;
  duration: number;
  price: number;
  status: TreatmentStatus;
  staffId: string;
  startedAt: string;
  completedAt: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountReason: string;
  discountManager: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Online';
  date: string;
}

export interface Visit {
  id: string;
  branchId: BranchId;
  customerId: string;
  date: string;
  time: string;
  source: 'Website' | 'Manager';
  status: VisitStatus;
  services: Treatment[];
  payments: Payment[];
  invoiceNumber: string;
  invoiceDate: string;
  sharing: 'Not shared' | 'Sharing initiated' | 'Confirmed sent' | 'Failed';
  createdAt: string;
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface StaffShiftDay {
  day: DayOfWeek;
  isWeeklyOff: boolean;
  startTime: string;
  endTime: string;
}

export interface StaffExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
}

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface StaffBankDetails {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Staff {
  id: string;
  branchId: BranchId;
  name: string;
  role: string;
  specialties: string[];
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  dob?: string;
  gender?: 'Female' | 'Male' | 'Other';
  position?: string;
  username?: string;
  active: boolean;
  showAllAppointments: boolean;
  enableAppointments: boolean;
  onlineNotifications: boolean;
  teamNotifications: boolean;
  shifts: StaffShiftDay[];
  joiningDate?: string;
  reportingTo?: string;
  uanNumber?: string;
  workingHours?: string;
  designation?: string;
  experience: StaffExperience[];
  documents: StaffDocument[];
  bankDetails: StaffBankDetails;
}

export interface ServiceCategory {
  id: string;
  branchId: BranchId;
  name: string;
  active: boolean;
  position: number;
  group: 'Both' | 'Female' | 'Male';
  hideFromCatalogue: boolean;
  images: {
    both: string;
    female: string;
    male: string;
  };
  assignedStaffIds: string[];
}

export interface ProductCategory {
  id: string;
  branchId: BranchId;
  name: string;
  active: boolean;
  itemCount: number;
}

export interface ProductItem {
  id: string;
  branchId: BranchId;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export type MembershipType = 'Fixed' | 'Percentage' | 'Hourly' | 'Hybrid';

export interface MembershipPlan {
  id: string;
  branchId: BranchId;
  name: string;
  type: MembershipType;
  active: boolean;
  fees: number;
  validityDays: number;
  renewalReminder: number;
  totalHours?: number;
  shareable: boolean;
  maxShareCount: number;
  specificServices: string[];
  totalToPay: number;
  description?: string;
}

export interface GiftCard {
  id: string;
  branchId: BranchId;
  name: string;
  active: boolean;
  description: string;
  amount: number;
  validityDays: number;
  renewalReminder: number;
}

export type SaleType = 'Orders' | 'Memberships' | 'Packages' | 'Gift Cards';
export type SaleStatus = 'Accepted' | 'Rejected' | 'Completed';

export interface SaleItem {
  name: string;
  qty: number;
  price: number;
  category?: string;
}

export interface SaleRecord {
  id: string;
  reference: string;
  branchId: BranchId;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: SaleType;
  items: SaleItem[];
  quantity: number;
  totalAmount: number;
  date: string;
  time: string;
  status: SaleStatus;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Online';
}

export interface Campaign {
  id: string;
  branchId: BranchId;
  title: string;
  group: 'Large' | 'Square' | 'Small';
  imageUrl: string;
  description: string;
  sendWithLink: boolean;
  shareLink: string;
  showOnCatalogue: boolean;
  createdAt: string;
}

export interface HomepageConfig {
  bannerUrl: string;
  bannerTitle: string;
  bannerActive: boolean;
  trendingServiceIds: string[];
  catalogueUrl: string;
}

export interface SpaPackage {
  id: string;
  branchId: BranchId;
  name: string;
  services: string[];
  duration: number;
  price: number;
  validityDays: number;
  active: boolean;
}

export interface ExpenseItem {
  id: string;
  branchId: BranchId;
  title: string;
  category: 'Supplies' | 'Maintenance' | 'Utilities' | 'Staff' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  approvedBy: string;
}

export interface EnquiryItem {
  id: string;
  branchId: BranchId;
  name: string;
  mobile: string;
  serviceInterest: string;
  source: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Closed';
  date: string;
  notes: string;
}

export interface SpaData {
  customers: Customer[];
  visits: Visit[];
  activity: { id: string; branchId: BranchId; text: string; time: string }[];
  staff: Staff[];
  serviceCategories: ServiceCategory[];
  productCategories: ProductCategory[];
  products: ProductItem[];
  memberships: MembershipPlan[];
  giftCards: GiftCard[];
  sales: SaleRecord[];
  campaigns: Campaign[];
  homepage: Record<BranchId, HomepageConfig>;
  packages: SpaPackage[];
  expenses: ExpenseItem[];
  enquiries: EnquiryItem[];
}

const defaultShifts = (weeklyOffDay: DayOfWeek = 'Tuesday'): StaffShiftDay[] => {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.map((day) => ({
    day,
    isWeeklyOff: day === weeklyOffDay,
    startTime: '09:00',
    endTime: '20:00',
  }));
};

export const staff: Staff[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `${b}-s1`,
    branchId: b,
    name: b === 'amr' ? 'Priya Reddy' : 'Meera Nair',
    firstName: b === 'amr' ? 'Priya' : 'Meera',
    lastName: b === 'amr' ? 'Reddy' : 'Nair',
    role: 'Senior therapist',
    specialties: ['Massage', 'Wellness', 'Body Care'],
    mobile: b === 'amr' ? '9848011221' : '9848022331',
    email: b === 'amr' ? 'priya.reddy@bodespa.in' : 'meera.nair@bodespa.in',
    dob: '1992-05-14',
    gender: 'Female',
    position: 'Senior Spa Therapist',
    username: b === 'amr' ? 'priya.amr' : 'meera.svm',
    active: true,
    showAllAppointments: true,
    enableAppointments: true,
    onlineNotifications: true,
    teamNotifications: true,
    shifts: defaultShifts('Tuesday'),
    joiningDate: '2023-02-15',
    reportingTo: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
    uanNumber: '100987654321',
    workingHours: '9 Hours (09:00 - 18:00)',
    designation: 'Lead Wellness Specialist',
    experience: [
      { id: 'exp1', company: 'Taj Krishna Spa', role: 'Therapist', duration: '3 Years' },
      { id: 'exp2', company: 'O2 Spa Hyderabad', role: 'Junior Therapist', duration: '2 Years' },
    ],
    documents: [
      { id: 'doc1', name: 'Aadhaar Card Copy.pdf', type: 'Government ID', uploadedAt: '2023-02-15' },
      { id: 'doc2', name: 'Ayurvedic Therapy Diploma.pdf', type: 'Certificate', uploadedAt: '2023-02-15' },
    ],
    bankDetails: {
      bankName: 'HDFC Bank',
      branchName: 'ECIL Branch',
      accountNumber: '50100234987612',
      ifscCode: 'HDFC0001234',
    },
  },
  {
    id: `${b}-s2`,
    branchId: b,
    name: b === 'amr' ? 'Sneha Rao' : 'Divya Shah',
    firstName: b === 'amr' ? 'Sneha' : 'Divya',
    lastName: b === 'amr' ? 'Rao' : 'Shah',
    role: 'Beauty therapist',
    specialties: ['Facial', 'Wellness', 'Grooming'],
    mobile: b === 'amr' ? '9848011222' : '9848022332',
    email: b === 'amr' ? 'sneha.rao@bodespa.in' : 'divya.shah@bodespa.in',
    dob: '1995-08-20',
    gender: 'Female',
    position: 'Beauty & Skincare Specialist',
    username: b === 'amr' ? 'sneha.amr' : 'divya.svm',
    active: true,
    showAllAppointments: true,
    enableAppointments: true,
    onlineNotifications: true,
    teamNotifications: false,
    shifts: defaultShifts('Wednesday'),
    joiningDate: '2023-06-01',
    reportingTo: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
    uanNumber: '100987654322',
    workingHours: '9 Hours (10:00 - 19:00)',
    designation: 'Aesthetician',
    experience: [{ id: 'exp3', company: 'Kaya Skin Clinic', role: 'Beauty Advisor', duration: '2.5 Years' }],
    documents: [{ id: 'doc3', name: 'PAN Card.pdf', type: 'Tax ID', uploadedAt: '2023-06-01' }],
    bankDetails: {
      bankName: 'ICICI Bank',
      branchName: 'A.S. Rao Nagar',
      accountNumber: '004701567890',
      ifscCode: 'ICIC0000047',
    },
  },
  {
    id: `${b}-s3`,
    branchId: b,
    name: b === 'amr' ? 'Arjun Kumar' : 'Vikram Singh',
    firstName: b === 'amr' ? 'Arjun' : 'Vikram',
    lastName: b === 'amr' ? 'Kumar' : 'Singh',
    role: 'Spa therapist',
    specialties: ['Massage', 'Wellness', 'Body Care'],
    mobile: b === 'amr' ? '9848011223' : '9848022333',
    email: b === 'amr' ? 'arjun.kumar@bodespa.in' : 'vikram.singh@bodespa.in',
    dob: '1994-11-10',
    gender: 'Male',
    position: 'Senior Bodywork Therapist',
    username: b === 'amr' ? 'arjun.amr' : 'vikram.svm',
    active: true,
    showAllAppointments: false,
    enableAppointments: true,
    onlineNotifications: true,
    teamNotifications: true,
    shifts: defaultShifts('Monday'),
    joiningDate: '2023-08-10',
    reportingTo: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
    uanNumber: '100987654323',
    workingHours: '9 Hours (11:00 - 20:00)',
    designation: 'Deep Tissue Specialist',
    experience: [{ id: 'exp4', company: 'ITC Kohenur Spa', role: 'Therapist', duration: '3 Years' }],
    documents: [{ id: 'doc4', name: 'Certificate in Swedish Massage.pdf', type: 'Certificate', uploadedAt: '2023-08-10' }],
    bankDetails: {
      bankName: 'State Bank of India',
      branchName: 'Sainikpuri',
      accountNumber: '31098765432',
      ifscCode: 'SBIN0004567',
    },
  },
]);

export const today = () => new Date().toLocaleDateString('en-CA');
export const money = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function treatment(s: CatalogueItem, staffId = '', status: TreatmentStatus = 'Added'): Treatment {
  return {
    id: crypto.randomUUID(),
    catalogueId: s.id,
    name: s.name,
    duration: s.duration,
    price: s.price,
    status,
    staffId,
    startedAt: status === 'In Progress' ? new Date().toISOString() : '',
    completedAt: '',
    discountType: 'fixed',
    discountValue: 0,
    discountReason: '',
    discountManager: '',
  };
}

export function discount(s: Treatment) {
  return Math.min(s.price, Math.max(0, s.discountType === 'percentage' ? (s.price * s.discountValue) / 100 : s.discountValue));
}

export const billingConfig = { taxRate: 0, charges: 0, discountsEnabled: true };

export function totals(v: Visit) {
  const subtotal = v.services.filter((s) => s.status !== 'Cancelled').reduce((n, s) => n + s.price, 0);
  const discounts = v.services.filter((s) => s.status !== 'Cancelled').reduce((n, s) => n + discount(s), 0);
  const taxes = Math.round(((subtotal - discounts) * billingConfig.taxRate) / 100);
  const total = subtotal - discounts + taxes + billingConfig.charges;
  const paid = v.payments.reduce((n, p) => n + p.amount, 0);
  return { subtotal, discounts, taxes, charges: billingConfig.charges, total, paid, balance: Math.max(0, total - paid) };
}

export function paymentStatus(v: Visit) {
  const t = totals(v);
  return t.balance === 0 ? 'Fully Paid' : t.paid > 0 ? 'Partially Paid' : 'Unpaid';
}

export function branchVisits(data: SpaData, branchId: BranchId) {
  return data.visits.filter((v) => v.branchId === branchId);
}

export function hasAppointmentConflict(
  data: SpaData,
  branchId: BranchId,
  date: string,
  time: string,
  duration: number,
  staffId: string,
  excludeId = ''
) {
  const start = Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
  return data.visits.some(
    (v) =>
      v.id !== excludeId &&
      v.branchId === branchId &&
      v.date === date &&
      v.status !== 'Cancelled' &&
      v.status !== 'Completed' &&
      v.services.some(
        (s) =>
          s.status !== 'Cancelled' &&
          (staffId ? s.staffId === staffId : !s.staffId) &&
          start < Number(v.time.split(':')[0]) * 60 + Number(v.time.split(':')[1]) + s.duration &&
          start + duration > Number(v.time.split(':')[0]) * 60 + Number(v.time.split(':')[1])
      )
  );
}

export function isStaffOnShift(s: Staff | undefined, date: string, time: string, duration = 60) {
  if (!s || !s.shifts || s.shifts.length === 0) return true;
  const dateObj = new Date(`${date}T12:00`);
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dateObj.getDay()];
  const shift = s.shifts.find((sh) => sh.day === dayName);
  if (!shift) return true;
  if (shift.isWeeklyOff) return false;
  const start = Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
  const shiftStart = Number(shift.startTime.split(':')[0]) * 60 + Number(shift.startTime.split(':')[1]);
  const shiftEnd = Number(shift.endTime.split(':')[0]) * 60 + Number(shift.endTime.split(':')[1]);
  return start >= shiftStart && start + duration <= shiftEnd;
}

export function available(
  data: SpaData,
  branchId: BranchId,
  date: string,
  time: string,
  duration: number,
  staffId: string,
  excludeId = '',
  checkShift = false
) {
  if (checkShift && staffId) {
    const s = (data.staff ?? staff).find((x) => x.id === staffId);
    if (s && !isStaffOnShift(s, date, time, duration)) return false;
  }
  return !hasAppointmentConflict(data, branchId, date, time, duration, staffId, excludeId);
}

export const initialServiceCategories: ServiceCategory[] = [
  'Massages',
  'Scrub Services',
  'Classic Facial',
  'Premium Facials',
  'Foot Reflexology',
  'Pedicure & Manicure',
  'Best Sellers',
  'Head Neck & Shoulder',
].flatMap((name, idx) =>
  (['amr', 'svm'] as const).map((branchId) => ({
    id: `cat-${branchId}-${idx + 1}`,
    branchId,
    name,
    active: true,
    position: idx + 1,
    group: idx === 1 ? 'Female' : idx === 3 ? 'Female' : 'Both',
    hideFromCatalogue: false,
    images: {
      both: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
      female: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      male: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80',
    },
    assignedStaffIds: [`${branchId}-s1`, `${branchId}-s2`, `${branchId}-s3`],
  }))
);

export const initialProductCategories: ProductCategory[] = [
  'Kama Ayurveda Organic',
  'Oil',
  'Disposables',
  'Cleaning Items',
  'Shower Gels',
  'Pedicure + Facial Products',
].flatMap((name, idx) =>
  (['amr', 'svm'] as const).map((branchId) => ({
    id: `prod-cat-${branchId}-${idx + 1}`,
    branchId,
    name,
    active: true,
    itemCount: [12, 8, 24, 15, 6, 18][idx] ?? 10,
  }))
);

export const initialProducts: ProductItem[] = (['amr', 'svm'] as const).flatMap((b) => [
  { id: `${b}-p1`, branchId: b, categoryId: `prod-cat-${b}-1`, name: 'Kumkumadi Miraculous Beauty Fluid', price: 3195, stock: 14, active: true },
  { id: `${b}-p2`, branchId: b, categoryId: `prod-cat-${b}-1`, name: 'Bringadi Intensive Hair Treatment', price: 1650, stock: 22, active: true },
  { id: `${b}-p3`, branchId: b, categoryId: `prod-cat-${b}-2`, name: 'Organic Cold Pressed Sesame Oil (500ml)', price: 850, stock: 35, active: true },
  { id: `${b}-p4`, branchId: b, categoryId: `prod-cat-${b}-2`, name: 'Lavender & Rosemary Massage Blend', price: 1250, stock: 18, active: true },
  { id: `${b}-p5`, branchId: b, categoryId: `prod-cat-${b}-5`, name: 'Eucalyptus & Mint Revitalizing Shower Gel', price: 950, stock: 20, active: true },
]);

export const initialMemberships: MembershipPlan[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `mem-${b}-1`,
    branchId: b,
    name: 'Platinum Plan',
    type: 'Hybrid',
    active: true,
    fees: 25000,
    validityDays: 365,
    renewalReminder: 15,
    totalHours: 20,
    shareable: true,
    maxShareCount: 4,
    specificServices: ['Swedish Massage', 'Deep Tissue Massage', 'Classic Facial'],
    totalToPay: 25000,
    description: 'Premier unlimited relaxation with exclusive ritual privileges.',
  },
  {
    id: `mem-${b}-2`,
    branchId: b,
    name: 'Gold Plan',
    type: 'Percentage',
    active: true,
    fees: 15000,
    validityDays: 180,
    renewalReminder: 10,
    shareable: true,
    maxShareCount: 2,
    specificServices: ['Swedish Massage', 'Classic Facial', 'Foot Reflexology'],
    totalToPay: 15000,
    description: '20% off all wellness therapies for 6 months.',
  },
  {
    id: `mem-${b}-3`,
    branchId: b,
    name: 'Silver Plan',
    type: 'Fixed',
    active: true,
    fees: 9999,
    validityDays: 90,
    renewalReminder: 7,
    shareable: false,
    maxShareCount: 1,
    specificServices: ['Swedish Massage', 'Foot Reflexology'],
    totalToPay: 9999,
    description: 'Quarterly rejuvenation bundle for regular guests.',
  },
  {
    id: `mem-${b}-4`,
    branchId: b,
    name: 'Bronze Plan',
    type: 'Hourly',
    active: true,
    fees: 5999,
    validityDays: 60,
    renewalReminder: 5,
    totalHours: 5,
    shareable: false,
    maxShareCount: 1,
    specificServices: ['Foot Reflexology', 'Head Neck & Shoulder'],
    totalToPay: 5999,
    description: '5 hours of targeted destress therapies.',
  },
  {
    id: `mem-${b}-5`,
    branchId: b,
    name: 'BODE Special',
    type: 'Hybrid',
    active: true,
    fees: 18999,
    validityDays: 180,
    renewalReminder: 14,
    totalHours: 12,
    shareable: true,
    maxShareCount: 2,
    specificServices: ['Balinese Massage', 'Aromatherapy Massage', 'Classic Facial'],
    totalToPay: 18999,
    description: 'Bespoke combination plan featuring signature therapies.',
  },
]);

export const initialGiftCards: GiftCard[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `gc-${b}-1`,
    branchId: b,
    name: 'Celebration Voucher',
    active: true,
    description: 'The gift of serene wellness for birthdays and special anniversaries.',
    amount: 5000,
    validityDays: 180,
    renewalReminder: 15,
  },
  {
    id: `gc-${b}-2`,
    branchId: b,
    name: 'Pure Calm Gift Card',
    active: true,
    description: 'Redeemable against any signature massage or body ritual.',
    amount: 2500,
    validityDays: 90,
    renewalReminder: 7,
  },
  {
    id: `gc-${b}-3`,
    branchId: b,
    name: 'Executive Wellness Pass',
    active: true,
    description: 'Curated deep recovery session voucher.',
    amount: 3500,
    validityDays: 120,
    renewalReminder: 10,
  },
]);

export const initialCampaigns: Campaign[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `camp-${b}-1`,
    branchId: b,
    title: 'Monsoon Rejuvenation Festival',
    group: 'Large',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    description: 'Flat 25% off all signature Ayurvedic and Balinese massage therapies.',
    sendWithLink: true,
    shareLink: `https://bodespa.in/offers/monsoon?branch=${b}`,
    showOnCatalogue: true,
    createdAt: today(),
  },
  {
    id: `camp-${b}-2`,
    branchId: b,
    title: 'Weekend Glow Ritual',
    group: 'Square',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    description: 'Complimentary herbal steam session with any 90-minute facial ritual.',
    sendWithLink: true,
    shareLink: `https://bodespa.in/offers/glow?branch=${b}`,
    showOnCatalogue: true,
    createdAt: today(),
  },
  {
    id: `camp-${b}-3`,
    branchId: b,
    title: 'Couple’s Sanctuary Package',
    group: 'Small',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80',
    description: 'Double therapy suite celebration with custom essential aroma blends.',
    sendWithLink: false,
    shareLink: `https://bodespa.in/offers/couples?branch=${b}`,
    showOnCatalogue: false,
    createdAt: today(),
  },
]);

export const initialPackages: SpaPackage[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `pkg-${b}-1`,
    branchId: b,
    name: 'Total Radiance Ritual',
    services: ['Swedish Massage', 'Classic Facial'],
    duration: 120,
    price: 4499,
    validityDays: 60,
    active: true,
  },
  {
    id: `pkg-${b}-2`,
    branchId: b,
    name: 'Executive Destress Package',
    services: ['Deep Tissue Massage', 'Foot Reflexology'],
    duration: 120,
    price: 4299,
    validityDays: 60,
    active: true,
  },
]);

export const initialExpenses: ExpenseItem[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `exp-${b}-1`,
    branchId: b,
    title: 'Aroma Oils & Essential Extracts Restock',
    category: 'Supplies',
    amount: 14500,
    date: today(),
    paidTo: 'Forest Essentials B2B',
    paymentMethod: 'UPI',
    approvedBy: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
  },
  {
    id: `exp-${b}-2`,
    branchId: b,
    title: 'Treatment Room Linen Laundry & Sanitization',
    category: 'Maintenance',
    amount: 3200,
    date: today(),
    paidTo: 'Sparkle Fresh Laundry Services',
    paymentMethod: 'Cash',
    approvedBy: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
  },
  {
    id: `exp-${b}-3`,
    branchId: b,
    title: 'Mall Electricity & AC Maintenance Surcharge',
    category: 'Utilities',
    amount: 18450,
    date: today(),
    paidTo: 'Mall Management Office',
    paymentMethod: 'Bank Transfer',
    approvedBy: b === 'amr' ? 'Ananya Sharma' : 'Rahul Verma',
  },
]);

export const initialEnquiries: EnquiryItem[] = (['amr', 'svm'] as const).flatMap((b) => [
  {
    id: `enq-${b}-1`,
    branchId: b,
    name: 'Dr. Harshavardhan',
    mobile: '9848123456',
    serviceInterest: 'Deep Tissue Massage & Aromatherapy',
    source: 'Website Enquiry',
    status: 'New',
    date: today(),
    notes: 'Inquired about couple therapy availability for coming Saturday evening.',
  },
  {
    id: `enq-${b}-2`,
    branchId: b,
    name: 'Pooja Agarwal',
    mobile: '9988776655',
    serviceInterest: 'Platinum Membership Plan',
    source: 'Instagram Ad',
    status: 'Contacted',
    date: today(),
    notes: 'Shared brochure via WhatsApp; awaiting confirmation on family share details.',
  },
]);

export function seedData(): SpaData {
  const customers: Customer[] = [];
  const visits: Visit[] = [];
  const sales: SaleRecord[] = [];

  (['amr', 'svm'] as const).forEach((b) => {
    const names =
      b === 'amr'
        ? ['Riya Mehta', 'Aditya Reddy', 'Kavya Sharma', 'Vikram Rao', 'Sneha Kapoor', 'Neha Desai', 'Rahul Nair', 'Anjali Gupta']
        : ['Lakshmi Rao', 'Sandeep Kumar', 'Divya Nair', 'Rohit Shah', 'Meera Joshi', 'Kiran Patel', 'Nisha Reddy', 'Arun Das'];

    names.forEach((name, i) => {
      const id = `${b}-c${i}`;
      customers.push({
        id,
        branchId: b,
        name,
        mobile: `98765432${String(i + 10).padStart(2, '0')}`,
        whatsapp: `98765432${String(i + 10).padStart(2, '0')}`,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        dob: '1990-06-15',
        membershipId: i === 0 ? `mem-${b}-1` : undefined,
      });

      const cat = catalogue.find((c) => c.id === `${b}-${i % 6}`);
      if (!cat) return;
      const status: VisitStatus = i < 3 ? 'In Progress' : i < 6 ? 'Scheduled' : 'Completed';
      const s = treatment(cat, `${b}-s${(i % 3) + 1}`, status === 'In Progress' ? 'In Progress' : status === 'Completed' ? 'Completed' : 'Added');

      visits.push({
        id: `BOD-${b.toUpperCase()}-${1041 + i}`,
        branchId: b,
        customerId: id,
        date: today(),
        time: ['10:00', '10:30', '11:00', '12:00', '13:30', '14:00', '09:00', '09:30'][i] ?? '15:00',
        source: i % 2 === 0 ? 'Website' : 'Manager',
        status,
        services: [s],
        payments: i % 2 === 0 ? [{ id: `pay-${b}-${i}`, amount: 99, method: 'Online', date: new Date().toISOString() }] : [],
        invoiceNumber: i >= 6 ? `BODE-${b.toUpperCase()}-${2021 + i}` : '',
        invoiceDate: i >= 6 ? new Date().toISOString() : '',
        sharing: 'Not shared',
        createdAt: new Date().toISOString(),
      });

      // Sample sales records
      sales.push({
        id: `sale-${b}-${i + 1}`,
        reference: `SL-${b.toUpperCase()}-${3040 + i}`,
        branchId: b,
        customerId: id,
        customerName: name,
        customerMobile: `98765432${String(i + 10).padStart(2, '0')}`,
        type: i % 4 === 0 ? 'Orders' : i % 4 === 1 ? 'Memberships' : i % 4 === 2 ? 'Packages' : 'Gift Cards',
        items: [
          {
            name: i % 4 === 0 ? cat.name : i % 4 === 1 ? 'Gold Plan' : i % 4 === 2 ? 'Total Radiance Ritual' : 'Celebration Voucher',
            qty: 1,
            price: i % 4 === 0 ? cat.price : i % 4 === 1 ? 15000 : i % 4 === 2 ? 4499 : 5000,
          },
        ],
        quantity: 1,
        totalAmount: i % 4 === 0 ? cat.price : i % 4 === 1 ? 15000 : i % 4 === 2 ? 4499 : 5000,
        date: today(),
        time: ['10:15', '11:00', '12:45', '14:20', '15:30', '16:10', '17:00', '18:15'][i] ?? '16:00',
        status: i % 5 === 4 ? 'Rejected' : i % 5 === 3 ? 'Accepted' : 'Completed',
        paymentMethod: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'Card' : 'Cash',
      });
    });
  });

  const homepage: Record<BranchId, HomepageConfig> = {
    amr: {
      bannerUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
      bannerTitle: 'Rejuvenate Your Mind and Body at AMR Planet Mall',
      bannerActive: true,
      trendingServiceIds: ['amr-0', 'amr-1', 'amr-3'],
      catalogueUrl: 'https://bodespa.in/branches/amr/catalogue',
    },
    svm: {
      bannerUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
      bannerTitle: 'Urban Sanctuary of Wellness at SVM Grand Hotel',
      bannerActive: true,
      trendingServiceIds: ['svm-0', 'svm-2', 'svm-4'],
      catalogueUrl: 'https://bodespa.in/branches/svm/catalogue',
    },
  };

  return {
    customers,
    visits,
    activity: [
      { id: 'a1', branchId: 'amr', text: 'Riya Mehta started Swedish Massage', time: '10:00' },
      { id: 'a2', branchId: 'amr', text: 'Invoice generated for Rahul Nair', time: '09:55' },
      { id: 'a3', branchId: 'amr', text: 'Anjali Gupta completed her visit', time: '09:45' },
      { id: 'a4', branchId: 'svm', text: 'Lakshmi Rao checked in', time: '10:00' },
      { id: 'a5', branchId: 'amr', text: 'Quick Sale completed for Platinum Plan (₹25,000)', time: '10:30' },
      { id: 'a6', branchId: 'amr', text: 'Priya Reddy weekly shifts updated', time: '11:15' },
    ],
    staff,
    serviceCategories: initialServiceCategories,
    productCategories: initialProductCategories,
    products: initialProducts,
    memberships: initialMemberships,
    giftCards: initialGiftCards,
    sales,
    campaigns: initialCampaigns,
    homepage,
    packages: initialPackages,
    expenses: initialExpenses,
    enquiries: initialEnquiries,
  };
}
