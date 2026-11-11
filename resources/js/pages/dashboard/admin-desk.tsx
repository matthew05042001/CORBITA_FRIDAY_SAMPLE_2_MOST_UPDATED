import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useTheme } from 'next-themes';
import {
    Activity,
    AlertCircle,
    Banknote,
    Bell,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileText,
    LayoutDashboard,
    Moon,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    Settings,
    Sun,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import './admin-desk-overrides.css';
import './admin-desk.css';

type Status = 'Pending Review' | 'Documents Verified' | 'Awaiting Dean' | 'Approved' | 'Needs a fix' | 'Rejected';
type Student = {
    id: number;
    name: string;
    number: string;
    program: string;
    status: Status;
    applied: string;
    grades: boolean;
    tuition: boolean;
    balance?: number;
    docs: { name: string; verified: boolean; flagged: boolean; submitted: boolean }[];
    subjects: string[];
    history: { label: string; detail: string; date: string }[];
};
type Session = { id: string; date: string; start: string; end: string; venue: string; proctor: string; students: string[] };
type Notice = { time: string; student: string; type: string; message: string };
type FeedItem = { student: string; message: string; time: string };
const docNames = ['Transcript of records', 'Evaluation sheet', 'Clearance form', 'Signed application form'];
const makeStudent = (
    id: number,
    name: string,
    number: string,
    program: string,
    status: Status,
    applied: string,
    grades = true,
    tuition = true,
    verified = false,
    balance?: number,
    missingDoc = false,
): Student => ({
    id,
    name,
    number,
    program,
    status,
    applied,
    grades,
    tuition,
    balance,
    docs: docNames.map((doc, index) => ({ name: doc, verified, flagged: false, submitted: !(missingDoc && index === 1) })),
    subjects: [
        ['Educational Research', 'Curriculum Development', 'School Administration'],
        ['Strategic Management', 'Financial Analysis', 'Business Law'],
        ['Data Analytics', 'IT Project Management', 'Systems Design'],
        ['Public Policy Analysis', 'Public Finance', 'Public Administration'],
        ['Nursing Leadership', 'Advanced Practice', 'Health Research'],
    ][(id - 1) % 5],
    history: [
        {
            label: status === 'Awaiting Dean' ? 'Sent to Dean' : 'Application submitted by student',
            detail: status === 'Awaiting Dean' ? 'Eligibility and documents cleared' : 'Received by Graduate School Office',
            date: applied,
        },
    ],
});
const seed: Student[] = [
    makeStudent(1, 'Bianca Louise Aquino', '240000000544', 'MAEd', 'Pending Review', 'Oct 4, 2026'),
    makeStudent(2, 'Paolo Miguel Reyes', '240000000470', 'MBA', 'Pending Review', 'Oct 4, 2026', true, true, false, undefined, true),
    makeStudent(3, 'Maria Angelica Santos', '240000000137', 'MAEd', 'Pending Review', 'Oct 3, 2026'),
    makeStudent(4, 'John Paul Villanueva', '240000000174', 'MBA', 'Pending Review', 'Oct 2, 2026'),
    makeStudent(5, 'Kristine Joy Ocampo', '240000000211', 'MSIT', 'Documents Verified', 'Oct 1, 2026', true, true, true),
    makeStudent(6, 'Ramon dela Cruz Jr.', '240000000292', 'MPA', 'Needs a fix', 'Oct 3, 2026', false),
    makeStudent(7, 'Jasmine Mae Tan', '240000000332', 'MAN', 'Awaiting Dean', 'Sep 29, 2026', true, true, true),
    makeStudent(8, 'Mark Anthony Lim', '230000000093', 'MBA', 'Approved', 'Sep 27, 2026', true, true, true),
    makeStudent(9, 'Czarina Faith Bautista', '230000000412', 'MAEd', 'Approved', 'Sep 26, 2026', true, true, true),
    makeStudent(10, 'Hannah Beatrice Cruz', '240000000419', 'MPA', 'Needs a fix', 'Sep 25, 2026', true, false, false, 12400),
    makeStudent(11, 'Elijah Gabriel Navarro', '230000000628', 'MSIT', 'Approved', 'Sep 24, 2026', true, true, true),
    makeStudent(12, 'Angelo Joseph Mercado', '220000000185', 'MAN', 'Rejected', 'Sep 23, 2026'),
    makeStudent(13, 'Francis Xavier Pacheco', '230000000398', 'MSIT', 'Approved', 'Sep 22, 2026', true, true, true),
    makeStudent(14, 'Lara Nicole Gutierrez', '230000000776', 'MBA', 'Approved', 'Sep 21, 2026', true, true, true),
];
const initialSessions: Session[] = [
    {
        id: 'CE-2026-11-A',
        date: 'Nov 16, 2026',
        start: '9:00 AM',
        end: '12:00 PM',
        venue: 'Fr. Selga Campus, Room 304',
        proctor: 'Prof. Elena Marquez',
        students: ['Czarina Faith Bautista', 'Francis Xavier Pacheco'],
    },
    { id: 'CE-2026-11-B', date: 'Nov 17, 2026', start: '1:00 PM', end: '4:00 PM', venue: 'Bonifacio Campus, Room 210', proctor: '', students: [] },
    {
        id: 'CE-2026-11-C',
        date: 'Nov 18, 2026',
        start: '9:00 AM',
        end: '12:00 PM',
        venue: 'Fr. Selga Campus, Room 301',
        proctor: 'Dr. Carmelita Uy',
        students: [],
    },
];
const initialNotices: Notice[] = [
    {
        time: 'Oct 3, 4:20 PM',
        student: 'Ramon dela Cruz Jr.',
        type: 'Deficiency',
        message: 'Your application is on hold. One grade is incomplete (Public Policy Analysis). Please follow up with your instructor.',
    },
    {
        time: 'Oct 2, 9:05 AM',
        student: 'Czarina Faith Bautista',
        type: 'Approved',
        message: 'Your comprehensive exam application is approved. You can now submit your proof of payment.',
    },
    {
        time: 'Oct 1, 2:41 PM',
        student: 'Lara Nicole Gutierrez',
        type: 'Payment',
        message: 'Your payment receipt could not be read. Please upload a clear copy.',
    },
    {
        time: 'Sep 30, 10:12 AM',
        student: 'Hannah Beatrice Cruz',
        type: 'Deficiency',
        message: 'Your application is on hold because of an outstanding tuition balance of ₱12,400.',
    },
];
const nav = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Applications', icon: ClipboardCheck },
    { name: 'Payments', icon: Banknote },
    { name: 'Schedules', icon: CalendarDays },
    { name: 'Messages', icon: Send },
];
const pipelineStatuses: Status[] = ['Pending Review', 'Documents Verified', 'Awaiting Dean', 'Approved', 'Needs a fix'];
const colors: Record<Status, string> = {
    'Pending Review': '#4f85dc',
    'Documents Verified': '#239c8b',
    'Awaiting Dean': '#8668c6',
    Approved: '#43a276',
    'Needs a fix': '#cf9740',
    Rejected: '#b95461',
};
const chipClass: Record<Status, string> = {
    'Pending Review': 'pending',
    'Documents Verified': 'verified',
    'Awaiting Dean': 'dean',
    Approved: 'approved',
    'Needs a fix': 'fix',
    Rejected: 'rejected',
};
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const toMinutes = (value: string) => {
    const [clock, meridiem] = value.trim().split(/\s+/);
    const [hours, minutes] = clock.split(':').map(Number);
    return (meridiem ? (hours % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0) : hours) * 60 + minutes;
};
const toDisplayTime = (value: string) => {
    if (/\s(?:AM|PM)$/i.test(value)) return value;
    const [hours, minutes] = value.split(':').map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
};
const toInputTime = (value: string) => {
    const total = toMinutes(value);
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const formatSessionDate = (value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const programNames: Record<string, string> = {
    MAEd: 'MA in Education, Educational Management',
    MBA: 'Master of Business Administration',
    MSIT: 'MS in Information Technology',
    MPA: 'Master of Public Administration',
    MAN: 'Master of Arts in Nursing',
};
const formatAppliedDate = (value: string) => {
    const applied = new Date(value);
    const daysAgo = Math.max(0, Math.round((new Date('Oct 5, 2026').getTime() - applied.getTime()) / 86_400_000));
    return `${applied.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${daysAgo}d`;
};
function deficiencyMessage(student: Student) {
    const issues = [
        !student.grades && 'Incomplete grades (Public Policy Analysis)',
        !student.tuition && `Outstanding tuition balance of ${money.format(student.balance ?? 12400)}`,
        student.docs.some((doc) => !doc.submitted) && 'A required document is missing',
    ].filter(Boolean);
    return `Your comprehensive exam application is on hold. Please fix the following and reply here when done:\n\n${issues.map((issue) => `- ${issue}`).join('\n')}`;
}

export default function AdminDesk() {
    const { resolvedTheme } = useTheme();
    const [section, setSection] = useState('Dashboard');
    const [students, setStudents] = useState(seed);
    const [sessions, setSessions] = useState(initialSessions);
    const [notices, setNotices] = useState(initialNotices);
    const [feed, setFeed] = useState<FeedItem[]>([
        { student: 'Mark Anthony Lim', message: 'Payment is waiting for verification', time: 'Yesterday' },
        { student: 'Dean', message: 'Approved Czarina Faith Bautista and Francis Xavier Pacheco', time: 'Fri' },
        { student: 'Ramon dela Cruz Jr.', message: 'Deficiency notice sent', time: 'Fri' },
        { student: 'Angelo Joseph Mercado', message: 'Application rejected by Dean', time: 'Thu' },
    ]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [program, setProgram] = useState('All programs');
    const [filter, setFilter] = useState('All');
    const [dialog, setDialog] = useState<'receipt' | 'session' | null>(null);
    const [receipt, setReceipt] = useState('Mark Anthony Lim');
    const [paymentState, setPaymentState] = useState<Record<string, string>>({
        'Mark Anthony Lim': 'Pending',
        'Czarina Faith Bautista': 'Verified',
        'Elijah Gabriel Navarro': 'Not submitted',
        'Francis Xavier Pacheco': 'Verified',
        'Lara Nicole Gutierrez': 'Rejected',
    });
    const [drawerForm, setDrawerForm] = useState<'' | 'deficiency' | 'reject'>('');
    const [reason, setReason] = useState('');
    const [sessionForm, setSessionForm] = useState({ date: '', start: '', end: '', venue: '', proctor: '' });
    const [editingSession, setEditingSession] = useState<string | null>(null);
    const [sessionError, setSessionError] = useState('');
    const [toast, setToast] = useState('');
    const selected = students.find((student) => student.id === selectedId) ?? null;
    const approved = students.filter((student) => student.status === 'Approved');
    const filtered = useMemo(
        () =>
            students
                .filter(
                    (student) =>
                        `${student.name} ${student.number}`.toLowerCase().includes(search.toLowerCase()) &&
                        (program === 'All programs' || student.program === program) &&
                        (filter === 'All' || student.status === filter || (filter === 'Deficiency' && student.status === 'Needs a fix')),
                )
                .sort((left, right) => new Date(right.applied).getTime() - new Date(left.applied).getTime()),
        [students, search, program, filter],
    );
    const paymentCount = Object.values(paymentState).filter((state) => state === 'Pending').length;
    const reviewCount = students.filter((student) => ['Pending Review', 'Documents Verified'].includes(student.status)).length;

    useEffect(() => {
        const dismissOverlays = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedId(null);
                setDrawerForm('');
                setDialog(null);
                setEditingSession(null);
            }
        };
        window.addEventListener('keydown', dismissOverlays);
        return () => window.removeEventListener('keydown', dismissOverlays);
    }, []);

    function action(message: string, studentName = 'Graduate School Office', type = 'Application update', toastMessage = message) {
        const time = new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
        setToast(toastMessage);
        window.setTimeout(() => setToast(''), 2500);
        setFeed((items) => [{ student: studentName, message, time: 'Just now' }, ...items].slice(0, 8));
        if (studentName !== 'Graduate School Office' || type === 'Schedule') {
            setNotices((items) => [{ time: `Today, ${time}`, student: studentName, type, message }, ...items]);
        }
        if (studentName !== 'Graduate School Office') {
            setStudents((items) =>
                items.map((student) =>
                    student.name === studentName
                        ? {
                              ...student,
                              history: [
                                  { label: message, detail: 'Updated by Maricel Dizon, Administrative Assistant', date: `Oct 5, 2026 · ${time}` },
                                  ...student.history,
                              ],
                          }
                        : student,
                ),
            );
        }
    }
    function updateStudent(id: number, changes: Partial<Student>, message: string, toastMessage?: string) {
        const target = students.find((student) => student.id === id);
        setStudents((items) => items.map((student) => (student.id === id ? { ...student, ...changes } : student)));
        if (target) {
            const lowerMessage = message.toLowerCase();
            const type = lowerMessage.includes('payment') ? 'Payment' : lowerMessage.includes('deficiency') ? 'Deficiency' : 'Application update';
            action(message, target.name, type, toastMessage);
        }
    }
    function resolveCheck(id: number, key: 'grades' | 'tuition' | 'docs') {
        const student = students.find((item) => item.id === id);
        if (!student) return;
        const changes: Partial<Student> =
            key === 'docs' ? { docs: student.docs.map((doc) => ({ ...doc, submitted: true, flagged: false })) } : { [key]: true };
        if (student.grades || key === 'grades') changes.grades = true;
        if (student.tuition || key === 'tuition') changes.tuition = true;
        if (
            student.docs.every((doc) => doc.verified && doc.submitted) &&
            (student.grades || key === 'grades') &&
            (student.tuition || key === 'tuition')
        )
            changes.status = 'Documents Verified';
        updateStudent(id, changes, `${key === 'grades' ? 'Grades' : key === 'tuition' ? 'Tuition balance' : 'Documents'} marked resolved`);
    }
    function updateDocument(id: number, index: number, verify: boolean) {
        const student = students.find((item) => item.id === id);
        if (!student) return;
        if (!student.docs[index].submitted) return;
        const docs = student.docs.map((doc, current) => (current === index ? { ...doc, verified: verify, flagged: false } : doc));
        const complete = docs.every((doc) => doc.verified && doc.submitted);
        const status: Status =
            complete && student.grades && student.tuition
                ? 'Documents Verified'
                : student.status === 'Documents Verified'
                  ? 'Pending Review'
                  : student.status;
        updateStudent(id, { docs, status }, `${docs[index].name} ${verify ? 'verified' : 'verification removed'}`);
    }
    function flagDocument(id: number, index: number) {
        const student = students.find((item) => item.id === id);
        if (!student) return;
        const docs = student.docs.map((doc, current) => (current === index ? { ...doc, flagged: true, verified: false } : doc));
        updateStudent(id, { docs, status: 'Needs a fix' }, `${docs[index].name} flagged for follow-up`);
    }
    function sendDrawerAction() {
        if (!selected || !drawerForm) return;
        if (!reason.trim()) {
            setToast('Enter a reason first');
            return;
        }
        const message = drawerForm === 'deficiency' ? `Deficiency notice sent: ${reason}` : `Application rejected: ${reason}`;
        const firstName = selected.name.split(' ')[0];
        updateStudent(
            selected.id,
            { status: drawerForm === 'deficiency' ? 'Needs a fix' : 'Rejected' },
            message,
            drawerForm === 'deficiency' ? `Deficiency notice sent to ${firstName}` : 'Application rejected and student notified',
        );
        setDrawerForm('');
        setReason('');
        setSelectedId(null);
    }
    function changePayment(name: string, status: string) {
        setPaymentState((current) => ({ ...current, [name]: status }));
        action(
            `Payment ${status.toLowerCase()}${status === 'Rejected' ? ' - please upload a clearer receipt' : ''}`,
            name,
            'Payment',
            status === 'Verified' ? 'Payment verified' : 'Payment rejected and student notified',
        );
    }
    function remindAll() {
        const onHold = students.filter((student) => student.status === 'Needs a fix');
        onHold.forEach((student) => action('Reminder sent: please resolve the items on hold before applications close.', student.name, 'Reminder'));
        setToast(`Reminders sent to ${onHold.length} students`);
    }
    function createSession(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSessionError('');
        if (!sessionForm.date || !sessionForm.start || !sessionForm.end || !sessionForm.venue.trim()) {
            setSessionError('Please fill out date, time and venue.');
            return;
        }
        if (toMinutes(sessionForm.end) <= toMinutes(sessionForm.start)) {
            setSessionError('End time must be after the start time.');
            return;
        }
        const date = new Date(`${sessionForm.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (editingSession) {
            setSessions((items) =>
                items.map((item) =>
                    item.id === editingSession
                        ? {
                              ...item,
                              date,
                              start: toDisplayTime(sessionForm.start),
                              end: toDisplayTime(sessionForm.end),
                              venue: sessionForm.venue,
                              proctor: sessionForm.proctor,
                          }
                        : item,
                ),
            );
            setEditingSession(null);
            action('Exam session updated', 'Graduate School Office', 'Schedule', 'Session updated');
        } else {
            setSessions((items) => [
                ...items,
                {
                    id: `CE-2026-11-${String.fromCharCode(65 + items.length)}`,
                    date,
                    start: toDisplayTime(sessionForm.start),
                    end: toDisplayTime(sessionForm.end),
                    venue: sessionForm.venue,
                    proctor: sessionForm.proctor,
                    students: [],
                },
            ]);
            action('Exam session created', 'Graduate School Office', 'Schedule', 'Session created');
        }
        setSessionForm({ date: '', start: '', end: '', venue: '', proctor: '' });
        setDialog(null);
        setSessionError('');
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Applications', href: '/defense' }, { title: 'Comprehensive Exams', href: '/assistant/comprehensive-exam' }]}>
        <div className={`ceas-desk ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
            <Head title="CEAS Admin Desk" />
            <aside className="ceas-sidebar">
                <div className="ceas-brand">
                    <span className="ceas-logo">CE</span>
                    <span>
                        <b>CEAS</b>
                        <small>Graduate School Office</small>
                    </span>
                </div>
                <div className="sidebar-label">WORKSPACE</div>
                <nav className="desk-nav" aria-label="Main navigation">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const count = item.name === 'Applications' ? reviewCount : item.name === 'Payments' ? paymentCount : 0;
                        return (
                            <button key={item.name} className={section === item.name ? 'active' : ''} onClick={() => setSection(item.name)}>
                                <Icon size={18} />
                                <span>{item.name}</span>
                                {count > 0 && <b className="nav-badge">{count}</b>}
                            </button>
                        );
                    })}
                </nav>
                <div className="sidebar-bottom">
                    <div className="appearance-button">
                        <Settings size={17} />
                        <span>Appearance</span>
                        {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    </div>
                    <span className="sidebar-sample-note">Sample data for design review</span>
                    <div className="account-wrap">
                        <div className="account-button">
                            <span className="avatar">MD</span>
                            <span>
                                <b>Maricel Dizon</b>
                                <small>Administrative Assistant</small>
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
            <main className="desk-main">
                <header className="desk-topbar">
                    <div className="mobile-brand">
                        <span className="ceas-logo">CE</span>
                        <b>CEAS</b>
                    </div>
                    <div className="crumb">
                        <span>Graduate School</span>
                        <ChevronRight size={14} />
                        <b>{section}</b>
                    </div>
                    <div className="top-tools">
                        <span className="sample-label">
                            <i /> SAMPLE DATA
                        </span>
                        <button aria-label="Open messages" onClick={() => setSection('Messages')}>
                            <Bell size={17} />
                        </button>
                        <span className="top-avatar">MD</span>
                    </div>
                </header>
                <div className="desk-content">
                    <div className="page-heading">
                        <div>
                            <span className="overline">{section === 'Dashboard' ? 'MONDAY, OCTOBER 5, 2026' : 'COMPREHENSIVE EXAMINATION'}</span>
                            <h1>{section === 'Dashboard' ? 'Good morning, Maricel' : section}</h1>
                            <p>
                                {
                                    (
                                        {
                                            Dashboard: 'Here is what needs your attention today.',
                                            Applications: 'Comprehensive exam requests for Cycle 1.',
                                            Payments: 'Exam fee ₱3,500 · only approved applicants can pay.',
                                            Schedules: 'Exam sessions and proctor assignments.',
                                            Messages: 'Notices sent to students by email and in the app.',
                                        } as Record<string, string>
                                    )[section]
                                }
                            </p>
                        </div>
                        {section === 'Schedules' && (
                            <button
                                className="primary"
                                onClick={() => {
                                    setEditingSession(null);
                                    setSessionForm({ date: '', start: '', end: '', venue: '', proctor: '' });
                                    setSessionError('');
                                    setDialog('session');
                                }}
                            >
                                <Plus size={16} />
                                New session
                            </button>
                        )}
                    </div>
                    <nav className="section-tabs" aria-label="Comprehensive examination sections">
                        {nav.map((item) => {
                            const Icon = item.icon;
                            const count = item.name === 'Applications' ? reviewCount : item.name === 'Payments' ? paymentCount : 0;
                            return <button key={item.name} className={section === item.name ? 'active' : ''} onClick={() => setSection(item.name)}><Icon size={16} /><span>{item.name}</span>{count > 0 && <b>{count}</b>}</button>;
                        })}
                    </nav>
                    {section === 'Dashboard' && (
                        <Dashboard
                            students={students}
                            feed={feed}
                            setSection={setSection}
                            openStudent={(id) => {
                                setSelectedId(id);
                                setSection('Applications');
                            }}
                            openFilter={(value) => {
                                setFilter(value === 'Needs a fix' ? 'Deficiency' : value);
                                setSection('Applications');
                            }}
                        />
                    )}
                    {section === 'Applications' && (
                        <Applications
                            students={students}
                            filtered={filtered}
                            search={search}
                            setSearch={setSearch}
                            program={program}
                            setProgram={setProgram}
                            filter={filter}
                            setFilter={setFilter}
                            openStudent={setSelectedId}
                        />
                    )}
                    {section === 'Payments' && (
                        <Payments
                            students={approved}
                            state={paymentState}
                            openReceipt={(name) => {
                                setReceipt(name);
                                setDialog('receipt');
                            }}
                            update={changePayment}
                            remind={(name) => action('Payment reminder sent', name, 'Reminder', `Reminder sent to ${name.split(' ')[0]}`)}
                        />
                    )}
                    {section === 'Schedules' && (
                        <Schedules
                            sessions={sessions}
                            setSessions={setSessions}
                            students={students}
                            paymentState={paymentState}
                            action={action}
                            onEdit={(session) => {
                                setEditingSession(session.id);
                                setSessionForm({
                                    date: new Date(`${session.date} 12:00:00`).toISOString().slice(0, 10),
                                    start: toInputTime(session.start),
                                    end: toInputTime(session.end),
                                    venue: session.venue,
                                    proctor: session.proctor,
                                });
                                setSessionError('');
                                setDialog('session');
                            }}
                        />
                    )}
                    {section === 'Messages' && (
                        <Messages
                            notices={notices}
                            count={students.filter((student) => student.status === 'Needs a fix').length}
                            holdNames={students.filter((student) => student.status === 'Needs a fix').map((student) => student.name)}
                            remindAll={remindAll}
                        />
                    )}
                    <footer className="desk-footer">
                        <span>Comprehensive Exam Application System</span>
                        <span>
                            University of the Immaculate Conception · <b>Sample data for demonstration</b>
                        </span>
                    </footer>
                </div>
            </main>
            <nav className="mobile-nav" aria-label="Main navigation">
                {nav.map((item) => {
                    const Icon = item.icon;
                    const count = item.name === 'Applications' ? reviewCount : item.name === 'Payments' ? paymentCount : 0;
                    return (
                        <button key={item.name} className={section === item.name ? 'active' : ''} onClick={() => setSection(item.name)}>
                            <Icon size={18} />
                            <span>{item.name}</span>
                            {count > 0 && <b>{count}</b>}
                        </button>
                    );
                })}
                <span className="mobile-avatar">MD</span>
            </nav>
            {selected && (
                <Drawer
                    student={selected}
                    paymentState={paymentState[selected.name]}
                    close={() => {
                        setSelectedId(null);
                        setDrawerForm('');
                    }}
                    resolve={(key) => resolveCheck(selected.id, key)}
                    verify={(index, value) => updateDocument(selected.id, index, value)}
                    flag={(index) => flagDocument(selected.id, index)}
                    form={drawerForm}
                    setForm={(value) => {
                        setDrawerForm(value);
                        setReason(value === 'deficiency' ? deficiencyMessage(selected) : '');
                    }}
                    reason={reason}
                    setReason={setReason}
                    submit={sendDrawerAction}
                    approve={() => {
                        updateStudent(
                            selected.id,
                            { status: 'Awaiting Dean' },
                            'Application approved and sent to Dean',
                            'Sent to the Dean for a decision',
                        );
                        setSelectedId(null);
                    }}
                />
            )}
            {dialog === 'receipt' && (
                <Receipt
                    name={receipt}
                    state={paymentState[receipt] ?? 'Pending'}
                    close={() => setDialog(null)}
                    verify={() => {
                        changePayment(receipt, 'Verified');
                        setDialog(null);
                    }}
                    reject={() => {
                        changePayment(receipt, 'Rejected');
                        setDialog(null);
                    }}
                />
            )}
            {dialog === 'session' && (
                <SessionDialog
                    form={sessionForm}
                    setForm={setSessionForm}
                    submit={createSession}
                    error={sessionError}
                    close={() => {
                        setDialog(null);
                        setEditingSession(null);
                        setSessionError('');
                    }}
                    editing={editingSession}
                />
            )}
            {toast && (
                <div className="desk-toast" role="status">
                    <CheckCircle2 size={17} />
                    {toast}
                </div>
            )}
        </div>
        </AppLayout>
    );
}

