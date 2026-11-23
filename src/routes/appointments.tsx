import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  CalendarDays,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Users,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, VisitTable, Status, Initials, Modal, pageHead, money } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import {
  today,
  catalogue,
  treatment,
  available,
  isStaffOnShift,
  type DayOfWeek,
  type Visit,
  type Treatment,
  type Staff,
} from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/appointments')({
  head: () => pageHead('Appointments', 'Employee-wise appointment calendar and daily branch scheduling.'),
  component: Appointments,
});

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

const branchRooms = [
  { id: 'room-1', name: 'Suite 1 (Ayurveda)' },
  { id: 'room-2', name: 'Suite 2 (Bodywork)' },
  { id: 'room-3', name: 'Suite 3 (Aesthetics)' },
];

function Appointments() {
  const { visits, customers, staff, catalogue, data, manager, createVisit, activity } = useSpa();
  const navigate = useNavigate();

  const [date, setDate] = useState(today());
  const [viewMode, setViewMode] = useState<'calendar' | 'resource' | 'table'>('calendar');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [query, setQuery] = useState('');

  // Mobile selected staff tab
  const [mobileStaffId, setMobileStaffId] = useState<string>('all');

  // Quick Assign Modal
  const [slotModal, setSlotModal] = useState(false);
  const [slotStaffId, setSlotStaffId] = useState('');
  const [slotTime, setSlotTime] = useState('10:00');
  const [slotCustId, setSlotCustId] = useState('');
  const [slotServiceId, setSlotServiceId] = useState('');
  const [slotCustName, setSlotCustName] = useState('');
  const [slotCustMobile, setSlotCustMobile] = useState('');

  if (!manager) return null;

  const branchStaff = staff.filter((s) => s.branchId === manager.branchId);
  const branchServices = catalogue.filter((s) => s.branchId === manager.branchId);

  // Day of week calculation
  const dateObj = new Date(`${date}T12:00`);
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = days[dateObj.getDay()];

  // Date controls
  const handlePrevDay = () => {
    const d = new Date(`${date}T12:00`);
    d.setDate(d.getDate() - 1);
    setDate(d.toLocaleDateString('en-CA'));
  };

  const handleNextDay = () => {
    const d = new Date(`${date}T12:00`);
    d.setDate(d.getDate() + 1);
    setDate(d.toLocaleDateString('en-CA'));
  };

  // Filtered visits for the active day
  const dayVisits = visits.filter((v) => {
    const cust = customers.find((c) => c.id === v.customerId);
    const matchDate = v.date === date;
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchService = serviceFilter === 'All' || v.services.some((s) => s.name === serviceFilter);
    const matchStaff = staffFilter === 'All' || v.services.some((s) => s.staffId === staffFilter);
    const matchQuery = `${v.id} ${cust?.name} ${cust?.mobile}`.toLowerCase().includes(query.toLowerCase());
    return matchDate && matchStatus && matchService && matchStaff && matchQuery;
  });

  const openSlotAssign = (staffId: string, time: string) => {
    setSlotStaffId(staffId);
    setSlotTime(time);
    setSlotCustId('');
    setSlotCustName('');
    setSlotCustMobile('');
    setSlotServiceId(branchServices[0]?.id ?? '');
    setSlotModal(true);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotCustName.trim() || !/^\d{10}$/.test(slotCustMobile)) {
      toast.error('Enter valid customer name and 10-digit mobile number');
      return;
    }
    const selectedSrv = branchServices.find((s) => s.id === slotServiceId);
    if (!selectedSrv) {
      toast.error('Select a treatment service');
      return;
    }

    // Check staff availability & shift
    const selectedStaff = branchStaff.find((s) => s.id === slotStaffId);
    if (selectedStaff && !isStaffOnShift(selectedStaff, date, slotTime, selectedSrv.duration)) {
      toast.error(`${selectedStaff.name} is on weekly off or outside shift hours at ${slotTime}`);
      return;
    }

    if (!available(data, manager.branchId, date, slotTime, selectedSrv.duration, slotStaffId)) {
      toast.error('This therapist already has an overlapping appointment at this time');
      return;
    }

    const existingCust = customers.find((c) => c.mobile === slotCustMobile);
    const cust = existingCust ?? {
      id: `${manager.branchId}-c-${Date.now()}`,
      branchId: manager.branchId,
      name: slotCustName.trim(),
      mobile: slotCustMobile,
      whatsapp: slotCustMobile,
      email: '',
    };

    const newVisit: Visit = {
      id: `BOD-${manager.branchId.toUpperCase()}-${Date.now().toString().slice(-7)}`,
      branchId: manager.branchId,
      customerId: cust.id,
      date,
      time: slotTime,
      source: 'Manager',
      status: 'Scheduled',
      services: [treatment(selectedSrv, slotStaffId, 'Added')],
      payments: [],
      invoiceNumber: '',
      invoiceDate: '',
      sharing: 'Not shared',
      createdAt: new Date().toISOString(),
    };

    createVisit(newVisit, cust);
    activity(`Scheduled ${selectedSrv.name} for ${cust.name} with ${selectedStaff?.name ?? 'Therapist'}`);
    toast.success('Appointment scheduled in calendar');
    setSlotModal(false);
  };

  return (
    <>
      <PageHeading
        title="Appointments"
        description="Employee-wise appointment scheduling, shift status, and branch availability."
      >
        <Button asChild>
          <Link to="/create-service">
            <Plus /> New Appointment
          </Link>
        </Button>
      </PageHeading>

      {/* Date Navigation & View Mode Header */}
      <section className="panel mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevDay} aria-label="Previous day">
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(today())}
              className={date === today() ? 'border-primary text-primary font-bold' : ''}
            >
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextDay} aria-label="Next day">
              <ChevronRight size={16} />
            </Button>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs !w-auto font-medium"
              aria-label="Appointment date selector"
            />

            <span className="text-sm font-semibold ml-2 hidden sm:inline">
              {dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-secondary p-1 rounded-lg">
              <Button
                size="sm"
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                onClick={() => setViewMode('calendar')}
                className="text-xs h-7 gap-1"
              >
                <Users size={13} /> Staff View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'resource' ? 'default' : 'ghost'}
                onClick={() => setViewMode('resource')}
                className="text-xs h-7 gap-1"
              >
                <DoorOpen size={13} /> Resource View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="text-xs h-7 gap-1"
              >
                <List size={13} /> Table
              </Button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filters !px-0 !pb-0 !border-b-0 mt-4">
          <input
            placeholder="Search customer, mobile or reference…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search appointments"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
          >
            <option value="All">All statuses</option>
            {['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            aria-label="Filter service"
          >
            <option value="All">All services</option>
            {branchServices.map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
          </select>
          {viewMode !== 'resource' && (
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              aria-label="Filter staff"
            >
              <option value="All">All staff members</option>
              {branchStaff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* VIEW MODE 1: Table Mode */}
      {viewMode === 'table' && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Appointments Register ({dayVisits.length})</h2>
            <CalendarDays size={20} className="text-gold" />
          </div>
          <VisitTable visits={dayVisits} />
        </section>
      )}

      {/* VIEW MODE 2: Employee-wise Calendar View (Screenshot 24) */}
      {viewMode === 'calendar' && (
        <section className="panel overflow-hidden">
          {/* Mobile Therapist Tabs (<768px) */}
          <div className="md:hidden p-3 border-b border-border bg-secondary/40">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-2">Select Therapist</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <Button
                size="sm"
                variant={mobileStaffId === 'all' ? 'default' : 'outline'}
                className="text-xs h-7 shrink-0"
                onClick={() => setMobileStaffId('all')}
              >
                All Staff
              </Button>
              {branchStaff.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={mobileStaffId === s.id ? 'default' : 'outline'}
                  className="text-xs h-7 shrink-0"
                  onClick={() => setMobileStaffId(s.id)}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Multi-column Grid (>=768px) */}
          <div className="hidden md:block overflow-x-auto">
            <div
              className="grid border-b border-border bg-muted/40"
              style={{
                gridTemplateColumns: `80px repeat(${branchStaff.length}, minmax(220px, 1fr))`,
              }}
            >
              <div className="p-3 border-r border-border text-center text-[10px] font-bold text-muted-foreground uppercase">
                Time
              </div>
              {branchStaff.map((s) => {
                const shift = s.shifts?.find((sh) => sh.day === currentDayName);
                const isOff = shift?.isWeeklyOff;
                return (
                  <div key={s.id} className="p-3 border-r border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Initials name={s.name} />
                      <div>
                        <strong className="text-xs block">{s.name}</strong>
                        <span className="text-[10px] text-muted-foreground block">{s.role}</span>
                      </div>
                    </div>
                    <div>
                      {isOff ? (
                        <span className="badge cancelled text-[9px]">Weekly Off</span>
                      ) : (
                        <span className="badge completed text-[9px]">
                          {shift?.startTime ?? '09:00'} - {shift?.endTime ?? '20:00'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div
              className="grid divide-y divide-border"
              style={{
                gridTemplateColumns: `80px repeat(${branchStaff.length}, minmax(220px, 1fr))`,
              }}
            >
              {timeSlots.map((slot) => (
                <div key={slot} className="contents">
                  {/* Time label column */}
                  <div className="p-2 border-r border-border text-center text-xs font-mono text-muted-foreground bg-card/60">
                    {slot}
                  </div>

                  {/* Columns for each staff member */}
                  {branchStaff.map((s) => {
                    const shift = s.shifts?.find((sh) => sh.day === currentDayName);
                    const isOff = shift?.isWeeklyOff;

                    // Find visits assigned to this staff at this time
                    const matchingVisits = dayVisits.filter(
                      (v) => v.time === slot && v.services.some((t) => t.staffId === s.id)
                    );

                    if (isOff) {
                      return (
                        <div
                          key={`${slot}-${s.id}`}
                          className="p-1 border-r border-border bg-muted/20 text-center flex items-center justify-center text-[10px] text-muted-foreground/40 select-none"
                        >
                          Off
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${slot}-${s.id}`}
                        className="p-1.5 border-r border-border min-h-[52px] relative group hover:bg-secondary/40 transition-colors"
                      >
                        {matchingVisits.map((v) => {
                          const cust = customers.find((c) => c.id === v.customerId);
                          const srv = v.services.find((t) => t.staffId === s.id) ?? v.services[0];
                          return (
                            <Link
                              key={v.id}
                              to="/visits/$visitId"
                              params={{ visitId: v.id }}
                              className="block p-2 rounded border border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground transition-all shadow-xs"
                            >
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="font-bold text-primary truncate max-w-[110px]">
                                  {cust?.name ?? 'Guest'}
                                </span>
                                <Status status={v.status} />
                              </div>
                              <p className="text-[11px] font-medium truncate">{srv?.name}</p>
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                                <Clock size={10} /> {srv?.duration} min
                              </div>
                            </Link>
                          );
                        })}

                        {matchingVisits.length === 0 && (
                          <button
                            type="button"
                            onClick={() => openSlotAssign(s.id, slot)}
                            className="opacity-0 group-hover:opacity-100 w-full h-full text-[10px] text-primary/70 font-medium border border-dashed border-primary/40 rounded py-1 transition-opacity flex items-center justify-center gap-1"
                          >
                            <Plus size={11} /> Book
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Agenda View (<768px) */}
          <div className="md:hidden divide-y divide-border">
            {timeSlots.map((slot) => {
              const matching = dayVisits.filter((v) => {
                const matchTime = v.time === slot;
                const matchStaff = mobileStaffId === 'all' || v.services.some((t) => t.staffId === mobileStaffId);
                return matchTime && matchStaff;
              });

              if (matching.length === 0) return null;

              return (
                <div key={slot} className="p-3">
                  <span className="text-xs font-mono font-bold text-primary block mb-2">{slot}</span>
                  <div className="space-y-2">
                    {matching.map((v) => {
                      const cust = customers.find((c) => c.id === v.customerId);
                      const srv = v.services[0];
                      const assignedStaff = branchStaff.find((s) => s.id === srv?.staffId);
                      return (
                        <Link
                          key={v.id}
                          to="/visits/$visitId"
                          params={{ visitId: v.id }}
                          className="block p-3 border border-border rounded-lg bg-card shadow-xs"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <strong className="text-xs block">{cust?.name}</strong>
                              <span className="text-[10px] text-muted-foreground">{cust?.mobile}</span>
                            </div>
                            <Status status={v.status} />
                          </div>
                          <p className="text-xs font-medium mt-1">{srv?.name}</p>
                          <div className="mt-2 pt-2 border-t border-border flex justify-between text-[10px] text-muted-foreground">
                            <span>{assignedStaff ? `Therapist: ${assignedStaff.name}` : 'Therapist unassigned'}</span>
                            <span>{srv?.duration} mins</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {dayVisits.length === 0 && (
              <div className="empty !py-12">
                <CalendarDays size={36} className="mx-auto text-muted-foreground/40 mb-2" />
                <p>No appointments scheduled on this date.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW MODE 3: Resource View (Rooms / Suites) */}
      {viewMode === 'resource' && (
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <div
              className="grid border-b border-border bg-muted/40"
              style={{
                gridTemplateColumns: `80px repeat(${branchRooms.length}, minmax(240px, 1fr))`,
              }}
            >
              <div className="p-3 border-r border-border text-center text-[10px] font-bold text-muted-foreground uppercase">
                Time
              </div>
              {branchRooms.map((room) => (
                <div key={room.id} className="p-3 border-r border-border flex items-center gap-2">
                  <DoorOpen size={16} className="text-primary" />
                  <div>
                    <strong className="text-xs block">{room.name}</strong>
                    <span className="text-[10px] text-muted-foreground">{manager.branchId.toUpperCase()} Resource</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="grid divide-y divide-border"
              style={{
                gridTemplateColumns: `80px repeat(${branchRooms.length}, minmax(240px, 1fr))`,
              }}
            >
              {timeSlots.map((slot) => (
                <div key={slot} className="contents">
                  <div className="p-2 border-r border-border text-center text-xs font-mono text-muted-foreground bg-card/60">
                    {slot}
                  </div>

                  {branchRooms.map((room, idx) => {
                    // Spread appointments across rooms
                    const roomVisits = dayVisits.filter(
                      (v, i) => v.time === slot && i % branchRooms.length === idx
                    );

                    return (
                      <div key={`${slot}-${room.id}`} className="p-1.5 border-r border-border min-h-[50px]">
                        {roomVisits.map((v) => {
                          const cust = customers.find((c) => c.id === v.customerId);
                          const srv = v.services[0];
                          return (
                            <Link
                              key={v.id}
                              to="/visits/$visitId"
                              params={{ visitId: v.id }}
                              className="block p-2 rounded border border-border bg-secondary hover:border-primary text-xs transition-colors"
                            >
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="font-semibold">{cust?.name}</span>
                                <Status status={v.status} />
                              </div>
                              <p className="text-[11px] truncate">{srv?.name}</p>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Slot Assign Modal */}
      {slotModal && (
        <Modal title={`Book Slot · ${slotTime}`} onClose={() => setSlotModal(false)}>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg text-xs">
              <strong className="block mb-1">Appointment Details</strong>
              <span className="text-muted-foreground">
                Date: {date} · Time: {slotTime} · Therapist: {branchStaff.find((s) => s.id === slotStaffId)?.name ?? 'Selected'}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="slot-cust-name">Customer Name *</label>
                <input
                  id="slot-cust-name"
                  value={slotCustName}
                  onChange={(e) => setSlotCustName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="slot-cust-mobile">Mobile Number *</label>
                <input
                  id="slot-cust-mobile"
                  value={slotCustMobile}
                  onChange={(e) => setSlotCustMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label>Requested Treatment *</label>
              <select
                value={slotServiceId}
                onChange={(e) => setSlotServiceId(e.target.value)}
                required
              >
                {branchServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} mins) · {money(s.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Assigned Therapist</label>
              <select
                value={slotStaffId}
                onChange={(e) => setSlotStaffId(e.target.value)}
              >
                {branchStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full mt-5">
              <CheckCircle2 /> Confirm & Schedule
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}

