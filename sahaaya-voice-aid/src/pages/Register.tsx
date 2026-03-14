// src/pages/Register.tsx
// Voice registration — no mock data imports, saves to real backend
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowRight, Keyboard, Check } from 'lucide-react';
import { useVoiceRegistration } from '@/hooks/useVoiceRegistration';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Register = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const {
    step, currentQuestion, totalQuestions, answers,
    isListening, isSpeaking, transcript, isComplete, error,
    startListening, stopListening, submitAnswer, askCurrentQuestion,
  } = useVoiceRegistration();

  const [showTextForm, setShowTextForm] = useState(false);
  const [textInput,   setTextInput]    = useState('');
  const [isLoading,   setIsLoading]    = useState(false);

  // ── When voice registration completes, save to backend ───────────────────────
  useEffect(() => {
    if (!isComplete) return;
    setIsLoading(true);

    const rawProfile = {
      name:           answers.name || 'User',
      district:       answers.location?.split(',')[0]?.trim() || answers.location || '',
      state:          answers.location?.split(',')[1]?.trim() || '',
      occupation:     answers.occupation || '',
      family_size:    parseInt(answers.family_size) || 4,
      monthly_income: parseInt(answers.monthly_income?.replace(/[^\d]/g, '')) || 10000,
      has_disability: /हाँ|हां|yes|ha|ஆம்|అవును|হ্যাঁ|होय/i.test(answers.has_disability || ''),
      has_bpl_card:   /हाँ|हां|yes|ha|ஆம்|అవును|হ্যাঁ|होय/i.test(answers.has_bpl_card || ''),
      language:       lang,
    };

    (async () => {
      try {
        // Save user to Supabase via backend
        const saveRes  = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: rawProfile }),
        });
        const saveData = await saveRes.json();
        const userId   = saveData.success && saveData.user?.id ? saveData.user.id : crypto.randomUUID();

        // Match schemes
        const matchRes  = await fetch(`${API_URL}/api/match-schemes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: rawProfile }),
        });
        const matchData = await matchRes.json();
        const schemes   = matchData.success ? matchData.schemes : [];

        const fullProfile = {
          ...rawProfile,
          id: userId,
          created_at: new Date().toISOString(),
          schemes_matched: schemes.length,
        };
        localStorage.setItem('sahaaya_user',    JSON.stringify(fullProfile));
        localStorage.setItem('sahaaya_schemes', JSON.stringify(schemes));
      } catch {
        // Offline fallback — save locally
        const fallback = {
          ...rawProfile,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          schemes_matched: 0,
        };
        localStorage.setItem('sahaaya_user', JSON.stringify(fallback));
      } finally {
        setTimeout(() => navigate('/profile'), 1500);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // Save progress locally as user answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('sahaaya_progress', JSON.stringify({ step, answers }));
    }
  }, [step, answers]);

  const handleMicTap = () => {
    if (isListening) {
      stopListening();
      if (transcript) submitAnswer(transcript);
    } else {
      askCurrentQuestion().then(() => setTimeout(startListening, 500));
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) { submitAnswer(textInput.trim()); setTextInput(''); }
  };

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-secondary mb-2">{t.profileCreating}</h2>
          <p className="text-muted-foreground">{t.profileCreatingDesc}</p>
        </motion.div>
      </div>
    );
  }

  // ── Main registration UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground">
          ← {t.back}
        </button>
        <span className="text-sm font-medium text-secondary">Sahaaya AI</span>
      </div>

      {/* Progress bar */}
      <div className="container mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {t.question} {step + 1} {t.of} {totalQuestions}
          </span>
          <span className="text-sm font-medium text-secondary">
            {Math.round(((step + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="container flex-1 flex flex-col items-center justify-center max-w-lg mx-auto">
        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="text-center mb-8 w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">{currentQuestion.text}</h2>
          </motion.div>
        </AnimatePresence>

        {/* Mic button */}
        {!showTextForm && (
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {isListening && (
                <>
                  <motion.div className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
                </>
              )}
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleMicTap} disabled={isSpeaking}
                className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-colors ${
                  isListening
                    ? 'bg-destructive shadow-lg'
                    : isSpeaking
                    ? 'bg-muted cursor-wait'
                    : 'bg-primary shadow-primary-glow'
                }`}>
                {isListening
                  ? <MicOff className="w-12 h-12 text-destructive-foreground" />
                  : <Mic    className="w-12 h-12 text-primary-foreground" />}
              </motion.button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {isListening ? t.listening : isSpeaking ? t.speaking : t.tapToSpeak}
            </p>
          </div>
        )}

        {/* Transcript confirm */}
        {transcript && !showTextForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-card p-4 shadow-card mb-4 w-full text-center">
            <p className="text-lg text-foreground italic">"{transcript}"</p>
            {!isListening && (
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => submitAnswer(transcript)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-button text-sm font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> {t.confirm}
                </button>
                <button onClick={startListening}
                  className="bg-muted text-foreground px-4 py-2 rounded-button text-sm font-medium">
                  {t.retry}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Text input fallback */}
        {showTextForm && (
          <form onSubmit={handleTextSubmit} className="w-full mb-8">
            <div className="flex gap-2">
              <input
                type={currentQuestion.type === 'number' ? 'number' : 'text'}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={currentQuestion.text}
                autoFocus
                className="flex-1 bg-card border border-border rounded-button px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-3 rounded-button">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Toggle voice/text */}
        <button onClick={() => setShowTextForm(!showTextForm)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Keyboard className="w-4 h-4" />
          {showTextForm ? t.useVoice : t.typeInstead}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-destructive/10 text-destructive px-4 py-3 rounded-button text-sm text-center">
            {error}
          </div>
        )}

        {/* Answers so far */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-8 w-full">
            <p className="text-xs text-muted-foreground mb-2">{t.yourAnswers}:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).map(([key, val]) => (
                <span key={key} className="bg-success/10 text-success text-xs px-3 py-1 rounded-full">{val}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;