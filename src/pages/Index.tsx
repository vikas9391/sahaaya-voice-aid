import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Home, Heart, BookOpen, Wheat, ArrowRight, Users, MapPin, Award, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-illustration.jpg';

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span className="tabular-nums">{count.toLocaleString('en-IN')}</span>;
}

const Index = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const handleDemo = () => {
    localStorage.setItem('sahaaya_user', JSON.stringify({
      id: 'demo-001', name: 'राम कुमार', district: 'वाराणसी', state: 'उत्तर प्रदेश',
      occupation: 'किसान', family_size: 5, monthly_income: 8000,
      has_disability: false, has_bpl_card: true, language: lang,
      created_at: new Date().toISOString(), schemes_matched: 7,
    }));
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-secondary">Sahaaya AI</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={e => setLang(e.target.value as any)}
              className="text-sm bg-muted rounded-button px-3 py-1.5 border-0 text-foreground focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.nativeLabel}</option>
              ))}
            </select>
            <button onClick={() => navigate('/admin')} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">
              {t.admin}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-secondary leading-tight mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              {t.heroSubtitle}
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-md">
              {t.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-button text-lg font-semibold shadow-primary-glow hover:opacity-90 transition-opacity"
              >
                <Mic className="w-5 h-5" />
                {t.registerCTA}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDemo}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 rounded-button text-lg font-semibold shadow-warm hover:opacity-90 transition-opacity"
              >
                {t.demoMode}
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <img src={heroImage} alt="Sahaaya AI - Digital India welfare platform" className="rounded-card shadow-elevated w-full" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-10">
        <div className="container grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Award, label: t.schemesAvailable, value: 150 },
            { icon: Users, label: t.usersHelped, value: 25000 },
            { icon: MapPin, label: t.statesCovered, value: 28 },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="py-4"
            >
              <s.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-bold text-secondary-foreground">
                <AnimatedCounter target={s.value} />+
              </div>
              <div className="text-sm text-secondary-foreground/70 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary text-center mb-10">
          {t.howItWorks}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Mic, title: t.stepSpeak, desc: t.stepSpeakDesc },
            { icon: Users, title: t.stepProfile, desc: t.stepProfileDesc },
            { icon: Award, title: t.stepMatch, desc: t.stepMatchDesc },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="bg-card rounded-card p-6 shadow-card text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary text-center mb-8">
          {t.whatWeCover}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Wheat, label: t.food, color: 'bg-primary/10 text-primary' },
            { icon: Home, label: t.housing, color: 'bg-secondary/10 text-secondary' },
            { icon: Heart, label: t.health, color: 'bg-success/10 text-success' },
            { icon: BookOpen, label: t.education, color: 'bg-warning/10 text-warning' },
            { icon: Briefcase, label: t.jobs, color: 'bg-primary/10 text-primary' },
          ].map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-card rounded-card p-4 shadow-warm text-center cursor-default"
            >
              <div className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center mx-auto mb-2`}>
                <c.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-foreground">{c.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-8">
        <div className="container text-center">
          <p className="text-secondary-foreground/70 text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
