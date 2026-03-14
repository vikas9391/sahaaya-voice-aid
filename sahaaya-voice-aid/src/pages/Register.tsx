// src/pages/Profile.tsx
// Updated: loads real schemes from backend API + real jobs + aid centers
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Phone, MapPin, Filter, Briefcase, Heart, Home, BookOpen, Wheat, ChevronLeft, Loader2 } from 'lucide-react';
import { type UserProfile, type Scheme, type Job, type AidCenter, JOBS, AID_CENTERS } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import MapView from '@/components/MapView';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type TabKey = 'schemes' | 'jobs' | 'aid';
type SchemeFilter = 'all' | 'central' | 'food' | 'housing' | 'health' | 'education' | 'employment';

const CATEGORY_ICONS: Record<string, any> = {
  food: Wheat, housing: Home, health: Heart, education: BookOpen, employment: Briefcase,
};

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('schemes');
  const [schemeFilter, setSchemeFilter] = useState<SchemeFilter>('all');
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [jobs, setJobs] = useState<Job[]>(JOBS); // start with mock, replace with real
  const [aidCenters, setAidCenters] = useState<AidCenter[]>(AID_CENTERS);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingAid, setLoadingAid] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Load user + schemes
  useEffect(() => {
    const saved = localStorage.getItem('sahaaya_user');
    if (!saved) { navigate('/'); return; }
    const u = JSON.parse(saved) as UserProfile;
    setUser(u);

    // Try cached schemes first (set by Register.tsx)
    const cachedSchemes = localStorage.getItem('sahaaya_schemes');
    if (cachedSchemes) {
      try {
        setMatchedSchemes(JSON.parse(cachedSchemes));
        return;
      } catch {}
    }

    // Fetch from backend if no cache
    fetchSchemes(u);
  }, [navigate]);

  const fetchSchemes = async (u: UserProfile) => {
    setLoadingSchemes(true);
    try {
      const res = await fetch(`${API_URL}/api/match-schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: u }),
      });
      const data = await res.json();
      if (data.success) {
        setMatchedSchemes(data.schemes);
        localStorage.setItem('sahaaya_schemes', JSON.stringify(data.schemes));
      }
    } catch (err) {
      console.error('Scheme fetch error:', err);
      // Keep mock data schemes as fallback — import from mockData
      const { matchSchemes: localMatch } = await import('@/data/mockData');
      setMatchedSchemes(localMatch(u) as any);
    } finally {
      setLoadingSchemes(false);
    }
  };

  // Fetch real jobs when Jobs tab is opened
  useEffect(() => {
    if (activeTab !== 'jobs' || !user) return;
    setLoadingJobs(true);
    fetch(`${API_URL}/api/jobs?district=${encodeURIComponent(user.district || '')}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.jobs?.length > 0) setJobs(data.jobs);
      })
      .catch(() => {}) // keep mock data on error
      .finally(() => setLoadingJobs(false));
  }, [activeTab, user]);

  // Fetch real aid centers when Aid tab is opened
  useEffect(() => {
    if (activeTab !== 'aid' || !user) return;
    setLoadingAid(true);
    fetch(`${API_URL}/api/aid-centers?district=${encodeURIComponent(user.district || '')}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.centers?.length > 0) setAidCenters(data.centers);
      })
      .catch(() => {})
      .finally(() => setLoadingAid(false));
  }, [activeTab, user]);

  const filteredSchemes = matchedSchemes.filter(s => {
    if (schemeFilter === 'all') return true;
    if (schemeFilter === 'central') return s.is_central;
    return s.category === schemeFilter;
  });

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement('a');
      a.download = `sahaaya-${user?.id || 'qr'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
  const qrData = `${window.location.origin}/verify/${user.id}`;

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'schemes', label: t.schemes },
    { key: 'jobs', label: t.jobsTab },
    { key: 'aid', label: t.aidCenters },
  ];

  const SCHEME_FILTERS: { key: SchemeFilter; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'central', label: t.central },
    { key: 'food', label: t.food },
    { key: 'housing', label: t.housing },
    { key: 'health', label: t.health },
    { key: 'education', label: t.education },
    { key: 'employment', label: t.jobs },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-secondary text-secondary-foreground">
        <div className="container py-6">
          <button onClick={() => navigate('/')} className="text-secondary-foreground/70 text-sm mb-4 flex items-center gap-1 hover:text-secondary-foreground">
            <ChevronLeft className="w-4 h-4" /> {t.back}
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{user.name}</h1>
              <p className="text-secondary-foreground/70 flex items-center gap-1 text-sm">
                <MapPin className="w-3 h-3" /> {user.district}, {user.state}
              </p>
              <p className="text-secondary-foreground/70 text-xs mt-1">ID: {user.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-6 grid md:grid-cols-[280px_1fr] gap-6">
        {/* QR Card */}
        <div className="bg-card rounded-card p-6 shadow-card self-start">
          <h3 className="font-semibold text-secondary mb-3 text-center">{t.yourQRCode}</h3>
          <div ref={qrRef} className="flex justify-center mb-3">
            <QRCodeSVG value={qrData} size={180} bgColor="#FFFFFF" fgColor="#1B4332" level="M" />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-3">
            {user.name} • {user.district}<br />
            {matchedSchemes.length} {t.schemesMatched}
          </p>
          <button onClick={downloadQR} className="w-full bg-secondary text-secondary-foreground py-2 rounded-button text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <Download className="w-4 h-4" /> {t.downloadQR}
          </button>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>{t.family}</span><span className="font-medium text-foreground">{user.family_size} {t.members}</span></div>
            <div className="flex justify-between"><span>{t.income}</span><span className="font-medium text-foreground">₹{user.monthly_income?.toLocaleString('en-IN')}{t.perMonth}</span></div>
            <div className="flex justify-between"><span>{t.bplCard}</span><span className="font-medium text-foreground">{user.has_bpl_card ? t.yes : t.no}</span></div>
            <div className="flex justify-between"><span>{t.disability}</span><span className="font-medium text-foreground">{user.has_disability ? t.yes : t.no}</span></div>
          </div>
        </div>

        <div>
          <div className="flex gap-1 bg-muted p-1 rounded-card mb-6">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-3 rounded-button text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-secondary text-secondary-foreground shadow-warm' : 'text-muted-foreground hover:text-foreground'
                }`}>{tab.label}</button>
            ))}
          </div>

          {/* SCHEMES TAB */}
          {activeTab === 'schemes' && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                {SCHEME_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setSchemeFilter(f.key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      schemeFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
                    }`}>{f.label}</button>
                ))}
              </div>

              {loadingSchemes ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{user.language === 'hi' ? 'योजनाएं खोज रहे हैं...' : 'Finding schemes...'}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSchemes.map((s, i) => {
                    const Icon = CATEGORY_ICONS[s.category] || Briefcase;
                    // Support both name_hi/name_en (backend) and name_hi/name_en (mock)
                    const nameHi = (s as any).name_hindi || (s as any).name_hi || s.name_en || '';
                    const nameEn = (s as any).name_english || (s as any).name_en || '';
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }} className="bg-card rounded-card p-4 shadow-card">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-secondary text-sm">{nameHi}</h4>
                              <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-medium">{t.eligible} ✓</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{nameEn} • {s.ministry}</p>
                            <p className="text-xs text-foreground/80 mb-2">{s.description}</p>
                            {(s as any).match_reason && (
                              <p className="text-xs text-primary/80 mb-2 italic">{(s as any).match_reason}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-primary tabular-nums">{s.benefit_amount}</span>
                              <a href={s.apply_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-button text-xs font-medium hover:opacity-90 transition">
                                {t.applyNow} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredSchemes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{t.noSchemesFound}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div>
              {loadingJobs && (
                <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading jobs...</span>
                </div>
              )}
              <div className="space-y-3 mb-6">
                {jobs.map((j, i) => (
                  <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="bg-card rounded-card p-4 shadow-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-secondary text-sm">{j.title}</h4>
                        <p className="text-xs text-muted-foreground">{j.employer_name} • {j.district}, {j.state}</p>
                      </div>
                      <span className="bg-success/10 text-success text-sm font-bold px-3 py-1 rounded-full tabular-nums">₹{j.daily_wage}/day</span>
                    </div>
                    <p className="text-xs text-foreground/80 mb-3">{j.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{j.sector}</span>
                      <a href={`tel:${j.contact_number}`} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-button text-xs font-medium">
                        <Phone className="w-3 h-3" /> {t.callEmployer}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-card overflow-hidden shadow-card" style={{ height: 300 }}>
                <MapView markers={jobs.filter((j: any) => j.lat && j.lng).map((j: any) => ({ lat: j.lat, lng: j.lng, label: `${j.title} - ₹${j.daily_wage}/day` }))} center={[22, 78]} zoom={5} />
              </div>
            </div>
          )}

          {/* AID CENTERS TAB */}
          {activeTab === 'aid' && (
            <div>
              {loadingAid && (
                <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading aid centers...</span>
                </div>
              )}
              <div className="space-y-3 mb-6">
                {aidCenters.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="bg-card rounded-card p-4 shadow-card">
                    <h4 className="font-semibold text-secondary text-sm mb-1">{a.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {a.address}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {a.services.map((s: string) => (
                        <span key={s} className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>🕐 {a.timing}</span>
                      <a href={`tel:${a.contact}`} className="text-primary font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {a.contact}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-card overflow-hidden shadow-card" style={{ height: 300 }}>
                <MapView markers={aidCenters.map((a: AidCenter) => ({ lat: a.lat, lng: a.lng, label: a.name }))} center={[22, 78]} zoom={5} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;