// src/pages/Admin.tsx
// Full-featured admin: view · edit · delete · scheme mgmt · stats
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Award, MapPin, Briefcase, Search, LogOut, Plus,
  Loader2, AlertCircle, RefreshCw, Pencil, Trash2, X,
  Check, ChevronDown, Eye, Database, LayoutDashboard,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ⚠️  Change before production
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRecord {
  id: string;
  name: string;
  district: string;
  state: string;
  occupation: string;
  monthly_income: number | null;
  family_size: number | null;
  age: number | null;
  gender: string | null;
  has_bpl_card: boolean;
  has_disability: boolean;
  schemes_matched: number;
  created_at: string;
}

interface SchemeRecord {
  id: string;
  name_english: string;
  name_hindi: string;
  category: string;
  eligibility_income_max: number | null;
  eligibility_bpl_required: boolean;
  eligibility_disability: boolean;
  description: string;
}

interface Stats {
  total_users: number;
  total_jobs: number;
  total_schemes: number;
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
const EditableCell = ({
  value, onSave, type = 'text', className = '',
}: {
  value: string | number | null;
  onSave: (v: string) => void;
  type?: string;
  className?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => { setEditing(false); onSave(draft); };
  const cancel = () => { setEditing(false); setDraft(String(value ?? '')); };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          className="w-full bg-background border border-primary rounded px-2 py-0.5 text-sm text-foreground focus:outline-none"
        />
        <button onClick={commit} className="text-success hover:text-success/80"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={cancel} className="text-destructive hover:text-destructive/80"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }
  return (
    <span
      className={`cursor-pointer hover:text-primary group flex items-center gap-1 ${className}`}
      onClick={() => setEditing(true)}
    >
      <span>{value ?? '—'}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </span>
  );
};

// ─── User Detail / Edit Modal ─────────────────────────────────────────────────
const UserModal = ({
  user, onClose, onSave, onDelete,
}: {
  user: UserRecord;
  onClose: () => void;
  onSave: (updated: UserRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [draft, setDraft] = useState<UserRecord>({ ...user });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key: keyof UserRecord, val: any) => setDraft(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(user.id);
    setDeleting(false);
    onClose();
  };

  const field = (label: string, key: keyof UserRecord, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={String(draft[key] ?? '')}
        onChange={e => set(key, type === 'number' ? Number(e.target.value) || null : e.target.value)}
        className="bg-background border border-border rounded-button px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
      />
    </div>
  );

  const toggle = (label: string, key: 'has_bpl_card' | 'has_disability') => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => set(key, !draft[key])}
        className={`w-10 h-5 rounded-full transition-colors relative ${draft[key] ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${draft[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card rounded-card shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
            <div>
              <h2 className="font-bold text-lg text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">ID: {user.id}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 grid grid-cols-2 gap-4">
            {field('Full Name', 'name')}
            {field('Age', 'age', 'number')}
            {field('District', 'district')}
            {field('State', 'state')}
            {field('Occupation', 'occupation')}
            {field('Monthly Income (₹)', 'monthly_income', 'number')}
            {field('Family Size', 'family_size', 'number')}

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Gender</label>
              <select
                value={draft.gender ?? ''}
                onChange={e => set('gender', e.target.value || null)}
                className="bg-background border border-border rounded-button px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-2 space-y-3 pt-2 border-t border-border">
              {toggle('BPL Card Holder', 'has_bpl_card')}
              {toggle('Person with Disability', 'has_disability')}
            </div>
          </div>

          <div className="p-5 border-t border-border flex items-center justify-between gap-3 sticky bottom-0 bg-card">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-destructive hover:bg-destructive/10 px-3 py-2 rounded-button transition"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-destructive font-medium">Sure?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="bg-destructive text-white px-3 py-1.5 rounded-button text-xs font-medium">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="text-muted-foreground hover:text-foreground px-2 py-1.5 text-xs">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-button transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-button font-medium hover:opacity-90 flex items-center gap-1.5 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Schemes Tab ──────────────────────────────────────────────────────────────
const SchemesTab = () => {
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<SchemeRecord>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/schemes`).then(r => r.json());
      if (r.success) setSchemes(r.schemes);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (s: SchemeRecord) => { setEditId(s.id); setDraft({ ...s }); };
  const cancelEdit = () => { setEditId(null); setDraft({}); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/api/schemes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }).then(r => r.json());
      if (r.success) {
        setSchemes(ss => ss.map(s => s.id === editId ? { ...s, ...draft } as SchemeRecord : s));
        cancelEdit();
      }
    } finally { setSaving(false); }
  };

  const deleteScheme = async (id: string) => {
    if (!confirm('Delete this scheme?')) return;
    await fetch(`${API_URL}/api/schemes/${id}`, { method: 'DELETE' });
    setSchemes(ss => ss.filter(s => s.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" /><span>Loading schemes…</span>
    </div>
  );

  return (
    <div className="space-y-3">
      {schemes.map(s => (
        <motion.div key={s.id} layout className="bg-card rounded-card shadow-card p-4 border border-border">
          {editId === s.id ? (
            <div className="grid grid-cols-2 gap-3">
              {(['name_english', 'name_hindi', 'category', 'description'] as const).map(k => (
                <div key={k} className={k === 'description' ? 'col-span-2' : ''}>
                  <label className="text-xs text-muted-foreground block mb-1 capitalize">{k.replace(/_/g, ' ')}</label>
                  {k === 'description'
                    ? <textarea value={String(draft[k] ?? '')} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-button px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none" rows={3} />
                    : <input type="text" value={String(draft[k] ?? '')} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-button px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                  }
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Income (₹/yr)</label>
                <input type="number" value={draft.eligibility_income_max ?? ''} onChange={e => setDraft(d => ({ ...d, eligibility_income_max: Number(e.target.value) || null }))}
                  className="w-full bg-background border border-border rounded-button px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex gap-4 items-center pt-3">
                {(['eligibility_bpl_required', 'eligibility_disability'] as const).map(k => (
                  <label key={k} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={!!draft[k]} onChange={e => setDraft(d => ({ ...d, [k]: e.target.checked }))} className="accent-primary" />
                    {k === 'eligibility_bpl_required' ? 'BPL Required' : 'Disability'}
                  </label>
                ))}
              </div>
              <div className="col-span-2 flex gap-2 justify-end mt-1">
                <button onClick={cancelEdit} className="px-3 py-1.5 text-sm border border-border rounded-button text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-button font-medium flex items-center gap-1">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm">{s.name_english}</span>
                  {s.name_hindi && <span className="text-xs text-muted-foreground">{s.name_hindi}</span>}
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{s.category}</span>
                  {s.eligibility_bpl_required && <span className="bg-warning/10 text-warning text-xs px-2 py-0.5 rounded-full">BPL</span>}
                  {s.eligibility_disability && <span className="bg-info/10 text-info text-xs px-2 py-0.5 rounded-full">Disability</span>}
                </div>
                {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                {s.eligibility_income_max && (
                  <p className="text-xs text-muted-foreground mt-0.5">Max income: ₹{s.eligibility_income_max.toLocaleString('en-IN')}/yr</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(s)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteScheme(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ))}
      {schemes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No schemes found.</div>
      )}
    </div>
  );
};

// ─── Main Admin Component ─────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tab, setTab] = useState<'users' | 'schemes'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats>({ total_users: 0, total_jobs: 0, total_schemes: 0 });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const loadData = async () => {
    setLoading(true); setError(false);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`).then(r => r.json()),
        fetch(`${API_URL}/api/users`).then(r => r.json()),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success && Array.isArray(usersRes.users)) setUsers(usersRes.users);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true); setLoginError('');
    } else {
      setLoginError(t.invalidCredentials || 'Invalid username or password');
    }
  };

  // ── Inline quick-edit (name/district directly in table) ──────────────────
  const patchUser = async (id: string, field: string, value: string) => {
    const parsed = ['monthly_income', 'family_size', 'age'].includes(field)
      ? Number(value) || null : value;
    try {
      const r = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: parsed }),
      }).then(r => r.json());
      if (r.success) {
        setUsers(us => us.map(u => u.id === id ? { ...u, [field]: parsed } : u));
      }
    } catch { /* silently ignore */ }
  };

  // ── Full save from modal ──────────────────────────────────────────────────
  const saveUser = async (updated: UserRecord) => {
    const r = await fetch(`${API_URL}/api/users/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).then(r => r.json());
    if (r.success) setUsers(us => us.map(u => u.id === updated.id ? updated : u));
  };

  const deleteUser = async (id: string) => {
    await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
    setUsers(us => us.filter(u => u.id !== id));
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueDistricts = new Set(users.map(u => u.district).filter(Boolean)).size;

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-card p-8 shadow-elevated w-full max-w-sm">
          <h1 className="text-2xl font-bold text-secondary mb-1 text-center">{t.adminPortal || 'Admin Portal'}</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">{t.ngoLogin || 'NGO / Government Login'}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" value={username}
              onChange={e => setUsername(e.target.value)} autoComplete="username"
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password"
              className="w-full bg-background border border-border rounded-button px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            <button type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-button font-medium hover:opacity-90 transition">
              {t.login || 'Login'}
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground text-center">
            ← {t.back || 'Back'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Sahaaya {t.admin || 'Admin'}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/post-job')}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-button text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> {t.postJob || 'Post Job'}
            </button>
            <button onClick={loadData} disabled={loading}
              className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setIsLoggedIn(false)}
              className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users,     label: t.totalRegistrations  || 'Total Users',   value: stats.total_users   },
            { icon: Award,     label: t.schemesMatchedAdmin || 'Total Schemes', value: stats.total_schemes },
            { icon: MapPin,    label: t.districts           || 'Districts',     value: uniqueDistricts     },
            { icon: Briefcase, label: t.activeJobs          || 'Active Jobs',   value: stats.total_jobs    },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="bg-card rounded-card p-4 shadow-card">
              <s.icon className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold text-secondary tabular-nums">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-card p-4 mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Could not connect to backend. Make sure the server is running on {API_URL}.
            <button onClick={loadData} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-muted p-1 rounded-button w-fit">
          {[
            { key: 'users' as const, label: 'Users', icon: LayoutDashboard },
            { key: 'schemes' as const, label: 'Schemes', icon: Database },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-all ${
                tab === key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type="text" placeholder={t.searchUsers || 'Search by name, district or state…'}
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground focus:outline-none text-sm" />
              <span className="text-xs text-muted-foreground shrink-0">{filtered.length} users</span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading from database…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {users.length === 0
                    ? 'No registrations yet. Users will appear here after they complete onboarding.'
                    : 'No users match your search.'}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {['Name', 'Location', 'Occupation', 'Income', 'Schemes', 'Registered', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        {/* Inline editable name */}
                        <td className="px-4 py-3 font-medium text-foreground">
                          <EditableCell value={u.name} onSave={v => patchUser(u.id, 'name', v)} />
                        </td>
                        {/* Inline editable district */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <EditableCell
                            value={[u.district, u.state].filter(Boolean).join(', ')}
                            onSave={v => patchUser(u.id, 'district', v)}
                          />
                        </td>
                        {/* Inline editable occupation */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <EditableCell value={u.occupation || null} onSave={v => patchUser(u.id, 'occupation', v)} />
                        </td>
                        {/* Inline editable income */}
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          <EditableCell
                            value={u.monthly_income ?? null}
                            onSave={v => patchUser(u.id, 'monthly_income', v)}
                            type="number"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-medium">
                            {u.schemes_matched ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/verify/${u.id}`)}
                              title="View profile"
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedUser(u)}
                              title="Edit user"
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete ${u.name}?`)) await deleteUser(u.id);
                              }}
                              title="Delete user"
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Schemes Tab */}
        {tab === 'schemes' && <SchemesTab />}
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={saveUser}
          onDelete={deleteUser}
        />
      )}
    </div>
  );
};

export default Admin;