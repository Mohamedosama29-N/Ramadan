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
  LayoutDashboard
} from 'lucide-react';

// --- Firebase Configuration ---
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

// --- Component: Advanced Professional Background ---
const AnimatedBackground = () => {
  const stars = useMemo(() => Array.from({ length: 120 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.5,
    duration: `${Math.random() * 4 + 2}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#010413] w-full h-full">
      <style>{`
        @keyframes floatMoon {
          0%, 100% { transform: translateY(0) rotate(12deg); filter: drop-shadow(0 0 50px rgba(245, 158, 11, 0.4)); }
          50% { transform: translateY(-40px) rotate(18deg); filter: drop-shadow(0 0 90px rgba(245, 158, 11, 0.6)); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(45deg) scale(0); opacity: 0; }
          10% { opacity: 1; scale: 1; }
          100% { transform: translateX(-100vw) translateY(100vh) rotate(45deg) scale(0.2); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-moon-ultra { animation: floatMoon 12s ease-in-out infinite; }
        .star-item { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--duration) ease-in-out infinite; }
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 180px;
          background: linear-gradient(to bottom, transparent, #fbbf24, white);
          opacity: 0;
          animation: shootingStar 8s linear infinite;
        }
        .magical-glow {
          background: conic-gradient(from 0deg at 50% 50%, #fbbf24, #d97706, #020617, #d97706, #fbbf24);
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
      
      {/* Background Gradients */}
      <div className="absolute top-[-25%] left-[-15%] w-[80%] h-[80%] bg-blue-900/15 rounded-full blur-[180px]"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-amber-950/15 rounded-full blur-[180px]"></div>

      {/* Stars Grid */}
      {stars.map(s => (
        <div key={s.id} className="star-item" style={{ top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`, '--duration': s.duration, animationDelay: s.delay }} />
      ))}

      {/* Shooting Stars */}
      <div className="shooting-star" style={{ top: '5%', right: '10%', animationDelay: '1s' }}></div>
      <div className="shooting-star" style={{ top: '20%', right: '40%', animationDelay: '6s' }}></div>
      <div className="shooting-star" style={{ top: '0%', right: '70%', animationDelay: '14s' }}></div>

      {/* Giant Moon for Laptop/Desktop */}
      <div className="absolute -top-10 -left-10 lg:top-10 lg:left-10 text-amber-500/10 lg:text-amber-500/30 animate-moon-ultra transition-all duration-1000">
        <Moon size={400} fill="currentColor" />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('settings'); 
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (!user || view !== 'admin_dashboard') return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResponses(data.sort((a, b) => b.uniqueId - a.uniqueId));
    });
    return () => unsubscribe();
  }, [user, view]);

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
    link.setAttribute("download", `نتائج_المسابقة_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  if (loading && view !== 'success') {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#010413] z-[999] flex flex-col items-center justify-center text-amber-500 overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <Moon className="w-24 h-24 text-amber-400 animate-moon-ultra" fill="currentColor" />
          <p className="animate-pulse font-black text-3xl tracking-[0.4em] uppercase text-center px-6">رمضان يجمعنا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#010413] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden flex flex-col items-center py-8 sm:py-16 lg:py-24" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-xl md:max-w-3xl lg:max-w-6xl flex flex-col items-center mx-auto px-4 sm:px-10">
        
        {/* Professional Header Section */}
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-12 sm:mb-24 animate-in fade-in slide-in-from-top-10 duration-1000 flex flex-col items-center w-full">
            <div className="relative inline-block group mb-10">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              
              <div className="relative w-32 h-32 sm:w-40 lg:w-56 lg:h-56 bg-slate-900/80 backdrop-blur-3xl rounded-[3.5rem] lg:rounded-[5rem] flex items-center justify-center shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)] border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-700">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-amber-400 flex flex-col items-center">
                    <Star size={60} className="fill-current animate-pulse mb-2" />
                    <span className="text-[12px] lg:text-sm font-black uppercase tracking-[0.4em]">KAREEM</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-[7rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 mb-6 drop-shadow-2xl tracking-tighter leading-tight">مسابقة رمضان</h1>
            <p className="text-amber-100/70 text-xl sm:text-2xl lg:text-3xl font-medium tracking-wide italic text-center max-w-2xl px-6 opacity-80">رحلة إيمانية وجوائز يومية ببركة الشهر الكريم</p>
          </header>
        )}

        {/* --- View: Home (Main Content) --- */}
        {view === 'home' && (
          <main className="space-y-10 sm:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 w-full flex flex-col items-center max-w-4xl">
            {/* Status Indicator */}
            <div className={`group w-full p-[2px] rounded-[2.5rem] bg-gradient-to-r ${isLive ? 'from-emerald-500 via-emerald-300 to-emerald-800' : 'from-rose-500 via-rose-300 to-rose-800'} shadow-2xl backdrop-blur-3xl`}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-6 gap-6 rounded-[2.4rem] bg-slate-950/90 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                  <div className={`w-5 h-5 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_15px_#10b981] animate-ping' : 'bg-rose-400'}`}></div>
                  <span className="text-2xl lg:text-3xl font-black tracking-tight uppercase">{isLive ? 'المسابقة مفتوحة الآن' : 'المسابقة مغلقة حالياً'}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-4 font-mono text-3xl lg:text-4xl text-amber-400 bg-amber-400/10 px-8 py-3 rounded-2xl border border-amber-400/20 shadow-inner">
                    <Clock size={28} className="animate-pulse" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Question Card with Magical Border Effect */}
            <div className="relative w-full group">
              {/* Spinning Magic Border Background */}
              <div className="absolute -inset-[2px] magical-glow rounded-[4rem] opacity-30 blur-sm group-hover:opacity-60 transition-opacity duration-1000"></div>
              
              <div className="relative bg-slate-950/80 w-full backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 sm:p-16 lg:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]"></div>
                
                <div className="flex items-center justify-center gap-6 mb-8 lg:mb-10">
                  <Sparkles size={32} className="text-amber-400 animate-bounce" />
                  <h2 className="text-amber-400 font-black text-2xl lg:text-3xl italic uppercase tracking-[0.2em] underline decoration-amber-500/20 underline-offset-8">سؤال اليوم</h2>
                </div>

                <p className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black leading-[1.1] mb-10 lg:mb-14 text-slate-50 min-h-fit px-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {isLive ? config.currentQuestion.text : `ننتظركم يومياً في تمام الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
                </p>

                {isLive ? (
                  <button onClick={() => setView('form')} className="relative overflow-hidden w-full max-w-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 text-[#010413] font-black py-8 rounded-[3rem] flex items-center justify-center gap-6 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-[0_30px_80px_-15px_rgba(245,158,11,0.6)] text-3xl lg:text-4xl group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                    <span>اشترك الآن واربح</span>
                    <ChevronLeft size={48} className="group-hover/btn:-translate-x-3 transition-transform duration-500" />
                  </button>
                ) : (
                  <div className="text-center p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-inner w-full backdrop-blur-md">
                    <p className="text-amber-100/60 text-xl lg:text-3xl font-bold leading-relaxed">
                      المسابقة متاحة يومياً من <br/>
                      <span className="text-amber-400 font-black text-4xl lg:text-5xl mx-2 underline decoration-amber-500/40">{config.startHour > 12 ? config.startHour - 12 : config.startHour}</span> 
                      إلى 
                      <span className="text-amber-400 font-black text-4xl lg:text-5xl mx-2 underline decoration-amber-500/40">{config.endHour > 12 ? config.endHour - 12 : config.endHour}</span> 
                      مساءً
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* --- View: Registration Form --- */}
        {view === 'form' && (
          <main className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 sm:p-20 shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in slide-in-from-left-12 duration-1000 w-full max-w-5xl flex flex-col items-center mx-auto">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-16 gap-8">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-amber-500">
                   <Users size={44}/>
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">بيانات المشاركة</h2>
              </div>
              <button onClick={() => setView('home')} className="text-slate-400 hover:text-amber-400 flex items-center gap-3 text-xl font-black transition-all bg-white/5 px-10 py-5 rounded-[2rem] border border-white/5 hover:border-amber-500/30">
                <ChevronRight size={32} /> رجوع
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-10 sm:space-y-12 w-full flex flex-col items-center">
              <div className="w-full space-y-10 max-w-4xl">
                {/* Custom Styled Input Fields */}
                <div className="relative group">
                  <User className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-all duration-500" size={32} />
                  <input required className="w-full bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 pr-20 pl-10 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/60 outline-none transition-all text-2xl lg:text-3xl font-black text-center placeholder:text-slate-700" placeholder="الاسم الثلاثي كاملاً كما في البطاقة" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                  <div className="relative group">
                    <Phone className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-all" size={32} />
                    <input required type="tel" className="w-full bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 pr-20 pl-10 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/60 outline-none transition-all text-2xl lg:text-3xl font-black text-center" placeholder="رقم الموبايل" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Facebook className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-all" size={32} />
                    <input required className="w-full bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 pr-20 pl-10 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/60 outline-none transition-all text-2xl lg:text-3xl font-black text-center" placeholder="رابط حساب الفيسبوك" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                  </div>
                </div>
                
                <div className="relative group">
                  <MapPin className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-all" size={32} />
                  <input required className="w-full bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 pr-20 pl-10 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/60 outline-none transition-all text-2xl lg:text-3xl font-black text-center" placeholder="العنوان (المحافظة / المدينة)" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <div className="relative">
                  <textarea required rows="4" className="w-full bg-slate-900/50 border border-white/10 rounded-[3.5rem] py-10 px-12 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/60 outline-none transition-all text-3xl font-medium text-center leading-relaxed placeholder:text-slate-700 shadow-inner" placeholder="اكتب إجابتك النموذجية والكاملة هنا..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full max-w-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-900 text-white font-black py-9 rounded-[3.5rem] text-3xl lg:text-4xl shadow-[0_30px_70px_-10px_rgba(16,185,129,0.5)] active:scale-95 hover:scale-[1.03] transition-all flex items-center justify-center gap-6">
                {loading ? <Sparkles className="animate-spin" size={40} /> : <><Send size={44} /> إرسال الإجابة ودخول السحب</>}
              </button>
            </form>
          </main>
        )}

        {/* --- View: Success (Professional Win Screen) --- */}
        {view === 'success' && (
          <main className="bg-slate-950/90 backdrop-blur-3xl border-2 border-emerald-500/40 rounded-[5rem] p-12 sm:p-24 text-center shadow-[0_0_150px_-20px_rgba(16,185,129,0.3)] animate-in zoom-in-95 duration-1000 w-full max-w-5xl flex flex-col items-center mx-auto relative overflow-hidden">
            {/* Success Glow Decoration */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[180px]"></div>
            
            <div className="relative w-40 h-40 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-16 shadow-[0_0_80px_rgba(16,185,129,0.4)] border border-emerald-400/30">
               <CheckCircle2 size={100} className="animate-bounce" />
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-white mb-10 tracking-tighter drop-shadow-2xl">تم استلام طلبك!</h2>
            
            <div className="bg-slate-900/80 w-full max-w-3xl rounded-[4rem] sm:rounded-[5rem] p-12 sm:p-20 mb-16 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-300 shadow-lg"></div>
              <p className="text-amber-400/60 mb-8 font-black uppercase tracking-[0.8em] text-xl">رقم السحب الذهبي</p>
              <p className="text-9xl sm:text-[13rem] font-black text-amber-500 drop-shadow-[0_0_60px_rgba(245,158,11,0.7)] tracking-tighter transition-transform group-hover:scale-110 duration-700">#{uniqueId}</p>
              
              <div className="mt-16 flex items-center justify-center gap-5 text-amber-400/90 bg-amber-400/5 py-8 px-12 rounded-[3rem] border border-amber-400/10 animate-pulse">
                <Camera size={44}/>
                <p className="text-2xl sm:text-3xl font-black tracking-wide leading-tight">التقط صورة للشاشة الآن للرقم</p>
              </div>
            </div>
            
            <div className="space-y-10 w-full max-w-xl">
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-6 w-full py-10 bg-gradient-to-r from-[#1877F2] to-[#084291] text-white rounded-[3rem] font-black text-3xl lg:text-4xl shadow-[0_30px_70px_-15px_rgba(24,119,242,0.6)] hover:scale-105 active:scale-95 transition-all"><Facebook size={48} /> تابع النتائج على فيسبوك</a>
              <button onClick={() => setView('home')} className="text-slate-600 text-sm font-black hover:text-amber-500 transition-colors uppercase tracking-[0.8em] py-6">العودة للرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Dashboard (Desktop Optimized) --- */}
        {view === 'admin_dashboard' && (
          <main className="animate-in slide-in-from-bottom-12 duration-1000 space-y-12 pb-40 w-full flex flex-col items-center">
            {/* High-End Admin Navigation */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-16 w-full sticky top-0 bg-slate-950/90 backdrop-blur-3xl py-10 z-20 border-b border-white/10 px-12 rounded-b-[5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] gap-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex items-center gap-6 text-amber-400">
                  <LayoutDashboard size={60} />
                  <h2 className="text-5xl font-black tracking-tighter uppercase">قمرة القيادة</h2>
                </div>
                
                <div className="flex bg-white/5 p-3 rounded-[2.5rem] border border-white/10 shadow-inner backdrop-blur-2xl">
                  <button onClick={() => setAdminTab('settings')} className={`px-12 py-5 rounded-3xl font-black text-xl transition-all flex items-center gap-4 ${adminTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-110' : 'text-slate-400 hover:text-white'}`}><Settings size={28}/> الإعدادات</button>
                  <button onClick={() => setAdminTab('responses')} className={`px-12 py-5 rounded-3xl font-black text-xl transition-all flex items-center gap-4 ${adminTab === 'responses' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-110' : 'text-slate-400 hover:text-white'}`}><Users size={28}/> المشاركات <span className="bg-black/20 px-4 py-1.5 rounded-2xl text-sm">{responses.length}</span></button>
                </div>
              </div>
              <button onClick={() => setView('home')} className="text-rose-400 text-xl font-black bg-rose-500/10 px-16 py-6 rounded-[2.5rem] border border-rose-500/20 hover:bg-rose-500/20 transition-all uppercase tracking-[0.4em] shadow-2xl active:scale-95"><LogOut size={32}/> خروج</button>
            </div>

            {adminTab === 'settings' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700 w-full max-w-7xl">
                {/* Question Editor Card */}
                <div className="bg-slate-900/60 border border-white/10 rounded-[4.5rem] p-12 lg:p-16 shadow-2xl border-t-[12px] border-t-amber-500 flex flex-col items-center">
                  <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-6 w-full justify-center"><Send size={36} className="text-amber-500"/> نص السؤال النشط</h3>
                  <textarea className="w-full bg-slate-950 border border-white/10 rounded-[3rem] p-10 outline-none focus:border-amber-500 text-white text-3xl h-64 leading-relaxed text-center shadow-inner font-medium" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                  <p className="mt-6 text-slate-500 italic font-bold">التعديل يتم حفظه تلقائياً عند النقر خارج المربع</p>
                </div>

                {/* Time Configuration Card */}
                <div className="bg-slate-900/60 border border-white/10 rounded-[4.5rem] p-12 lg:p-16 shadow-2xl border-t-[12px] border-t-emerald-500 flex flex-col items-center">
                  <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-6 w-full justify-center"><Clock size={36} className="text-emerald-500"/> نظام الجدولة (24h)</h3>
                  <div className="grid grid-cols-2 gap-12 w-full text-center">
                    <div className="space-y-6">
                      <label className="text-base text-slate-500 font-black uppercase tracking-[0.3em]">ساعة الانطلاق</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-[3rem] p-10 text-center font-black text-7xl text-emerald-400 shadow-inner" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-6">
                      <label className="text-base text-slate-500 font-black uppercase tracking-[0.3em]">ساعة الإغلاق</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-[3rem] p-10 text-center font-black text-7xl text-rose-400 shadow-inner" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="mt-12 p-8 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 text-emerald-300 text-xl text-center font-bold">
                    * يدعم النظام العمل عبر منتصف الليل (مثلاً من 20 مساءً حتى 2 فجراً)
                  </div>
                </div>

                {/* Branding & Export Full Row */}
                <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-[5rem] p-12 lg:p-20 shadow-2xl border-t-[12px] border-t-blue-500 grid grid-cols-1 md:grid-cols-2 gap-20 w-full">
                  <div className="space-y-12 flex flex-col items-center">
                    <h3 className="text-3xl font-black text-white flex items-center gap-6 w-full justify-center"><ShieldCheck size={40} className="text-blue-500"/> هوية الموقع</h3>
                    <div className="w-full space-y-8">
                       <input className="w-full bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-2xl text-center font-bold shadow-inner" placeholder="رابط صورة اللوجو المباشر" defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} />
                       <input className="w-full bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-2xl text-center font-bold shadow-inner" placeholder="رابط صفحة الفيسبوك" defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-12 flex flex-col items-center">
                    <h3 className="text-3xl font-black text-white flex items-center gap-6 w-full justify-center"><Key size={40} className="text-blue-400"/> أمان النظام</h3>
                    <div className="w-full space-y-8">
                      <input className="w-full bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-2xl text-center font-black shadow-inner" placeholder="اسم مستخدم الإدارة" onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} />
                      <input className="w-full bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-2xl text-center font-black shadow-inner" type="password" placeholder="تحديث كلمة المرور" onBlur={e => e.target.value && updateAdminPass(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Participant Management UI with Wide Layout for Laptop */
              <div className="space-y-12 animate-in fade-in duration-700 w-full max-w-7xl flex flex-col items-center">
                <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 flex flex-col xl:flex-row items-center justify-between gap-12 shadow-2xl w-full">
                  <div className="relative w-full xl:w-[45rem]">
                    <Search className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500" size={36} />
                    <input 
                      className="w-full bg-slate-950 border border-white/10 rounded-[3rem] py-8 pr-20 pl-10 outline-none focus:border-amber-500 text-3xl text-center shadow-inner font-bold placeholder:text-slate-700 transition-all" 
                      placeholder="ابحث بالاسم، الرقم، أو رقم الهاتف..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-16 py-8 rounded-[3rem] font-black transition-all flex items-center gap-5 shadow-[0_20px_60px_-10px_rgba(16,185,129,0.5)] w-full xl:w-auto text-2xl active:scale-95"><Download size={36} /> تصدير قاعدة البيانات لملف Excel</button>
                </div>
                
                <div className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[5rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,1)] w-full">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/20">
                    <table className="w-full text-right border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-white/5 text-amber-400 border-b border-white/10 uppercase tracking-[0.4em] text-base">
                          <th className="px-10 py-10 font-black text-center">رقم السحب</th>
                          <th className="px-10 py-10 font-black">بيانات المشترك</th>
                          <th className="px-10 py-10 font-black">الإجابة المكتوبة</th>
                          <th className="px-10 py-10 font-black text-center">حالة التحقق</th>
                          <th className="px-10 py-10 font-black text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredResponses.length > 0 ? filteredResponses.map((res) => (
                          <tr key={res.id} className="hover:bg-white/[0.05] transition-colors group">
                            <td className="px-10 py-10 text-center">
                              <span className="font-black text-amber-500 text-5xl tracking-tighter bg-amber-500/10 px-8 py-4 rounded-[2rem] border border-amber-500/20 shadow-inner">#{res.uniqueId}</span>
                            </td>
                            <td className="px-10 py-10">
                              <div className="font-black text-white text-3xl mb-2">{res.name}</div>
                              <div className="text-emerald-400 text-xl font-mono flex items-center gap-3 mb-3 tracking-[0.1em]"><Phone size={20}/> {res.phone}</div>
                              <a href={res.facebook?.startsWith('http') ? res.facebook : `https://${res.facebook}`} target="_blank" rel="noreferrer" className="text-blue-400 text-sm flex items-center gap-3 hover:underline font-black bg-blue-400/5 w-fit px-5 py-2.5 rounded-2xl border border-blue-400/10 transition-all hover:bg-blue-400/15"><Facebook size={18}/> ملف الفيسبوك</a>
                            </td>
                            <td className="px-10 py-10 max-w-md">
                              <div className="text-slate-300 text-xl italic leading-relaxed bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-inner line-clamp-4 font-medium">
                                {res.answer}
                              </div>
                            </td>
                            <td className="px-10 py-10 text-center">
                              <button 
                                onClick={() => toggleVerify(res.id, res.verified)} 
                                className={`mx-auto px-8 py-5 rounded-3xl font-black text-base transition-all border flex items-center gap-4 shadow-2xl ${res.verified ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-white/10 text-slate-500 hover:border-amber-500/50'}`}
                              >
                                {res.verified ? <><CheckCircle2 size={24}/> مستوفي الشروط</> : <><div className="w-5 h-5 rounded-full border-2 border-slate-700"/> قيد المراجعة</>}
                              </button>
                            </td>
                            <td className="px-10 py-10 text-center">
                              <button onClick={() => deleteResponse(res.id)} className="p-7 text-rose-500 hover:bg-rose-500/10 rounded-3xl transition-all active:scale-90 group-hover:opacity-100 md:opacity-20 shadow-2xl"><Trash2 size={36} /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="px-10 py-48 text-center text-slate-600 font-black text-4xl tracking-[0.5em] italic uppercase">قاعدة البيانات فارغة حالياً</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* --- View: Admin Login (Professional Security UI) --- */}
        {view === 'admin_login' && (
          <main className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[5rem] p-16 sm:p-24 shadow-[0_60px_120px_rgba(0,0,0,1)] animate-in fade-in duration-700 w-full max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-full flex justify-end mb-16">
              <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-400 flex items-center gap-3 text-xl font-black transition-all bg-white/5 px-8 py-4 rounded-3xl border border-white/5">
                <ChevronRight size={28} /> عودة للموقع
              </button>
            </div>
            <div className="text-center mb-16 flex flex-col items-center">
               <div className="w-24 h-24 bg-amber-500/10 text-amber-400 rounded-[2.5rem] flex items-center justify-center mb-8 border border-amber-500/20 shadow-2xl self-center"><Lock size={50} /></div>
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase">بوابة الدخول المحمية</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-10 w-full flex flex-col items-center">
              <input required className="w-full max-w-lg bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 px-10 outline-none focus:border-amber-500 text-center font-bold text-3xl shadow-inner tracking-widest placeholder:text-slate-800" placeholder="اسم المستخدم" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} />
              <input required type="password" className="w-full max-w-lg bg-slate-900/50 border border-white/10 rounded-[2.5rem] py-8 px-10 outline-none focus:border-amber-500 text-center font-bold text-3xl shadow-inner tracking-widest placeholder:text-slate-800" placeholder="كلمة المرور" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
              {loginError && <p className="text-rose-500 text-xl text-center font-black bg-rose-500/10 py-5 rounded-[2rem] border border-rose-500/20 w-full">{loginError}</p>}
              <button type="submit" className="w-full max-w-lg bg-amber-500 text-[#010413] font-black py-8 rounded-[3rem] shadow-[0_30px_70px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all text-3xl">تأكيد الهوية والدخول</button>
            </form>
          </main>
        )}

        {/* Premium Professional Footer */}
        {view === 'home' && (
          <footer className="mt-24 text-center relative z-10 opacity-30 hover:opacity-100 transition-all duration-1000 delay-500 pb-16 w-full flex flex-col items-center">
            <button onClick={() => setView('admin_login')} className="text-[16px] text-slate-500 hover:text-amber-500 transition-all tracking-[1.2em] flex items-center justify-center gap-6 mx-auto uppercase font-black italic group py-4 hover:tracking-[1.5em] duration-700">
              <Lock size={20} className="group-hover:animate-bounce" /> Control Portal
            </button>
            <p className="text-slate-700 text-[14px] mt-12 font-black tracking-[0.6em] italic uppercase text-center px-6">© 2024 Ramadan Contest • Powered by Premium Design Engine</p>
          </footer>
        )}
      </div>

      {/* Advanced CSS Utilities */}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-in { animation-duration: 1.2s; animation-fill-mode: both; }
        ::-webkit-scrollbar { width: 12px; height: 12px; }
        ::-webkit-scrollbar-track { background: #010413; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 4px solid #010413; }
        ::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
        body { background-color: #010413; margin: 0; padding: 0; width: 100vw; overflow-x: hidden; scroll-behavior: smooth; }
        * { scrollbar-width: thin; scrollbar-color: #1e293b #010413; }
      `}</style>
    </div>
  );
}