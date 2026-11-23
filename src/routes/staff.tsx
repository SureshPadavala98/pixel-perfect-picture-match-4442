import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  UserRound,
  ArrowUpRight,
  Plus,
  Edit2,
  Calendar,
  Clock,
  Shield,
  FileText,
  Briefcase,
  Building2,
  Check,
  Trash2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Initials, Status, Modal, pageHead } from '@/components/spa-shared';
import { useSpa } from '@/lib/spa-context';
import { branches, type DayOfWeek, type Staff, type StaffShiftDay, type StaffExperience, type StaffDocument } from '@/lib/spa-model';
import { toast } from 'sonner';

export const Route = createFileRoute('/staff')({
  head: () => pageHead('Staff Management', 'Branch therapists, 7-day weekly shift schedules, and operational availability.'),
  component: StaffPage,
});

const defaultSevenDays: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StaffPage() {
  const { staff, visits, customers, manager, updateStaff, createStaff } = useSpa();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'' | 'edit' | 'create'>('');
  const [activeTab, setActiveTab] = useState<'personal' | 'settings' | 'shifts' | 'joining' | 'experience' | 'documents' | 'bank'>('personal');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('Senior therapist');
  const [username, setUsername] = useState('');

  // Status & Settings toggles
  const [active, setActive] = useState(true);
  const [showAllAppointments, setShowAllAppointments] = useState(true);
  const [enableAppointments, setEnableAppointments] = useState(true);
  const [onlineNotifications, setOnlineNotifications] = useState(true);
  const [teamNotifications, setTeamNotifications] = useState(true);

  // Shifts (Sunday to Saturday)
  const [shifts, setShifts] = useState<StaffShiftDay[]>([]);

  // Joining details
  const [joiningDate, setJoiningDate] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [uanNumber, setUanNumber] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [designation, setDesignation] = useState('');

  // Experience
  const [experience, setExperience] = useState<StaffExperience[]>([]);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Documents
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('ID Proof');

  // Bank details
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  if (!manager) return null;

  const branchStaff = staff.filter((s) => s.branchId === manager.branchId);
  const filteredStaff = branchStaff.filter((s) =>
    `${s.name} ${s.role} ${s.mobile} ${s.position}`.toLowerCase().includes(query.toLowerCase())
  );

  const openEdit = (s: Staff) => {
    setEditingStaff(s);
    setFirstName(s.firstName ?? s.name.split(' ')[0] ?? '');
    setLastName(s.lastName ?? s.name.split(' ').slice(1).join(' ') ?? '');
    setMobile(s.mobile ?? '');
    setEmail(s.email ?? '');
    setDob(s.dob ?? '1992-05-14');
    setGender(s.gender ?? 'Female');
    setPosition(s.position ?? s.role);
    setRole(s.role);
    setUsername(s.username ?? `${s.name.toLowerCase().replace(/\s+/g, '.')}`);

    setActive(s.active ?? true);
    setShowAllAppointments(s.showAllAppointments ?? true);
    setEnableAppointments(s.enableAppointments ?? true);
    setOnlineNotifications(s.onlineNotifications ?? true);
    setTeamNotifications(s.teamNotifications ?? true);

    setShifts(
      s.shifts?.length
        ? s.shifts
        : defaultSevenDays.map((day) => ({
            day,
            isWeeklyOff: day === 'Tuesday',
            startTime: '09:00',
            endTime: '20:00',
          }))
    );

    setJoiningDate(s.joiningDate ?? '2023-01-15');
    setReportingTo(s.reportingTo ?? manager.name);
    setUanNumber(s.uanNumber ?? '');
    setWorkingHours(s.workingHours ?? '9 Hours Daily');
    setDesignation(s.designation ?? s.role);

    setExperience(s.experience ?? []);
    setDocuments(s.documents ?? []);

    setBankName(s.bankDetails?.bankName ?? '');
    setBankBranch(s.bankDetails?.branchName ?? '');
    setAccountNumber(s.bankDetails?.accountNumber ?? '');
    setIfscCode(s.bankDetails?.ifscCode ?? '');

    setActiveTab('personal');
    setModal('edit');
  };

  const openCreate = () => {
    setEditingStaff(null);
    setFirstName('');
    setLastName('');
    setMobile('');
    setEmail('');
    setDob('1995-01-01');
    setGender('Female');
    setPosition('Spa Therapist');
    setRole('Spa therapist');
    setUsername('');

    setActive(true);
    setShowAllAppointments(true);
    setEnableAppointments(true);
    setOnlineNotifications(true);
    setTeamNotifications(true);

    setShifts(
      defaultSevenDays.map((day) => ({
        day,
        isWeeklyOff: day === 'Wednesday',
        startTime: '09:00',
        endTime: '20:00',
      }))
    );

    setJoiningDate(new Date().toISOString().split('T')[0] ?? '');
    setReportingTo(manager.name);
    setUanNumber('');
    setWorkingHours('9 Hours (09:00 - 18:00)');
    setDesignation('Therapist');

    setExperience([]);
    setDocuments([]);

    setBankName('');
    setBankBranch('');
    setAccountNumber('');
    setIfscCode('');

    setActiveTab('personal');
    setModal('create');
  };

  const handleShiftChange = (index: number, field: keyof StaffShiftDay, val: any) => {
    setShifts((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: val };
      }
      return copy;
    });
  };

  const addExperienceItem = () => {
    if (!newCompany.trim() || !newRole.trim()) {
      toast.error('Enter company and role');
      return;
    }
    const item: StaffExperience = {
      id: `exp-${Date.now()}`,
      company: newCompany.trim(),
      role: newRole.trim(),
      duration: newDuration.trim() || '1 Year',
    };
    setExperience((prev) => [...prev, item]);
    setNewCompany('');
    setNewRole('');
    setNewDuration('');
    toast.success('Experience added');
  };

  const removeExperienceItem = (id: string) => {
    setExperience((prev) => prev.filter((it) => it.id !== id));
  };

  const addDocumentItem = () => {
    if (!newDocName.trim()) {
      toast.error('Enter document name');
      return;
    }
    const doc: StaffDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      type: newDocType,
      uploadedAt: new Date().toISOString().split('T')[0] ?? '',
    };
    setDocuments((prev) => [...prev, doc]);
    setNewDocName('');
    toast.success('Document uploaded');
  };

  const removeDocumentItem = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !mobile.trim()) {
      toast.error('First name and mobile number are required');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const payload: Staff = {
      id: editingStaff ? editingStaff.id : `${manager.branchId}-s-${Date.now()}`,
      branchId: manager.branchId,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      specialties: editingStaff?.specialties ?? ['Massage', 'Wellness'],
      mobile: mobile.trim(),
      email: email.trim(),
      dob,
      gender,
      position: position.trim(),
      username: username.trim() || `${firstName.toLowerCase()}.${manager.branchId}`,
      active,
      showAllAppointments,
      enableAppointments,
      onlineNotifications,
      teamNotifications,
      shifts,
      joiningDate,
      reportingTo,
      uanNumber,
      workingHours,
      designation,
      experience,
      documents,
      bankDetails: {
        bankName,
        branchName: bankBranch,
        accountNumber,
        ifscCode,
      },
    };

    if (editingStaff) {
      updateStaff(payload);
      toast.success('Staff profile and shifts updated');
    } else {
      createStaff(payload);
      toast.success('New employee added to branch team');
    }
    setModal('');
  };

  return (
    <>
      <PageHeading
        title="Staff Management"
        description="Comprehensive therapist profiles, 7-day weekly shift schedules, and operational availability."
      >
        <Button onClick={openCreate}>
          <Plus /> Add Staff Member
        </Button>
      </PageHeading>

      <section className="panel">
        <div className="panel-heading">
          <h2>Branch Team ({filteredStaff.length})</h2>
          <UserRound size={20} className="text-gold" />
        </div>

        <div className="filters">
          <input
            placeholder="Search therapist by name, role, mobile or position…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff"
          />
        </div>

        <div className="staff-grid p-5">
          {filteredStaff.map((s) => {
            const current = visits.find(
              (v) =>
                v.status === 'In Progress' &&
                v.services.some((t) => t.staffId === s.id && t.status === 'In Progress')
            );

            return (
              <div
                key={s.id}
                className="border border-border rounded-xl p-5 bg-card flex flex-col justify-between shadow-xs hover:border-gold transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <Initials name={s.name} />
                    <div className="flex gap-1.5 items-center">
                      <span className={`badge ${s.active ? 'completed' : 'cancelled'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                      <Status status={current ? 'In Progress' : 'Available'} />
                    </div>
                  </div>

                  <strong className="text-base block">{s.name}</strong>
                  <span className="text-xs text-muted-foreground block">{s.position || s.role}</span>
                  <p className="text-[11px] text-muted-foreground mt-1">📞 {s.mobile || 'Not configured'}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {s.specialties.map((spec) => (
                      <span key={spec} className="badge">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Current Assignment
                    </span>
                    {current ? (
                      <div className="text-xs">
                        <span className="font-semibold text-primary block">
                          {customers.find((c) => c.id === current.customerId)?.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {current.services
                            .filter((t) => t.staffId === s.id && t.status === 'In Progress')
                            .map((t) => t.name)
                            .join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Available for appointments</span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1"
                    onClick={() => openEdit(s)}
                  >
                    <Edit2 size={13} /> Edit Profile & Shifts
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Staff Modal (Screenshots 3, 5, 6, 7) */}
      {modal && (
        <Modal
          title={modal === 'edit' ? `Staff Profile · ${firstName} ${lastName}` : 'Add Staff Member'}
          onClose={() => setModal('')}
        >
          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border mb-4">
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'settings', label: 'Status & Settings' },
              { id: 'shifts', label: 'Weekly Shifts' },
              { id: 'joining', label: 'Joining Details' },
              { id: 'experience', label: 'Work Experience' },
              { id: 'documents', label: 'Documents' },
              { id: 'bank', label: 'Bank Details' },
            ].map((t) => (
              <Button
                key={t.id}
                type="button"
                variant={activeTab === t.id ? 'default' : 'ghost'}
                size="sm"
                className="text-xs h-8 shrink-0"
                onClick={() => setActiveTab(t.id as any)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSaveStaff} className="space-y-4">
            {/* TAB 1: Personal Information (Screenshot 3) */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-fname">First Name *</label>
                    <input
                      id="st-fname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="st-lname">Last Name</label>
                    <input
                      id="st-lname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-mobile">Mobile Number *</label>
                    <input
                      id="st-mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="st-email">Email Address</label>
                    <input
                      id="st-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-dob">Date of Birth</label>
                    <input
                      id="st-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Gender</label>
                    <div className="flex gap-2">
                      {(['Female', 'Male', 'Other'] as const).map((g) => (
                        <Button
                          key={g}
                          type="button"
                          variant={gender === g ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setGender(g)}
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-position">Position / Designation</label>
                    <input
                      id="st-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Senior Spa Specialist"
                    />
                  </div>
                  <div>
                    <label htmlFor="st-role">Role</label>
                    <select id="st-role" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option>Senior therapist</option>
                      <option>Beauty therapist</option>
                      <option>Spa therapist</option>
                      <option>Lead Aesthetician</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label>Assigned Branch</label>
                    <input
                      readOnly
                      value={branches[manager.branchId].name}
                      className="bg-muted text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="st-user">Login Username</label>
                    <input
                      id="st-user"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Status & Settings (Screenshot 5) */}
            {activeTab === 'settings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">Active Staff Status</strong>
                    <span className="text-[10px] text-muted-foreground">Employee is currently active at this branch</span>
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
                    <strong className="text-xs block">Show All Staff Appointments</strong>
                    <span className="text-[10px] text-muted-foreground">Allow viewing appointments of peer therapists</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showAllAppointments}
                    onChange={(e) => setShowAllAppointments(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">Enable Appointments</strong>
                    <span className="text-[10px] text-muted-foreground">Eligible for customer booking assignments</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAppointments}
                    onChange={(e) => setEnableAppointments(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">Online Notifications</strong>
                    <span className="text-[10px] text-muted-foreground">Receive alerts for website bookings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlineNotifications}
                    onChange={(e) => setOnlineNotifications(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <strong className="text-xs block">Team Notifications</strong>
                    <span className="text-[10px] text-muted-foreground">Receive branch internal broadcast messages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={teamNotifications}
                    onChange={(e) => setTeamNotifications(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Shift Management (Screenshots 5 & 6) */}
            {activeTab === 'shifts' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  Configure working hours and weekly off for each day. This schedule directly drives appointment availability in the calendar.
                </p>

                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {shifts.map((sh, idx) => (
                    <div key={sh.day} className="p-3 flex flex-wrap items-center justify-between gap-3 bg-card">
                      <div className="w-24">
                        <strong className="text-xs block">{sh.day}</strong>
                        <span className={`text-[10px] ${sh.isWeeklyOff ? 'text-destructive font-semibold' : 'text-primary'}`}>
                          {sh.isWeeklyOff ? 'Weekly Off' : 'Working'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs font-normal !mb-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sh.isWeeklyOff}
                            onChange={(e) => handleShiftChange(idx, 'isWeeklyOff', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span>Weekly Off</span>
                        </label>
                      </div>

                      {!sh.isWeeklyOff ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={sh.startTime}
                            onChange={(e) => handleShiftChange(idx, 'startTime', e.target.value)}
                            className="py-1 px-2 text-xs !w-auto"
                            aria-label={`${sh.day} start time`}
                          />
                          <span className="text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={sh.endTime}
                            onChange={(e) => handleShiftChange(idx, 'endTime', e.target.value)}
                            className="py-1 px-2 text-xs !w-auto"
                            aria-label={`${sh.day} end time`}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No working hours scheduled</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Joining Details (Screenshot 6) */}
            {activeTab === 'joining' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-join">Joining Date</label>
                    <input
                      id="st-join"
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="st-rep">Reporting To</label>
                    <input
                      id="st-rep"
                      value={reportingTo}
                      onChange={(e) => setReportingTo(e.target.value)}
                      placeholder="Manager Name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-uan">UAN Number</label>
                    <input
                      id="st-uan"
                      value={uanNumber}
                      onChange={(e) => setUanNumber(e.target.value)}
                      placeholder="Universal Account Number"
                    />
                  </div>
                  <div>
                    <label htmlFor="st-whours">Configured Working Hours</label>
                    <input
                      id="st-whours"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g. 9 Hours (09:00 - 18:00)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="st-desig">Designation</label>
                  <input
                    id="st-desig"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Bodywork Specialist"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: Work Experience (Screenshot 6) */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg space-y-2">
                  <span className="text-xs font-semibold block">Add Previous Experience</span>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      placeholder="Company / Spa"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="text-xs"
                    />
                    <input
                      placeholder="Designation"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="text-xs"
                    />
                    <input
                      placeholder="Duration (e.g. 2 Yrs)"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <Button type="button" size="sm" onClick={addExperienceItem} className="mt-2 text-xs">
                    <Plus size={12} /> Add Experience
                  </Button>
                </div>

                <div className="space-y-2">
                  {experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 border border-border rounded-lg flex justify-between items-center bg-card text-xs"
                    >
                      <div>
                        <strong className="block">{exp.company}</strong>
                        <span className="text-muted-foreground">{exp.role} · {exp.duration}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={() => removeExperienceItem(exp.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                  {experience.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No previous experience logged.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: Documents (Screenshot 7) */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg space-y-2">
                  <span className="text-xs font-semibold block">Add Verification Document</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      placeholder="Document Name (e.g. Aadhaar Card Copy.pdf)"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="text-xs"
                    />
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="text-xs"
                    >
                      <option>Government ID</option>
                      <option>Certificate</option>
                      <option>Tax ID</option>
                      <option>Address Proof</option>
                      <option>Contract Agreement</option>
                    </select>
                  </div>
                  <Button type="button" size="sm" onClick={addDocumentItem} className="mt-2 text-xs">
                    <Plus size={12} /> Upload Document
                  </Button>
                </div>

                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 border border-border rounded-lg flex justify-between items-center bg-card text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gold" />
                        <div>
                          <strong className="block">{doc.name}</strong>
                          <span className="text-[10px] text-muted-foreground">{doc.type} · Uploaded {doc.uploadedAt}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={() => removeDocumentItem(doc.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No documents uploaded.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: Bank Details (Screenshot 7 - Restricted) */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Shield size={16} className="shrink-0" />
                  <span>Confidential banking records. Restricted to authorized branch manager view only.</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-bname">Bank Name</label>
                    <input
                      id="st-bname"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div>
                    <label htmlFor="st-bbranch">Branch Name</label>
                    <input
                      id="st-bbranch"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="e.g. ECIL Branch"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="st-acc">Account Number</label>
                    <input
                      id="st-acc"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                    />
                  </div>
                  <div>
                    <label htmlFor="st-ifsc">IFSC Code</label>
                    <input
                      id="st-ifsc"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-6">
              <Check /> Save Staff Profile
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}

