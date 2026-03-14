// src/pages/PostJob.tsx
// Updated: submits job to backend API → saves to Supabase
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SECTORS = ['construction', 'farming', 'delivery', 'domestic', 'security', 'other'];

const PostJob = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', employer_name: '', district: '', state: '',
    daily_wage: '', sector: 'construction', contact_number: '', description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          daily_wage: parseInt(form.daily_wage) || 0,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        throw new Error(data.error || 'Failed to post job');
      }
    } catch (err: any) {
      console.error('Post job error:', err);
      setError(err.message || 'Could not post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">{t.jobPosted}</h2>
          <p className="text-muted-foreground mb-6">{t.jobPostedDesc}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => {
              setSubmitted(false);
              setForm({ title: '', employer_name: '', district: '', state: '', daily_wage: '', sector: 'construction', contact_number: '', description: '' });
            }} className="bg-primary text-primary-foreground px-6 py-2 rounded-button font-medium">
              {t.postAnother}
            </button>
            <button onClick={() => navigate('/')} className="bg-muted text-foreground px-6 py-2 rounded-button font-medium">
              {t.home}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const fields = [
    { key: 'title',          label: t.jobTitle,       type: 'text'   },
    { key: 'employer_name',  label: t.employerName,   type: 'text'   },
    { key: 'district',       label: t.district,       type: 'text'   },
    { key: 'state',          label: t.state,          type: 'text'   },
    { key: 'daily_wage',     label: t.dailyWage,      type: 'number' },
    { key: 'contact_number', label: t.contactNumber,  type: 'tel'    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ChevronLeft className="w-4 h-4" /> {t.back}
        </button>
        <div className="bg-card rounded-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">{t.postJobTitle}</h1>
              <p className="text-xs text-muted-foreground">{t.postJobSubtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
                <input type={f.type} required value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm" />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t.sector}</label>
              <select value={form.sector} onChange={e => setForm(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t.description}</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none" />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-button">{error}</div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-button font-medium text-base hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Posting...</>
              ) : t.postJobBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;