import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Phone, MapPin, Filter, Briefcase, Heart, Home, BookOpen, Wheat, ChevronLeft, Users } from 'lucide-react';
import { SCHEMES, JOBS, AID_CENTERS, matchSchemes, type UserProfile, type Scheme, type Job, type AidCenter } from '@/data/mockData';
import MapView from '@/components/MapView';

type TabKey = 'schemes' | 'jobs' | 'aid';
type SchemeFilter = 'all' | 'central' | 'state' | 'food' | 'housing' | 'health' | 'education' | 'employment';

const CATEGORY_ICONS: Record<string, any> = { food: Wheat, housing: Home, health: Heart, education: BookOpen, employment: Briefcase };

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('schemes');
  const [schemeFilter, setSchemeFilter] = useState<SchemeFilter>('all');
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sahaaya_user');
    if (saved) {
      const u = JSON.parse(saved) as UserProfile;
      setUser(u);
      const matched = matchSchemes(u);
      setMatchedSchemes(matched);
      u.schemes_matched = matched.length;
      localStorage.setItem('sahaaya_user', JSON.stringify(u));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const filteredSchemes = matchedSchemes.filter(s => {
    if (schemeFilter === 'all') return true;
    if (schemeFilter === 'central') return s.is_central;
    if (schemeFilter === 'state') return !s.is_central;
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

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const qrData = `${window.location.origin}/verify/${user.id}`;

  const TABS: { key: TabKey; label: string; labelEn: string }[] = [
    { key: 'schemes', label: 'योजनाएं', labelEn: 'Schemes' },
    { key: 'jobs', label: 'नौकरी', labelEn: 'Jobs' },
    { key: 'aid', label: 'सहायता केंद्र', labelEn: 'Aid Centers' },
  ];

  const SCHEME_FILTERS: { key: SchemeFilter; label: string }[] = [
    { key: 'all', label: 'सभी / All' },
    { key: 'central', label: 'केंद्रीय / Central' },
    { key: 'food', label: 'खाद्य / Food' },
    { key: 'housing', label: 'आवास / Housing' },
    { key: 'health', label: 'स्वास्थ्य / Health' },
    { key: 'education', label: 'शिक्षा / Education' },
    { key: 'employment', label: 'रोज़गार / Employment' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container py-6">
          <button onClick={() => navigate('/')} className="text-secondary-foreground/70 text-sm mb-4 flex items-center gap-1 hover:text-secondary-foreground">
            <ChevronLeft className="w-4 h-4" /> वापस / Back
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{user.name}</h1>
              <p className="text-secondary-foreground/70 flex items-center gap-1 text-sm">
                <MapPin className="w-3 h-3" /> {user.district}, {user.state}
              </p>
              <p className="text-secondary-foreground/70 text-xs mt-1">ID: {user.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-6 grid md:grid-cols-[280px_1fr] gap-6">
        {/* QR Card */}
        <div className="bg-card rounded-card p-6 shadow-card self-start">
          <h3 className="font-semibold text-secondary mb-3 text-center">आपका QR कोड</h3>
          <div ref={qrRef} className="flex justify-center mb-3">
            <QRCodeSVG value={qrData} size={180} bgColor="#FFFFFF" fgColor="#1B4332" level="M" />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-3">
            {user.name} • {user.district}<br />
            {matchedSchemes.length} योजनाएं / schemes matched
          </p>
          <button onClick={downloadQR} className="w-full bg-secondary text-secondary-foreground py-2 rounded-button text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <Download className="w-4 h-4" /> Download QR
          </button>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>परिवार / Family</span><span className="font-medium text-foreground">{user.family_size} सदस्य</span></div>
            <div className="flex justify-between"><span>आय / Income</span><span className="font-medium text-foreground">₹{user.monthly_income.toLocaleString('en-IN')}/माह</span></div>
            <div className="flex justify-between"><span>BPL कार्ड</span><span className="font-medium text-foreground">{user.has_bpl_card ? 'हाँ ✓' : 'नहीं'}</span></div>
            <div className="flex justify-between"><span>विकलांगता</span><span className="font-medium text-foreground">{user.has_disability ? 'हाँ ✓' : 'नहीं'}</span></div>
          </div>
        </div>

        {/* Tabs Content */}
        <div>
          {/* Tab Nav */}
          <div className="flex gap-1 bg-muted p-1 rounded-card mb-6">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2.5 px-3 rounded-button text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? 'bg-secondary text-secondary-foreground shadow-warm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="block">{t.label}</span>
                <span className="block text-xs opacity-70">{t.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Schemes Tab */}
          {activeTab === 'schemes' && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                {SCHEME_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setSchemeFilter(f.key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      schemeFilter === f.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredSchemes.map((s, i) => {
                  const Icon = CATEGORY_ICONS[s.category] || Briefcase;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="bg-card rounded-card p-4 shadow-card"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-secondary text-sm">{s.name_hi}</h4>
                            <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-medium">पात्र ✓</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{s.name_en} • {s.ministry}</p>
                          <p className="text-xs text-foreground/80 mb-2">{s.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary tabular-nums">{s.benefit_amount}</span>
                            <a
                              href={s.apply_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-button text-xs font-medium hover:opacity-90 transition"
                            >
                              आवेदन करें <ExternalLink className="w-3 h-3" />
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
                    <p>इस श्रेणी में कोई योजना नहीं मिली</p>
                    <p className="text-xs">No schemes found in this category</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <div className="space-y-3 mb-6">
                {JOBS.map((j, i) => (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-card p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-secondary text-sm">{j.title}</h4>
                        <p className="text-xs text-muted-foreground">{j.employer_name} • {j.district}, {j.state}</p>
                      </div>
                      <span className="bg-success/10 text-success text-sm font-bold px-3 py-1 rounded-full tabular-nums">
                        ₹{j.daily_wage}/day
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 mb-3">{j.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{j.sector}</span>
                      <a href={`tel:${j.contact_number}`} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-button text-xs font-medium">
                        <Phone className="w-3 h-3" /> कॉल करें
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-card overflow-hidden shadow-card" style={{ height: 300 }}>
                <MapView markers={JOBS.filter(j => j.lat && j.lng).map(j => ({ lat: j.lat!, lng: j.lng!, label: `${j.title} - ₹${j.daily_wage}/day` }))} center={[22, 78]} zoom={5} />
              </div>
            </div>
          )}

          {/* Aid Centers Tab */}
          {activeTab === 'aid' && (
            <div>
              <div className="space-y-3 mb-6">
                {AID_CENTERS.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-card p-4 shadow-card"
                  >
                    <h4 className="font-semibold text-secondary text-sm mb-1">{a.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {a.address}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {a.services.map(s => (
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
                <MapView markers={AID_CENTERS.map(a => ({ lat: a.lat, lng: a.lng, label: a.name }))} center={[22, 78]} zoom={5} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
