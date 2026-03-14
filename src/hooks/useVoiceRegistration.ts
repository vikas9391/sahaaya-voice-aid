import { useState, useCallback, useRef } from 'react';
import { useLanguage, type LangCode } from '@/contexts/LanguageContext';

export function useVoiceRegistration() {
  const { t, speechCode } = useLanguage();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const questions = [
    { id: '1', text: t.q1, field: 'name', type: 'text' as const },
    { id: '2', text: t.q2, field: 'location', type: 'text' as const },
    { id: '3', text: t.q3, field: 'occupation', type: 'text' as const },
    { id: '4', text: t.q4, field: 'family_size', type: 'number' as const },
    { id: '5', text: t.q5, field: 'monthly_income', type: 'number' as const },
    { id: '6', text: t.q6, field: 'has_disability', type: 'boolean' as const },
    { id: '7', text: t.q7, field: 'has_bpl_card', type: 'boolean' as const },
  ];

  const warmResponses = [
    t.warmResponse1, t.warmResponse2, t.warmResponse3, t.warmResponse4,
    t.warmResponse5, t.warmResponse6, t.warmResponse7,
  ];

  const currentQuestion = questions[step] || questions[0];
  const totalQuestions = questions.length;

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      utterance.rate = 0.9;
      setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }, [speechCode]);

  const startListening = useCallback(() => {
    setError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t.micNotSupported);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechCode;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1][0].transcript;
      setTranscript(result);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error === 'not-allowed') {
        setError(t.micNotSupported);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [speechCode, t.micNotSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  const submitAnswer = useCallback(async (answerText: string) => {
    const field = currentQuestion.field;
    setAnswers(prev => ({ ...prev, [field]: answerText }));
    setTranscript('');

    if (step < questions.length - 1) {
      await speak(warmResponses[step]);
      setStep(s => s + 1);
      // Need to get next question text - use index
      const nextQ = questions[step + 1];
      if (nextQ) await speak(nextQ.text);
    } else {
      await speak(t.thankYouProfile);
      setIsComplete(true);
    }
  }, [step, currentQuestion, speak, warmResponses, questions, t.thankYouProfile]);

  const askCurrentQuestion = useCallback(async () => {
    await speak(currentQuestion.text);
  }, [currentQuestion, speak]);

  const reset = useCallback(() => {
    setStep(0); setAnswers({}); setTranscript(''); setIsComplete(false); setError(null);
  }, []);

  return {
    step, currentQuestion, totalQuestions, answers,
    isListening, isSpeaking, transcript, isComplete, error,
    startListening, stopListening, submitAnswer, askCurrentQuestion, speak, reset,
  };
}
