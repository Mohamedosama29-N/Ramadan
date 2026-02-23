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
  getDocs
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
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
  ExternalLink
} from 'lucide-react';

// --- Firebase Configuration ---
// Note: When deploying to Vercel, replace this object with your actual Firebase project config.
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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ramadan-contest-2024';

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
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const fallingStars = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 5 + 3}s`,
      delay: `${Math.random() * 15}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
      <style>{`
        @keyframes floatMoon {
          0%, 100% { transform: translateY(0) rotate(12deg); filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.3)); }
          50% { transform: translateY(-30px) rotate(15deg); filter: drop-shadow(0 0 50px rgba(245, 158, 11, 0.5)); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes fallingStar {
          0% { transform: translateY(-10vh) translateX(0) rotate(45deg) scale(0); opacity: 0; }
          10% { opacity: 1; scale: 1; }
          100% { transform: translateY(110vh) translateX(-30vw) rotate(45deg) scale(0.3); opacity: 0; }
        }
        .animate-moon { animation: floatMoon 8s ease-in-out infinite; }
        .star-item { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--duration) ease-in-out infinite; }
        .falling-item {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, #f59e0b);
          opacity: 0;
          animation: fallingStar var(--duration) linear infinite;
        }
      `}</style>

      {/* Twinkling Stars */}
      {stars.map(s => (
        <div 
          key={s.id} className="star-item" 
          style={{ 
            top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`, 
            '--duration': s.duration, animationDelay: s.delay 
          }} 
        />
      ))}

      {/* Falling Stars */}
      {fallingStars.map(fs => (
        <div 
          key={`f-${fs.id}`} className="falling-item" 
          style={{ left: fs.left, '--duration': fs.duration, animationDelay: fs.delay }} 
        />
      ))}

      {/* The Moon */}
      <div className="absolute top-12 left-12 text-amber-500/40 animate-moon">
        <Moon size={180} fill="currentColor" />
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]"></div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'form', 'success', 'admin_login', 'admin_dashboard'
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    currentQuestion: { text: "جاري تحميل سؤال اليوم...", id: 1 },
    logoUrl: "",
    adminUser: "admin",
    adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // Default: "123"
    counter: 1000,
    startHour: 20, // 8 PM
    endHour: 24,   // 12 AM
    pageLink: "https://facebook.com/yourpage"
  });

  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [uniqueId, setUniqueId] = useState(null);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    facebook: '',
    answer: ''
  });

  // --- 1. Authentication ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 2. Real-time Config Sync ---
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

  // --- 3. Timer Logic ---
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

  // --- 4. Submissions ---
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
        ...formData,
        uniqueId: newId,
        timestamp: new Date().toISOString(),
        userId: user.uid
      });

      setUniqueId(newId);
      setView('success');
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Admin Controls ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const hashed = await hashPassword(loginData.pass);
    if (loginData.user === config.adminUser && hashed === config.adminPassHash) {
      setView('admin_dashboard');
      setLoginError('');
      setLoginData({ user: '', pass: '' });
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
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

  const exportToCSV = async () => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'));
    const snap = await getDocs(q);
    let csv = "\uFEFFرقم السحب,الاسم,الهاتف,العنوان,الفيسبوك,الإجابة,التوقيت\n";
    snap.forEach(d => {
      const data = d.data();
      csv += `${data.uniqueId},"${data.name}","${data.phone}","${data.address}","${data.facebook}","${data.answer}",${data.timestamp}\n`;
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
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse font-bold">جاري تحميل المسابقة الرمضانية...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12">
        {/* Header Section */}
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-10 animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-28 bg-slate-900/80 backdrop-blur-md rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-amber-500/20 border-4 border-amber-500/30 overflow-hidden">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-amber-500 flex flex-col items-center">
                  <Moon size={32} />
                  <span className="text-[10px] font-bold uppercase mt-1 tracking-widest">Ramadan</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black text-amber-500 mb-2 drop-shadow-lg">مسابقة رمضان اليومية</h1>
            <p className="text-slate-400 text-lg italic">أجب على الأسئلة الدينية واربح معنا!</p>
          </header>
        )}

        {/* --- View: Home (Question Display) --- */}
        {view === 'home' && (
          <main className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className={`p-4 rounded-2xl flex items-center justify-between border backdrop-blur-md shadow-xl ${isLive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="flex items-center gap-2">
                <Timer size={20} />
                <span className="font-bold">{isLive ? 'المسابقة متاحة الآن' : 'المسابقة مغلقة حالياً'}</span>
              </div>
              {isLive && <span className="text-sm font-mono bg-emerald-500/20 px-3 py-1 rounded-full">{timeLeft}</span>}
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl transition-all group-hover:bg-amber-500/20"></div>
              <h2 className="text-amber-500 font-bold mb-4 flex items-center gap-2 italic">
                <Star size={18} fill="currentColor" /> سؤال اليوم:
              </h2>
              <p className="text-2xl font-bold leading-relaxed mb-10 text-slate-50 min-h-[5rem]">
                {isLive ? config.currentQuestion.text : `برجاء انتظار السؤال الجديد غداً من الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
              </p>
              
              {isLive ? (
                <button 
                  onClick={() => setView('form')}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-500/30 text-xl"
                >
                  أعرف الإجابة.. أجب الآن! <ChevronLeft size={24} />
                </button>
              ) : (
                <div className="text-center p-6 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-slate-400 leading-relaxed text-sm">
                    المسابقة تبدأ يومياً في تمام الساعة <span className="text-amber-500 font-bold tracking-wide">{config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً</span> <br/>
                    وتستمر حتى الساعة <span className="text-amber-500 font-bold tracking-wide">{config.endHour > 12 ? config.endHour - 12 : config.endHour} مساءً</span>
                  </p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- View: Registration Form --- */}
        {view === 'form' && (
          <main className="bg-slate-900/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-left-8 duration-500">
            <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-500 mb-6 flex items-center gap-1 text-sm transition-colors">
              <ChevronLeft className="rotate-180" size={16} /> العودة للسؤال
            </button>
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <User className="text-amber-500" /> سجل بياناتك للمشاركة
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold mr-2">الاسم بالكامل</label>
                <div className="relative group">
                  <User className="absolute right-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input required className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-slate-800" placeholder="اسمك الثلاثي..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold mr-2">رقم الهاتف</label>
                  <div className="relative group">
                    <Phone className="absolute right-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input required type="tel" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-slate-800" placeholder="01xxxxxxxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold mr-2">رابط الفيسبوك</label>
                  <div className="relative group">
                    <Facebook className="absolute right-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input required className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-slate-800" placeholder="facebook.com/id" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold mr-2">العنوان بالتفصيل</label>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input required className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:bg-slate-800" placeholder="المحافظة / المدينة / المنطقة" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-500 font-black mr-2">إجابة سؤال اليوم</label>
                <textarea required rows="3" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all resize-none focus:bg-slate-800" placeholder="اكتب الإجابة الصحيحة هنا..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <p className="text-[11px] text-blue-100 leading-relaxed italic">يجب متابعة صفحتنا الرسمية وعمل "لايك" لمنشور المسابقة لتأكيد اشتراكك.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-600/20 text-xl">
                {loading ? 'جاري الحفظ...' : <><Send size={24} /> تأكيد وإرسال الإجابة</>}
              </button>
            </form>
          </main>
        )}

        {/* --- View: Success Message --- */}
        {view === 'success' && (
          <main className="bg-slate-900/90 backdrop-blur-2xl border-2 border-emerald-500 rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={64} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 italic tracking-tight">تم التسجيل بنجاح!</h2>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">أحسنت يا بطل! لقد استلمنا إجابتك وبياناتك في سجلات المسابقة.</p>
            
            <div className="bg-slate-800/50 rounded-3xl p-8 mb-10 border border-white/5 shadow-inner relative group">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">رقم السحب الخاص بك</p>
              <p className="text-7xl font-black text-amber-500 tracking-tighter drop-shadow-lg">#{uniqueId}</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-amber-300/80 bg-amber-500/10 py-3 px-4 rounded-xl border border-amber-500/20 animate-pulse">
                <Camera size={20} className="shrink-0" />
                <p className="text-[11px] font-bold">يرجى الاحتفاظ بهذا الرقم (سكرين شوت)</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-slate-300 text-sm">سيتم الإعلان عن الفائزين غداً بعد الإفطار مباشرة.</p>
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-black transition-all shadow-xl text-lg">
                <Facebook size={24} /> تابعنا لتعرف النتيجة <ExternalLink size={16} />
              </a>
              <button onClick={() => setView('home')} className="text-slate-500 text-xs hover:text-amber-500 transition-colors uppercase tracking-widest">العودة للرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Login --- */}
        {view === 'admin_login' && (
          <main className="bg-slate-900/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl animate-in fade-in duration-300">
            <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-500 mb-8 flex items-center gap-1 text-sm transition-colors"><ChevronLeft className="rotate-180" size={16} /> العودة للموقع</button>
            <div className="text-center mb-8"><div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div><h2 className="text-2xl font-bold text-white">دخول الإدارة الآمن</h2></div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input required className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-5 outline-none focus:border-amber-500 transition-all text-center" placeholder="اسم المستخدم" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} />
              <input required type="password" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-5 outline-none focus:border-amber-500 transition-all text-center" placeholder="كلمة المرور" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
              {loginError && <p className="text-rose-500 text-xs text-center font-bold bg-rose-500/10 py-2 rounded-lg">{loginError}</p>}
              <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">دخول</button>
            </form>
          </main>
        )}

        {/* --- View: Admin Dashboard --- */}
        {view === 'admin_dashboard' && (
          <main className="animate-in slide-in-from-bottom-8 duration-500 space-y-6 pb-24">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/80 backdrop-blur-md py-4 z-10 border-b border-white/5 px-2">
              <h2 className="text-2xl font-black text-amber-500 flex items-center gap-2"><Settings size={28} /> لوحة التحكم</h2>
              <button onClick={() => setView('home')} className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-sm font-bold bg-rose-500/10 px-5 py-2.5 rounded-2xl transition-all"><LogOut size={18} /> خروج</button>
            </div>

            <div className="grid grid-cols-1 gap-6 px-1">
              {/* Box: Daily Question */}
              <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 shadow-xl border-t-4 border-t-amber-500">
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2"><Send size={18} /> تحديث سؤال اليوم</h3>
                <textarea className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-amber-500 text-white mb-2 h-24 transition-all" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                <p className="text-[10px] text-slate-500 italic">* يتم الحفظ تلقائياً عند الضغط خارج المربع.</p>
              </div>

              {/* Box: Time Control */}
              <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 shadow-xl border-t-4 border-t-emerald-500">
                <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><Clock size={18} /> مواعيد وقفل المسابقة</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-slate-400 block mb-1">ساعة البدء (24h)</label><input type="number" className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 outline-none focus:border-emerald-500" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">ساعة الانتهاء (24h)</label><input type="number" className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 outline-none focus:border-emerald-500" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} /></div>
                </div>
              </div>

              {/* Box: Branding & Security */}
              <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 shadow-xl border-t-4 border-t-blue-500">
                <h3 className="text-blue-500 font-bold mb-4 flex items-center gap-2"><ShieldCheck size={18} /> العلامة التجارية والأمان</h3>
                <div className="space-y-4">
                  <div><label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-widest">رابط اللوجو (Direct Link)</label><input className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-blue-500" placeholder="https://..." defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} /></div>
                  <div><label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-widest">رابط صفحة الفيسبوك</label><input className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-blue-500" placeholder="https://facebook.com/..." defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div><label className="text-[10px] text-slate-500 block mb-1">يوزر الإدارة</label><input className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 text-xs outline-none focus:border-blue-500" defaultValue={config.adminUser} onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} /></div>
                    <div><label className="text-[10px] text-slate-500 block mb-1">باسورد جديد</label><input className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 text-xs outline-none focus:border-blue-500" type="password" placeholder="اترك فارغاً..." onBlur={e => e.target.value && updateAdminPass(e.target.value)} /></div>
                  </div>
                </div>
              </div>

              {/* Box: Export Data */}
              <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-t-indigo-500">
                <div className="text-center md:text-right">
                  <h3 className="text-xl font-black text-white mb-1">بيانات جميع المشتركين</h3>
                  <p className="text-xs text-slate-500">تحميل ملف الإكسيل (CSV) يحتوي على جميع الإجابات وأرقام السحب.</p>
                </div>
                <button onClick={exportToCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3">
                  <Download size={22} /> تحميل البيانات
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Footer Admin Link */}
        {view === 'home' && (
          <footer className="mt-16 text-center relative z-10 animate-in fade-in duration-1000 delay-500">
            <button onClick={() => setView('admin_login')} className="text-[9px] text-slate-800 hover:text-amber-500/50 transition-colors tracking-[0.4em] flex items-center justify-center gap-1 mx-auto uppercase font-black">
              <Lock size={9} /> Secure Admin Panel
            </button>
            <p className="text-slate-700 text-[10px] mt-4 font-bold tracking-widest italic opacity-50 uppercase">Ramadan Kareem 🌙 2024</p>
          </footer>
        )}
      </div>
    </div>
  );
}