function StatusChip({ status }: { status: Status }) {
    return (
        <span className={`status-chip ${chipClass[status]}`}>
            <i />
            {status === 'Needs a fix' ? 'Deficiency' : status}
        </span>
    );
}
function Dashboard({
    students,
    feed,
    setSection,
    openStudent,
    openFilter,
}: {
    students: Student[];
    feed: FeedItem[];
    setSection: (name: string) => void;
    openStudent: (id: number) => void;
    openFilter: (value: string) => void;
}) {
    const review = students.filter((student) => ['Pending Review', 'Documents Verified'].includes(student.status));
    const oldest = [
        { name: 'Kristine Joy Ocampo', days: 5 },
        { name: 'John Paul Villanueva', days: 4 },
        { name: 'Maria Angelica Santos', days: 3 },
        { name: 'Paolo Miguel Reyes', days: 2 },
        { name: 'Bianca Louise Aquino', days: 1 },
    ];
    return (
        <>
            <section className="cycle-banner">
                <span className="cycle-icon">
                    <CalendarDays size={20} />
                </span>
                <div className="cycle-copy">
                    <b>Comprehensive Exam, Cycle 1 · Fall 2026</b>
                    <span>Applications close October 30 · Exams November 16 to 18</span>
                </div>
                <div className="cycle-count">
                    <b>25</b>
                    <small>days until applications close on Oct 30</small>
                </div>
                <div className="cycle-progress">
                    <div>
                        <span>Application window</span>
                        <b>68% elapsed</b>
                    </div>
                    <i>
                        <em />
                    </i>
                    <small>
                        Opens Sep 1 <span>Closes Oct 30, 2026</span>
                    </small>
                </div>
            </section>
            <div className="dashboard-grid">
                <section className="pipeline">
                    <div className="section-head">
                        <div>
                            <h2>Application pipeline</h2>
                            <p>Current cycle · {students.length} sample applications</p>
                        </div>
                        <button className="text-link" onClick={() => openFilter('All')}>
                            View applications <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="pipeline-bar">
                        {pipelineStatuses.map((status) => {
                            const count = students.filter((student) => student.status === status).length;
                            return (
                                <button
                                    aria-label={`Filter ${status}: ${count}`}
                                    key={status}
                                    style={{ width: `${(count / students.length) * 100}%`, background: colors[status] }}
                                    onClick={() => openFilter(status)}
                                >
                                    {count}
                                </button>
                            );
                        })}
                    </div>
                    <div className="pipeline-legend">
                        {pipelineStatuses.map((status) => (
                            <button key={status} onClick={() => openFilter(status)}>
                                <i style={{ background: colors[status] }} />
                                {status}
                                <b>{students.filter((student) => student.status === status).length}</b>
                            </button>
                        ))}
                    </div>
                </section>
                <section className="needs">
                    <div className="section-head">
                        <div>
                            <h2>Needs you today</h2>
                            <p>Priority items across the office</p>
                        </div>
                        <span className="today">MON · OCT 5</span>
                    </div>
                    <div className="needs-grid">
                        <Need
                            icon={<FileText size={17} />}
                            color="blue"
                            number={String(review.length)}
                            title="Applications to review"
                            subtitle="Check documents and eligibility"
                            click={() => setSection('Applications')}
                        />
                        <Need
                            icon={<Banknote size={17} />}
                            color="green"
                            number="1"
                            title="Payments to verify"
                            subtitle="Proof of payment uploaded"
                            click={() => setSection('Payments')}
                        />
                        <Need
                            icon={<CalendarDays size={17} />}
                            color="amber"
                            number="1"
                            title="Schedule items open"
                            subtitle="1 without proctor, 0 cleared not scheduled"
                            click={() => setSection('Schedules')}
                        />
                        <Need
                            icon={<AlertCircle size={17} />}
                            color="rose"
                            number={String(students.filter((student) => student.status === 'Needs a fix').length)}
                            title="Students on hold"
                            subtitle="Send a reminder about what is missing"
                            click={() => setSection('Messages')}
                        />
                    </div>
                </section>
                <section className="panel longest">
                    <div className="section-head">
                        <div>
                            <h2>Waiting longest for review</h2>
                            <p>Oldest submissions needing a decision</p>
                        </div>
                        <button className="small-button" onClick={() => openFilter('All')}>
                            All applications
                        </button>
                    </div>
                    <div className="table-scroll">
                        <table className="desk-table">
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>PROGRAM</th>
                                    <th>WAITING</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {oldest.map((row) => {
                                    const student = students.find((item) => item.name === row.name)!;
                                    return (
                                        <tr key={student.id} onClick={() => openStudent(student.id)}>
                                            <td>
                                                <button className="student-link" onClick={() => openStudent(student.id)}>
                                                    {student.name}
                                                    <small>{student.number}</small>
                                                </button>
                                            </td>
                                            <td>{student.program}</td>
                                            <td>
                                                <span className="wait">{row.days} days</span>
                                            </td>
                                            <td>
                                                <button className="row-link" onClick={() => openStudent(student.id)}>
                                                    Review <ChevronRight size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="panel stuck">
                    <div className="section-head">
                        <div>
                            <h2>Why applications get stuck</h2>
                            <p>Common blockers this cycle</p>
                        </div>
                        <MoreHorizontal size={17} />
                    </div>
                    <div className="stuck-list">
                        <Blocker label="Incomplete grades" count={1} width="33%" />
                        <Blocker label="Tuition balance" count={1} width="33%" />
                        <Blocker label="Document problems" count={1} width="33%" />
                    </div>
                    <div className="stuck-foot">
                        <span>3 items need follow-up</span>
                        <button onClick={() => openFilter('Needs a fix')}>
                            Review blockers <ChevronRight size={13} />
                        </button>
                    </div>
                </section>
                <section className="panel activity-panel">
                    <div className="section-head">
                        <div>
                            <h2>Recent activity</h2>
                            <p>Latest updates across the application cycle</p>
                        </div>
                    </div>
                    {feed.slice(0, 4).map((item, index) => (
                        <div className="feed-row" key={`${item.student}-${index}`}>
                            <span className={`feed-icon feed-${index % 4}`}>
                                <Activity size={13} />
                            </span>
                            <div>
                                <b>{item.student}</b>
                                <span>{item.message}</span>
                            </div>
                            <time>{item.time}</time>
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
}
function Need({
    icon,
    color,
    number,
    title,
    subtitle,
    click,
}: {
    icon: React.ReactNode;
    color: string;
    number: string;
    title: string;
    subtitle: string;
    click: () => void;
}) {
    return (
        <button className="need-tile" onClick={click}>
            <span className={`need-icon ${color}`}>{icon}</span>
            <span>
                <strong>{number}</strong>
                <b>{title}</b>
                <small>{subtitle}</small>
            </span>
            <ChevronRight size={15} />
        </button>
    );
}
function Blocker({ label, count, width }: { label: string; count: number; width: string }) {
    return (
        <div className="blocker">
            <span>{label}</span>
            <b>{count}</b>
            <i>
                <em style={{ width }} />
            </i>
        </div>
    );
}
function Applications({
    students,
    filtered,
    search,
    setSearch,
    program,
    setProgram,
    filter,
    setFilter,
    openStudent,
}: {
    students: Student[];
    filtered: Student[];
    search: string;
    setSearch: (v: string) => void;
    program: string;
    setProgram: (v: string) => void;
    filter: string;
    setFilter: (v: string) => void;
    openStudent: (id: number) => void;
}) {
    const choices = ['All', 'Pending Review', 'Documents Verified', 'Deficiency', 'Awaiting Dean', 'Approved', 'Rejected'];
    return (
        <section className="panel applications-panel">
            <div className="toolbar">
                <label className="search-box">
                    <Search size={16} />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or student number" />
                </label>
                <select value={program} onChange={(event) => setProgram(event.target.value)} aria-label="Program filter">
                    <option>All programs</option>
                    {['MAEd', 'MBA', 'MSIT', 'MPA', 'MAN'].map((value) => (
                        <option key={value}>{value}</option>
                    ))}
                </select>
                <button className="filter-button">
                    <Settings size={15} />
                    Filters
                </button>
            </div>
            <div className="status-filters">
                {choices.map((value) => (
                    <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>
                        {value}
                        <b>
                            {value === 'All'
                                ? students.length
                                : students.filter((student) => student.status === (value === 'Deficiency' ? 'Needs a fix' : value)).length}
                        </b>
                    </button>
                ))}
            </div>
            <div className="table-scroll">
                <table className="desk-table applications-table">
                    <thead>
                        <tr>
                            <th>STUDENT</th>
                            <th>PROGRAM</th>
                            <th>ELIGIBILITY</th>
                            <th>APPLIED</th>
                            <th>STATUS</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((student) => (
                            <tr key={student.id} onClick={() => openStudent(student.id)}>
                                <td>
                                    <button className="student-link" onClick={() => openStudent(student.id)}>
                                        {student.name}
                                        <small>{student.number}</small>
                                    </button>
                                </td>
                                <td>
                                    <span className="program-tag">{student.program}</span>
                                </td>
                                <td>
                                    <div className="eligibility-tags">
                                        <Tag label="Grades" ok={student.grades} />
                                        <Tag label="Tuition" ok={student.tuition} />
                                        <Tag label="Docs" ok={student.docs.every((doc) => doc.submitted && !doc.flagged)} />
                                    </div>
                                </td>
                                <td>{formatAppliedDate(student.applied)}</td>
                                <td>
                                    <StatusChip status={student.status} />
                                </td>
                                <td>
                                    <button className="row-link" onClick={() => openStudent(student.id)}>
                                        Review <ChevronRight size={13} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state">No applications match these filters.</div>}
            </div>
            <div className="table-summary">
                Showing <b>{filtered.length}</b> of {students.length} sample applications{' '}
                <span>
                    1–{filtered.length} of {filtered.length}
                </span>
            </div>
        </section>
    );
}
function Tag({ label, ok }: { label: string; ok: boolean }) {
    return (
        <span className={`eligibility-tag ${ok ? 'good' : 'bad'}`}>
            <i />
            {label}
        </span>
    );
}
function Payments({
    students,
    state,
    openReceipt,
    update,
    remind,
}: {
    students: Student[];
    state: Record<string, string>;
    openReceipt: (name: string) => void;
    update: (name: string, status: string) => void;
    remind: (name: string) => void;
}) {
    const counts = Object.values(state);
    const received = counts.filter((value) => value === 'Verified').length;
    const waiting = counts.filter((value) => value === 'Pending').length;
    const rejected = counts.filter((value) => value === 'Rejected' || value === 'Not submitted').length;
    const refs: Record<string, string> = {
        'Mark Anthony Lim': 'GC-88214093',
        'Czarina Faith Bautista': 'OR-2026-0412',
        'Francis Xavier Pacheco': 'OR-2026-0398',
        'Lara Nicole Gutierrez': 'GC-88101776',
    };
    const modes: Record<string, string> = {
        'Mark Anthony Lim': 'GCash',
        'Czarina Faith Bautista': 'Bank deposit',
        'Francis Xavier Pacheco': 'Over the counter',
        'Lara Nicole Gutierrez': 'GCash',
    };
    const dates: Record<string, string> = {
        'Mark Anthony Lim': 'Oct 3',
        'Czarina Faith Bautista': 'Sep 30',
        'Francis Xavier Pacheco': 'Sep 28',
        'Lara Nicole Gutierrez': 'Oct 1',
    };
    return (
        <>
            <div className="payment-summary">
                <Summary label="WAITING FOR VERIFICATION" value={String(waiting)} detail="Payment proof uploaded" />
                <Summary label="VERIFIED, CLEARED FOR EXAM" value={String(received)} detail="Ready to schedule" />
                <Summary label="REJECTED OR NOT SUBMITTED" value={String(rejected)} detail="Follow-up required" />
            </div>
            <section className="panel payments-panel">
                <div className="section-head">
                    <div>
                        <h2>Approved applicants</h2>
                        <p>Exam fee ₱3,500 · only approved applicants can pay</p>
                    </div>
                    <span>{students.length} applicants</span>
                </div>
                <div className="table-scroll">
                    <table className="desk-table payments-table">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>REFERENCE</th>
                                <th>MODE</th>
                                <th>AMOUNT</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => {
                                const current = state[student.name] ?? 'Not submitted';
                                return (
                                    <tr key={student.id}>
                                        <td>
                                            <span className="student-static">
                                                {student.name}
                                                <small>{student.program}</small>
                                            </span>
                                        </td>
                                        <td className="mono">{refs[student.name] ?? 'Not submitted'}</td>
                                        <td>{modes[student.name] ?? '—'}</td>
                                        <td>{current === 'Not submitted' ? '—' : money.format(3500)}</td>
                                        <td>{dates[student.name] ?? '—'}</td>
                                        <td>
                                            <span
                                                className={`status-chip ${current === 'Not submitted' ? 'not-submitted' : `pay-${current.toLowerCase()}`} `}
                                            >
                                                <i />
                                                {current}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                {current !== 'Not submitted' && <button className="payment-action" onClick={() => openReceipt(student.name)}>Receipt</button>}
                                                {current === 'Pending' && (
                                                    <>
                                                        <button className="payment-action" onClick={() => update(student.name, 'Verified')}>
                                                            Verify
                                                        </button>
                                                        <button className="red-action" onClick={() => update(student.name, 'Rejected')}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {current === 'Not submitted' && <button onClick={() => remind(student.name)}>Remind</button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="payment-note">
                    <AlertCircle size={14} /> Sample payment records; updates are stored in memory.
                </div>
            </section>
        </>
    );
}
function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <article className="summary-tile">
            <small>{label}</small>
            <b>{value}</b>
            <span>{detail}</span>
        </article>
    );
}
function Schedules({
    sessions,
    setSessions,
    students,
    paymentState,
    action,
    onEdit,
}: {
    sessions: Session[];
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    students: Student[];
    paymentState: Record<string, string>;
    action: (message: string, student?: string, type?: string, toastMessage?: string) => void;
    onEdit: (session: Session) => void;
}) {
    const [assigning, setAssigning] = useState<string | null>(null);
    const [studentChoice, setStudentChoice] = useState('');
    const proctors = ['Prof. Ricardo Dizon', 'Prof. Elena Marquez', 'Dr. Carmelita Uy'];
    const cleared = students.filter((student) => paymentState[student.name] === 'Verified');
    const assignedNames = new Set(sessions.flatMap((session) => session.students));
    const available = cleared.filter((student) => !assignedNames.has(student.name));
    return (
        <div className="sessions-grid">
            {sessions.map((session) => (
                <article className="session-card" key={session.id}>
                    <div className="session-header">
                        <span className="mono">{session.id}</span>
                        <span className={`status-chip ${session.proctor ? 'approved' : 'fix'}`}>
                            <i />
                            {session.proctor ? 'Ready' : 'Needs proctor'}
                        </span>
                    </div>
                    <div className="session-date">
                        <CalendarDays size={18} />
                        <span>
                            <b>{formatSessionDate(session.date)}</b>
                            <small>
                                {session.start} to {session.end}
                            </small>
                        </span>
                    </div>
                    <div className="session-detail">
                        <small>VENUE</small>
                        <b>{session.venue}</b>
                    </div>
                    <div className="session-detail">
                        <small>PROCTOR</small>
                        <select
                            aria-label={`Assign proctor to ${session.id}`}
                            value={session.proctor}
                            onChange={(event) => {
                                setSessions((items) =>
                                    items.map((item) => (item.id === session.id ? { ...item, proctor: event.target.value } : item)),
                                );
                                const message = `${event.target.value} assigned to ${session.id}`;
                                action(message, session.students[0] ?? 'Graduate School Office', 'Schedule', message);
                            }}
                        >
                            <option value="">Assign proctor</option>
                            {proctors.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="examinee-list">
                        <div>
                            <small>EXAMINEES</small>
                            <span>{session.students.length} assigned</span>
                        </div>
                        {session.students.map((name) => (
                            <span className="examinee" key={name}>
                                {name}
                            </span>
                        ))}
                        {assigning === session.id && (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    if (!studentChoice) return;
                                    setSessions((items) =>
                                        items.map((item) =>
                                            item.id === session.id ? { ...item, students: [...item.students, studentChoice] } : item,
                                        ),
                                    );
                                    const message = `1 students assigned to ${session.id}`;
                                    action(message, studentChoice, 'Schedule', message);
                                    setStudentChoice('');
                                    setAssigning(null);
                                }}
                            >
                                <select value={studentChoice} onChange={(event) => setStudentChoice(event.target.value)}>
                                    <option value="">Choose cleared student</option>
                                    {available.map((student) => (
                                        <option key={student.id}>{student.name}</option>
                                    ))}
                                </select>
                                <button className="mini-primary">Assign</button>
                            </form>
                        )}
                    </div>
                    <div className="session-actions">
                        <button onClick={() => onEdit(session)}>Edit</button>
                        <button disabled={available.length === 0} onClick={() => setAssigning(assigning === session.id ? null : session.id)}>
                            <Plus size={13} />
                            Assign cleared students ({available.length})
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}
function Messages({ notices, count, holdNames, remindAll }: { notices: Notice[]; count: number; holdNames: string[]; remindAll: () => void }) {
    return (
        <>
            <section className="hold-banner">
                <span>
                    <Bell size={18} />
                </span>
                <div>
                    <b>{count} students are on hold</b>
                    <small>{holdNames.join(', ') || 'No students are currently on hold.'}</small>
                </div>
                <button className="primary" disabled={count === 0} onClick={remindAll}>
                    <Send size={14} />
                    Send reminders to all
                </button>
            </section>
            <section className="panel messages-panel">
                <div className="section-head">
                    <div>
                        <h2>Notice log</h2>
                        <p>Application and payment updates sent to students</p>
                    </div>
                    <span>{notices.length} notices</span>
                </div>
                <div className="table-scroll">
                    <table className="desk-table messages-table">
                        <thead>
                            <tr>
                                <th>TIME SENT</th>
                                <th>TO</th>
                                <th>TYPE</th>
                                <th>MESSAGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notices.map((notice, index) => (
                                <tr key={`${notice.student}-${index}`}>
                                    <td>{notice.time}</td>
                                    <td>
                                        <b>{notice.student}</b>
                                    </td>
                                    <td>
                                        <span className={`notice-type notice-${notice.type.toLowerCase().replaceAll(' ', '-')}`}>{notice.type}</span>
                                    </td>
                                    <td>{notice.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
function Drawer({
    student,
    paymentState,
    close,
    resolve,
    verify,
    flag,
    form,
    setForm,
    reason,
    setReason,
    submit,
    approve,
}: {
    student: Student;
    paymentState?: string;
    close: () => void;
    resolve: (key: 'grades' | 'tuition' | 'docs') => void;
    verify: (index: number, value: boolean) => void;
    flag: (index: number) => void;
    form: '' | 'deficiency' | 'reject';
    setForm: (v: '' | 'deficiency' | 'reject') => void;
    reason: string;
    setReason: (v: string) => void;
    submit: () => void;
    approve: () => void;
}) {
    const docsSubmitted = student.docs.every((doc) => doc.submitted && !doc.flagged);
    const docsClear = student.docs.every((doc) => doc.verified && doc.submitted);
    const clear = student.grades && student.tuition && docsClear;
    const hasProblems = !student.grades || !student.tuition || !docsSubmitted || student.docs.some((doc) => doc.flagged);
    const checks = [
        {
            key: 'grades' as const,
            title: 'Complete grades',
            detail: student.grades ? 'All required grades are recorded' : 'Incomplete grade in Public Policy Analysis',
            ok: student.grades,
        },
        {
            key: 'tuition' as const,
            title: 'No tuition balance',
            detail: student.tuition ? 'Account balance is clear' : `Outstanding balance: ${money.format(student.balance ?? 12400)}`,
            ok: student.tuition,
        },
        {
            key: 'docs' as const,
            title: 'Required documents submitted',
            detail: docsSubmitted ? 'All four documents received' : 'A required document is missing',
            ok: docsSubmitted,
        },
    ];
    return (
        <div
            className="drawer-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <aside className="application-drawer" aria-label="Application details">
                <header className="drawer-head">
                    <div>
                        <span className="overline">APPLICATION REVIEW</span>
                        <button aria-label="Close drawer" onClick={close}>
                            <X size={18} />
                        </button>
                    </div>
                    <h2>{student.name}</h2>
                    <div className="drawer-meta">
                        <span className="mono">{student.number}</span>
                        <i>·</i>
                        {programNames[student.program] ?? student.program}
                        <StatusChip status={student.status} />
                        {student.status === 'Approved' && (
                            <span className={`status-chip pay-${(paymentState ?? 'Not submitted').toLowerCase().replaceAll(' ', '-')}`}>
                                <i />
                                {paymentState ?? 'Not submitted'}
                            </span>
                        )}
                    </div>
                </header>
                <div className="drawer-scroll">
                    {student.status === 'Rejected' && <div className="drawer-note">Note: Required units not yet completed. Reapply next cycle.</div>}
                    <section className="drawer-section">
                        <div className="section-head">
                            <div>
                                <h3>Eligibility check</h3>
                                <p>Confirm requirements before sending to Dean</p>
                            </div>
                            <span className={`check-count ${clear ? 'good' : 'attention'}`}>{checks.filter((check) => check.ok).length}/3 clear</span>
                        </div>
                        {checks.map((check) => (
                            <div className="check-row" key={check.key}>
                                <span className={`check-icon ${check.ok ? 'ok' : 'not-ok'}`}>{check.ok ? <Check size={14} /> : <X size={14} />}</span>
                                <span>
                                    <b>{check.title}</b>
                                    <small>{check.detail}</small>
                                </span>
                                {!check.ok && <button onClick={() => resolve(check.key)}>Mark resolved</button>}
                            </div>
                        ))}
                    </section>
                    <section className="drawer-section">
                        <div className="section-head">
                            <div>
                                <h3>Documents</h3>
                                <p>Verify each required file</p>
                            </div>
                            <span className="check-count">{student.docs.filter((doc) => doc.verified).length}/4 verified</span>
                        </div>
                        {student.docs.map((doc, index) => (
                            <div className="doc-row" key={doc.name}>
                                <span className={`doc-icon ${doc.verified ? 'ok' : doc.flagged ? 'flagged' : !doc.submitted ? 'missing' : ''}`}>
                                    {doc.verified ? (
                                        <Check size={16} />
                                    ) : doc.flagged ? (
                                        <X size={16} />
                                    ) : doc.submitted ? (
                                        <Clock3 size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                </span>
                                <span>
                                    <b>{doc.name}</b>
                                    <small>
                                        {doc.verified
                                            ? 'Verified · PDF document'
                                            : doc.flagged
                                              ? 'Flagged: needs to be replaced'
                                              : doc.submitted
                                                ? 'Uploaded, waiting for your check'
                                                : 'Not submitted'}
                                    </small>
                                </span>
                                {doc.submitted && (
                                    <button className="verify-button" disabled={doc.verified} onClick={() => verify(index, true)}>
                                        Verify
                                    </button>
                                )}
                                {doc.submitted && (
                                    <button className="flag-button" disabled={doc.flagged} onClick={() => flag(index)}>
                                        Flag
                                    </button>
                                )}
                            </div>
                        ))}
                    </section>
                    <section className="drawer-section">
                        <div className="section-head">
                            <div>
                                <h3>Subjects</h3>
                                <p>Selected for comprehensive examination</p>
                            </div>
                        </div>
                        <div className="subjects">
                            {student.subjects.map((subject) => (
                                <span key={subject}>{subject}</span>
                            ))}
                        </div>
                    </section>
                    {form && (
                        <section className="inline-form">
                            <div>
                                <b>{form === 'deficiency' ? 'Send deficiency notice' : 'Reject application'}</b>
                                <button onClick={() => setForm('')} aria-label="Close form">
                                    <X size={15} />
                                </button>
                            </div>
                            <p>{form === 'deficiency' ? `Deficiency notice to ${student.name.split(' ')[0]}` : 'Reason for rejection'}</p>
                            <textarea
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                placeholder="Enter a clear message or reason"
                            />
                            <div>
                                <button onClick={() => setForm('')}>Cancel</button>
                                <button className={form === 'reject' ? 'danger-button' : 'primary'} onClick={submit}>
                                    {form === 'deficiency' ? 'Send notice' : 'Reject application'}
                                </button>
                            </div>
                        </section>
                    )}
                    <section className="drawer-section">
                        <div className="section-head">
                            <div>
                                <h3>History</h3>
                                <p>Application and review timeline</p>
                            </div>
                        </div>
                        {student.history.map((entry, index) => (
                            <div className={`history-entry ${index === 0 ? 'newest' : ''}`} key={`${entry.date}-${index}`}>
                                <i />
                                <span>
                                    <b>{entry.label}</b>
                                    <small>{entry.detail}</small>
                                    <time>{entry.date}</time>
                                </span>
                            </div>
                        ))}
                    </section>
                </div>
                <footer className="drawer-footer">
                    {student.status === 'Awaiting Dean' ? (
                        <div className="decision-status">Waiting for the Dean's decision.</div>
                    ) : student.status === 'Approved' ? (
                        <div className="decision-status">Approved by the Dean. Payments and schedules continue from here.</div>
                    ) : student.status === 'Rejected' ? (
                        <div className="decision-status">This application is closed.</div>
                    ) : (
                        <>
                            <div className="approval-hint">
                                {!clear && (
                                    <>
                                        <AlertCircle size={14} />
                                        {docsSubmitted && student.grades && student.tuition && 'Verify all four documents to approve.'}
                                        {(!student.grades || !student.tuition || !docsSubmitted) && 'Resolve the issues above to approve.'}
                                    </>
                                )}
                            </div>
                            <div>
                                <button className="outline-button" disabled={!hasProblems} onClick={() => setForm('deficiency')}>
                                    Send deficiency notice
                                </button>
                                <button className="danger-button" onClick={() => setForm('reject')}>
                                    Reject
                                </button>
                                <button className="primary" disabled={!clear} onClick={approve}>
                                    <Check size={14} />
                                    Approve and send to Dean
                                </button>
                            </div>
                        </>
                    )}
                </footer>
            </aside>
        </div>
    );
}
function Receipt({ name, state, close, verify, reject }: { name: string; state: string; close: () => void; verify: () => void; reject: () => void }) {
    const refs: Record<string, string> = {
        'Mark Anthony Lim': 'GC-88214093',
        'Czarina Faith Bautista': 'OR-2026-0412',
        'Francis Xavier Pacheco': 'OR-2026-0398',
        'Lara Nicole Gutierrez': 'GC-88101776',
    };
    const modes: Record<string, string> = {
        'Mark Anthony Lim': 'GCash',
        'Czarina Faith Bautista': 'Bank deposit',
        'Francis Xavier Pacheco': 'Over the counter',
        'Lara Nicole Gutierrez': 'GCash',
    };
    const dates: Record<string, string> = {
        'Mark Anthony Lim': 'Oct 3',
        'Czarina Faith Bautista': 'Sep 30',
        'Francis Xavier Pacheco': 'Sep 28',
        'Lara Nicole Gutierrez': 'Oct 1',
    };
    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <section className="ceas-modal" role="dialog" aria-modal="true" aria-label="Proof of payment">
                <header className="modal-head">
                    <div>
                        <span className="overline">PAYMENT REVIEW</span>
                        <h2>Proof of payment</h2>
                    </div>
                    <button aria-label="Close receipt" onClick={close}>
                        <X size={18} />
                    </button>
                </header>
                <div className="receipt-grid">
                    <span>
                        STUDENT<strong>{name}</strong>
                    </span>
                    <span>
                        MODE<strong>{modes[name] ?? '—'}</strong>
                    </span>
                    <span>
                        REFERENCE<strong className="mono">{refs[name] ?? 'Not submitted'}</strong>
                    </span>
                    <span>
                        AMOUNT<strong>{state === 'Not submitted' ? '—' : '₱3,500'}</strong>
                    </span>
                    <span>
                        DATE<strong>{dates[name] ?? '—'}</strong>
                    </span>
                    <span>
                        STATUS<strong>{state}</strong>
                    </span>
                </div>
                <div className="receipt-image">
                    <FileText size={27} />
                    <b>Uploaded receipt image (example)</b>
                </div>
                {state === 'Rejected' && <div className="receipt-note">Receipt screenshot is unreadable. Please upload a clear copy.</div>}
                {state === 'Pending' ? (
                    <div className="modal-actions">
                        <button className="danger-button" onClick={reject}>
                            Reject
                        </button>
                        <button className="primary" onClick={verify}>
                            Verify payment
                        </button>
                    </div>
                ) : (
                    <button className="primary modal-done" onClick={close}>
                        Done
                    </button>
                )}
            </section>
        </div>
    );
}
function SessionDialog({
    form,
    setForm,
    submit,
    close,
    editing,
    error,
}: {
    form: { date: string; start: string; end: string; venue: string; proctor: string };
    setForm: React.Dispatch<React.SetStateAction<{ date: string; start: string; end: string; venue: string; proctor: string }>>;
    submit: (event: React.FormEvent<HTMLFormElement>) => void;
    close: () => void;
    editing: string | null;
    error: string;
}) {
    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <section className="ceas-modal" role="dialog" aria-modal="true" aria-label={editing ? `Edit ${editing}` : 'Create exam session'}>
                <header className="modal-head">
                    <div>
                        <span className="overline">EXAM SCHEDULING</span>
                        <h2>{editing ? `Edit ${editing}` : 'New exam session'}</h2>
                        <p>Fall 2026 comprehensive examination</p>
                    </div>
                    <button aria-label="Close form" onClick={close}>
                        <X size={18} />
                    </button>
                </header>
                <form className="session-form" onSubmit={submit} noValidate>
                    <label>
                        Date
                        <input
                            required
                            type="date"
                            value={form.date}
                            onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))}
                        />
                    </label>
                    <div className="time-fields">
                        <label>
                            Start
                            <input
                                required
                                type="time"
                                value={form.start}
                                onChange={(event) => setForm((value) => ({ ...value, start: event.target.value }))}
                            />
                        </label>
                        <label>
                            End
                            <input
                                required
                                type="time"
                                value={form.end}
                                onChange={(event) => setForm((value) => ({ ...value, end: event.target.value }))}
                            />
                        </label>
                    </div>
                    <label>
                        Venue
                        <input
                            required
                            placeholder="Campus and room"
                            value={form.venue}
                            onChange={(event) => setForm((value) => ({ ...value, venue: event.target.value }))}
                        />
                    </label>
                    <label>
                        Proctor
                        <select value={form.proctor} onChange={(event) => setForm((value) => ({ ...value, proctor: event.target.value }))}>
                            <option value="">Assign later</option>
                            <option>Prof. Ricardo Dizon</option>
                            <option>Prof. Elena Marquez</option>
                            <option>Dr. Carmelita Uy</option>
                        </select>
                    </label>
                    {error && (
                        <p className="session-error" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="modal-actions">
                        <button type="button" className="outline-button" onClick={close}>
                            Cancel
                        </button>
                        <button className="primary" type="submit">
                            <Plus size={14} />
                            Save session
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
