import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  increment,
  query,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Moon, 
  Star, 
  Timer, 
  User, 
  Phone, 
  MapPin, 
  Send, 
  Settings, 
  Download,
  CheckCircle2,
  AlertCircle,
  Facebook,
  ChevronLeft,
  Lock,
  LogOut,
  Image as ImageIcon,
  Key,
  Clock,
  Camera,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Search,
  Trash2,
  Users,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

// --- Firebase Configuration (المفاتيح الخاصة بك) ---
const firebaseConfig = {
  apiKey: "AIzaSyB7XSdwMXBwq-zPscIGRR5m-E37JwaQu4M",
  authDomain: "ramadancontest.firebaseapp.com",
  projectId: "ramadancontest",
  storageBucket: "ramadancontest.firebasestorage.app",
  messagingSenderId: "1056949637914",
  appId: "1:1056949637914:web:d04041f567514e6fd9d2a3",
  measurementId: "G-M7JN2YCYSP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'ramadan-contest-2024';

// --- Utility: SHA-256 Password Hashing ---
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Component: Professional Responsive Background ---
const AnimatedBackground = () => {
  const stars = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 0.5,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617] w-full h-full">
      <style>{`
        @keyframes floatMoon {
          0%, 100% { transform: translateY(0) rotate(12deg); filter: drop-shadow(0 0 40px rgba(245, 158, 11, 0.3)); }
          50% { transform: translateY(-40px) rotate(15deg); filter: drop-shadow(0 0 70px rgba(245, 158, 11, 0.5)); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
        @keyframes fallingStar {
          0% { transform: translateY(-20vh) translateX(0) rotate(45deg) scale(0); opacity: 0; }
          10% { opacity: 1; scale: 1; }
          100% { transform: translateY(120vh) translateX(-50vw) rotate(45deg) scale(0.1); opacity: 0; }
        }
        .animate-moon-pro { animation: floatMoon 10s ease-in-out infinite; }
        .star-particle { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--duration) ease-in-out infinite; }
        .meteor {
          position: absolute;
          width: 2px;
          height: 150px;
          background: linear-gradient(to bottom, transparent, #fbbf24);
          opacity: 0;
          animation: fallingStar 6s linear infinite;
        }
      `}</style>
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-950/20 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-950/10 rounded-full blur-[150px]"></div>
      {stars.map(s => (
        <div key={s.id} className="star-particle" style={{ top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`, '--duration': s.duration, animationDelay: s.delay }} />
      ))}
      <div className="meteor" style={{ top: '0%', left: '85%', animationDelay: '2s' }}></div>
      <div className="meteor" style={{ top: '0%', left: '25%', animationDelay: '8s' }}></div>
      <div className="absolute top-5 sm:top-10 left-5 sm:left-10 lg:top-20 lg:left-20 text-amber-500/10 lg:text-amber-500/30 animate-moon-pro transition-opacity duration-1000">
        <Moon size={Math.min(300, window.innerWidth * 0.3)} fill="currentColor" />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('settings'); 
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState({
    currentQuestion: { text: "جاري تحميل سؤال اليوم...", id: 1 },
    logoUrl: "",
    adminUser: "admin",
    adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    counter: 1000,
    startHour: 20,
    endHour: 24,
    pageLink: "https://facebook.com/yourpage"
  });

  const [responses, setResponses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [uniqueId, setUniqueId] = useState(null);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', facebook: '', answer: '' });

  // 1. Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Real-time Config Sync
  useEffect(() => {
    if (!user) return;
    const configDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubscribe = onSnapshot(configDoc, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(prev => ({ ...prev, ...docSnap.data() }));
      } else {
        setDoc(configDoc, config);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  // 3. Admin Data Sync
  useEffect(() => {
    if (!user || view !== 'admin_dashboard') return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResponses(data.sort((a, b) => b.uniqueId - a.uniqueId));
    });
    return () => unsubscribe();
  }, [user, view]);

  // 4. Timer Logic
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      
      let live = false;
      if (config.startHour < config.endHour) {
        live = h >= config.startHour && h < config.endHour;
      } else {
        live = h >= config.startHour || h < config.endHour;
      }
      
      setIsLive(live);

      if (live) {
        const end = new Date();
        if (h >= config.startHour && config.startHour > config.endHour) {
          end.setDate(end.getDate() + 1);
        }
        end.setHours(config.endHour, 0, 0, 0);
        
        const diff = end - now;
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hh}:${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`);
      }
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, [config.startHour, config.endHour]);

  // 5. Submissions
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isLive || !user) return;
    setLoading(true);
    try {
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
      await updateDoc(configRef, { counter: increment(1) });
      const snap = await getDoc(configRef);
      const newId = snap.data().counter;
      const responseRef = doc(db, 'artifacts', appId, 'public', 'data', 'responses', `${newId}`);
      await setDoc(responseRef, { 
        ...formData, uniqueId: newId, timestamp: new Date().toISOString(), userId: user.uid, verified: false 
      });
      setUniqueId(newId);
      setView('success');
    } catch (err) { console.error("Submission failed:", err); } finally { setLoading(false); }
  };

  // 6. Admin Actions
  const toggleVerify = async (resId, currentStatus) => {
    const resRef = doc(db, 'artifacts', appId, 'public', 'data', 'responses', resId);
    await updateDoc(resRef, { verified: !currentStatus });
  };

  const deleteResponse = async (resId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المشترك؟")) return;
    const resRef = doc(db, 'artifacts', appId, 'public', 'data', 'responses', resId);
    await deleteDoc(resRef);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const hashed = await hashPassword(loginData.pass);
    if (loginData.user === config.adminUser && hashed === config.adminPassHash) {
      setView('admin_dashboard');
      setLoginError('');
      setLoginData({ user: '', pass: '' });
    } else {
      setLoginError('بيانات الدخول غير صحيحة');
    }
  };

  const updateGlobalSettings = async (newData) => {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    await updateDoc(configRef, newData);
  };

  const updateAdminPass = async (newPass) => {
    if (!newPass) return;
    const newHash = await hashPassword(newPass);
    await updateGlobalSettings({ adminPassHash: newHash });
  };

  const filteredResponses = responses.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.phone?.includes(searchQuery) || 
    String(r.uniqueId).includes(searchQuery)
  );

  const exportToCSV = async () => {
    let csv = "\uFEFFرقم السحب,الاسم,الهاتف,العنوان,الفيسبوك,الإجابة,الحالة,التوقيت\n";
    filteredResponses.forEach(d => {
      csv += `${d.uniqueId},"${d.name}","${d.phone}","${d.address}","${d.facebook}","${d.answer}","${d.verified ? 'مستوفي الشروط' : 'غير محقق'}",${d.timestamp}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `contest_results.csv`);
    link.click();
  };

  if (loading && view !== 'success') {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#020617] z-[999] flex flex-col items-center justify-center text-amber-500 overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 text-center">
          <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse text-amber-400" />
          <p className="animate-pulse font-black text-xl sm:text-2xl md:text-3xl tracking-[0.2em] sm:tracking-[0.3em] uppercase">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        
        {/* Unified Header */}
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000 flex flex-col items-center w-full">
            <div className="relative inline-block group mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl sm:blur-3xl transition-all group-hover:bg-amber-500/40"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-amber-400 flex flex-col items-center">
                    <Moon size={Math.min(40, window.innerWidth * 0.1)} className="fill-current animate-pulse" />
                    <span className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase mt-1 sm:mt-2 tracking-[0.2em] sm:tracking-[0.3em]">RAMADAN</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-2 sm:mb-3 md:mb-4 drop-shadow-2xl tracking-tighter px-2">مسابقة رمضان</h1>
            <p className="text-amber-100/60 text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-wide italic text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4">رحلة إيمانية وجوائز يومية في شهر الخير</p>
          </header>
        )}

        {/* --- View: Home --- */}
        {view === 'home' && (
          <main className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 w-full flex flex-col items-center">
            {/* Professional Status Bar */}
            <div className={`w-full max-w-2xl lg:max-w-3xl p-1 rounded-2xl sm:rounded-3xl lg:rounded-[2rem] bg-gradient-to-r ${isLive ? 'from-emerald-500/40 via-emerald-400/20 to-emerald-800/40' : 'from-rose-500/40 via-rose-400/20 to-rose-800/40'} border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 gap-3 sm:gap-4 rounded-xl sm:rounded-2xl lg:rounded-[1.8rem] bg-slate-950/80">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></div>
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-tight">{isLive ? 'المسابقة متاحة الآن' : 'المسابقة مغلقة حالياً'}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 font-mono text-base sm:text-lg md:text-xl lg:text-2xl text-amber-400 bg-amber-400/5 px-3 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl border border-amber-400/10">
                    <Timer size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 animate-pulse" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Question Card */}
            <div className="bg-slate-900/40 w-full max-w-2xl lg:max-w-3xl backdrop-blur-3xl border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[3.5rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-[0_0_100px_-20px_rgba(245,158,11,0.2)] relative overflow-hidden group text-center flex flex-col items-center border-b-4 sm:border-b-8 border-b-amber-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-amber-500/5 rounded-full blur-[60px] sm:blur-[80px] md:blur-[120px]"></div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                <Sparkles size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-amber-400 animate-pulse" />
                <h2 className="text-amber-400 font-black text-base sm:text-lg md:text-xl lg:text-2xl italic tracking-widest uppercase">سؤال اليوم</h2>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.2] mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-slate-50 min-h-[6rem] sm:min-h-[8rem] md:min-h-[10rem] lg:min-h-[12rem] px-2 sm:px-3 md:px-4 drop-shadow-2xl">
                {isLive ? config.currentQuestion.text : `برجاء انتظار السؤال الجديد في تمام الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
              </p>
              {isLive ? (
                <button onClick={() => setView('form')} className="relative overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-slate-950 font-black py-4 sm:py-5 md:py-6 lg:py-7 rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_30px_70px_-15px_rgba(245,158,11,0.5)] text-base sm:text-lg md:text-xl lg:text-2xl group">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <span>أجب الآن واربح معنا</span>
                  <ChevronLeft size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
                </button>
              ) : (
                <div className="text-center p-4 sm:p-5 md:p-6 lg:p-8 bg-white/5 rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[3rem] border border-white/10 shadow-inner w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <p className="text-amber-200/60 text-sm sm:text-base md:text-lg lg:text-xl font-bold">المسابقة تفتح يومياً من <span className="text-amber-400 font-black px-1 sm:px-2"> {config.startHour > 12 ? config.startHour - 12 : config.startHour} </span> إلى <span className="text-amber-400 font-black px-1 sm:px-2"> {config.endHour > 12 ? config.endHour - 12 : config.endHour} </span> مساءً</p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- View: Form --- */}
        {view === 'form' && (
          <main className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[3.5rem] p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl animate-in slide-in-from-left-12 duration-700 w-full max-w-2xl lg:max-w-3xl mx-auto">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4 sm:gap-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white flex items-center gap-2 sm:gap-3 md:gap-4">
                 <Users className="text-amber-500" size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"/> سجل بياناتك
              </h2>
              <button onClick={() => setView('home')} className="text-slate-400 hover:text-amber-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-black transition-all bg-white/5 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border border-white/5">
                <ChevronRight size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> العودة
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 w-full flex flex-col items-center">
              {/* Input Wrapper Component Style */}
              <div className="w-full max-w-lg lg:max-w-xl space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                <div className="relative group">
                  <User className="absolute right-3 sm:right-4 md:right-5 lg:right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <input required className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16 pl-3 sm:pl-4 md:pl-5 lg:pl-6 focus:ring-2 sm:focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center" placeholder="الاسم الثلاثي بالكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full">
                  <div className="relative group">
                    <Phone className="absolute right-3 sm:right-4 md:right-5 lg:right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <input required type="tel" className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16 pl-3 sm:pl-4 md:pl-5 lg:pl-6 focus:ring-2 sm:focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center" placeholder="رقم الموبايل" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Facebook className="absolute right-3 sm:right-4 md:right-5 lg:right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <input required className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16 pl-3 sm:pl-4 md:pl-5 lg:pl-6 focus:ring-2 sm:focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center" placeholder="رابط الفيسبوك" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                  </div>
                </div>
                
                <div className="relative group">
                  <MapPin className="absolute right-3 sm:right-4 md:right-5 lg:right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <input required className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16 pl-3 sm:pl-4 md:pl-5 lg:pl-6 focus:ring-2 sm:focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center" placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <div className="relative">
                  <textarea required rows="4" className="w-full bg-slate-950/40 border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] py-4 sm:py-5 md:py-6 lg:py-8 px-4 sm:px-5 md:px-6 lg:px-8 focus:ring-2 sm:focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-center leading-relaxed placeholder:text-slate-600 shadow-inner" placeholder="اكتب إجابتك النموذجية هنا..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-800 text-white font-black py-4 sm:py-5 md:py-6 lg:py-7 rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] text-base sm:text-lg md:text-xl lg:text-2xl shadow-[0_20px_60px_-10px_rgba(16,185,129,0.4)] active:scale-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                {loading ? <Sparkles className="animate-spin w-5 h-5 sm:w-6 sm:h-6" /> : <><Send size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" /> إرسال الإجابة والمشاركة</>}
              </button>
            </form>
          </main>
        )}

        {/* --- View: Success --- */}
        {view === 'success' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border-2 border-emerald-500/50 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center shadow-[0_0_100px_-10px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-700 w-full max-w-2xl lg:max-w-3xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-400/30">
               <CheckCircle2 size={40} className="sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 animate-bounce" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 tracking-tight">تم بنجاح!</h2>
            
            <div className="bg-slate-950/80 w-full max-w-lg lg:max-w-xl mx-auto rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-10 lg:p-12 mb-8 sm:mb-10 md:mb-12 border border-white/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-2 sm:h-2.5 md:h-3 bg-gradient-to-l from-amber-400 to-amber-700 shadow-[0_5px_20px_rgba(245,158,11,0.5)]"></div>
              <p className="text-amber-400/60 mb-3 sm:mb-4 md:mb-5 lg:mb-6 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] lg:tracking-[0.5em] text-xs sm:text-sm md:text-base lg:text-lg">رقم السحب الفريد</p>
              <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)] tracking-tighter">#{uniqueId}</p>
              <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-amber-400/90 bg-amber-400/5 py-3 sm:py-4 md:py-5 lg:py-6 px-4 sm:px-5 md:px-6 lg:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2rem] border border-amber-400/10 animate-pulse">
                <Camera size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"/>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wide">التقط سكرين شوت لرقمك</p>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full py-4 sm:py-5 md:py-6 lg:py-7 bg-[#1877F2] text-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] font-black text-base sm:text-lg md:text-xl lg:text-2xl shadow-[0_20px_50px_-10px_rgba(24,119,242,0.4)] hover:brightness-110 active:scale-95 transition-all"><Facebook size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" /> تابع النتائج على فيسبوك</a>
              <button onClick={() => setView('home')} className="text-slate-500 text-xs sm:text-sm font-black hover:text-amber-400 transition-colors uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] lg:tracking-[0.6em] py-2 sm:py-3 md:py-4">العودة للقائمة الرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Dashboard --- */}
        {view === 'admin_dashboard' && (
          <main className="animate-in slide-in-from-bottom-12 duration-700 space-y-6 sm:space-y-8 md:space-y-10 pb-20 sm:pb-24 md:pb-28 lg:pb-32 w-full">
            {/* Professional Admin Navigation */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12 w-full sticky top-0 bg-slate-950/90 backdrop-blur-3xl py-4 sm:py-5 md:py-6 lg:py-8 z-20 border-b border-white/10 px-4 sm:px-6 md:px-8 lg:px-10 rounded-b-2xl sm:rounded-b-3xl md:rounded-b-4xl lg:rounded-b-[4rem] shadow-2xl gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-5 md:gap-6 lg:gap-10 w-full lg:w-auto">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-amber-400">
                  <LayoutDashboard size={28} className="sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase">التحكم</h2>
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden bg-white/5 p-2 rounded-xl border border-white/10"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Tabs */}
                <div className="hidden lg:flex bg-white/5 p-1 sm:p-1.5 md:p-2 rounded-2xl lg:rounded-3xl border border-white/10 shadow-inner">
                  <button onClick={() => setAdminTab('settings')} className={`px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center gap-2 sm:gap-3 ${adminTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-105' : 'text-slate-400 hover:text-white'}`}><Settings size={18} className="sm:w-4 sm:h-4 md:w-5 md:h-5"/> الإعدادات</button>
                  <button onClick={() => setAdminTab('responses')} className={`px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center gap-2 sm:gap-3 ${adminTab === 'responses' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-105' : 'text-slate-400 hover:text-white'}`}><Users size={18} className="sm:w-4 sm:h-4 md:w-5 md:h-5"/> المشاركات <span className="bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs">{responses.length}</span></button>
                </div>
              </div>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="lg:hidden w-full bg-white/5 p-2 rounded-2xl border border-white/10 flex flex-col gap-2">
                  <button onClick={() => { setAdminTab('settings'); setMobileMenuOpen(false); }} className={`w-full px-4 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${adminTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Settings size={18}/> الإعدادات</button>
                  <button onClick={() => { setAdminTab('responses'); setMobileMenuOpen(false); }} className={`w-full px-4 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${adminTab === 'responses' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Users size={18}/> المشاركات <span className="bg-black/20 px-2 py-0.5 rounded-lg text-xs">{responses.length}</span></button>
                </div>
              )}
              
              <button onClick={() => setView('home')} className="text-rose-400 text-sm sm:text-base md:text-lg font-black bg-rose-500/10 px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] shadow-lg active:scale-95 flex items-center gap-2 sm:gap-3">
                <LogOut size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6"/> خروج
              </button>
            </div>

            {adminTab === 'settings' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 animate-in fade-in duration-500 w-full">
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[3.5rem] p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 shadow-2xl border-t-4 sm:border-t-6 md:border-t-8 border-t-amber-500">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 md:gap-4 w-full justify-center underline decoration-amber-500/20"><Send size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-amber-500"/> سؤال المسابقة الحالي</h3>
                  <textarea className="w-full bg-slate-950 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 outline-none focus:border-amber-500 text-white text-sm sm:text-base md:text-lg lg:text-xl h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 leading-relaxed text-center shadow-inner" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                </div>
                
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[3.5rem] p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 shadow-2xl border-t-4 sm:border-t-6 md:border-t-8 border-t-emerald-500">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 md:gap-4 w-full justify-center underline decoration-emerald-500/20"><Clock size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-emerald-500"/> الجدولة (توقيت 24 ساعة)</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 w-full">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <label className="text-xs sm:text-sm text-slate-500 font-black uppercase tracking-widest">ساعة البدء</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-center font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-emerald-400 shadow-inner" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <label className="text-xs sm:text-sm text-slate-500 font-black uppercase tracking-widest">ساعة الغلق</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-center font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-rose-400 shadow-inner" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 p-3 sm:p-4 md:p-5 lg:p-6 bg-emerald-500/5 rounded-2xl sm:rounded-3xl border border-emerald-500/10 text-emerald-400/80 text-center font-medium italic text-xs sm:text-sm md:text-base">
                    ملاحظة: يمكنك إدخال وقت الانتهاء بعد منتصف الليل (مثلاً بدء 20 ونهاية 2) وسيقوم النظام بفتح المسابقة تلقائياً.
                  </div>
                </div>
                
                <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[4rem] p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 shadow-2xl border-t-4 sm:border-t-6 md:border-t-8 border-t-blue-500 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10">
                  <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 md:gap-4 w-full justify-center underline decoration-blue-500/20"><ShieldCheck size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-500"/> الهوية البصرية</h3>
                    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                       <input className="w-full bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-sm sm:text-base md:text-lg text-center font-bold" placeholder="رابط صورة اللوجو (Direct Link)" defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} />
                       <input className="w-full bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-sm sm:text-base md:text-lg text-center font-bold" placeholder="رابط صفحة الفيسبوك" defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 md:gap-4 w-full justify-center underline decoration-blue-400/20"><Key size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-400"/> نظام الحماية</h3>
                    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                      <input className="w-full bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-sm sm:text-base md:text-lg text-center font-bold" placeholder="اسم مستخدم المدير" onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} />
                      <input className="w-full bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-sm sm:text-base md:text-lg text-center font-bold" type="password" placeholder="كلمة مرور جديدة" onBlur={e => e.target.value && updateAdminPass(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Participant Management Tab */
              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 animate-in fade-in duration-500 w-full">
                <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl lg:rounded-[3rem] p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-5 lg:gap-6 shadow-2xl">
                  <div className="relative w-full md:w-auto md:flex-1 max-w-md">
                    <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} className="sm:w-5 sm:h-5" />
                    <input 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-2 sm:py-2.5 md:py-3 lg:py-4 pr-8 sm:pr-10 pl-3 sm:pl-4 outline-none focus:border-amber-500 text-sm sm:text-base md:text-lg text-center shadow-inner font-bold placeholder:text-slate-700" 
                      placeholder="ابحث بالاسم أو الرقم أو الهاتف..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  <button onClick={exportToCSV} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-xl sm:rounded-2xl md:rounded-3xl font-black transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-[0_15px_40px_rgba(16,185,129,0.3)] text-sm sm:text-base md:text-lg active:scale-95"><Download size={18} className="sm:w-5 sm:h-5" /> تصدير الكشف (Excel)</button>
                </div>
                
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl lg:rounded-[4rem] overflow-hidden shadow-2xl border-b-4 sm:border-b-6 md:border-b-8 border-b-slate-800">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/20">
                    <table className="w-full text-right border-collapse min-w-[600px] sm:min-w-[700px] md:min-w-[800px] lg:min-w-[900px] xl:min-w-[1000px]">
                      <thead>
                        <tr className="bg-white/5 text-amber-400 border-b border-white/10 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-xs sm:text-sm">
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 font-black text-center">رقم السحب</th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 font-black">المشترك</th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 font-black">الإجابة المكتوبة</th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 font-black text-center">الشروط</th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 font-black text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredResponses.length > 0 ? filteredResponses.map((res) => (
                          <tr key={res.id} className="hover:bg-white/[0.04] transition-colors group">
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 text-center">
                              <span className="font-black text-amber-500 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tracking-tighter bg-amber-500/10 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 xl:py-3 rounded-xl sm:rounded-2xl border border-amber-500/20 shadow-inner">#{res.uniqueId}</span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6">
                              <div className="font-black text-white text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 sm:mb-1">{res.name}</div>
                              <div className="text-emerald-400 text-xs sm:text-sm md:text-base font-mono flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 tracking-widest"><Phone size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4"/> {res.phone}</div>
                              <a href={res.facebook?.startsWith('http') ? res.facebook : `https://${res.facebook}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 sm:gap-2 hover:underline font-black bg-blue-400/5 w-fit px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-blue-400/10 transition-all hover:bg-blue-400/10"><Facebook size={10} className="sm:w-3 sm:h-3"/> زيارة البروفايل</a>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[250px]">
                              <div className="text-slate-300 text-xs sm:text-sm md:text-base italic leading-relaxed bg-slate-950/60 p-2 sm:p-3 md:p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner line-clamp-3 sm:line-clamp-4">
                                {res.answer}
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 text-center">
                              <button 
                                onClick={() => toggleVerify(res.id, res.verified)} 
                                className={`mx-auto px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-xl font-black text-xs sm:text-sm transition-all border flex items-center gap-1 sm:gap-2 shadow-xl ${res.verified ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-white/10 text-slate-500 hover:border-amber-500/50'}`}
                              >
                                {res.verified ? <><CheckCircle2 size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4"/> مستوفي</> : <><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full border-2 border-slate-700"/> مراجعة</>}
                              </button>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 text-center">
                              <button onClick={() => deleteResponse(res.id)} className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90 group-hover:opacity-100 md:opacity-20 shadow-lg"><Trash2 size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-10 sm:py-15 md:py-20 lg:py-25 xl:py-30 text-center text-slate-500 font-black text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tracking-widest uppercase">لا يوجد مشتركين في هذا البحث</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* --- View: Admin Login --- */}
        {view === 'admin_login' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl sm:rounded-4xl md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 shadow-2xl animate-in fade-in duration-500 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <div className="w-full flex justify-end mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-black transition-all bg-white/5 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border border-white/5">
                <ChevronRight size={18} className="sm:w-5 sm:h-5" /> الخروج
              </button>
            </div>
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex flex-col items-center">
               <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 bg-amber-500/10 text-amber-400 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 border border-amber-500/20 shadow-2xl"><Lock size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" /></div>
               <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">بوابة المسؤولين</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 w-full">
              <input required className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 px-4 sm:px-5 md:px-6 outline-none focus:border-amber-500 text-center font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-inner" placeholder="اسم المستخدم" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} />
              <input required type="password" className="w-full bg-slate-950/40 border border-white/10 rounded-xl sm:rounded-2xl md:rounded-3xl py-3 sm:py-4 md:py-5 lg:py-6 px-4 sm:px-5 md:px-6 outline-none focus:border-amber-500 text-center font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-inner" placeholder="كلمة المرور" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
              {loginError && <p className="text-rose-500 text-xs sm:text-sm md:text-base text-center font-black bg-rose-500/10 py-2 sm:py-3 md:py-4 rounded-xl border border-rose-500/20 w-full">{loginError}</p>}
              <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-3 sm:py-4 md:py-5 lg:py-6 rounded-2xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] shadow-[0_20px_50px_rgba(245,158,11,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all text-base sm:text-lg md:text-xl lg:text-2xl">دخول آمن</button>
            </form>
          </main>
        )}

        {/* Global Footer */}
        {view === 'home' && (
          <footer className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-20 text-center relative z-10 opacity-30 hover:opacity-100 transition-all duration-1000 delay-500 pb-4 sm:pb-5 md:pb-6 lg:pb-8 xl:pb-10">
            <button onClick={() => setView('admin_login')} className="text-[10px] sm:text-xs md:text-sm text-slate-500 hover:text-amber-500 transition-colors tracking-[0.3em] sm:tracking-[0.5em] md:tracking-[0.8em] lg:tracking-[1em] flex items-center justify-center gap-2 sm:gap-3 mx-auto uppercase font-black italic group py-2">
              <Lock size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 group-hover:animate-bounce" /> Access Panel
            </button>
            <p className="text-slate-700 text-[8px] sm:text-[10px] md:text-xs mt-4 sm:mt-5 md:mt-6 lg:mt-8 xl:mt-10 font-black tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] lg:tracking-[0.5em] italic uppercase px-2">© 2024 Ramadan Al-Khair • Powered by Gemini AI</p>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-in { animation-duration: 0.8s; animation-fill-mode: both; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 12px; border: 2px solid #020617; }
        ::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
        body { background-color: #020617; margin: 0; padding: 0; width: 100%; overflow-x: hidden; scroll-behavior: smooth; }
        * { scrollbar-width: thin; scrollbar-color: #1e293b #020617; }
        
        /* Responsive font sizes */
        @media (max-width: 640px) {
          html { font-size: 14px; }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          html { font-size: 15px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          html { font-size: 16px; }
        }
        @media (min-width: 1025px) {
          html { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}