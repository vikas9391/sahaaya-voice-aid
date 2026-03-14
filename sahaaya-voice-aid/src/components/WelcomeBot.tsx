// src/components/WelcomeBot.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot, User, Volume2, VolumeX, X, AlertCircle } from 'lucide-react';
import { useLanguage, LANGUAGES, type LangCode } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  type?: 'options';
  options?: { label: string; value: string }[];
}

const LANG_PROMPT_TEXT =
  'Please say your language — Hindi, English, Tamil, Telugu, Bengali, or Marathi.\n' +
  'कृपया अपनी भाषा बोलें — हिंदी, English, Tamil, Telugu, Bengali, या Marathi।';

const LANG_GREETINGS: Record<LangCode, string> = {
  hi: 'नमस्ते! मैं Sahaaya AI हूँ। सरकारी योजनाएं खोजने में मदद करूँगा।',
  en: 'Hello! I am Sahaaya AI. I will help you find government welfare schemes.',
  ta: 'வணக்கம்! நான் Sahaaya AI. அரசு நலத்திட்டங்களைக் கண்டறிய உதவுவேன்.',
  te: 'నమస్కారం! నేను Sahaaya AI. ప్రభుత్వ సంక్షేమ పథకాలు కనుగొనడంలో సహాయం చేస్తాను.',
  bn: 'নমস্কার! আমি Sahaaya AI। সরকারি প্রকল্প খুঁজে পেতে সাহায্য করব।',
  mr: 'नमस्कार! मी Sahaaya AI. सरकारी योजना शोधण्यात मदत करेन.',
};

