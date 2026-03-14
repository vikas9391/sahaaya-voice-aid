import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, MapPin, BarChart3, Search, LogOut, Plus } from 'lucide-react';
import { DEMO_USER, SCHEMES } from '@/data/mockData';

const ADMIN_CREDENTIALS = { username: 'admin', password: 'sahaaya2024' };

const Admin = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('गलत लॉगिन / Invalid credentials');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-card p-8 shadow-elevated w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-secondary mb-1 text-center">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">NGO / Admin Login</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-button font-medium hover:opacity-90 transition">
              Login
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground text-center">
            ← वापस / Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const mockUsers = [
    DEMO_USER,
    { ...DEMO_USER, id: 'usr-002', name: 'सीता देवी', district: 'पटना', state: 'बिहार', monthly_income: 5000, schemes_matched: 9 },
    { ...DEMO_USER, id: 'usr-003', name: 'मोहन लाल', district: 'जयपुर', state: 'राजस्थान', monthly_income: 12000, schemes_matched: 5 },
    { ...DEMO_USER, id: 'usr-004', name: 'फातिमा बी', district: 'चेन्नई', state: 'तमिलनाडु', monthly_income: 7000, schemes_matched: 8 },
  ];

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary text-secondary-foreground">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Sahaaya Admin</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/post-job')} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-button text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Post Job
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'कुल पंजीकरण / Registrations', value: '4' },
            { icon: Award, label: 'योजनाएं मैच / Schemes Matched', value: '29' },
            { icon: MapPin, label: 'जिले / Districts', value: '4' },
            { icon: BarChart3, label: 'इस सप्ताह / This Week', value: '2' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-card p-4 shadow-card"
            >
              <s.icon className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold text-secondary tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="खोजें / Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground focus:outline-none text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">नाम / Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">जिला / District</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">आय / Income</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">योजनाएं / Schemes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.district}, {u.state}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">₹{u.monthly_income.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-medium">{u.schemes_matched}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
