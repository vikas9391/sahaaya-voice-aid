import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowRight, Keyboard, Check } from 'lucide-react';
import { useVoiceRegistration } from '@/hooks/useVoiceRegistration';

const Register = () => {
  const navigate = useNavigate();
  const {
    step, currentQuestion, totalQuestions, answers,
    isListening, isSpeaking, transcript, isComplete, error,
    startListening, stopListening, submitAnswer, askCurrentQuestion, reset,
  } = useVoiceRegistration();

  const [showTextForm, setShowTextForm] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setIsLoading(true);
      // Parse answers into a profile
      const profile = {
        id: crypto.randomUUID(),
        name: answers.name || 'User',
        district: answers.location?.split(',')[0]?.trim() || answers.location || '',
        state: answers.location?.split(',')[1]?.trim() || '',
        occupation: answers.occupation || '',
        family_size: parseInt(answers.family_size) || 4,
        monthly_income: parseInt(answers.monthly_income?.replace(/[^\d]/g, '')) || 10000,
        has_disability: /हाँ|हां|yes|ha/i.test(answers.has_disability || ''),
        has_bpl_card: /हाँ|हां|yes|ha/i.test(answers.has_bpl_card || ''),
        language: 'hi',
        created_at: new Date().toISOString(),
        schemes_matched: 0,
      };
      localStorage.setItem('sahaaya_user', JSON.stringify(profile));
      setTimeout(() => navigate('/profile'), 2500);
    }
  }, [isComplete, answers, navigate]);

  // Save progress
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('sahaaya_progress', JSON.stringify({ step, answers }));
    }
  }, [step, answers]);

  // Restore progress
  useEffect(() => {
    const saved = localStorage.getItem('sahaaya_progress');
    if (saved) {
      // Could restore here if needed
    }
  }, []);

  const handleMicTap = () => {
    if (isListening) {
      stopListening();
      if (transcript) submitAnswer(transcript);
    } else {
      askCurrentQuestion().then(() => {
        setTimeout(startListening, 500);
      });
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      submitAnswer(textInput.trim());
      setTextInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-secondary mb-2">
            आपका प्रोफ़ाइल बन रहा है...
          </h2>
          <p className="text-muted-foreground">Creating your profile & matching schemes</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="container py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground">
          ← वापस / Back
        </button>
        <span className="text-sm font-medium text-secondary">Sahaaya AI</span>
      </div>

      {/* Progress */}
      <div className="container mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">सवाल {step + 1} / {totalQuestions}</span>
          <span className="text-sm font-medium text-secondary">{Math.round(((step + 1) / totalQuestions) * 100)}%</span>
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

      {/* Question */}
      <div className="container flex-1 flex flex-col items-center justify-center max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="text-center mb-8 w-full"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
              {currentQuestion.text_hi}
            </h2>
            <p className="text-muted-foreground">{currentQuestion.text_en}</p>
          </motion.div>
        </AnimatePresence>

        {/* Mic Button */}
        {!showTextForm && (
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {isListening && (
                <>
                  <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full bg-primary/10" animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
                </>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleMicTap}
                disabled={isSpeaking}
                className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-destructive shadow-lg' 
                    : isSpeaking 
                      ? 'bg-muted cursor-wait' 
                      : 'bg-primary shadow-primary-glow'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12 text-destructive-foreground" />
                ) : (
                  <Mic className="w-12 h-12 text-primary-foreground" />
                )}
              </motion.button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {isListening ? 'सुन रहा हूँ... बोलिये / Listening...' : isSpeaking ? 'बोल रहा हूँ... / Speaking...' : 'माइक दबाएं / Tap to speak'}
            </p>
          </div>
        )}

        {/* Transcript */}
        {transcript && !showTextForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-card p-4 shadow-card mb-4 w-full text-center"
          >
            <p className="text-lg text-foreground italic">"{transcript}"</p>
            {!isListening && (
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => submitAnswer(transcript)} className="bg-primary text-primary-foreground px-4 py-2 rounded-button text-sm font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> सही है / Confirm
                </button>
                <button onClick={startListening} className="bg-muted text-foreground px-4 py-2 rounded-button text-sm font-medium">
                  फिर से / Retry
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Text Fallback */}
        {showTextForm ? (
          <form onSubmit={handleTextSubmit} className="w-full mb-8">
            <div className="flex gap-2">
              <input
                type={currentQuestion.type === 'number' ? 'number' : 'text'}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={currentQuestion.text_en}
                className="flex-1 bg-card border border-border rounded-button px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-3 rounded-button">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : null}

        {/* Toggle */}
        <button
          onClick={() => setShowTextForm(!showTextForm)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Keyboard className="w-4 h-4" />
          {showTextForm ? 'वॉइस से जवाब दें / Use Voice' : 'टाइप करें / Type Instead'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-destructive/10 text-destructive px-4 py-3 rounded-button text-sm text-center">
            {error}
          </div>
        )}

        {/* Answered so far */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-8 w-full">
            <p className="text-xs text-muted-foreground mb-2">आपके जवाब / Your answers:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).map(([key, val]) => (
                <span key={key} className="bg-success/10 text-success text-xs px-3 py-1 rounded-full">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