const QUESTIONS_BY_LANG: Record<LangCode, { field: string; text: string; type: 'text' | 'number' | 'yesno' }[]> = {
  hi: [
    { field: 'name',           text: 'आपका नाम क्या है?',                           type: 'text'   },
    { field: 'location',       text: 'आप कहाँ रहते हैं? जिला और राज्य बताइये।',     type: 'text'   },
    { field: 'occupation',     text: 'आप क्या काम करते हैं?',                        type: 'text'   },
    { field: 'family_size',    text: 'परिवार में कितने लोग हैं? संख्या बताइये।',     type: 'number' },
    { field: 'monthly_income', text: 'महीने की कमाई कितनी है? सिर्फ संख्या बोलें।', type: 'number' },
    { field: 'has_disability', text: 'परिवार में कोई विकलांग है? हाँ या नहीं।',      type: 'yesno'  },
    { field: 'has_bpl_card',   text: 'आपके पास BPL कार्ड है? हाँ या नहीं।',         type: 'yesno'  },
  ],
  en: [
    { field: 'name',           text: 'What is your name?',                               type: 'text'   },
    { field: 'location',       text: 'Where do you live? Say your district and state.',   type: 'text'   },
    { field: 'occupation',     text: 'What is your occupation or work?',                  type: 'text'   },
    { field: 'family_size',    text: 'How many people are in your family? Say a number.', type: 'number' },
    { field: 'monthly_income', text: 'What is your monthly income in rupees?',            type: 'number' },
    { field: 'has_disability', text: 'Is anyone in your family disabled? Say yes or no.', type: 'yesno' },
    { field: 'has_bpl_card',   text: 'Do you have a BPL card? Say yes or no.',            type: 'yesno' },
  ],
  ta: [
    { field: 'name',           text: 'உங்கள் பெயர் என்ன?',                                       type: 'text'   },
    { field: 'location',       text: 'நீங்கள் எங்கே வசிக்கிறீர்கள்?',                             type: 'text'   },
    { field: 'occupation',     text: 'உங்கள் தொழில் என்ன?',                                       type: 'text'   },
    { field: 'family_size',    text: 'குடும்பத்தில் எத்தனை பேர்? எண்ணில் சொல்லுங்கள்.',           type: 'number' },
    { field: 'monthly_income', text: 'மாத வருமானம் எவ்வளவு? எண்ணில் சொல்லுங்கள்.',               type: 'number' },
    { field: 'has_disability', text: 'குடும்பத்தில் மாற்றுத்திறனாளி உள்ளாரா? ஆம் அல்லது இல்லை.', type: 'yesno' },
    { field: 'has_bpl_card',   text: 'BPL அட்டை உள்ளதா? ஆம் அல்லது இல்லை.',                      type: 'yesno' },
  ],
  te: [
    { field: 'name',           text: 'మీ పేరు ఏమిటి?',                                 type: 'text'   },
    { field: 'location',       text: 'మీరు ఎక్కడ నివసిస్తున్నారు?',                      type: 'text'   },
    { field: 'occupation',     text: 'మీ వృత్తి ఏమిటి?',                                type: 'text'   },
    { field: 'family_size',    text: 'కుటుంబంలో ఎంతమంది? సంఖ్య చెప్పండి.',             type: 'number' },
    { field: 'monthly_income', text: 'నెలవారీ ఆదాయం ఎంత? సంఖ్య చెప్పండి.',            type: 'number' },
    { field: 'has_disability', text: 'కుటుంబంలో వికలాంగులు ఉన్నారా? అవును లేదా లేదు.', type: 'yesno'  },
    { field: 'has_bpl_card',   text: 'BPL కార్డ్ ఉందా? అవును లేదా లేదు.',              type: 'yesno'  },
  ],
  bn: [
    { field: 'name',           text: 'আপনার নাম কী?',                         type: 'text'   },
    { field: 'location',       text: 'আপনি কোথায় থাকেন?',                     type: 'text'   },
    { field: 'occupation',     text: 'আপনার পেশা কী?',                         type: 'text'   },
    { field: 'family_size',    text: 'পরিবারে কতজন? সংখ্যায় বলুন।',          type: 'number' },
    { field: 'monthly_income', text: 'মাসিক আয় কত? সংখ্যায় বলুন।',          type: 'number' },
    { field: 'has_disability', text: 'পরিবারে কেউ প্রতিবন্ধী? হ্যাঁ বা না।', type: 'yesno'  },
    { field: 'has_bpl_card',   text: 'BPL কার্ড আছে? হ্যাঁ বা না।',           type: 'yesno'  },
  ],
  mr: [
    { field: 'name',           text: 'तुमचे नाव काय आहे?',                           type: 'text'   },
    { field: 'location',       text: 'तुम्ही कुठे राहता?',                            type: 'text'   },
    { field: 'occupation',     text: 'तुमचा व्यवसाय काय?',                           type: 'text'   },
    { field: 'family_size',    text: 'कुटुंबात किती जण आहेत? संख्या सांगा.',         type: 'number' },
    { field: 'monthly_income', text: 'महिन्याचे उत्पन्न किती? संख्या सांगा.',        type: 'number' },
    { field: 'has_disability', text: 'कुटुंबात कोणी अपंग आहे का? होय किंवा नाही.',   type: 'yesno'  },
    { field: 'has_bpl_card',   text: 'BPL कार्ड आहे का? होय किंवा नाही.',            type: 'yesno'  },
  ],
};

const YES_NO_LABELS: Record<LangCode, { yes: string; no: string }> = {
  hi: { yes: 'हाँ',   no: 'नहीं'   },
  en: { yes: 'Yes',   no: 'No'     },
  ta: { yes: 'ஆம்',  no: 'இல்லை' },
  te: { yes: 'అవును', no: 'లేదు'  },
  bn: { yes: 'হ্যাঁ', no: 'না'    },
  mr: { yes: 'होय',   no: 'नाही'  },
};

