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
  Trash2
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

// --- Component: Animated Ramadan Background ---
const AnimatedBackground = () => {
  const stars = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#01040f]">
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
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[150px]"></div>
      {stars.map(s => (
        <div key={s.id} className="star-particle" style={{ top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`, '--duration': s.duration, animationDelay: s.delay }} />
      ))}
      <div className="meteor" style={{ top: '0%', left: '90%', animationDelay: '1s' }}></div>
      <div className="meteor" style={{ top: '0%', left: '30%', animationDelay: '5s' }}></div>
      <div className="absolute top-10 left-10 lg:top-20 lg:left-20 text-amber-500/20 lg:text-amber-500/40 animate-moon-pro transition-opacity duration-1000">
        <Moon size={280} fill="currentColor" />
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
      const live = h >= config.startHour && h < config.endHour;
      setIsLive(live);
      if (live) {
        const end = new Date();
        if (config.endHour === 24) end.setHours(24, 0, 0, 0);
        else end.setHours(config.endHour, 0, 0, 0);
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
    link.setAttribute("download", `contest_results_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  if (loading && view !== 'success') {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-amber-500">
        <Sparkles className="w-16 h-16 animate-pulse mb-4" />
        <p className="animate-pulse font-black text-2xl tracking-widest uppercase">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden flex flex-col items-center py-6 sm:py-12 lg:py-20" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-xl lg:max-w-4xl mx-auto px-4 sm:px-6">
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-10 sm:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="relative inline-block group mb-6">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl transition-all group-hover:bg-amber-500/40"></div>
              <div className="relative w-24 h-24 sm:w-32 lg:w-40 lg:h-40 bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] lg:rounded-[3.5rem] mx-auto flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden transform hover:rotate-3 transition-transform">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-amber-400 flex flex-col items-center">
                    <Moon size={50} className="fill-current animate-pulse" />
                    <span className="text-[10px] lg:text-xs font-black uppercase mt-2 tracking-[0.2em]">KAREEM</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-4 drop-shadow-2xl">مسابقة رمضان</h1>
            <p className="text-amber-100/60 text-lg sm:text-xl lg:text-2xl font-medium tracking-wide italic underline decoration-amber-500/20">رحلة إيمانية وجوائز يومية في شهر الخير</p>
          </header>
        )}

        {/* --- View: Home --- */}
        {view === 'home' && (
          <main className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700 w-full max-w-2xl mx-auto">
            <div className={`group p-1 rounded-3xl bg-gradient-to-r ${isLive ? 'from-emerald-500/40 via-emerald-400/20 to-emerald-800/40' : 'from-rose-500/40 via-rose-400/20 to-rose-800/40'} border border-white/10 shadow-2xl backdrop-blur-md`}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4 rounded-2xl bg-slate-950/60">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></div>
                  <span className="text-lg lg:text-xl font-black tracking-tight uppercase">{isLive ? 'المسابقة متاحة الآن' : 'المسابقة مغلقة حالياً'}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-3 font-mono text-xl lg:text-2xl text-amber-400 bg-amber-400/10 px-5 py-2 rounded-xl border border-amber-400/20 shadow-inner">
                    <Timer size={20} className="animate-pulse" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_0_80px_-15px_rgba(245,158,11,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]"></div>
              <div className="flex items-center gap-4 mb-8">
                <Sparkles size={24} className="text-amber-400" />
                <h2 className="text-amber-400 font-bold text-xl italic underline decoration-amber-500/30">سؤال اليوم:</h2>
              </div>
              <p className="text-3xl sm:text-4xl font-black leading-[1.3] mb-12 text-slate-50 min-h-[10rem]">
                {isLive ? config.currentQuestion.text : `برجاء انتظار السؤال الجديد في تمام الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
              </p>
              {isLive ? (
                <button onClick={() => setView('form')} className="relative overflow-hidden w-full bg-gradient-to-br from-amber-400 to-amber-700 text-slate-950 font-black py-6 rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-[0_25px_60px_-10px_rgba(245,158,11,0.4)] text-2xl group">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <span>أجب الآن واربح معنا</span>
                  <ChevronLeft size={32} />
                </button>
              ) : (
                <div className="text-center p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner">
                  <p className="text-amber-200/60 text-lg">المسابقة يومياً من <span className="text-amber-400 font-black">{config.startHour > 12 ? config.startHour - 12 : config.startHour}</span> إلى <span className="text-amber-400 font-black">{config.endHour > 12 ? config.endHour - 12 : config.endHour}</span> مساءً</p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- View: Registration Form --- */}
        {view === 'form' && (
          <main className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl animate-in slide-in-from-left-12 duration-700 w-full max-w-2xl mx-auto">
            <button onClick={() => setView('home')} className="text-slate-400 hover:text-amber-400 mb-10 flex items-center gap-2 text-base font-black"><ChevronRight size={24} /> العودة للسؤال</button>
            <h2 className="text-3xl font-black mb-12 text-white flex items-center gap-5 underline decoration-amber-500/20">سجل بياناتك للمشاركة</h2>
            <form onSubmit={handleFormSubmit} className="space-y-8">
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-xl" placeholder="الاسم الثلاثي..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-xl" placeholder="رقم الموبايل" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-xl" placeholder="رابط الفيسبوك" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
              </div>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-xl" placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <textarea required rows="4" className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 px-8 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-2xl font-medium" placeholder="إجابتك على السؤال..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-800 text-white font-black py-7 rounded-[2rem] text-2xl shadow-xl active:scale-95 transition-all">إرسال الإجابة والمشاركة في السحب</button>
            </form>
          </main>
        )}

        {/* --- View: Success Message --- */}
        {view === 'success' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border-2 border-emerald-500/50 rounded-[4rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-700 w-full max-w-2xl mx-auto">
            <CheckCircle2 size={80} className="text-emerald-400 mx-auto mb-10 animate-bounce" />
            <h2 className="text-5xl font-black text-white mb-6 italic tracking-tighter">تم التسجيل بنجاح!</h2>
            <div className="bg-slate-950/80 rounded-[3.5rem] p-10 mb-12 border border-white/10 shadow-inner">
              <p className="text-amber-400/60 mb-5 font-black uppercase tracking-[0.5em]">رقم السحب الخاص بك</p>
              <p className="text-8xl font-black text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]">#{uniqueId}</p>
              <p className="mt-8 text-amber-400/80 text-lg font-black tracking-wide flex items-center justify-center gap-3"><Camera size={24}/> يرجى تصوير الشاشة (سكرين شوت)</p>
            </div>
            <div className="space-y-6">
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-5 w-full py-7 bg-gradient-to-r from-[#1877F2] to-[#0a51b5] text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:brightness-110 transition-all"><Facebook size={32} /> تابع النتائج على فيسبوك</a>
              <button onClick={() => setView('home')} className="text-slate-500 text-xs font-black hover:text-amber-400 transition-colors uppercase tracking-[0.4em]">العودة للقائمة الرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Login --- */}
        {view === 'admin_login' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in duration-500 w-full max-w-lg mx-auto">
            <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-400 mb-8 flex items-center gap-2 text-sm font-black transition-all group">
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} /> الخروج
            </button>
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Lock size={32} /></div>
               <h2 className="text-2xl font-black text-white tracking-tighter uppercase">بوابة المسؤولين</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-amber-500 text-center font-bold" placeholder="اسم المستخدم" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} />
              <input required type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-amber-500 text-center font-bold" placeholder="كلمة المرور" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
              {loginError && <p className="text-rose-500 text-xs text-center font-black bg-rose-500/10 py-3 rounded-xl">{loginError}</p>}
              <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">دخول آمن</button>
            </form>
          </main>
        )}

        {/* --- View: Admin Dashboard --- */}
        {view === 'admin_dashboard' && (
          <main className="animate-in slide-in-from-bottom-12 duration-700 space-y-8 pb-32 w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 sticky top-0 bg-slate-950/60 backdrop-blur-3xl py-6 z-20 border-b border-white/5 px-6 rounded-b-[3rem] shadow-2xl gap-4">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-amber-400 flex items-center gap-4"><Settings size={40} /> لوحة التحكم</h2>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  <button onClick={() => setAdminTab('settings')} className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${adminTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>الإعدادات</button>
                  <button onClick={() => setAdminTab('responses')} className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${adminTab === 'responses' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>المشاركات <span className="bg-black/20 px-2 py-0.5 rounded-lg text-xs">{responses.length}</span></button>
                </div>
              </div>
              <button onClick={() => setView('home')} className="text-rose-400 text-sm font-black bg-rose-500/10 px-8 py-4 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all uppercase tracking-widest">خروج</button>
            </div>

            {adminTab === 'settings' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl border-t-8 border-t-amber-500">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4"><Send size={24} className="text-amber-500"/> سؤال اليوم</h3>
                  <textarea className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 outline-none focus:border-amber-500 text-white text-xl h-40 leading-relaxed shadow-inner" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                </div>
                <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl border-t-8 border-t-emerald-500">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4"><Clock size={24} className="text-emerald-500"/> الجدولة الزمنية (24h)</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-xs text-slate-500 font-black mb-3 block">الفتح</label><input type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-center font-black text-3xl text-emerald-400" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} /></div>
                    <div><label className="text-xs text-slate-500 font-black mb-3 block">الغلق</label><input type="number" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-center font-black text-3xl text-rose-400" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} /></div>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl border-t-8 border-t-blue-500 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-4"><ShieldCheck size={24} className="text-blue-500"/> الهوية واللوجو</h3>
                    <input className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-lg" placeholder="رابط اللوجو" defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} />
                    <input className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-lg" placeholder="رابط الفيسبوك" defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-4"><Key size={24} className="text-blue-400"/> تعديل الأمان</h3>
                    <input className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-lg" placeholder="يوزر الإدارة" onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} />
                    <input className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-lg" type="password" placeholder="باسورد جديد" onBlur={e => e.target.value && updateAdminPass(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pr-14 pl-6 outline-none focus:border-amber-500 text-lg" placeholder="ابحث بالاسم أو الرقم..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl"><Download size={24} /> تحميل Excel</button>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-amber-400 border-b border-white/10">
                          <th className="px-6 py-6 font-black text-sm">رقم السحب</th>
                          <th className="px-6 py-6 font-black text-sm">المشترك</th>
                          <th className="px-6 py-6 font-black text-sm">الإجابة</th>
                          <th className="px-6 py-6 font-black text-sm">الحالة</th>
                          <th className="px-6 py-6 font-black text-sm">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredResponses.length > 0 ? filteredResponses.map((res) => (
                          <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-6 font-black text-amber-500 text-xl tracking-tighter">#{res.uniqueId}</td>
                            <td className="px-6 py-6">
                              <div className="font-black text-white text-lg">{res.name}</div>
                              <div className="text-slate-400 text-sm">{res.phone}</div>
                              <a href={res.facebook?.startsWith('http') ? res.facebook : `https://${res.facebook}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 mt-1 hover:underline"><Facebook size={12}/> بروفايل</a>
                            </td>
                            <td className="px-6 py-6 max-w-xs text-slate-300 text-sm italic">"{res.answer}"</td>
                            <td className="px-6 py-6">
                              <button onClick={() => toggleVerify(res.id, res.verified)} className={`px-4 py-2 rounded-xl font-black text-xs transition-all border ${res.verified ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950 border-white/10 text-slate-500 hover:border-amber-500/50'}`}>
                                {res.verified ? 'مستوفي الشروط' : 'قيد المراجعة'}
                              </button>
                            </td>
                            <td className="px-6 py-6"><button onClick={() => deleteResponse(res.id)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button></td>
                          </tr>
                        )) : <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-500 font-black tracking-widest uppercase">لا يوجد مشتركين</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Footer Admin Link */}
        {view === 'home' && (
          <footer className="mt-16 text-center relative z-10 opacity-20 hover:opacity-100 transition-all duration-1000 delay-500 pb-10">
            <button onClick={() => setView('admin_login')} className="text-[12px] text-slate-500 hover:text-amber-500 transition-colors tracking-[0.8em] flex items-center justify-center gap-3 mx-auto uppercase font-black italic">
              <Lock size={12} /> Access Control System
            </button>
            <p className="text-slate-700 text-[10px] mt-8 font-black tracking-[0.4em] italic uppercase">© 2024 Ramadan Al-Khair • Powered by Gemini AI</p>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-in { animation-duration: 0.8s; animation-fill-mode: both; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}