// src/hooks/useVoiceRegistration.ts
// Updated: uses Groq Whisper STT + Sarvam AI TTS via backend
import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function callSTT(audioBase64: string, language: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/stt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, language, mimeType: 'audio/webm' }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'STT failed');
  return data.transcript;
}

async function callTTS(text: string, language: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, gender: 'female' }),
    });
    const data = await res.json();
    if (data.success && data.audioBase64) return data.audioBase64;
    return null;
  } catch { return null; }
}

function browserSpeak(text: string, speechCode: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechCode; u.rate = 0.9;
    u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

async function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audio.onended = () => resolve(); audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function recordAudio(durationMs = 6000): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read audio'));
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, durationMs);
    } catch (err) { reject(err); }
  });
}

export function useVoiceRegistration() {
  const { t, speechCode, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const questions = [
    { id: '1', text: t.q1, field: 'name',          type: 'text'    as const },
    { id: '2', text: t.q2, field: 'location',       type: 'text'    as const },
    { id: '3', text: t.q3, field: 'occupation',     type: 'text'    as const },
    { id: '4', text: t.q4, field: 'family_size',    type: 'number'  as const },
    { id: '5', text: t.q5, field: 'monthly_income', type: 'number'  as const },
    { id: '6', text: t.q6, field: 'has_disability', type: 'boolean' as const },
    { id: '7', text: t.q7, field: 'has_bpl_card',   type: 'boolean' as const },
  ];

  const warmResponses = [
    t.warmResponse1, t.warmResponse2, t.warmResponse3, t.warmResponse4,
    t.warmResponse5, t.warmResponse6, t.warmResponse7,
  ];

  const currentQuestion = questions[step] || questions[0];
  const totalQuestions = questions.length;

  // Speak via Sarvam AI → fallback to browser TTS
  const speak = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true);
    try {
      const audioBase64 = await callTTS(text, lang);
      if (audioBase64) {
        await playBase64Audio(audioBase64);
      } else {
        await browserSpeak(text, speechCode);
      }
    } catch {
      await browserSpeak(text, speechCode);
    } finally {
      setIsSpeaking(false);
    }
  }, [lang, speechCode]);

  const askCurrentQuestion = useCallback(async () => {
    await speak(currentQuestion.text);
  }, [currentQuestion, speak]);

  // Start listening: Groq Whisper primary, browser SR fallback
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');

    if (!navigator.mediaDevices?.getUserMedia) {
      // Browser SpeechRecognition fallback
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setError(t.micNotSupported); return; }
      const recognition = new SR();
      recognition.lang = speechCode;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1][0].transcript;
        setTranscript(result);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => { setIsListening(false); setError(t.micNotSupported); };
      recognitionRef.current = recognition;
      recognition.start();
      return;
    }

    // Groq Whisper via backend
    setIsListening(true);
    recordAudio(6000)
      .then(async (audioBase64) => {
        setIsListening(false);
        try {
          const result = await callSTT(audioBase64, lang);
          setTranscript(result);
        } catch {
          setError('Voice recognition failed. Please type your answer.');
        }
      })
      .catch(() => {
        setIsListening(false);
        setError(t.micNotSupported);
      });
  }, [lang, speechCode, t.micNotSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const submitAnswer = useCallback(async (answerText: string) => {
    const field = currentQuestion.field;
    const newAnswers = { ...answers, [field]: answerText };
    setAnswers(newAnswers);
    setTranscript('');
    if (step < questions.length - 1) {
      await speak(warmResponses[step] || '👍');
      setStep(s => s + 1);
      const nextQ = questions[step + 1];
      if (nextQ) await speak(nextQ.text);
    } else {
      await speak(t.thankYouProfile);
      setIsComplete(true);
    }
  }, [step, currentQuestion, speak, warmResponses, answers, questions, t.thankYouProfile]);

  const reset = useCallback(() => {
    setStep(0); setAnswers({}); setTranscript(''); setIsComplete(false); setError(null);
  }, []);

  return {
    step, currentQuestion, totalQuestions, answers,
    isListening, isSpeaking, transcript, isComplete, error,
    startListening, stopListening, submitAnswer, askCurrentQuestion, speak, reset,
  };
}