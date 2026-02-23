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
  Navigation
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

// --- Component: Advanced Animated Background ---
const AnimatedBackground = () => {
  const stars = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  const lanterns = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    top: `${20 + Math.random() * 60}%`,
    duration: `${6 + Math.random() * 4}s`,
    delay: `${Math.random() * 10}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
      <style>{`
        @keyframes floatMoon {
          0%, 100% { transform: translateY(0) rotate(12deg); filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.4)); }
          50% { transform: translateY(-30px) rotate(15deg); filter: drop-shadow(0 0 60px rgba(245, 158, 11, 0.6)); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes fallingStar {
          0% { transform: translateY(-10vh) translateX(0) rotate(45deg) scale(0); opacity: 0; }
          5% { opacity: 0.8; scale: 1; }
          100% { transform: translateY(110vh) translateX(-40vw) rotate(45deg) scale(0.2); opacity: 0; }
        }
        @keyframes swayLantern {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); opacity: 0.4; }
          50% { transform: translate(10px, -20px) rotate(5deg); opacity: 0.7; }
        }
        @keyframes bgGlow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.4; }
        }
        .animate-moon { animation: floatMoon 8s ease-in-out infinite; }
        .star-item { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--duration) ease-in-out infinite; }
        .falling-item {
          position: absolute;
          width: 2px;
          height: 120px;
          background: linear-gradient(to bottom, transparent, #f59e0b);
          opacity: 0;
          animation: fallingStar 4s linear infinite;
        }
        .lantern-item {
          position: absolute;
          animation: swayLantern var(--duration) ease-in-out infinite;
          color: #fbbf24;
        }
      `}</style>

      {/* Deep Space Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animation-delay-2000 animate-pulse"></div>

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="star-item" style={{ top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`, '--duration': s.duration, animationDelay: s.delay }} />
      ))}

      {/* Falling Stars */}
      <div className="falling-item" style={{ top: '10%', left: '80%', animationDelay: '2s' }}></div>
      <div className="falling-item" style={{ top: '5%', left: '40%', animationDelay: '7s' }}></div>

      {/* Floating Lanterns */}
      {lanterns.map(l => (
        <div key={l.id} className="lantern-item" style={{ left: l.left, top: l.top, '--duration': l.duration, animationDelay: l.delay }}>
          <Sparkles size={24} className="opacity-60" />
        </div>
      ))}

      {/* The Moon */}
      <div className="absolute top-10 left-10 text-amber-400/30 animate-moon lg:opacity-100">
        <Moon size={220} fill="currentColor" />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
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

  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [uniqueId, setUniqueId] = useState(null);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', facebook: '', answer: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
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
      await setDoc(responseRef, { ...formData, uniqueId: newId, timestamp: new Date().toISOString(), userId: user.uid });
      setUniqueId(newId);
      setView('success');
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    link.setAttribute("download", `contest_results.csv`);
    link.click();
  };

  if (loading && view !== 'success') {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-amber-500">
        <Sparkles className="w-12 h-12 animate-pulse mb-4" />
        <p className="animate-pulse font-black text-xl tracking-widest uppercase">رمضان يجمعنا...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden flex flex-col justify-center py-10" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        {view !== 'admin_dashboard' && (
          <header className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/40 transition-all"></div>
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden transform hover:rotate-3 transition-transform">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-amber-400 flex flex-col items-center">
                    <Moon size={40} className="fill-current animate-pulse" />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-widest">KAREEM</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-3 drop-shadow-2xl">مسابقة رمضان</h1>
            <p className="text-amber-100/60 text-lg sm:text-xl font-medium tracking-wide">أجب، اربح، واحتفل ببركة الشهر الكريم</p>
          </header>
        )}

        {/* --- View: Home --- */}
        {view === 'home' && (
          <main className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
            {/* Status Bar */}
            <div className={`group p-1 rounded-2xl bg-gradient-to-r ${isLive ? 'from-emerald-500/40 to-emerald-800/40' : 'from-rose-500/40 to-rose-800/40'} border border-white/10 shadow-2xl backdrop-blur-md`}>
              <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></div>
                  <span className="text-base font-black tracking-tight">{isLive ? 'المسابقة متاحة الآن' : 'المسابقة مغلقة حالياً'}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-2 font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                    <Timer size={16} />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-amber-400 font-bold text-lg italic tracking-widest">سؤال اليوم:</h2>
              </div>

              <p className="text-2xl sm:text-4xl font-black leading-[1.3] mb-12 text-slate-50 min-h-[8rem] drop-shadow-lg">
                {isLive ? config.currentQuestion.text : `برجاء انتظار السؤال الجديد في تمام الساعة ${config.startHour > 12 ? config.startHour - 12 : config.startHour} مساءً`}
              </p>
              
              {isLive ? (
                <button 
                  onClick={() => setView('form')}
                  className="relative overflow-hidden w-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-slate-950 font-black py-5 sm:py-6 rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_50px_rgba(245,158,11,0.3)] text-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span>أجب الآن واربح معنا</span>
                  <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/10 animate-pulse">
                  <p className="text-amber-200/60 text-sm sm:text-base leading-relaxed">
                    تقبل الله طاعاتكم.. المسابقة تفتح يومياً <br/>
                    من <span className="text-amber-400 font-black">{config.startHour > 12 ? config.startHour - 12 : config.startHour}</span> 
                    إلى <span className="text-amber-400 font-black">{config.endHour > 12 ? config.endHour - 12 : config.endHour}</span> مساءً
                  </p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* --- View: Form --- */}
        {view === 'form' && (
          <main className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl animate-in slide-in-from-left-12 duration-700 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[60px]"></div>
             
             <button onClick={() => setView('home')} className="text-slate-400 hover:text-amber-400 mb-8 flex items-center gap-2 text-sm font-bold transition-all group">
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} /> العودة للسؤال
            </button>
            
            <h2 className="text-3xl font-black mb-10 text-white flex items-center gap-4">
               <div className="w-1 h-8 bg-amber-500 rounded-full"></div>
               سجل بياناتك للمشاركة
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-black mr-2 uppercase tracking-widest">الاسم الثلاثي</label>
                  <div className="relative group">
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-14 pl-5 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="اكتب اسمك بالكامل هنا..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-black mr-2 uppercase tracking-widest">رقم الموبايل</label>
                    <div className="relative group">
                      <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                      <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-14 pl-5 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="01xxxxxxxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-black mr-2 uppercase tracking-widest">رابط الفيسبوك</label>
                    <div className="relative group">
                      <Facebook className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                      <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-14 pl-5 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="facebook.com/id" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-black mr-2 uppercase tracking-widest">العنوان</label>
                  <div className="relative group">
                    <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-14 pl-5 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="المحافظة - المدينة - المنطقة" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] text-amber-400 font-black mr-2 uppercase tracking-widest">الإجابة على السؤال</label>
                  <textarea required rows="3" className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-6 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all resize-none placeholder:text-slate-600 text-lg" placeholder="اكتب إجابتك الصحيحة هنا بكل دقة..." value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
                </div>
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] flex items-start gap-4">
                <AlertCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                <p className="text-[12px] text-blue-200/70 leading-relaxed italic font-medium">تنبيه: السحب يتم عشوائياً بين أصحاب الإجابات الصحيحة الذين قاموا بمتابعة الصفحة الرسمية.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_40px_rgba(16,185,129,0.2)] text-xl">
                {loading ? 'جاري تأمين بياناتك...' : <><Send size={26} /> تأكيد المشاركة في السحب</>}
              </button>
            </form>
          </main>
        )}

        {/* --- View: Success --- */}
        {view === 'success' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border-2 border-emerald-500/50 rounded-[4rem] p-12 sm:p-16 text-center shadow-[0_0_80px_rgba(16,185,129,0.1)] animate-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            <div className="relative w-28 h-28 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner group">
              <CheckCircle2 size={70} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">مبارك! تم التسجيل</h2>
            <p className="text-slate-400 mb-10 text-lg sm:text-xl font-medium">لقد انضممت رسمياً للمشاركين في مسابقة اليوم.</p>
            
            <div className="bg-slate-950/60 rounded-[3rem] p-8 sm:p-10 mb-10 border border-white/10 shadow-2xl relative">
              <p className="text-[12px] text-amber-400/60 mb-3 uppercase tracking-[0.3em] font-black">رقم السحب الذهبي</p>
              <p className="text-7xl sm:text-8xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">#{uniqueId}</p>
              <div className="mt-8 flex items-center justify-center gap-3 text-amber-400/80 bg-amber-400/5 py-4 px-6 rounded-2xl border border-amber-400/10 animate-pulse">
                <Camera size={22} />
                <p className="text-[13px] font-black">احتفظ بهذا الرقم (سكرين شوت)</p>
              </div>
            </div>

            <div className="space-y-6">
              <a href={config.pageLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-4 w-full py-6 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-[2rem] font-black transition-all shadow-xl text-xl group">
                <Facebook size={28} /> 
                <span>تابع النتائج على فيسبوك</span>
                <ExternalLink size={18} className="opacity-60 group-hover:translate-x-[-4px] transition-transform" />
              </a>
              <button onClick={() => setView('home')} className="text-slate-500 text-xs font-black hover:text-amber-400 transition-colors uppercase tracking-[0.4em]">العودة للرئيسية</button>
            </div>
          </main>
        )}

        {/* --- View: Admin Login --- */}
        {view === 'admin_login' && (
          <main className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in duration-500">
            <button onClick={() => setView('home')} className="text-slate-500 hover:text-amber-400 mb-8 flex items-center gap-2 text-sm font-black transition-all group">
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} /> الخروج
            </button>
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                 <Lock size={32} />
               </div>
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
          <main className="animate-in slide-in-from-bottom-12 duration-700 space-y-6 pb-28">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/40 backdrop-blur-2xl py-6 z-20 border-b border-white/5 px-4 rounded-b-[2rem]">
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-3"><Settings size={32} /> لوحة الإدارة</h2>
              <button onClick={() => setView('home')} className="text-rose-400 text-xs font-black bg-rose-500/10 px-6 py-3 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">تسجيل خروج</button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Question Editor */}
              <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl border-t-4 border-t-amber-500">
                <div className="flex items-center gap-3 mb-6">
                  <Send className="text-amber-500" size={24} />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">سؤال المسابقة الحالي</h3>
                </div>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-amber-500 text-white text-lg h-32 transition-all shadow-inner" defaultValue={config.currentQuestion.text} onBlur={(e) => updateGlobalSettings({ currentQuestion: { text: e.target.value, id: Date.now() } })}></textarea>
                <p className="mt-3 text-[10px] text-slate-500 italic font-bold">سيتم التحديث فور الضغط خارج المربع.</p>
              </div>

              {/* Time Configuration */}
              <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl border-t-4 border-t-emerald-500">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="text-emerald-500" size={24} />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">الجدولة الزمنية (24h)</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase mr-2">وقت البدء</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center font-black text-xl" defaultValue={config.startHour} onBlur={(e) => updateGlobalSettings({ startHour: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase mr-2">وقت القفل</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center font-black text-xl" defaultValue={config.endHour} onBlur={(e) => updateGlobalSettings({ endHour: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>

              {/* Branding & Social */}
              <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl border-t-4 border-t-blue-500 space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-blue-500" size={24} />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">الهوية والأمان</h3>
                </div>
                <div className="space-y-4">
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold" placeholder="رابط اللوجو (صورة مباشرة)" defaultValue={config.logoUrl} onBlur={(e) => updateGlobalSettings({ logoUrl: e.target.value })} />
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold" placeholder="رابط صفحة الفيسبوك" defaultValue={config.pageLink} onBlur={(e) => updateGlobalSettings({ pageLink: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <input className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black" placeholder="يوزر الإدارة الجديد" onBlur={e => e.target.value && updateGlobalSettings({adminUser: e.target.value})} />
                    <input className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black" type="password" placeholder="باسورد الإدارة الجديد" onBlur={e => e.target.value && updateAdminPass(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center text-center gap-8 border-t-4 border-t-indigo-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">قاعدة بيانات المشتركين</h3>
                  <p className="text-slate-400 max-w-xs font-medium">تحميل جميع البيانات (الإجابات، الأرقام، الهواتف) في ملف Excel واحد للسحب اليومي.</p>
                </div>
                <button onClick={exportToCSV} className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 text-xl">
                  <Download size={28} />
                  <span>تحميل كشف CSV</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Footer Admin Link */}
        {view === 'home' && (
          <footer className="mt-16 text-center relative z-10 animate-in fade-in duration-1000 delay-500 opacity-20 hover:opacity-100 transition-opacity">
            <button onClick={() => setView('admin_login')} className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors tracking-[0.6em] flex items-center justify-center gap-2 mx-auto uppercase font-black italic">
              <Lock size={10} /> Access Control
            </button>
            <p className="text-slate-700 text-[9px] mt-6 font-black tracking-[0.2em] italic uppercase">© 2024 Ramadan Al-Khair</p>
          </footer>
        )}
      </div>

      {/* Global Shimmer Animation Style */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}