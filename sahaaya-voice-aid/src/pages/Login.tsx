// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Search, Loader2, AlertCircle, User, Bot } from 'lucide-react';
import { useLanguage, LANGUAGES, type LangCode } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type LoginTab = 'phone' | 'name';

const LABELS: Record<LangCode, {
  title: string; subtitle: string; phoneTab: string; nameTab: string;
  mobilePlaceholder: string; otpLabel: string; sendOtp: string; otpSent: string; resend: string;
  signIn: string; newUser: string; namePlaceholder: string; districtPlaceholder: string;
  findProfile: string; errorPhone: string; errorOtp: string; errorNotFound: string;
  privacy: string;
}> = {
  hi: {
    title: 'Sahaaya', subtitle: 'सरकारी योजनाएं खोजें',
    phoneTab: 'फोन / आधार', nameTab: 'प्रोफाइल खोजें',
    mobilePlaceholder: 'मोबाइल नंबर (10 अंक)', otpLabel: 'OTP', sendOtp: 'OTP भेजें',
    otpSent: 'भेजा!', resend: 'फिर भेजें', signIn: 'लॉग इन करें →',
    newUser: 'नया उपयोगकर्ता? प्रोफाइल बनाएं',
    namePlaceholder: 'पूरा नाम', districtPlaceholder: 'जिला',
    findProfile: 'प्रोफाइल खोजें →', errorPhone: 'सही मोबाइल नंबर डालें',
    errorOtp: 'OTP डालें', errorNotFound: 'प्रोफाइल नहीं मिला।',
    privacy: 'गोपनीयता नीति',
  },
  en: {
    title: 'Sahaaya', subtitle: 'Find government welfare schemes',
    phoneTab: 'Phone / Aadhaar', nameTab: 'Find Profile',
    mobilePlaceholder: 'Mobile number (10 digits)', otpLabel: 'OTP (sent via SMS)', sendOtp: 'Send OTP',
    otpSent: 'Sent!', resend: 'Resend', signIn: 'Sign in →',
    newUser: 'New user? Create profile',
    namePlaceholder: 'Full name', districtPlaceholder: 'District',
    findProfile: 'Find my profile →', errorPhone: 'Enter a valid mobile number',
    errorOtp: 'Enter the OTP', errorNotFound: 'No profile found. Please register first.',
    privacy: 'Privacy policy',
  },
  ta: {
    title: 'Sahaaya', subtitle: 'அரசு நலத்திட்டங்கள்',
    phoneTab: 'தொலைபேசி', nameTab: 'சுயவிவரம் கண்டுபிடி',
    mobilePlaceholder: 'கைபேசி எண்', otpLabel: 'OTP', sendOtp: 'OTP அனுப்பு',
    otpSent: 'அனுப்பப்பட்டது!', resend: 'மீண்டும் அனுப்பு', signIn: 'உள்நுழை →',
    newUser: 'புதிய பயனர்? சுயவிவரம் உருவாக்கு',
    namePlaceholder: 'முழு பெயர்', districtPlaceholder: 'மாவட்டம்',
    findProfile: 'சுயவிவரம் கண்டுபிடி →', errorPhone: 'செல்லுபடியான எண் உள்ளிடவும்',
    errorOtp: 'OTP உள்ளிடவும்', errorNotFound: 'சுயவிவரம் கண்டுபிடிக்கவில்லை.',
    privacy: 'தனியுரிமைக் கொள்கை',
  },
  te: {
    title: 'Sahaaya', subtitle: 'ప్రభుత్వ సంక్షేమ పథకాలు',
    phoneTab: 'ఫోన్', nameTab: 'ప్రొఫైల్ వెతకండి',
    mobilePlaceholder: 'మొబైల్ నంబర్', otpLabel: 'OTP', sendOtp: 'OTP పంపండి',
    otpSent: 'పంపారు!', resend: 'మళ్లీ పంపండి', signIn: 'లాగిన్ →',
    newUser: 'కొత్త వినియోగదారు? ప్రొఫైల్ సృష్టించండి',
    namePlaceholder: 'పూర్తి పేరు', districtPlaceholder: 'జిల్లా',
    findProfile: 'ప్రొఫైల్ వెతకండి →', errorPhone: 'చెల్లుబాటు అయ్యే నంబర్ నమోదు చేయండి',
    errorOtp: 'OTP నమోదు చేయండి', errorNotFound: 'ప్రొఫైల్ కనుగొనబడలేదు.',
    privacy: 'గోప్యతా విధానం',
  },
  bn: {
    title: 'Sahaaya', subtitle: 'সরকারি প্রকল্প খুঁজুন',
    phoneTab: 'ফোন', nameTab: 'প্রোফাইল খুঁজুন',
    mobilePlaceholder: 'মোবাইল নম্বর', otpLabel: 'OTP', sendOtp: 'OTP পাঠান',
    otpSent: 'পাঠানো হয়েছে!', resend: 'আবার পাঠান', signIn: 'সাইন ইন →',
    newUser: 'নতুন ব্যবহারকারী? প্রোফাইল তৈরি করুন',
    namePlaceholder: 'পুরো নাম', districtPlaceholder: 'জেলা',
    findProfile: 'প্রোফাইল খুঁজুন →', errorPhone: 'সঠিক নম্বর লিখুন',
    errorOtp: 'OTP লিখুন', errorNotFound: 'প্রোফাইল পাওয়া যায়নি।',
    privacy: 'গোপনীয়তা নীতি',
  },
  mr: {
    title: 'Sahaaya', subtitle: 'सरकारी योजना शोधा',
    phoneTab: 'फोन', nameTab: 'प्रोफाइल शोधा',
    mobilePlaceholder: 'मोबाइल नंबर', otpLabel: 'OTP', sendOtp: 'OTP पाठवा',
    otpSent: 'पाठवले!', resend: 'पुन्हा पाठवा', signIn: 'लॉगिन करा →',
    newUser: 'नवीन वापरकर्ता? प्रोफाइल तयार करा',
    namePlaceholder: 'पूर्ण नाव', districtPlaceholder: 'जिल्हा',
    findProfile: 'प्रोफाइल शोधा →', errorPhone: 'योग्य नंबर टाका',
    errorOtp: 'OTP टाका', errorNotFound: 'प्रोफाइल सापडले नाही.',
    privacy: 'गोपनीयता धोरण',
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const L = LABELS[lang as LangCode] ?? LABELS['en'];

  const [tab,         setTab]         = useState<LoginTab>('phone');
  const [phone,       setPhone]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [district,    setDistrict]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // ── Send OTP ──────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (otpCooldown) return;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { setError(L.errorPhone); return; }
    setError('');
    setOtpCooldown(true);
    setOtpSent(true);

    try {
      await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
    } catch {
      // Silently fail — real SMS handled by backend; demo still works
    }

    setTimeout(() => setOtpCooldown(false), 30000);
  };

  // ── Phone/OTP login ───────────────────────────────────────────────────────────
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { setError(L.errorPhone); return; }
    if (!otp.trim())          { setError(L.errorOtp);   return; }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned, otp: otp.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('sahaaya_user',    JSON.stringify(data.user));
        if (data.schemes) {
          localStorage.setItem('sahaaya_schemes', JSON.stringify(data.schemes));
        }
        navigate('/profile');
      } else {
        setError(data.error || L.errorNotFound);
      }
    } catch {
      setError(L.errorNotFound);
    } finally {
      setLoading(false);
    }
  };

  // ── Find profile by name + district ──────────────────────────────────────────
  const handleFindProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !district.trim()) { setError('Please fill in both fields.'); return; }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch(
        `${API_URL}/api/users/search?name=${encodeURIComponent(nameInput.trim())}&district=${encodeURIComponent(district.trim())}`,
      );
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('sahaaya_user', JSON.stringify(data.user));
        if (data.schemes) {
          localStorage.setItem('sahaaya_schemes', JSON.stringify(data.schemes));
        }
        navigate('/profile');
      } else {
        setError(L.errorNotFound);
      }
    } catch {
      setError(L.errorNotFound);
    } finally {
      setLoading(false);
    }
  };

  // ── Language pills ────────────────────────────────────────────────────────────
  const LANG_LABELS: { code: LangCode; label: string }[] = [
    { code: 'hi', label: 'हिंदी'   },
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்'   },
    { code: 'te', label: 'తెలుగు'  },
    { code: 'bn', label: 'বাংলা'   },
    { code: 'mr', label: 'मराठी'   },
  ];

  const TABS: { key: LoginTab; icon: any; label: string }[] = [
    { key: 'phone', icon: Phone,  label: L.phoneTab },
    { key: 'name',  icon: Search, label: L.nameTab  },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-card rounded-[22px] shadow-card border border-border w-full max-w-sm p-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary leading-tight">{L.title}</h1>
            <p className="text-xs text-muted-foreground">{L.subtitle}</p>
          </div>
        </div>

        {/* Language chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {LANG_LABELS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                lang === l.code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground border border-border hover:border-primary/30'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-card mb-5">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setError(''); }}
              className={`flex-1 py-2 px-2 rounded-button text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === key
                  ? 'bg-secondary text-secondary-foreground shadow-warm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* ── Phone tab ── */}
        <AnimatePresence mode="wait">
          {tab === 'phone' && (
            <motion.form key="phone"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handlePhoneLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {L.mobilePlaceholder}
                </label>
                <input
                  type="tel" inputMode="numeric" maxLength={12}
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-muted border border-border rounded-button px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {L.otpLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number" inputMode="numeric" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="flex-1 bg-muted border border-border rounded-button px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                  <button type="button" onClick={handleSendOtp} disabled={otpCooldown}
                    className="whitespace-nowrap px-3 py-2.5 rounded-button border border-border bg-card text-xs font-medium text-secondary hover:bg-muted transition disabled:opacity-50">
                    {otpSent ? (otpCooldown ? L.otpSent : L.resend) : L.sendOtp}
                  </button>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-secondary text-secondary-foreground py-3 rounded-button text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {L.signIn}
              </button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button type="button" onClick={() => navigate('/')}
                className="w-full border border-border bg-card py-2.5 rounded-button text-sm font-medium text-secondary flex items-center justify-center gap-2 hover:bg-muted transition">
                <User className="w-4 h-4" /> {L.newUser}
              </button>
            </motion.form>
          )}

          {/* ── Name tab ── */}
          {tab === 'name' && (
            <motion.form key="name"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleFindProfile}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {L.namePlaceholder}
                </label>
                <input
                  type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full bg-muted border border-border rounded-button px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {L.districtPlaceholder}
                </label>
                <input
                  type="text" value={district} onChange={e => setDistrict(e.target.value)}
                  placeholder="Varanasi"
                  className="w-full bg-muted border border-border rounded-button px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-secondary text-secondary-foreground py-3 rounded-button text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {L.findProfile}
              </button>

              <button type="button" onClick={() => navigate('/')}
                className="w-full border border-border bg-card py-2.5 rounded-button text-sm font-medium text-secondary flex items-center justify-center gap-2 hover:bg-muted transition">
                <User className="w-4 h-4" /> {L.newUser}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          By signing in you agree to our{' '}
          <a href="#" className="text-primary hover:underline font-medium">{L.privacy}</a>.
          Your data stays secure.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;