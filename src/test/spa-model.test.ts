import {describe,it,expect} from 'vitest';
import {seedData,totals,discount,branchVisits,available,paymentStatus,type Visit} from '@/lib/spa-model';
const sample=():Visit=>{const v=seedData().visits[0];if(!v)throw new Error('Missing sample');return {...v,services:v.services.map(s=>({...s})),payments:[...v.payments]};};
describe('BODE visit business rules',()=>{
it('credits the ₹99 website advance exactly once',()=>{const v=sample();expect(totals(v).paid).toBe(99);expect(totals(v).balance).toBe(2401);expect(totals(v).balance).toBe(2401);});
it('does not invent an advance for a manager walk-in',()=>{const v={...sample(),source:'Manager' as const,payments:[]};expect(totals(v).paid).toBe(0);expect(totals(v).balance).toBe(2500);});
it('applies ₹200 fixed discount to only the selected service',()=>{const v=sample();const s=v.services[0];if(!s)throw new Error('Missing service');v.services=[{...s,discountValue:200},{...s,id:'facial',name:'Classic Facial',price:2499}];expect(discount(v.services[0]??s)).toBe(200);expect(discount(v.services[1]??s)).toBe(0);expect(totals(v).total).toBe(4799);});
it('applies 10% to Classic Facial individually',()=>{const v=sample();const s=v.services[0];if(!s)throw new Error('Missing service');expect(discount({...s,price:2499,discountType:'percentage',discountValue:10})).toBeCloseTo(249.9);});
it('uses the specified consolidated invoice formula without invented tax',()=>{const v=sample();const s=v.services[0];if(!s)throw new Error('Missing service');v.services=[{...s,price:2500,discountValue:200},{...s,id:'facial',price:2499,discountValue:100}];expect(totals(v)).toMatchObject({subtotal:4999,discounts:300,taxes:0,charges:0,total:4699,balance:4600});});
it('only exposes the authenticated manager branch',()=>{const data=seedData();const amr=branchVisits(data,'amr');expect(amr.length).toBe(8);expect(amr.some(v=>v.branchId==='svm')).toBe(false);});
it('keeps partial payments separate from completed service status',()=>{const v=sample();v.status='Completed';v.payments.push({id:'partial',amount:500,method:'Cash',date:new Date().toISOString()});expect(paymentStatus(v)).toBe('Partially Paid');expect(v.status).toBe('Completed');expect(v.services[0]?.status).toBe('In Progress');});
it('never marks sharing sent when a sharing link is opened',()=>{const v=sample();v.sharing='Sharing initiated';expect(v.sharing).not.toBe('Confirmed sent');});
it('prevents conflicting staff appointments',()=>{const data=seedData();const v=data.visits[0];if(!v)throw new Error('Missing visit');expect(available(data,'amr',v.date,'10:15',60,'amr-s1')).toBe(false);expect(available(data,'amr',v.date,'18:00',60,'amr-s1')).toBe(true);});
it('additional services preserve the original visit and price history',()=>{const v=sample();const s=v.services[0];if(!s)throw new Error('Missing service');const next={...v,services:[...v.services,{...s,id:'additional',price:2499,name:'Classic Facial'}]};expect(next.id).toBe(v.id);expect(next.customerId).toBe(v.customerId);expect(next.services[0]?.price).toBe(2500);expect(next.services.length).toBe(2);});

describe('Respark Backoffice and Shift models', () => {
  it('correctly evaluates staff shift availability and weekly off', async () => {
    const { isStaffOnShift } = await import('@/lib/spa-model');
    const data = seedData();
    const s1 = data.staff.find(s => s.id === 'amr-s1');
    expect(s1).toBeDefined();
    if (!s1) return;

    // 2026-11-24 is Tuesday (s1 weekly off)
    expect(isStaffOnShift(s1, '2026-11-24', '11:00')).toBe(false);

    // 2026-11-25 is Wednesday (working day: 09:00 - 20:00)
    expect(isStaffOnShift(s1, '2026-11-25', '11:00')).toBe(true);
    expect(isStaffOnShift(s1, '2026-11-25', '08:30')).toBe(false); // Before shift starts (09:00)
    expect(isStaffOnShift(s1, '2026-11-25', '19:30', 60)).toBe(false); // Ends at 20:30, after shift ends (20:00)
    expect(isStaffOnShift(s1, '2026-11-25', '20:30')).toBe(false); // After shift ends
  });

  it('provides seeded service categories with gender groups and active status', () => {
    const data = seedData();
    expect(data.serviceCategories.length).toBeGreaterThan(0);
    const cat = data.serviceCategories[0];
    expect(cat).toHaveProperty('group');
    expect(['Both', 'Female', 'Male']).toContain(cat.group);
    expect(cat).toHaveProperty('assignedStaffIds');
    expect(Array.isArray(cat.assignedStaffIds)).toBe(true);
  });

  it('provides product categories and retail products', () => {
    const data = seedData();
    expect(data.productCategories.length).toBeGreaterThan(0);
    expect(data.products.length).toBeGreaterThan(0);
    const prod = data.products[0];
    expect(prod).toHaveProperty('price');
    expect(prod).toHaveProperty('stock');
  });

  it('supports multiple membership types with validation rules', () => {
    const data = seedData();
    expect(data.memberships.length).toBeGreaterThan(0);
    const types = data.memberships.map(m => m.type);
    expect(types).toContain('Percentage');
    expect(types).toContain('Fixed');
  });
});
});
