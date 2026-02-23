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
      <div className="absolute top-10 left-10 lg:top-20 lg:left-20 text-amber-500/10 lg:text-amber-500/30 animate-moon-pro transition-opacity duration-1000">
        <Moon size={300} fill="currentColor" />
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
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Sparkles className="w-20 h-20 animate-pulse text-amber-400" />
          <p className="animate-pulse font-black text-3xl tracking-[0.3em] uppercase text-center px-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden flex flex-col items-center justify-center py-6 sm:py-12 lg:py-20" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-5xl flex flex-col items-center mx-auto px-4 sm:px-6">
        
        {/* Unified Header */}
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-8 sm:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000 flex flex-col items-center w-full">
            <div className="relative inline-block group mb-6">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl transition-all group-hover:bg-amber-500/40"></div>
              <div className="relative w-24 h-24 sm:w-32 lg:w-44 lg:h-44 bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] lg:rounded-[4rem] flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-amber-400 flex flex-col items-center">
                    <Moon size={60} className="fill-current animate-pulse" />
                    <span className="text-[12px] font-black uppercase mt-2 tracking-[0.3em]">RAMADAN</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-4 drop-shadow-2xl tracking-tighter">مسابقة رمضان</h1>
            <p className="text-amber-100/60 text-lg sm:text-2xl font-medium tracking-wide italic text-center max-w-lg">رحلة إيمانية وجوائز يومية في شهر الخير</p>
          </header>
        )}

        {/* --- View: Home --- */}
        {view === 'home' && (
          <main className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 w-full flex flex-col items-center">
            {/* Professional Status Bar */}
            <div className={`w-full max-w-3xl p-1 rounded-[2rem] bg-gradient-to-r ${isLive ? 'from-emerald-500/40 via-emerald-400/20 to-emerald-800/40' : 'from-rose-500/40 via-rose-400/20 to-rose-800/40'} border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl`}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 gap-4 rounded-[1.8rem] bg-slate-950/80">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></div>
                  <span className="text-xl lg:text-2xl font-black tracking-tight">{isLive ? 'المسابقة متاحة الآن' : 'المسابقة مغلقة حالياً'}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-4 font-mono text-2xl lg:text-3xl text-amber-400 bg-amber-400/5 px-6 py-2 rounded-2xl border border-amber-400/10">
                    <Timer size={24} className="animate-pulse" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Question Card */}
            <div className="bg-slate-900/40 w-full max-w-3xl backdrop-blur-3xl border border-white/10 rounded-[3.5rem] lg:rounded-[4.5rem] p-10 sm:p-16 shadow-[0_0_100px_-20px_rgba(245,158,11,0.2)] relative overflow-hidden group text-center flex flex-col items-center border-b-8 border-b-amber-500/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]"></div>
              <div className="flex items-center justify-center gap-5 mb-10">
                <Sparkles size={32} className="text-amber-400 animate-pulse" />
                <h2 className="text-amber-400 font-black text-2xl lg:text-3xl italic tracking-widest uppercase">سؤال اليوم</h2>
              </div>
              <p className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.2] mb-16 text-slate-50 min-h-[12rem] px-4 drop-shadow-2xl">
                {isLive ? config.currentQuestion.text : `برجاء انتظار السؤال الجديد في تمام الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
              </p>
              {isLive ? (
                <button onClick={() => setView('form')} className="relative overflow-hidden w-full max-w-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-slate-950 font-black py-7 rounded-[2.5rem] flex items-center justify-center gap-5 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_30px_70px_-15px_rgba(245,158,11,0.5)] text-2xl lg:text-3xl group">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <span>أجب الآن واربح معنا</span>
                  <ChevronLeft size={40} />
                </button>
              ) : (
                <div className="text-center p-10 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner w-full">
                  <p className="text-amber-200/60 text-xl lg:text-2xl font-bold">المسابقة تفتح يومياً من <span className="text-amber-400 font-black px-2"> {config.startHour > 12 ? config.startHour - 12 : config.startHour} </span> إلى <span className="text-amber-400 font-black px-2"> {config.endHour > 12 ? config.endHour - 12 : config.endHour} </span> مساءً</p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- View: Form --- */}
        {view === 'form' && (
          <main className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] lg:rounded-[4.5rem] p-10 sm:p-16 shadow-2xl animate-in slide-in-from-left-12 duration-700 w-full max-w-4xl flex flex-col items-center mx-auto">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-14 gap-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white flex items-center gap-4">
                 <Users className="text-amber-500" size={40}/> سجل بياناتك
              </h2>
              <button onClick={() => setView('home')} className="text-slate-400 hover:text-amber-400 flex items-center gap-2 text-lg font-black transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <ChevronRight size={28} /> العودة
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-8 sm:space-y-10 w-full flex flex-col items-center">
              {/* Input Wrapper Component Style */}
              <div className="w-full max-w-3xl space-y-8">
                <div className="relative group">
                  <User className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={24} />
                  <input required className="w-full bg-slate-950/40 border border-white/10 rounded-[1.8rem] py-6 pr-16 pl-8 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-xl font-bold text-center" placeholder="الاسم الثلاثي بالكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="relative group">
                    <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={24} />
                    <input required type="tel" className="w-full bg-slate-950/40 border border-white/10 rounded-[1.8rem] py-6 pr-16 pl-8 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-xl font-bold text-center" placeholder="رقم الموبايل" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Facebook className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={24} />
                    <input required className="w-full bg-slate-950/40 border border-white/10 rounded-[1.8rem] py-6 pr-16 pl-8 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-xl font-bold text-center" placeholder="رابط الفيسبوك" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                  </div>
                </div>
                
                <div className="relative group">
                  <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" size={24} />
                  <input required className="w-full bg-slate-950/40 border border-white/10 rounded-[1.8rem] py-6 pr-16 pl-8 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-xl font-bold text-center" placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <div className="relative">
                  <textarea required rows="4" className="w-full bg-slate-950/40 border border-white/10 rounded-[2.5rem] py-8 px-10 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all text-2xl font-medium text-center leading-relaxed placeholder:text-slate-600 shadow-inner" placeholder="اكتب إجابتك النموذجية هنا..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full max-w-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-800 text-white font-black py-7 rounded-[2.5rem] text-2xl lg:text-3xl shadow-[0_20px_60px_-10px_rgba(16,185,129,0.4)] active:scale-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-5">
                {loading ? <Sparkles className="animate-spin" /> : <><Send size={32} /> إرسال الإجابة والمشاركة</>}
              </button>
            </form>
          </main>
        )}

        {/* --- View: Success --- */}
        {view === 'success' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border-2 border-emerald-500/50 rounded-[4rem] p-12 sm:p-20 text-center shadow-[0_0_100px_-10px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-700 w-full max-w-4xl flex flex-col items-center mx-auto">
            <div className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-400/30">
               <CheckCircle2 size={80} className="animate-bounce" />
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tight">تم بنجاح!</h2>
            
            <div className="bg-slate-950/80 w-full max-w-3xl rounded-[3rem] sm:rounded-[4rem] p-10 sm:p-16 mb-12 border border-white/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-3 bg-gradient-to-l from-amber-400 to-amber-700 shadow-[0_5px_20px_rgba(245,158,11,0.5)]"></div>
              <p className="text-amber-400/60 mb-6 font-black uppercase tracking-[0.5em] text-lg">رقم السحب الفريد</p>
              <p className="text-8xl sm:text-9xl lg:text-[11rem] font-black text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)] tracking-tighter">#{uniqueId}</p>
              <div className="mt-12 flex items-center justify-center gap-4 text-amber-400/90 bg-amber-400/5 py-6 px-10 rounded-[2rem] border border-amber-400/10 animate-pulse">
                <Camera size={32}/>
                <p className="text-xl sm:text-2xl font-black tracking-wide">التقط سكرين شوت لرقمك</p>
              </div>
            </div>
            
            <div className="space-y-8 w-full max-w-lg">
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-6 w-full py-8 bg-[#1877F2] text-white rounded-[2.5rem] font-black text-2xl lg:text-3xl shadow-[0_20px_50px_-10px_rgba(24,119,242,0.4)] hover:brightness-110 active:scale-95 transition-all"><Facebook size={36} /> تابع النتائج على فيسبوك</a>
              <button onClick={() => setView('home')} className="text-slate-500 text-sm font-black hover:text-amber-400 transition-colors uppercase tracking-[0.6em] py-4">العودة للقائمة الرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Dashboard --- */}
        {view === 'admin_dashboard' && (
          <main className="animate-in slide-in-from-bottom-12 duration-700 space-y-10 pb-32 w-full flex flex-col items-center text-right">
            {/* Professional Admin Navigation */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12 w-full sticky top-0 bg-slate-950/90 backdrop-blur-3xl py-8 z-20 border-b border-white/10 px-10 rounded-b-[4rem] shadow-2xl gap-8">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="flex items-center gap-5 text-amber-400">
                  <LayoutDashboard size={48} />
                  <h2 className="text-4xl font-black tracking-tighter uppercase">التحكم</h2>
                </div>
                
                <div className="flex bg-white/5 p-2 rounded-3xl border border-white/10 shadow-inner">
                  <button onClick={() => setAdminTab('settings')} className={`px-10 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${adminTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-105' : 'text-slate-400 hover:text-white'}`}><Settings size={22}/> الإعدادات</button>
                  <button onClick={() => setAdminTab('responses')} className={`px-10 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${adminTab === 'responses' ? 'bg-amber-500 text-slate-950 shadow-2xl scale-105' : 'text-slate-400 hover:text-white'}`}><Users size={22}/> المشاركات <span className="bg-black/20 px-3 py-1 rounded-xl text-xs">{responses.length}</span></button>
                </div>
              </div>
              <button onClick={() => setView('home')} className="text-rose-400 text-lg font-black bg-rose-500/10 px-12 py-5 rounded-[2rem] border border-rose-500/20 hover:bg-rose-500/20 transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95 flex items-center gap-3"><LogOut size={24}/> خروج</button>
            </div>

            {adminTab === 'settings' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500 w-full">
                <div className="bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl border-t-8 border-t-amber-500 flex flex-col items-center">
                  <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 w-full justify-center underline decoration-amber-500/20"><Send size={28} className="text-amber-500"/> سؤال المسابقة الحالي</h3>
                  <textarea className="w-full bg-slate-950 border border-white/10 rounded-3xl p-8 outline-none focus:border-amber-500 text-white text-2xl h-56 leading-relaxed text-center shadow-inner" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                </div>
                
                <div className="bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl border-t-8 border-t-emerald-500 flex flex-col items-center">
                  <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 w-full justify-center underline decoration-emerald-500/20"><Clock size={28} className="text-emerald-500"/> الجدولة (توقيت 24 ساعة)</h3>
                  <div className="grid grid-cols-2 gap-10 w-full text-center">
                    <div className="space-y-4">
                      <label className="text-sm text-slate-500 font-black uppercase tracking-widest">ساعة البدء</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-3xl p-8 text-center font-black text-5xl text-emerald-400 shadow-inner" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm text-slate-500 font-black uppercase tracking-widest">ساعة الغلق</label>
                      <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-3xl p-8 text-center font-black text-5xl text-rose-400 shadow-inner" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="mt-10 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-emerald-400/80 text-center font-medium italic">
                    ملاحظة: يمكنك إدخال وقت الانتهاء بعد منتصف الليل (مثلاً بدء 20 ونهاية 2) وسيقوم النظام بفتح المسابقة تلقائياً.
                  </div>
                </div>
                
                <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-[4rem] p-12 lg:p-16 shadow-2xl border-t-8 border-t-blue-500 grid grid-cols-1 md:grid-cols-2 gap-16 w-full">
                  <div className="space-y-8 flex flex-col items-center">
                    <h3 className="text-2xl font-black text-white flex items-center gap-5 w-full justify-center underline decoration-blue-500/20"><ShieldCheck size={32} className="text-blue-500"/> الهوية البصرية</h3>
                    <div className="w-full space-y-6">
                       <input className="w-full bg-slate-950 border border-white/10 rounded-[1.8rem] p-6 text-xl text-center font-bold" placeholder="رابط صورة اللوجو (Direct Link)" defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} />
                       <input className="w-full bg-slate-950 border border-white/10 rounded-[1.8rem] p-6 text-xl text-center font-bold" placeholder="رابط صفحة الفيسبوك" defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-8 flex flex-col items-center">
                    <h3 className="text-2xl font-black text-white flex items-center gap-5 w-full justify-center underline decoration-blue-400/20"><Key size={32} className="text-blue-400"/> نظام الحماية</h3>
                    <div className="w-full space-y-6">
                      <input className="w-full bg-slate-950 border border-white/10 rounded-[1.8rem] p-6 text-xl text-center font-bold" placeholder="اسم مستخدم المدير" onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} />
                      <input className="w-full bg-slate-950 border border-white/10 rounded-[1.8rem] p-6 text-xl text-center font-bold" type="password" placeholder="كلمة مرور جديدة" onBlur={e => e.target.value && updateAdminPass(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Participant Management Tab */
              <div className="space-y-10 animate-in fade-in duration-500 w-full flex flex-col items-center">
                <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl w-full">
                  <div className="relative w-full md:w-[35rem]">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500" size={28} />
                    <input 
                      className="w-full bg-slate-950 border border-white/10 rounded-[2rem] py-5 pr-16 pl-8 outline-none focus:border-amber-500 text-2xl text-center shadow-inner font-bold placeholder:text-slate-700" 
                      placeholder="ابحث بالاسم أو الرقم أو الهاتف..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-4 shadow-[0_15px_40px_rgba(16,185,129,0.3)] w-full md:w-auto text-xl active:scale-95"><Download size={28} /> تصدير الكشف (Excel)</button>
                </div>
                
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl w-full border-b-8 border-b-slate-800">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/20">
                    <table className="w-full text-right border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-white/5 text-amber-400 border-b border-white/10 uppercase tracking-[0.2em] text-sm">
                          <th className="px-8 py-8 font-black text-center">رقم السحب</th>
                          <th className="px-8 py-8 font-black">المشترك</th>
                          <th className="px-8 py-8 font-black">الإجابة المكتوبة</th>
                          <th className="px-8 py-8 font-black text-center">الشروط</th>
                          <th className="px-8 py-8 font-black text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredResponses.length > 0 ? filteredResponses.map((res) => (
                          <tr key={res.id} className="hover:bg-white/[0.04] transition-colors group">
                            <td className="px-8 py-8 text-center">
                              <span className="font-black text-amber-500 text-4xl tracking-tighter bg-amber-500/10 px-6 py-3 rounded-[1.5rem] border border-amber-500/20 shadow-inner">#{res.uniqueId}</span>
                            </td>
                            <td className="px-8 py-8">
                              <div className="font-black text-white text-2xl mb-1">{res.name}</div>
                              <div className="text-emerald-400 text-lg font-mono flex items-center gap-2 mb-2 tracking-widest"><Phone size={16}/> {res.phone}</div>
                              <a href={res.facebook?.startsWith('http') ? res.facebook : `https://${res.facebook}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-2 hover:underline font-black bg-blue-400/5 w-fit px-3 py-1.5 rounded-xl border border-blue-400/10 transition-all hover:bg-blue-400/10"><Facebook size={14}/> زيارة البروفايل</a>
                            </td>
                            <td className="px-8 py-8 max-w-sm">
                              <div className="text-slate-300 text-lg italic leading-relaxed bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 shadow-inner line-clamp-4">
                                {res.answer}
                              </div>
                            </td>
                            <td className="px-8 py-8 text-center">
                              <button 
                                onClick={() => toggleVerify(res.id, res.verified)} 
                                className={`mx-auto px-6 py-4 rounded-2xl font-black text-sm transition-all border flex items-center gap-3 shadow-xl ${res.verified ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-white/10 text-slate-500 hover:border-amber-500/50'}`}
                              >
                                {res.verified ? <><CheckCircle2 size={20}/> مستوفي</> : <><div className="w-4 h-4 rounded-full border-2 border-slate-700"/> مراجعة</>}
                              </button>
                            </td>
                            <td className="px-8 py-8 text-center">
                              <button onClick={() => deleteResponse(res.id)} className="p-5 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90 group-hover:opacity-100 md:opacity-20 shadow-lg"><Trash2 size={28} /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="px-8 py-40 text-center text-slate-500 font-black text-3xl tracking-widest uppercase">لا يوجد مشتركين في هذا البحث</td></tr>
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
          <main className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 sm:p-20 shadow-2xl animate-in fade-in duration-500 w-full max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-full flex justify-end mb-12">
              <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-400 flex items-center gap-2 text-lg font-black transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <ChevronRight size={24} /> الخروج
              </button>
            </div>
            <div className="text-center mb-12 flex flex-col items-center">
               <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-[1.5rem] flex items-center justify-center mb-6 border border-amber-500/20 shadow-2xl self-center"><Lock size={40} /></div>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase">بوابة المسؤولين</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-8 w-full flex flex-col items-center">
              <input required className="w-full max-w-md bg-slate-950/40 border border-white/10 rounded-2xl py-6 px-8 outline-none focus:border-amber-500 text-center font-bold text-2xl shadow-inner" placeholder="اسم المستخدم" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} />
              <input required type="password" className="w-full max-w-md bg-slate-950/40 border border-white/10 rounded-2xl py-6 px-8 outline-none focus:border-amber-500 text-center font-bold text-2xl shadow-inner" placeholder="كلمة المرور" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
              {loginError && <p className="text-rose-500 text-lg text-center font-black bg-rose-500/10 py-4 rounded-2xl border border-rose-500/20 w-full">{loginError}</p>}
              <button type="submit" className="w-full max-w-md bg-amber-500 text-slate-950 font-black py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(245,158,11,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all text-2xl">دخول آمن</button>
            </form>
          </main>
        )}

        {/* Global Footer */}
        {view === 'home' && (
          <footer className="mt-20 text-center relative z-10 opacity-30 hover:opacity-100 transition-all duration-1000 delay-500 pb-10 w-full flex flex-col items-center">
            <button onClick={() => setView('admin_login')} className="text-[14px] text-slate-500 hover:text-amber-500 transition-colors tracking-[1em] flex items-center justify-center gap-4 mx-auto uppercase font-black italic group py-3">
              <Lock size={16} className="group-hover:animate-bounce" /> Access Panel
            </button>
            <p className="text-slate-700 text-[12px] mt-10 font-black tracking-[0.5em] italic uppercase text-center px-4">© 2024 Ramadan Al-Khair • Powered by Gemini AI</p>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-in { animation-duration: 0.8s; animation-fill-mode: both; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 12px; border: 3px solid #020617; }
        ::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
        body { background-color: #020617; margin: 0; padding: 0; width: 100vw; overflow-x: hidden; scroll-behavior: smooth; }
        * { scrollbar-width: thin; scrollbar-color: #1e293b #020617; }
      `}</style>
    </div>
  );
}