const WARM_RESPONSES: Record<LangCode, string[]> = {
  hi: ['बहुत अच्छा!', 'शुक्रिया!', 'समझ गया!', 'ठीक है!', 'बढ़िया!', 'अच्छा!', 'बिल्कुल!'],
  en: ['Great!', 'Thank you!', 'Got it!', 'Okay!', 'Wonderful!', 'Good!', 'Perfect!'],
  ta: ['நன்று!', 'நன்றி!', 'புரிந்தது!', 'சரி!', 'அருமை!', 'நல்லது!', 'சரி!'],
  te: ['బాగుంది!', 'ధన్యవాదాలు!', 'అర్థమైంది!', 'సరే!', 'అద్భుతం!', 'బాగుంది!', 'సరే!'],
  bn: ['ভালো!', 'ধন্যবাদ!', 'বুঝেছি!', 'ঠিক!', 'দারুণ!', 'ভালো!', 'ঠিক!'],
  mr: ['छान!', 'धन्यवाद!', 'समजले!', 'ठीक!', 'अद्भुत!', 'चांगले!', 'बरोबर!'],
};

const COMPLETION_MSG: Record<LangCode, string> = {
  hi: 'शुक्रिया! प्रोफ़ाइल सुरक्षित हो रहा है।',
  en: 'Thank you! Saving your profile now.',
  ta: 'நன்றி! சுயவிவரம் சேமிக்கிறோம்.',
  te: 'ధన్యవాదాలు! ప్రొఫైల్ సేవ్ అవుతోంది.',
  bn: 'ধন্যবাদ! প্রোফাইল সংরক্ষণ হচ্ছে।',
  mr: 'धन्यवाद! प्रोफाइल जतन होत आहे.',
};

// ─── Hallucination filter ─────────────────────────────────────────────────────
const HALLUCINATION_PATTERNS = [
  /sign.*(in|into|up)/i, /dating app/i, /subscribe/i,
  /thank you for watching/i, /please like and/i, /copyright/i,
  /www\./i, /\.com/i, /attendance/i, /music by/i, /subtitles/i, /transcript/i,
];
function isHallucinatedTranscript(text: string): boolean {
  if (!text || text.trim().length < 2) return true;
  for (const p of HALLUCINATION_PATTERNS) if (p.test(text)) return true;
  return false;
}
function isValidAnswer(text: string, type: 'text' | 'number' | 'yesno'): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isHallucinatedTranscript(t)) return false;
  if (type === 'number') return /\d/.test(t);
  if (type === 'yesno')  return /yes|no|हाँ|हां|नहीं|nahi|nah|aam|illai|avunu|ledu|ha\b|ji\b|hoy|হ্যাঁ|না/i.test(t);
  const words = t.split(/\s+/).length;
  if (words > 8 && /^[a-z\s.,!?]+$/i.test(t)) return false;
  return true;
}

