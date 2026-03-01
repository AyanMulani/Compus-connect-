import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Bell, 
  CreditCard, 
  ClipboardCheck, 
  LogOut, 
  User,
  Plus,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  School,
  Briefcase,
  Clock,
  Home,
  Truck,
  AlertCircle,
  Grid,
  ClipboardList,
  CheckCircle,
  FileText,
  Map,
  Wifi,
  Coffee,
  Stethoscope,
  ShieldCheck,
  Search,
  Dumbbell,
  LifeBuoy,
  Smartphone,
  Download,
  QrCode,
  TrendingUp,
  CreditCard as PaymentIcon,
  Shield,
  FileSearch,
  Building,
  History,
  UserPlus,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---
type Role = 'super_admin' | 'admin' | 'faculty' | 'student' | 'parent';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  cgpa?: number;
  credits?: number;
  semester?: number;
  id_number?: string;
  student_id?: string; // For parents
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
}

interface Placement {
  id: number;
  company: string;
  role: string;
  package: string;
  deadline: string;
  description: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface Fee {
  id: number;
  amount: number;
  due_date: string;
  status: string;
  description: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  time_slot: string;
  subject: string;
  room: string;
}

interface AttendanceRecord {
  id: string;
  subject: string;
  date: string;
  status: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: string;
  description: string;
}

interface HostelInfo {
  block: string;
  room_no: string;
  type: string;
  mess_plan: string;
  warden: string;
}

interface TransportRoute {
  id: string;
  route_no: string;
  bus_no: string;
  driver: string;
  contact: string;
  pickup_point: string;
  pickup_time: string;
}

interface Grievance {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  created_at: any;
}

interface Department {
  id: string;
  name: string;
  head: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  timestamp: any;
  details: string;
}

interface PerformanceData {
  semester: string;
  gpa: number;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <Card className="flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </Card>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<string>('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [hostel, setHostel] = useState<HostelInfo | null>(null);
  const [transport, setTransport] = useState<TransportRoute[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
      fetchLibrary();
      fetchPlacements();
      fetchEvents();
      fetchTimetable();
      fetchTransport();
      fetchSyllabus();
      if (user.role === 'student' || user.role === 'parent') {
        const targetId = user.role === 'parent' ? user.student_id : user.id;
        fetchFees(targetId);
        fetchAttendance(targetId);
        fetchAssignments(targetId);
        fetchHostel(targetId);
        fetchGrievances(targetId);
        fetchPerformance(targetId);
        fetchStudentMarks(targetId);
      }
      if (user.role === 'admin' || user.role === 'super_admin') {
        fetchDepartments();
        fetchAuditLogs();
        fetchFaculty();
        fetchAllStudents();
      }
      if (user.role === 'faculty') {
        fetchAllStudents();
      }
    }
  }, [user]);

  const fetchPerformance = async (id?: string) => {
    const res = await fetch(`/api/student/performance/${id}`);
    const data = await res.json();
    setPerformanceData(data);
  };

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments');
    const data = await res.json();
    setDepartments(data);
  };

  const fetchAuditLogs = async () => {
    const res = await fetch('/api/audit_logs');
    const data = await res.json();
    setAuditLogs(data);
  };

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    setAnnouncements(data);
  };

  const fetchAttendance = async (id?: string) => {
    const res = await fetch(`/api/student/attendance/${id}`);
    const data = await res.json();
    setAttendance(data);
  };

  const fetchAssignments = async (id?: string) => {
    const res = await fetch(`/api/student/assignments/${id}`);
    const data = await res.json();
    setAssignments(data);
  };

  const fetchHostel = async (id?: string) => {
    const res = await fetch(`/api/student/hostel/${id}`);
    if (res.ok) {
      const data = await res.json();
      setHostel(data);
    }
  };

  const fetchTransport = async () => {
    const res = await fetch('/api/transport');
    const data = await res.json();
    setTransport(data);
  };

  const fetchGrievances = async (id?: string) => {
    const res = await fetch(`/api/student/grievances/${id}`);
    const data = await res.json();
    setGrievances(data);
  };

  const fetchTimetable = async () => {
    const res = await fetch('/api/timetable');
    const data = await res.json();
    setTimetable(data);
  };

  const fetchFees = async (id?: string) => {
    const res = await fetch(`/api/student/fees/${id}`);
    const data = await res.json();
    setFees(data);
  };

  const fetchLibrary = async () => {
    const res = await fetch('/api/library/books');
    const data = await res.json();
    setBooks(data);
  };

  const fetchPlacements = async () => {
    const res = await fetch('/api/placements');
    const data = await res.json();
    setPlacements(data);
  };

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data);
  };

  const fetchFaculty = async () => {
    const res = await fetch('/api/users?role=faculty');
    const data = await res.json();
    setFaculty(data);
  };

  const fetchAllStudents = async () => {
    const res = await fetch('/api/users?role=student');
    const data = await res.json();
    setAllStudents(data);
  };

  const fetchStudentMarks = async (studentId: string) => {
    const res = await fetch(`/api/marks/${studentId}`);
    const data = await res.json();
    setStudentMarks(data);
  };

  const fetchSyllabus = async () => {
    const res = await fetch('/api/syllabus');
    const data = await res.json();
    setSyllabus(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. The API might be down or misconfigured.");
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setConfigError(null);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message?.includes('Firebase not configured') || err.message?.includes('non-JSON response')) {
        setConfigError(err.message);
      } else {
        alert('Login failed. Check your internet connection or if the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: chatMessage,
        config: {
          systemInstruction: "You are CampusConnect AI, a helpful assistant for a college management system. Help students and faculty with their queries about college life, academics, and system features."
        }
      });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Error connecting to AI service." }]);
    }
  };

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'] },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'] },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['faculty', 'student', 'parent'] },
    { id: 'performance', label: 'Performance', icon: TrendingUp, roles: ['faculty', 'student', 'parent'] },
    { id: 'id_card', label: 'Digital ID', icon: QrCode, roles: ['student'] },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, roles: ['faculty', 'student'] },
    { id: 'timetable', label: 'Timetable', icon: Clock, roles: ['faculty', 'student', 'parent'] },
    { id: 'library', label: 'Library', icon: BookOpen, roles: ['super_admin', 'admin', 'faculty', 'student'] },
    { id: 'placements', label: 'Placements', icon: Briefcase, roles: ['super_admin', 'admin', 'student'] },
    { id: 'events', label: 'Events', icon: Calendar, roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'] },
    { id: 'fees', label: 'Fees', icon: PaymentIcon, roles: ['super_admin', 'admin', 'student', 'parent'] },
    { id: 'hostel', label: 'Hostel', icon: Home, roles: ['super_admin', 'admin', 'student'] },
    { id: 'transport', label: 'Transport', icon: Truck, roles: ['super_admin', 'admin', 'student', 'parent'] },
    { id: 'grievances', label: 'Grievances', icon: AlertCircle, roles: ['super_admin', 'admin', 'student'] },
    { id: 'departments', label: 'Departments', icon: Building, roles: ['super_admin', 'admin'] },
    { id: 'manage_faculty', label: 'Manage Faculty', icon: UserPlus, roles: ['super_admin', 'admin'] },
    { id: 'manage_students', label: 'Manage Students', icon: Users, roles: ['faculty'] },
    { id: 'upload_marks', label: 'Upload Marks', icon: FileText, roles: ['super_admin', 'admin', 'faculty'] },
    { id: 'results', label: 'My Results', icon: Award, roles: ['student'] },
    { id: 'syllabus', label: 'Syllabus', icon: FileSearch, roles: ['super_admin', 'admin', 'faculty', 'student'] },
    { id: 'audit_logs', label: 'Audit Logs', icon: History, roles: ['super_admin'] },
    { id: 'mobile_app', label: 'Mobile App', icon: Smartphone, roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'] },
  ];

  const filteredModules = modules.filter(m => m.roles.includes(user?.role || ''));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 mb-4">
              <GraduationCap className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">CampusConnect</h1>
            <p className="text-slate-500 mt-2">All-in-one College Management System</p>
          </div>

          {configError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
              {configError}
            </div>
          )}

          <Card>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@college.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Demo Admin: admin@college.edu / admin123
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900">CampusConnect</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {filteredModules.slice(0, 8).map(m => (
            <SidebarItem 
              key={m.id}
              icon={m.icon} 
              label={m.label} 
              active={view === m.id} 
              onClick={() => setView(m.id)} 
            />
          ))}
          <SidebarItem 
            icon={Grid} 
            label="All Modules" 
            active={view === 'modules'} 
            onClick={() => setView('modules')} 
          />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 capitalize">{view.replace('_', ' ')}</h2>
            <p className="text-slate-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
              <Bell size={24} />
            </button>
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              {user.name[0]}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'modules' && (
            <motion.div 
              key="modules" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredModules.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setView(m.id)}
                    className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group text-left"
                  >
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-all inline-block mb-4">
                      <m.icon className="text-slate-400 group-hover:text-indigo-600 transition-all" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{m.label}</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage your {m.label.toLowerCase()}</p>
                  </button>
                ))}
                {/* Placeholder for more features */}
                {[
                  { label: 'Exam Schedule', icon: FileText },
                  { label: 'Results', icon: CheckCircle },
                  { label: 'Syllabus', icon: ClipboardList },
                  { label: 'Mess Menu', icon: Coffee },
                  { label: 'Campus Map', icon: Map },
                  { label: 'Wi-Fi Access', icon: Wifi },
                  { label: 'Medical Room', icon: Stethoscope },
                  { label: 'Gym', icon: Dumbbell },
                  { label: 'Security', icon: ShieldCheck },
                  { label: 'Support', icon: LifeBuoy },
                ].map((m, i) => (
                  <div 
                    key={i}
                    className="p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200 opacity-60 flex flex-col items-center justify-center text-center"
                  >
                    <m.icon className="text-slate-300 mb-3" size={32} />
                    <h3 className="text-sm font-bold text-slate-400">{m.label}</h3>
                    <p className="text-xs text-slate-400 mt-1 italic">Coming Soon</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.role === 'student' || user.role === 'parent' ? (
                  <>
                    <StatCard label="Attendance" value="85%" icon={ClipboardCheck} color="bg-emerald-500" />
                    <StatCard label="Assignments" value="4 Pending" icon={ClipboardList} color="bg-amber-500" />
                    <StatCard label="Library Books" value="2 Issued" icon={BookOpen} color="bg-indigo-500" />
                    <StatCard label="CGPA" value={user.cgpa || '3.8'} icon={GraduationCap} color="bg-rose-500" />
                  </>
                ) : user.role === 'faculty' ? (
                  <>
                    <StatCard label="Total Students" value="120" icon={Users} color="bg-indigo-500" />
                    <StatCard label="Classes Today" value="4" icon={Clock} color="bg-emerald-500" />
                    <StatCard label="Pending Marks" value="15" icon={FileText} color="bg-amber-500" />
                    <StatCard label="Leave Balance" value="12" icon={Calendar} color="bg-rose-500" />
                  </>
                ) : (
                  <>
                    <StatCard label="Total Users" value="2,450" icon={Users} color="bg-indigo-500" />
                    <StatCard label="Revenue" value="$1.2M" icon={PaymentIcon} color="bg-emerald-500" />
                    <StatCard label="Active Sessions" value="145" icon={Smartphone} color="bg-amber-500" />
                    <StatCard label="System Health" value="99.9%" icon={Shield} color="bg-rose-500" />
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">
                        {user.role === 'parent' ? "Your Ward's Academic Performance" : "Academic Performance"}
                      </h3>
                      <button onClick={() => setView('performance')} className="text-indigo-600 font-bold text-sm hover:underline">Details</button>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 4]} />
                          <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                          />
                          <Line type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={3} dot={{r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  <Card>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Recent Announcements</h3>
                      <button onClick={() => setView('announcements')} className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {announcements.slice(0, 3).map(ann => (
                        <div key={ann.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                          <h4 className="font-bold text-slate-900 mb-1">{ann.title}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{ann.content}</p>
                          <div className="mt-3 flex items-center text-xs text-slate-400">
                            <span className="font-medium text-indigo-600">{ann.author_name}</span>
                            <span className="mx-2">•</span>
                            <span>{ann.created_at && (ann.created_at as any).seconds ? new Date((ann.created_at as any).seconds * 1000).toLocaleDateString() : new Date(ann.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-8">
                  <Card>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setView('attendance')} className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center">
                        <ClipboardCheck className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold">Attendance</span>
                      </button>
                      <button onClick={() => setView('fees')} className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center">
                        <PaymentIcon className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold">Pay Fees</span>
                      </button>
                      <button onClick={() => setView('timetable')} className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center">
                        <Clock className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold">Timetable</span>
                      </button>
                      <button onClick={() => setView('id_card')} className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center">
                        <QrCode className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold">ID Card</span>
                      </button>
                    </div>
                  </Card>

                  {user.role === 'student' && (
                    <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <GraduationCap size={24} />
                        </div>
                        <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Digital ID</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold">{user.name}</h4>
                        <p className="text-sm opacity-80">{user.id_number || 'CS2023001'}</p>
                        <p className="text-xs opacity-60">{user.department} Dept.</p>
                      </div>
                      <div className="mt-8 flex justify-center p-4 bg-white rounded-2xl">
                        <QRCodeSVG value={`campusconnect://user/${user.id}`} size={120} />
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Attendance Records</h3>
                <div className="space-y-4">
                  {attendance.map(record => (
                    <div key={record.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900">{record.subject}</h4>
                        <p className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        record.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'assignments' && (
            <motion.div key="assignments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Course Assignments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignments.map(asgn => (
                    <div key={asgn.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900">{asgn.title}</h4>
                          <p className="text-sm text-indigo-600 font-medium">{asgn.subject}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          asgn.status === 'submitted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {asgn.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{asgn.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Due: {new Date(asgn.deadline).toLocaleDateString()}</span>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">
                          {asgn.status === 'submitted' ? 'View Submission' : 'Submit Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'hostel' && (
            <motion.div key="hostel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Hostel Information</h3>
                {hostel ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                          <Home size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Allotted Room</p>
                          <p className="text-lg font-bold text-slate-900">Block {hostel.block}, Room {hostel.room_no}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Room Type</p>
                          <p className="text-lg font-bold text-slate-900">{hostel.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                          <Coffee size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Mess Plan</p>
                          <p className="text-lg font-bold text-slate-900">{hostel.mess_plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Hostel Warden</p>
                          <p className="text-lg font-bold text-slate-900">{hostel.warden}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-12">No hostel allotment found.</p>
                )}
              </Card>
            </motion.div>
          )}

          {view === 'transport' && (
            <motion.div key="transport" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Transport Routes</h3>
                <div className="space-y-6">
                  {transport.map(route => (
                    <div key={route.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-indigo-600 text-white rounded-xl">
                            <Truck size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">Route #{route.route_no}</h4>
                            <p className="text-sm text-slate-500">{route.bus_no}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">{route.pickup_time}</p>
                          <p className="text-xs text-slate-400">Pickup Time</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Pickup Point</p>
                          <p className="font-bold text-slate-700">{route.pickup_point}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Driver Details</p>
                          <p className="font-bold text-slate-700">{route.driver} ({route.contact})</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'grievances' && (
            <motion.div key="grievances" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Support & Grievances</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center text-sm">
                    <Plus size={18} className="mr-2" /> New Complaint
                  </button>
                </div>
                <div className="space-y-4">
                  {grievances.map(g => (
                    <div key={g.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">{g.subject}</h4>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          g.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {g.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{g.description}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Category: {g.category}</span>
                        <span>{g.created_at && (g.created_at as any).seconds ? new Date((g.created_at as any).seconds * 1000).toLocaleDateString() : new Date(g.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">All Announcements</h3>
                  {user.role !== 'student' && (
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center text-sm">
                      <Plus size={18} className="mr-2" /> New Post
                    </button>
                  )}
                </div>
                <div className="space-y-6">
                  {announcements.map(ann => (
                    <div key={ann.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{ann.title}</h4>
                      <p className="text-slate-600 mb-4">{ann.content}</p>
                      <div className="flex justify-between items-center text-sm text-slate-400">
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          <span>{ann.author_name}</span>
                        </div>
                        <span>{ann.created_at && (ann.created_at as any).seconds ? new Date((ann.created_at as any).seconds * 1000).toLocaleDateString() : new Date(ann.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'library' && (
            <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Library Catalog</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search books..." 
                      className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map(book => (
                    <div key={book.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <BookOpen className="text-indigo-600" size={24} />
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          book.status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{book.title}</h4>
                      <p className="text-sm text-slate-500 mb-4">{book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">ISBN: {book.isbn}</span>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Reserve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'placements' && (
            <motion.div key="placements" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Placement Opportunities</h3>
                <div className="space-y-6">
                  {placements.map(p => (
                    <div key={p.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{p.company}</h4>
                          <p className="text-indigo-600 font-bold">{p.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">{p.package}</p>
                          <p className="text-xs text-slate-400">Annual Package</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-6">{p.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-rose-500 font-bold">Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'events' && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Campus Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {events.map(e => (
                    <div key={e.id} className="group cursor-pointer">
                      <div className="aspect-video rounded-3xl bg-slate-200 mb-4 overflow-hidden relative">
                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-all flex items-center justify-center">
                          <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            View Details
                          </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900">
                          {new Date(e.date).toLocaleDateString()}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{e.title}</h4>
                      <p className="text-sm text-slate-500 mb-2 flex items-center">
                        <Map size={14} className="mr-1" /> {e.location}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">{e.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'timetable' && (
            <motion.div key="timetable" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Class Timetable</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Day</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Time</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Subject</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {timetable.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-4 font-medium text-slate-900">{entry.day}</td>
                          <td className="py-4 text-slate-600">{entry.time_slot}</td>
                          <td className="py-4 font-bold text-indigo-600">{entry.subject}</td>
                          <td className="py-4 text-slate-600">{entry.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'fees' && (
            <motion.div key="fees" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Fee Details</h3>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-rose-600">
                      ₹{fees.filter(f => f.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {fees.length > 0 ? fees.map(fee => (
                    <div key={fee.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${fee.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          <PaymentIcon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{fee.description}</h4>
                          <p className="text-sm text-slate-500">Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-6">
                        <div>
                          <p className="font-bold text-slate-900">₹{fee.amount}</p>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
                            fee.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {fee.status}
                          </span>
                        </div>
                        {fee.status === 'unpaid' && (
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <PaymentIcon size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500">No fee records found.</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Current CGPA" value={user.cgpa || '3.85'} icon={TrendingUp} color="bg-indigo-600" />
                <StatCard label="Credits Earned" value={user.credits || '120'} icon={GraduationCap} color="bg-emerald-500" />
                <StatCard label="Current Semester" value={user.semester || '6'} icon={Clock} color="bg-amber-500" />
              </div>
              
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Semester-wise GPA</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 4]} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="gpa" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={60}>
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.gpa >= 3.8 ? '#10b981' : '#4f46e5'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Subject Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Subject</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Internal</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">External</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Grade</th>
                        <th className="pb-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { name: 'Data Structures', internal: 28, external: 65, grade: 'A+', status: 'Pass' },
                        { name: 'Operating Systems', internal: 25, external: 58, grade: 'A', status: 'Pass' },
                        { name: 'Computer Networks', internal: 22, external: 52, grade: 'B+', status: 'Pass' },
                        { name: 'Database Systems', internal: 29, external: 68, grade: 'O', status: 'Pass' },
                      ].map((sub, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-all">
                          <td className="py-4 font-medium text-slate-900">{sub.name}</td>
                          <td className="py-4 text-slate-600">{sub.internal}/30</td>
                          <td className="py-4 text-slate-600">{sub.external}/70</td>
                          <td className="py-4 font-bold text-indigo-600">{sub.grade}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-xs font-bold uppercase">{sub.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'id_card' && (
            <motion.div key="id_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="max-w-md mx-auto">
                <Card className="bg-white overflow-hidden p-0 border-none shadow-2xl">
                  <div className="bg-indigo-600 p-8 text-center text-white relative">
                    <div className="absolute top-4 right-4 text-[10px] font-bold opacity-50 uppercase tracking-widest">Digital ID v2.0</div>
                    <div className="w-32 h-32 bg-white rounded-3xl mx-auto mb-4 border-4 border-white/20 overflow-hidden shadow-lg">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-indigo-100 opacity-80">{user.id_number || 'CS2023001'}</p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                        <p className="font-bold text-slate-900">{user.department || 'Computer Science'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semester</p>
                        <p className="font-bold text-slate-900">{user.semester || '6'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                        <p className="font-bold text-slate-900">June 2027</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                        <p className="font-bold text-rose-600">O+ve</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
                      <div className="p-4 bg-slate-50 rounded-3xl mb-4">
                        <QRCodeSVG value={`campusconnect://verify/${user.id}`} size={160} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Scan for verification</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 text-center">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">CampusConnect Pro ERP System</p>
                  </div>
                </Card>
                <div className="mt-8 flex justify-center space-x-4">
                  <button className="flex items-center space-x-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Download size={18} />
                    <span>Download PDF</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-indigo-600 px-6 py-3 rounded-xl font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <Smartphone size={18} />
                    <span>Add to Wallet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'departments' && (
            <motion.div key="departments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Department Management</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center">
                    <Plus size={18} className="mr-2" /> Add Department
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map(dept => (
                    <div key={dept.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Building size={24} />
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600">
                          <FileSearch size={18} />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{dept.name}</h4>
                      <p className="text-sm text-slate-500 mb-4">HOD: {dept.head}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            +45
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">View Faculty</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'audit_logs' && (
            <motion.div key="audit_logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">System Audit Logs</h3>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"><Search size={18} /></button>
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"><Download size={18} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 flex items-start space-x-4">
                      <div className="p-2 bg-white rounded-lg text-slate-400 mt-1">
                        <History size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{log.action}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {log.timestamp && (log.timestamp as any).seconds ? new Date((log.timestamp as any).seconds * 1000).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-2">User ID: {log.user_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'manage_faculty' && (
            <motion.div key="manage_faculty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Faculty Management</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center text-sm">
                    <UserPlus size={18} className="mr-2" /> Add Faculty
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {faculty.map(f => (
                    <div key={f.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {f.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{f.name}</h4>
                        <p className="text-sm text-slate-500">{f.email}</p>
                        <p className="text-xs text-indigo-600 font-bold mt-1">{f.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'manage_students' && (
            <motion.div key="manage_students" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Student Management</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center text-sm">
                    <Plus size={18} className="mr-2" /> Add Student
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allStudents.map(s => (
                    <div key={s.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                        {s.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                        <p className="text-sm text-slate-500">{s.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-bold">Sem {s.semester}</span>
                          <span className="text-xs text-slate-400">ID: {s.id_number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'upload_marks' && (
            <motion.div key="upload_marks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Upload Student Marks</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm">
                      <option>Select Student</option>
                      {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id_number})</option>)}
                    </select>
                    <input type="text" placeholder="Subject Name" className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm" />
                    <input type="number" placeholder="Marks (Out of 100)" className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm" />
                  </div>
                  <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">
                    Submit Marks
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Academic Results</h3>
                  <button className="text-indigo-600 font-bold flex items-center text-sm hover:underline">
                    <Download size={18} className="mr-2" /> Download Marksheet
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-sm">
                        <th className="pb-4 font-medium">Subject</th>
                        <th className="pb-4 font-medium">Internal</th>
                        <th className="pb-4 font-medium">External</th>
                        <th className="pb-4 font-medium">Total</th>
                        <th className="pb-4 font-medium">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {studentMarks.length > 0 ? studentMarks.map((m: any) => (
                        <tr key={m.id} className="text-slate-700">
                          <td className="py-4 font-bold">{m.subject}</td>
                          <td className="py-4">{m.internal || 25}</td>
                          <td className="py-4">{m.external || 65}</td>
                          <td className="py-4 font-bold text-indigo-600">{m.total || 90}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">A+</span>
                          </td>
                        </tr>
                      )) : (
                        <tr className="text-slate-700">
                          <td className="py-4 font-bold">Data Structures</td>
                          <td className="py-4">28</td>
                          <td className="py-4">65</td>
                          <td className="py-4 font-bold text-indigo-600">93</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">O</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'syllabus' && (
            <motion.div key="syllabus" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Course Syllabus</h3>
                <div className="space-y-4">
                  {syllabus.length > 0 ? syllabus.map((s: any) => (
                    <div key={s.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900">{s.subject}</h4>
                        <p className="text-sm text-slate-500">Semester {s.semester}</p>
                      </div>
                      <button className="text-indigo-600 font-bold flex items-center text-sm hover:underline">
                        <Download size={18} className="mr-2" /> View PDF
                      </button>
                    </div>
                  )) : (
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900">Computer Science - Core</h4>
                        <p className="text-sm text-slate-500">Semester 6</p>
                      </div>
                      <button className="text-indigo-600 font-bold flex items-center text-sm hover:underline">
                        <Download size={18} className="mr-2" /> View PDF
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'mobile_app' && (
            <motion.div key="mobile_app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Smartphone size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">CampusConnect for Android</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-10">
                    Get the full CampusConnect experience directly on your Android device. 
                    Install it as a Progressive Web App (PWA) for instant access.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                        Open in Chrome
                      </h4>
                      <p className="text-sm text-slate-600">
                        Open this URL in Google Chrome on your Android device.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                        Add to Home Screen
                      </h4>
                      <p className="text-sm text-slate-600">
                        Tap the three dots (menu) in Chrome and select <strong>"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 p-8 bg-indigo-600 rounded-3xl text-white">
                    <h4 className="text-xl font-bold mb-4">Why use the App?</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm opacity-90">
                      <li className="flex items-center"><CheckCircle size={16} className="mr-2" /> Offline Access</li>
                      <li className="flex items-center"><CheckCircle size={16} className="mr-2" /> Push Notifications</li>
                      <li className="flex items-center"><CheckCircle size={16} className="mr-2" /> Faster Loading</li>
                    </ul>
                  </div>

                  <div className="mt-10">
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center mx-auto hover:bg-slate-800 transition-all">
                      <Download size={20} className="mr-2" /> Download APK (Coming Soon)
                    </button>
                    <p className="text-xs text-slate-400 mt-4 italic">
                      Note: PWA installation is currently the recommended method for Android.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Chatbot Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={20} />
                  <span className="font-bold">CampusConnect AI</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-indigo-500 p-1 rounded-lg">
                  <ChevronRight className="rotate-90" size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 max-w-[80%]">
                  Hello! I'm your CampusConnect assistant. How can I help you today?
                </div>
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white ml-auto rounded-tr-none' 
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 flex space-x-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleChat}
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-200 hover:scale-110 transition-all active:scale-95"
        >
          <MessageSquare size={28} />
        </button>
      </div>
    </div>
  );
}
