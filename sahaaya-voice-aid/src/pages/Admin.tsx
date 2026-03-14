// src/pages/Admin.tsx
// Updated: loads real stats + users from backend API
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, MapPin, BarChart3, Search, LogOut, Plus, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'sahaaya2024' };

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total_users: 0, total_jobs: 0, total_schemes: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real stats + users after login
  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/api/admin/stats`).then(r => r.json()),
      fetch(`${API_URL}/api/users`).then(r => r.json()).catch(() => ({ success: false })),
    ])
      .then(([statsData, usersData]) => {
        if (statsData.success) setStats(statsData.stats);
        if (usersData.success && usersData.users) setUsers(usersData.users);
        else if (statsData.success?.recent_users) setUsers(statsData.stats.recent_users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true); setLoginError('');
    } else {
      setLoginError(t.invalidCredentials);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-card p-8 shadow-elevated w-full max-w-sm">
          <h1 className="text-2xl font-bold text-secondary mb-1 text-center">{t.adminPortal}</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">{t.ngoLogin}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-button font-medium hover:opacity-90 transition">
              {t.login}
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground text-center">
            ← {t.back}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary text-secondary-foreground">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Sahaaya {t.admin}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/post-job')}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-button text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> {t.postJob}
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats cards — real data from backend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users,    label: t.totalRegistrations,  value: loading ? '...' : String(stats.total_users) },
            { icon: Award,    label: t.schemesMatchedAdmin, value: loading ? '...' : String(stats.total_schemes) },
            { icon: MapPin,   label: t.districts,           value: loading ? '...' : String(new Set(users.map(u => u.district)).size || '—') },
            { icon: BarChart3, label: t.thisWeek,           value: loading ? '...' : String(stats.total_jobs) + ' jobs' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="bg-card rounded-card p-4 shadow-card">
              <s.icon className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold text-secondary tabular-nums">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Users table — real data from Supabase */}
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={t.searchUsers} value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground focus:outline-none text-sm" />
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading users from database...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {users.length === 0 ? 'No registrations yet. Users will appear here after registration.' : 'No users match your search.'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t.name}</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t.district}</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t.income}</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t.schemes}</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/verify/${u.id}`)}>
                      <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.district}, {u.state}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">₹{u.monthly_income?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-medium">{u.schemes_matched || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;