// ─── Language detection ───────────────────────────────────────────────────────
const LANG_KEYWORDS: { pattern: RegExp; code: LangCode }[] = [
  { pattern: /hindi|हिंदी|हिन्दी|\bhind\b/i,    code: 'hi' },
  { pattern: /english|angrezi|\beng\b|inglish/i, code: 'en' },
  { pattern: /tamil|தமிழ்|tamizh|thamizh/i,      code: 'ta' },
  { pattern: /telugu|తెలుగు|\btelgu\b/i,         code: 'te' },
  { pattern: /bengali|bangla|বাংলা|bangali/i,    code: 'bn' },
  { pattern: /marathi|मराठी|marathee/i,          code: 'mr' },
];
function keywordDetectLang(text: string): LangCode | null {
  for (const { pattern, code } of LANG_KEYWORDS) if (pattern.test(text)) return code;
  return null;
}
async function aiDetectLang(transcript: string): Promise<LangCode | null> {
  try {
    const res  = await fetch(`${API_URL}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `User said: "${transcript}". Which language? Reply ONLY: hi, en, ta, te, bn, mr, or unknown`,
        language: 'en', userProfile: {},
      }),
    });
    const data  = await res.json();
    const reply = (data.reply || '').trim().toLowerCase();
    const valid: LangCode[] = ['hi', 'en', 'ta', 'te', 'bn', 'mr'];
    for (const code of valid) if (reply.includes(code)) return code;
  } catch {}
  return null;
}

// ─── Yes/No detection ─────────────────────────────────────────────────────────
function detectYesNo(text: string, lang: LangCode): 'yes' | 'no' | null {
  const t = text.toLowerCase().trim();
  const YES: Record<LangCode, RegExp> = {
    hi: /हाँ|हां|ha\b|ji\b|haan|bilkul|zaroor|yes/,
    en: /\byes\b|yeah|yep|sure|correct|right/,
    ta: /ஆம்|aam|yes|aamam/,
    te: /అవును|avunu|yes/,
    bn: /হ্যাঁ|hya|yes|\bha\b/,
    mr: /होय|hoy|yes|aho/,
  };
  const NO: Record<LangCode, RegExp> = {
    hi: /नहीं|nahi|\bna\b|\bno\b/,
    en: /\bno\b|nope|nah|not/,
    ta: /இல்லை|illai|\bno\b/,
    te: /లేదు|ledu|\bno\b/,
    bn: /না|\bna\b|\bno\b/,
    mr: /नाही|nahi|\bno\b/,
  };
  if (YES[lang]?.test(t)) return 'yes';
  if (NO[lang]?.test(t))  return 'no';
  return null;
}

// ─── Smart TTS: browser speaks instantly, Sarvam races in background ─────────
async function speakText(
  text: string,
  lang: string,
  speechCode: string,
  muted: boolean,
): Promise<void> {
  if (muted || !text?.trim()) return;

  return new Promise(resolve => {
    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; resolve(); } };

    // Browser TTS fires immediately — zero network latency
    const startBrowserTTS = () => {
      if (!window.speechSynthesis) { done(); return; }
      window.speechSynthesis.cancel();
      const u   = new SpeechSynthesisUtterance(text);
      u.lang    = speechCode;
      u.rate    = 0.9;
      u.onend   = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
    };

    // Sarvam TTS races — if it arrives before browser finishes, switch to it
    const ctrl  = new AbortController();
    // Give Sarvam 3s to respond; if slower, browser has already started
    const raceTimer = setTimeout(() => ctrl.abort(), 3000);

    fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang, gender: 'female' }),
      signal: ctrl.signal,
    })
      .then(r => r.json())
      .then(data => {
        clearTimeout(raceTimer);
        if (data.success && data.audioBase64 && !resolved) {
          // Sarvam arrived — cancel browser and play Sarvam audio
          window.speechSynthesis?.cancel();
          const a   = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          a.onended = done;
          a.onerror = done;
          a.play().catch(done);
        }
      })
      .catch(() => clearTimeout(raceTimer));

    // Start browser TTS immediately without waiting
    startBrowserTTS();
  });
}

// ─── Smart STT: silence detection cuts wait time from 7s → ~1-2s ─────────────
async function recordAndTranscribe(maxDurationMs: number, langHint: string): Promise<string> {
  const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  // Silence detection via Web Audio API
  const audioCtx = new AudioContext();
  const source   = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.fftSize);
  let silenceStart = Date.now();
  let hasSpoken    = false;
  let stopped      = false;

  const SILENCE_THRESHOLD      = 12;    // RMS below this = silence
  const SILENCE_AFTER_SPEECH   = 1200;  // ms of silence after speech to auto-stop
  const MIN_RECORDING_MS       = 500;   // don't stop before this

  const stopAll = () => {
    if (stopped) return;
    stopped = true;
    if (recorder.state !== 'inactive') recorder.stop();
    stream.getTracks().forEach(t => t.stop());
    try { audioCtx.close(); } catch {}
  };

  const silencePoller = setInterval(() => {
    analyser.getByteTimeDomainData(dataArray);
    const rms = dataArray.reduce((s, v) => s + Math.abs(v - 128), 0) / dataArray.length;
    if (rms > SILENCE_THRESHOLD) {
      hasSpoken    = true;
      silenceStart = Date.now();
    } else if (hasSpoken && Date.now() - silenceStart > SILENCE_AFTER_SPEECH) {
      clearInterval(silencePoller);
      stopAll();
    }
  }, 80);

  // Hard max fallback
  const maxTimer = setTimeout(() => {
    clearInterval(silencePoller);
    stopAll();
  }, maxDurationMs);

  await new Promise<void>(resolve => {
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => { clearTimeout(maxTimer); clearInterval(silencePoller); resolve(); };
    recorder.start(100);
  });

  // If user never spoke (pure silence) return empty string
  if (!hasSpoken) return '';

  const blob   = new Blob(chunks, { type: mimeType });
  const base64 = await new Promise<string>((res, rej) => {
    const r   = new FileReader();
    r.onload  = () => res((r.result as string).split(',')[1]);
    r.onerror = () => rej(new Error('FileReader failed'));
    r.readAsDataURL(blob);
  });

  const resp = await fetch(`${API_URL}/api/stt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, language: langHint, mimeType }),
  });
  const data = await resp.json();
  if (!data.success) throw new Error(data.error || 'STT failed');
  return data.transcript as string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const WelcomeBot = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  const [isVisible,   setIsVisible]   = useState(false);
  const [phase,       setPhase]       = useState<'language' | 'questions' | 'saving' | 'done'>('language');
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [textInput,   setTextInput]   = useState('');
  const [answers,     setAnswers]     = useState<Record<string, string>>({});
  const [listenState, setListenState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [isMuted,     setIsMuted]     = useState(false);
  const [micError,    setMicError]    = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Single source of truth via refs — no stale closures in async callbacks
  const phaseRef       = useRef<'language' | 'questions' | 'saving' | 'done'>('language');
  const langRef        = useRef<LangCode>(lang as LangCode);
  const stepRef        = useRef(0);
  const answersRef     = useRef<Record<string, string>>({});
  const isMutedRef     = useRef(false);
  const isBusyRef      = useRef(false);
  const speechCodeRef  = useRef('hi-IN');

  useEffect(() => { phaseRef.current     = phase;                }, [phase]);
  useEffect(() => { langRef.current      = lang as LangCode;     }, [lang]);
  useEffect(() => { stepRef.current      = currentStep;          }, [currentStep]);
  useEffect(() => { answersRef.current   = answers;              }, [answers]);
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) window.speechSynthesis?.cancel();
  }, [isMuted]);
  useEffect(() => {
    const found = LANGUAGES.find(l => l.code === lang);
    speechCodeRef.current = found?.speechCode || 'hi-IN';
  }, [lang]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!localStorage.getItem('sahaaya_user')) setTimeout(() => setIsVisible(true), 500);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const addBotMsg = useCallback((text: string, extra?: Partial<ChatMessage>) =>
    setMessages(p => [...p, { id: `${Date.now()}${Math.random()}`, role: 'bot', text, ...extra }]), []);

  const addUserMsg = useCallback((text: string) =>
    setMessages(p => [...p, { id: `${Date.now()}u`, role: 'user', text }]), []);

  const speak = useCallback(async (text: string): Promise<void> => {
    setListenState('speaking');
    await speakText(text, langRef.current, speechCodeRef.current, isMutedRef.current);
    setListenState('idle');
  }, []);

  // ── Core listen loop — all state read from refs, never stale ─────────────────
  const listenAndProcess = useCallback(async (mode: 'language' | 'answer') => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setMicError(false);
    setListenState('listening');

    const currentLang = langRef.current;
    const step        = stepRef.current;
    const question    = QUESTIONS_BY_LANG[currentLang]?.[step];
    const whisperHint = currentLang === 'mr' ? 'hi' : currentLang;

    try {
      const transcript = await recordAndTranscribe(
        mode === 'language' ? 6000 : 8000,
        mode === 'language' ? 'en'  : whisperHint,
      );
      setListenState('processing');

      // ── Language phase ──────────────────────────────────────────────────────
      if (mode === 'language') {
        // Pure silence — re-listen silently
        if (!transcript || isHallucinatedTranscript(transcript)) {
          isBusyRef.current = false;
          setListenState('idle');
          setTimeout(() => listenAndProcess('language'), 200);
          return;
        }
        addUserMsg(transcript);
        let detected = keywordDetectLang(transcript);
        if (!detected) detected = await aiDetectLang(transcript);

        if (detected) {
          await startQuestions(detected);
        } else {
          const msg = 'Please say clearly: Hindi, English, Tamil, Telugu, Bengali, or Marathi.';
          addBotMsg(msg);
          isBusyRef.current = false;
          await speak(msg);
          listenAndProcess('language');
        }
        return;
      }

      // ── Answer phase ────────────────────────────────────────────────────────
      // Pure silence — re-listen silently
      if (!transcript || isHallucinatedTranscript(transcript)) {
        isBusyRef.current = false;
        setListenState('idle');
        setTimeout(() => listenAndProcess('answer'), 200);
        return;
      }

      if (!isValidAnswer(transcript, question?.type || 'text')) {
        const msg = currentLang === 'hi'
          ? 'मैं सुन नहीं पाया। कृपया फिर से बोलें।'
          : 'Could not hear clearly. Please speak again.';
        addBotMsg(msg);
        isBusyRef.current = false;
        await speak(msg);
        listenAndProcess('answer');
        return;
      }

      addUserMsg(transcript);

      let answer = transcript;
      if (question?.type === 'yesno') {
        const yn = detectYesNo(transcript, currentLang);
        if (!yn) {
          const msg = YES_NO_LABELS[currentLang].yes + ' / ' + YES_NO_LABELS[currentLang].no + '?';
          addBotMsg(msg);
          isBusyRef.current = false;
          await speak(msg);
          listenAndProcess('answer');
          return;
        }
        answer = yn;
      }

      isBusyRef.current = false;
      await processAnswer(answer);

    } catch (err) {
      console.error('Listen error:', err);
      setMicError(true);
      setListenState('idle');
      isBusyRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start questions ───────────────────────────────────────────────────────────
  const startQuestions = useCallback(async (selectedLang: LangCode) => {
    setLang(selectedLang);
    langRef.current       = selectedLang;
    speechCodeRef.current = LANGUAGES.find(l => l.code === selectedLang)?.speechCode || 'hi-IN';
    setPhase('questions');
    phaseRef.current = 'questions';
    setCurrentStep(0);
    stepRef.current = 0;

    const greeting = LANG_GREETINGS[selectedLang];
    const firstQ   = QUESTIONS_BY_LANG[selectedLang][0];

    addBotMsg(greeting);
    addBotMsg(firstQ.text, firstQ.type === 'yesno' ? {
      type: 'options',
      options: [
        { label: YES_NO_LABELS[selectedLang].yes, value: 'yes' },
        { label: YES_NO_LABELS[selectedLang].no,  value: 'no'  },
      ],
    } : undefined);

    isBusyRef.current = false;
    // Single combined TTS call — one network round trip instead of two
    await speak(`${greeting} ${firstQ.text}`);
    listenAndProcess('answer');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLang]);

  // ── Process answer ────────────────────────────────────────────────────────────
  const processAnswer = useCallback(async (answerText: string) => {
    const currentLang  = langRef.current;
    const questions    = QUESTIONS_BY_LANG[currentLang];
    const step         = stepRef.current;
    const currentQ     = questions[step];
    const newAnswers   = { ...answersRef.current, [currentQ.field]: answerText };

    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
      stepRef.current = nextStep;

      const warm  = WARM_RESPONSES[currentLang][step] || 'Ok!';
      const nextQ = questions[nextStep];

      addBotMsg(warm);
      addBotMsg(nextQ.text, nextQ.type === 'yesno' ? {
        type: 'options',
        options: [
          { label: YES_NO_LABELS[currentLang].yes, value: 'yes' },
          { label: YES_NO_LABELS[currentLang].no,  value: 'no'  },
        ],
      } : undefined);

      // Single TTS call: warm + next question combined
      await speak(`${warm} ${nextQ.text}`);
      listenAndProcess('answer');

    } else {
      const completionMsg = COMPLETION_MSG[currentLang];
      addBotMsg(completionMsg);
      setPhase('saving');
      phaseRef.current = 'saving';
      await speak(completionMsg);
      await saveToBackend(newAnswers, currentLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save to backend ───────────────────────────────────────────────────────────
  const saveToBackend = async (finalAnswers: Record<string, string>, finalLang: LangCode) => {
    const loc   = finalAnswers.location || '';
    const parts = loc.split(',').map((s: string) => s.trim());

    const rawProfile = {
      name:           finalAnswers.name?.slice(0, 100) || 'User',
      district:       parts[0]?.slice(0, 100) || '',
      state:          parts[1]?.slice(0, 100) || '',
      occupation:     finalAnswers.occupation?.slice(0, 100) || '',
      family_size:    Math.min(Math.max(parseInt(finalAnswers.family_size) || 4, 1), 50),
      monthly_income: Math.min(Math.max(parseInt(finalAnswers.monthly_income?.replace(/[^\d]/g, '') || '0') || 10000, 0), 10000000),
      has_disability: finalAnswers.has_disability === 'yes',
      has_bpl_card:   finalAnswers.has_bpl_card   === 'yes',
      language:       finalLang,
    };

    try {
      const saveRes  = await fetch(`${API_URL}/api/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: rawProfile }),
      });
      const saveData = await saveRes.json();
      const userId   = saveData.success && saveData.user?.id ? saveData.user.id : crypto.randomUUID();

      const matchRes  = await fetch(`${API_URL}/api/match-schemes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: rawProfile }),
      });
      const matchData = await matchRes.json();
      const schemes   = matchData.success ? matchData.schemes : [];

      localStorage.setItem('sahaaya_user',    JSON.stringify({ ...rawProfile, id: userId, created_at: new Date().toISOString(), schemes_matched: schemes.length }));
      localStorage.setItem('sahaaya_schemes', JSON.stringify(schemes));
    } catch {
      localStorage.setItem('sahaaya_user', JSON.stringify({
        ...rawProfile, id: crypto.randomUUID(),
        created_at: new Date().toISOString(), schemes_matched: 0,
      }));
    }
    setPhase('done');
    setTimeout(() => navigate('/profile'), 1800);
  };

  // ── Boot ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    const boot = async () => {
      addBotMsg(LANG_PROMPT_TEXT);
      await speak(LANG_PROMPT_TEXT);
      listenAndProcess('language');
    };
    const t = setTimeout(boot, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // ── Text submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = textInput.trim();
    if (!val) return;
    window.speechSynthesis?.cancel();
    isBusyRef.current = false;
    setTextInput('');

    if (phaseRef.current === 'language') {
      addUserMsg(val);
      const detected = keywordDetectLang(val) || await aiDetectLang(val);
      if (detected) {
        await startQuestions(detected);
      } else {
        addBotMsg('Please type: Hindi, English, Tamil, Telugu, Bengali, or Marathi.');
      }
    } else if (phaseRef.current === 'questions') {
      addUserMsg(val);
      await processAnswer(val);
    }
  };

  const handleManualMic = () => {
    window.speechSynthesis?.cancel();
    isBusyRef.current = false;
    setMicError(false);
    listenAndProcess(phaseRef.current === 'language' ? 'language' : 'answer');
  };

  const handleDismiss = () => {
    window.speechSynthesis?.cancel();
    isBusyRef.current = false;
    setIsVisible(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (next) window.speechSynthesis?.cancel();
  };

  if (!isVisible) return null;

  const questions   = QUESTIONS_BY_LANG[lang as LangCode] || QUESTIONS_BY_LANG['hi'];
  const statusLabel = listenState === 'listening'  ? '🎤 Listening…'
                    : listenState === 'processing' ? '⚙️ Processing…'
                    : listenState === 'speaking'   ? '🔊 Speaking…'
                    : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="bg-card w-full sm:max-w-md sm:rounded-[22px] rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '88vh' }}
        >
          {/* Header */}
          <div className="bg-secondary text-secondary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
                {listenState === 'listening' && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full animate-pulse" />}
                {listenState === 'speaking'  && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse" />}
              </div>
              <div>
                <h3 className="font-bold text-sm">Sahaaya AI</h3>
                <p className="text-[11px] text-secondary-foreground/70">
                  {statusLabel || (
                    phase === 'language'                      ? 'Say your language'  :
                    phase === 'saving' || phase === 'done'    ? '✓ Saving...'        :
                    `Question ${currentStep + 1} / ${questions.length}`
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/10 transition text-secondary-foreground/60 hover:text-secondary-foreground">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-white/10 transition text-secondary-foreground/60 hover:text-secondary-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          {phase === 'questions' && (
            <div className="h-1 bg-muted shrink-0">
              <motion.div className="h-full bg-primary"
                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }} />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px]">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'bot' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'bot'
                        ? 'bg-muted text-foreground rounded-bl-md'
                        : 'bg-primary text-primary-foreground rounded-br-md'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      {msg.type === 'options' && msg.options && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {msg.options.map(opt => (
                            <motion.button key={opt.value} whileTap={{ scale: 0.94 }}
                              onClick={() => {
                                window.speechSynthesis?.cancel();
                                isBusyRef.current = false;
                                addUserMsg(opt.label);
                                processAnswer(opt.value);
                              }}
                              className="bg-card text-foreground border border-border rounded-xl px-5 py-2 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all">
                              {opt.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {(phase === 'language' || phase === 'questions') && (
            <div className="border-t border-border p-3 shrink-0 bg-card space-y-2">
              <div className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm transition-all ${
                listenState === 'listening'  ? 'bg-red-50 text-red-600 border border-red-200'         :
                listenState === 'processing' ? 'bg-primary/10 text-primary border border-primary/20'  :
                listenState === 'speaking'   ? 'bg-green-50 text-green-700 border border-green-200'   :
                micError                     ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                'bg-muted text-muted-foreground border border-border'
              }`}>
                {listenState === 'listening' ? (
                  <>
                    <span className="flex gap-0.5 items-end h-4">
                      {[0, 1, 2, 3].map(i => (
                        <motion.span key={i} className="w-1 bg-red-500 rounded-full"
                          animate={{ height: ['4px', '14px', '4px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                      ))}
                    </span>
                    <span className="font-medium">Listening… speak now</span>
                  </>
                ) : listenState === 'processing' ? (
                  <><span className="inline-block animate-spin">⚙️</span><span>Processing…</span></>
                ) : listenState === 'speaking' ? (
                  <><Volume2 className="w-4 h-4 animate-pulse" /><span>Speaking… mic opens after</span></>
                ) : (
                  <button onClick={handleManualMic}
                    className="flex items-center gap-2 w-full justify-center font-medium hover:text-primary transition-colors">
                    {micError ? <AlertCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{micError ? 'Mic error — tap to retry' : phase === 'language' ? 'Tap to speak your language' : 'Tap to speak your answer'}</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder={phase === 'language' ? 'Or type: Hindi / English / Tamil…' : 'Or type your answer…'}
                  className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <motion.button type="submit" whileTap={{ scale: 0.88 }} disabled={!textInput.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>

              <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Mic opens automatically after bot finishes speaking
              </p>
            </div>
          )}

          {/* Saving */}
          {(phase === 'saving' || phase === 'done') && (
            <div className="border-t border-border p-4 shrink-0 bg-card">
              <div className="flex items-center justify-center gap-2 text-primary">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full" />
                <span className="text-sm font-medium">
                  {lang === 'hi' ? 'प्रोफ़ाइल सुरक्षित हो रही है...' : 'Saving your profile...'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeBot;