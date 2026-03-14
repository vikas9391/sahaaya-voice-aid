import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { matchSchemes, type UserProfile } from '@/data/mockData';
import { CheckCircle, MapPin, Calendar, Shield } from 'lucide-react';

const Verify = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [aided, setAided] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sahaaya_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.id === userId || userId === 'demo-001') {
        setUser(u);
      }
    }
  }, [userId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-card p-8 shadow-card text-center max-w-md">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary mb-2">उपयोगकर्ता नहीं मिला</h2>
          <p className="text-muted-foreground text-sm">User not found. The QR code may be invalid.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-button text-sm font-medium">
            होम पेज / Home
          </button>
        </div>
      </div>
    );
  }

  const schemes = matchSchemes(user);
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-card shadow-elevated p-6 print:shadow-none">
          <div className="text-center border-b border-border pb-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">SAHAAYA AI — VERIFICATION</p>
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-3">
              {initials}
            </div>
            <h1 className="text-2xl font-bold text-secondary">{user.name}</h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {user.district}, {user.state}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" /> पंजीकरण / Registered: {new Date(user.created_at).toLocaleDateString('hi-IN')}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-secondary mb-2">पात्र योजनाएं / Eligible Schemes ({schemes.length})</h3>
            <div className="space-y-1">
              {schemes.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span className="text-foreground">{s.name_hi}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <QRCodeSVG value={`${window.location.origin}/verify/${user.id}`} size={120} bgColor="#FFFFFF" fgColor="#1B4332" />
          </div>

          {!aided ? (
            <button
              onClick={() => setAided(true)}
              className="w-full bg-success text-success-foreground py-3 rounded-button font-medium hover:opacity-90 transition"
            >
              ✓ Mark as Aided / सहायता दी गई
            </button>
          ) : (
            <div className="bg-success/10 text-success text-center py-3 rounded-button font-medium">
              ✓ सहायता दर्ज की गई / Marked as Aided
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
