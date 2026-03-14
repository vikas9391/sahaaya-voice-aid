// src/pages/Index.tsx
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Home, Heart, BookOpen, Wheat, ArrowRight,
  Users, MapPin, Award, Briefcase, LogIn, UserCircle, LogOut, Sparkles,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-illustration.jpg';
import WelcomeBot from '@/components/WelcomeBot';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || target === 0) return;
    let start = 0;
    const inc = target / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString('en-IN')}</span>;
}

// ── Floating orb background ───────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 400, x: -10, y: -10, delay: 0,   dur: 20 },
        { size: 300, x: 70,  y: 60,  delay: 5,   dur: 25 },
        { size: 200, x: 20,  y: 80,  delay: 10,  dur: 18 },
        { size: 250, x: 85,  y: 10,  delay: 3,   dur: 22 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(27,67,50,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            delay: orb.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Particle dots ─────────────────────────────────────────────────────────────
function ParticleDots() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 10 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: d.size, height: d.size, left: `${d.x}%`, top: `${d.y}%` }}
          animate={{ opacity: [0, 1, 0], y: [0, -40, -80], scale: [0, 1, 0] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── Stagger container variants ────────────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────────────────────────────────────────
const Index = () => {
  const navigate     = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [stats, setStats]           = useState({ total_users: 0, total_schemes: 0, total_jobs: 0 });
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName]     = useState('');
  const [navScrolled, setNavScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 400], [0, -60]);  // parallax
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  // Nav shadow on scroll
  useEffect(() => {
    const unsub = scrollY.on('change', v => setNavScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  // Auth state
  useEffect(() => {
    const raw = localStorage.getItem('sahaaya_user');
    if (raw) {
      try { const u = JSON.parse(raw); setIsRegistered(true); setUserName(u.name || ''); }
      catch { setIsRegistered(false); }
    }
  }, []);

  // Stats
  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sahaaya_user');
    localStorage.removeItem('sahaaya_schemes');
    setIsRegistered(false);
    setUserName('');
  };

  const handleRegisterFresh = () => {
    localStorage.removeItem('sahaaya_user');
    localStorage.removeItem('sahaaya_schemes');
    window.location.reload();
  };

  const initials = userName
    ? userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <WelcomeBot />

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-border transition-all duration-300"
        style={{
          backgroundColor: navScrolled ? 'hsl(var(--background) / 0.95)' : 'hsl(var(--background) / 0.7)',
          backdropFilter: 'blur(16px)',
          boxShadow: navScrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo with pulse ring */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-bold text-secondary tracking-tight">Sahaaya AI</span>
          </motion.div>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={e => setLang(e.target.value as any)}
              className="text-sm bg-muted rounded-button px-3 py-1.5 border-0 text-foreground focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}
            </select>

            <motion.button
              onClick={() => navigate('/admin')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 hidden sm:block rounded-button hover:bg-muted transition-colors"
            >
              {t.admin}
            </motion.button>

            <AnimatePresence mode="wait">
              {isRegistered ? (
                <motion.div
                  key="logged-in"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
                  <motion.button
                    onClick={() => navigate('/profile')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-button text-sm font-medium transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials || <UserCircle className="w-4 h-4" />}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">{userName}</span>
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    title="Logout"
                    className="p-1.5 rounded-button text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  key="logged-out"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-button text-sm font-medium hover:opacity-90 transition shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.login || 'Login'}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative container py-14 md:py-24 overflow-hidden">
        <FloatingOrbs />
        <ParticleDots />

        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Welfare Discovery
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold text-secondary leading-tight mb-5"
            >
              {t.heroTitle}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-2">
              {t.heroSubtitle}
            </motion.p>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground mb-10 max-w-md leading-relaxed">
              {t.heroDescription}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {isRegistered ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(27,67,50,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-button text-lg font-semibold shadow-primary-glow hover:opacity-95 transition-all"
                  >
                    {t.viewProfile || 'View My Profile'} <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleRegisterFresh}
                    className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-6 py-4 rounded-button text-base font-medium hover:bg-muted/80 transition-colors border border-border"
                  >
                    {t.registerCTA || 'Register Again'}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(27,67,50,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRegisterFresh}
                    className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-button text-lg font-semibold shadow-primary-glow transition-all"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mic className="w-5 h-5" />
                    </motion.span>
                    {t.registerCTA}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 bg-card text-secondary px-6 py-4 rounded-button text-base font-medium hover:bg-muted transition-colors border border-border shadow-sm"
                  >
                    <LogIn className="w-5 h-5" />
                    {t.login || 'Already registered? Login'}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right: hero image with floating card overlays */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* Glow ring behind image */}
            <div className="absolute inset-0 rounded-card bg-primary/10 blur-3xl scale-90 translate-y-4" />

            <motion.img
              src={heroImage}
              alt="Sahaaya AI"
              className="relative rounded-card shadow-elevated w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            />

            {/* Floating stat chips on image */}
            <motion.div
              className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-card flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ y: -2 }}
            >
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Schemes</p>
                <p className="text-sm font-bold text-secondary">{stats.total_schemes || '150'}+</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-card flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ y: 2 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Families helped</p>
                <p className="text-sm font-bold text-secondary">{stats.total_users || '0'}+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section className="relative bg-secondary overflow-hidden py-10">
        {/* Subtle diagonal stripes */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="container grid grid-cols-3 gap-4 text-center relative z-10"
        >
          {[
            { icon: Award,  label: t.schemesAvailable, value: stats.total_schemes || 150, color: 'text-primary' },
            { icon: Users,  label: t.usersHelped,       value: stats.total_users   || 0,   color: 'text-primary' },
            { icon: MapPin, label: t.statesCovered,     value: 28,                          color: 'text-primary' },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="py-4 group"
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </motion.div>
              <div className="text-2xl md:text-4xl font-extrabold text-secondary-foreground">
                <AnimatedCounter target={s.value} />+
              </div>
              <div className="text-sm text-secondary-foreground/70 mt-1 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold text-secondary mb-3">{t.howItWorks}</h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border z-0">
            <motion.div
              className="h-full bg-primary/40 origin-left"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4 }}
            />
          </div>

          {[
            { icon: Mic,   title: t.stepSpeak,   desc: t.stepSpeakDesc,   num: '01' },
            { icon: Users, title: t.stepProfile, desc: t.stepProfileDesc, num: '02' },
            { icon: Award, title: t.stepMatch,   desc: t.stepMatchDesc,   num: '03' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(27,67,50,0.12)' }}
              className="relative bg-card rounded-card p-7 shadow-card text-center z-10 border border-border/50 cursor-default transition-shadow"
            >
              {/* Step number */}
              <span className="absolute top-4 right-5 text-4xl font-black text-primary/8 select-none leading-none">
                {item.num}
              </span>

              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <item.icon className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-bold text-secondary mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────────────── */}
      <section className="container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold text-secondary mb-3">{t.whatWeCover}</h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Wheat,     label: t.food,      color: 'bg-primary/10 text-primary',     glow: 'hover:shadow-[0_8px_30px_rgba(27,67,50,0.15)]' },
            { icon: Home,      label: t.housing,   color: 'bg-secondary/15 text-secondary',  glow: 'hover:shadow-[0_8px_30px_rgba(27,67,50,0.12)]' },
            { icon: Heart,     label: t.health,    color: 'bg-success/10 text-success',      glow: 'hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]' },
            { icon: BookOpen,  label: t.education, color: 'bg-warning/10 text-warning',      glow: 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)]'  },
            { icon: Briefcase, label: t.jobs,      color: 'bg-primary/10 text-primary',     glow: 'hover:shadow-[0_8px_30px_rgba(27,67,50,0.15)]' },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              className={`bg-card rounded-card p-5 shadow-warm text-center cursor-default border border-border/50 transition-all ${c.glow}`}
            >
              <motion.div
                className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-3`}
                whileHover={{ rotate: 10, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <c.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">{c.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────────── */}
      {!isRegistered && (
        <section className="container pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative bg-secondary rounded-[2rem] p-10 md:p-14 text-center overflow-hidden"
          >
            {/* Background animation */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }}
            />
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5"
              >
                <Mic className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-foreground mb-3">
                {t.heroSubtitle}
              </h2>
              <p className="text-secondary-foreground/70 mb-8 max-w-md mx-auto">
                {t.heroDescription}
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRegisterFresh}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-button text-lg font-semibold shadow-lg transition-all"
              >
                <Mic className="w-5 h-5" /> {t.registerCTA} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-secondary py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-secondary-foreground">Sahaaya AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-secondary-foreground/60">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <motion.a key={l} href="#" whileHover={{ color: 'hsl(var(--secondary-foreground))' }}
                  className="hover:text-secondary-foreground transition-colors">{l}</motion.a>
              ))}
            </div>
          </div>
          <div className="border-t border-secondary-foreground/10 pt-6 text-center">
            <p className="text-secondary-foreground/50 text-sm">{t.footer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;