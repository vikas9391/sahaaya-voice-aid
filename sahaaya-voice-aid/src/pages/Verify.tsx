// src/pages/Verify.tsx
// Updated: fetches user from backend API by ID (for NGO QR scan)
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, MapPin, Calendar, Shield, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Verify = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [aided, setAided] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) { setNotFound(true); setLoading(false); return; }

    const loadUser = async () => {
      setLoading(true);

      // 1. Try backend API first
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}`);
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Also fetch matched schemes
          const matchRes = await fetch(`${API_URL}/api/match-schemes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: data.user }),
          });
          const matchData = await matchRes.json();
          if (matchData.success) setSchemes(matchData.schemes);
          setLoading(false);
          return;
        }
      } catch {}

      // 2. Fallback: check localStorage (demo mode / offline)
      const saved = localStorage.getItem('sahaaya_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.id === userId || userId === 'demo-001') {
          setUser(u);
          // Use cached schemes
          const cachedSchemes = localStorage.getItem('sahaaya_schemes');
          if (cachedSchemes) {
            try { setSchemes(JSON.parse(cachedSchemes)); } catch {}
          }
          setLoading(false);
          return;
        }
      }

      // 3. Not found
      setNotFound(true);
      setLoading(false);
    };

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifying user...</span>
        </div>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-card p-8 shadow-card text-center max-w-md">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary mb-2">{t.userNotFound}</h2>
          <p className="text-muted-foreground text-sm">{t.userNotFoundDesc}</p>
          <button onClick={() => navigate('/')}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-button text-sm font-medium">
            {t.homePage}
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-card shadow-elevated p-6 print:shadow-none">

          {/* Header */}
          <div className="text-center border-b border-border pb-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">SAHAAYA AI — {t.verification?.toUpperCase()}</p>
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-3">
              {initials}
            </div>
            <h1 className="text-2xl font-bold text-secondary">{user.name}</h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {user.district}, {user.state}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              {t.registered}: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ID: {user.id?.slice(0, 8)}</p>
          </div>

          {/* Profile details */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-muted rounded-button px-3 py-2">
              <span className="text-muted-foreground">Occupation: </span>
              <span className="font-medium text-foreground">{user.occupation || '—'}</span>
            </div>
            <div className="bg-muted rounded-button px-3 py-2">
              <span className="text-muted-foreground">Income: </span>
              <span className="font-medium text-foreground">₹{user.monthly_income?.toLocaleString('en-IN')}/mo</span>
            </div>
            <div className="bg-muted rounded-button px-3 py-2">
              <span className="text-muted-foreground">BPL Card: </span>
              <span className="font-medium text-foreground">{user.has_bpl_card ? 'Yes ✓' : 'No'}</span>
            </div>
            <div className="bg-muted rounded-button px-3 py-2">
              <span className="text-muted-foreground">Family: </span>
              <span className="font-medium text-foreground">{user.family_size} members</span>
            </div>
          </div>

          {/* Eligible schemes */}
          {schemes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-secondary mb-2">{t.eligibleSchemes} ({schemes.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {schemes.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    <span className="text-foreground">{s.name_hindi || s.name_hi || s.name_english}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR code */}
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={`${window.location.origin}/verify/${user.id}`} size={120} bgColor="#FFFFFF" fgColor="#1B4332" />
          </div>

          {/* Mark as aided button */}
          {!aided ? (
            <button onClick={() => setAided(true)}
              className="w-full bg-success text-success-foreground py-3 rounded-button font-medium hover:opacity-90 transition">
              ✓ {t.markAsAided}
            </button>
          ) : (
            <div className="bg-success/10 text-success text-center py-3 rounded-button font-medium">
              ✓ {t.markedAsAided}
            </div>
          )}

          <button onClick={() => window.print()}
            className="w-full mt-2 bg-muted text-muted-foreground py-2 rounded-button text-sm hover:opacity-80 transition">
            🖨️ Print Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;