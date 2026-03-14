import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ChevronLeft, CheckCircle } from 'lucide-react';

const SECTORS = ['construction', 'farming', 'delivery', 'domestic', 'security', 'other'];

const PostJob = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '', employer_name: '', district: '', state: '', daily_wage: '',
    sector: 'construction', contact_number: '', description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to Supabase
    console.log('Job posted:', form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">नौकरी पोस्ट हो गई!</h2>
          <p className="text-muted-foreground mb-6">Job posted successfully!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ title: '', employer_name: '', district: '', state: '', daily_wage: '', sector: 'construction', contact_number: '', description: '' }); }} className="bg-primary text-primary-foreground px-6 py-2 rounded-button font-medium">
              एक और पोस्ट करें / Post Another
            </button>
            <button onClick={() => navigate('/')} className="bg-muted text-foreground px-6 py-2 rounded-button font-medium">
              होम / Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ChevronLeft className="w-4 h-4" /> वापस / Back
        </button>

        <div className="bg-card rounded-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">नौकरी पोस्ट करें</h1>
              <p className="text-xs text-muted-foreground">Post a Job Listing</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'title', label: 'Job Title / पद का नाम', type: 'text', required: true },
              { key: 'employer_name', label: 'Employer Name / नियोक्ता', type: 'text', required: true },
              { key: 'district', label: 'District / जिला', type: 'text', required: true },
              { key: 'state', label: 'State / राज्य', type: 'text', required: true },
              { key: 'daily_wage', label: 'Daily Wage (₹) / दैनिक मजदूरी', type: 'number', required: true },
              { key: 'contact_number', label: 'Contact Number / संपर्क नंबर', type: 'tel', required: true },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  required={f.required}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Sector / क्षेत्र</label>
              <select
                value={form.sector}
                onChange={e => setForm(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              >
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description / विवरण</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-background border border-border rounded-button px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
              />
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-button font-medium text-base hover:opacity-90 transition">
              पोस्ट करें / Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
