import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, User, Globe, Check, Keyboard, ArrowRight, X } from 'lucide-react';
import { useLanguage, LANGUAGES, type LangCode } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  type?: 'language-select' | 'text' | 'options';
  options?: { label: string; value: string }[];
}

const LANG_GREETINGS: Record<LangCode, string> = {
  hi: 'नमस्ते! 🙏 मैं Sahaaya AI हूँ। मैं आपकी मदद करूँगा सरकारी योजनाएं खोजने में।',
  en: 'Hello! 🙏 I am Sahaaya AI. I will help you find government welfare schemes.',
  ta: 'வணக்கம்! 🙏 நான் Sahaaya AI. அரசு நலத்திட்டங்களைக் கண்டறிய உதவுவேன்.',
  te: 'నమస్కారం! 🙏 నేను Sahaaya AI. ప్రభుత్వ సంక్షేమ పథకాలు కనుగొనడంలో సహాయం చేస్తాను.',
  bn: 'নমস্কার! 🙏 আমি Sahaaya AI। সরকারি প্রকল্প খুঁজে পেতে সাহায্য করব।',
  mr: 'नमस्कार! 🙏 मी Sahaaya AI आहे. सरकारी योजना शोधण्यात मदत करेन.',
};

const QUESTIONS_BY_LANG: Record<LangCode, { field: string; text: string; type: 'text' | 'number' | 'yesno' }[]> = {
  hi: [
    { field: 'name', text: 'सबसे पहले, आपका नाम क्या है?', type: 'text' },
    { field: 'location', text: 'आप कहाँ रहते हैं? अपना जिला और राज्य बताइये।', type: 'text' },
    { field: 'occupation', text: 'आप क्या काम करते हैं?', type: 'text' },
    { field: 'family_size', text: 'आपके परिवार में कितने लोग हैं?', type: 'number' },
    { field: 'monthly_income', text: 'आपकी महीने की कमाई कितनी है? (रुपयों में)', type: 'number' },
    { field: 'has_disability', text: 'क्या आपके परिवार में कोई विकलांग हैं?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'क्या आपके पास BPL कार्ड है?', type: 'yesno' },
  ],
  en: [
    { field: 'name', text: 'First, what is your name?', type: 'text' },
    { field: 'location', text: 'Where do you live? Tell your district and state.', type: 'text' },
    { field: 'occupation', text: 'What is your occupation?', type: 'text' },
    { field: 'family_size', text: 'How many members in your family?', type: 'number' },
    { field: 'monthly_income', text: 'What is your monthly income? (in rupees)', type: 'number' },
    { field: 'has_disability', text: 'Is anyone in your family disabled?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'Do you have a BPL card?', type: 'yesno' },
  ],
  ta: [
    { field: 'name', text: 'முதலில், உங்கள் பெயர் என்ன?', type: 'text' },
    { field: 'location', text: 'நீங்கள் எங்கே வசிக்கிறீர்கள்? மாவட்டம் மற்றும் மாநிலம் சொல்லுங்கள்.', type: 'text' },
    { field: 'occupation', text: 'உங்கள் தொழில் என்ன?', type: 'text' },
    { field: 'family_size', text: 'உங்கள் குடும்பத்தில் எத்தனை பேர்?', type: 'number' },
    { field: 'monthly_income', text: 'உங்கள் மாத வருமானம் எவ்வளவு? (ரூபாயில்)', type: 'number' },
    { field: 'has_disability', text: 'உங்கள் குடும்பத்தில் யாரேனும் மாற்றுத்திறனாளியா?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'உங்களிடம் BPL அட்டை உள்ளதா?', type: 'yesno' },
  ],
  te: [
    { field: 'name', text: 'మొదట, మీ పేరు ఏమిటి?', type: 'text' },
    { field: 'location', text: 'మీరు ఎక్కడ నివసిస్తున్నారు? జిల్లా మరియు రాష్ట్రం చెప్పండి.', type: 'text' },
    { field: 'occupation', text: 'మీ వృత్తి ఏమిటి?', type: 'text' },
    { field: 'family_size', text: 'మీ కుటుంబంలో ఎంతమంది?', type: 'number' },
    { field: 'monthly_income', text: 'మీ నెలవారీ ఆదాయం ఎంత? (రూపాయల్లో)', type: 'number' },
    { field: 'has_disability', text: 'మీ కుటుంబంలో ఎవరైనా వికలాంగులు ఉన్నారా?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'మీ దగ్గర BPL కార్డ్ ఉందా?', type: 'yesno' },
  ],
  bn: [
    { field: 'name', text: 'প্রথমে, আপনার নাম কী?', type: 'text' },
    { field: 'location', text: 'আপনি কোথায় থাকেন? জেলা ও রাজ্য বলুন।', type: 'text' },
    { field: 'occupation', text: 'আপনার পেশা কী?', type: 'text' },
    { field: 'family_size', text: 'আপনার পরিবারে কতজন সদস্য?', type: 'number' },
    { field: 'monthly_income', text: 'আপনার মাসিক আয় কত? (টাকায়)', type: 'number' },
    { field: 'has_disability', text: 'আপনার পরিবারে কি কেউ প্রতিবন্ধী?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'আপনার কি BPL কার্ড আছে?', type: 'yesno' },
  ],
  mr: [
    { field: 'name', text: 'प्रथम, तुमचे नाव काय आहे?', type: 'text' },
    { field: 'location', text: 'तुम्ही कुठे राहता? जिल्हा आणि राज्य सांगा.', type: 'text' },
    { field: 'occupation', text: 'तुमचा व्यवसाय काय आहे?', type: 'text' },
    { field: 'family_size', text: 'तुमच्या कुटुंबात किती सदस्य आहेत?', type: 'number' },
    { field: 'monthly_income', text: 'तुमचे महिन्याचे उत्पन्न किती आहे? (रुपयांमध्ये)', type: 'number' },
    { field: 'has_disability', text: 'तुमच्या कुटुंबात कोणी अपंग आहे का?', type: 'yesno' },
    { field: 'has_bpl_card', text: 'तुमच्याकडे BPL कार्ड आहे का?', type: 'yesno' },
  ],
};

const YES_NO_LABELS: Record<LangCode, { yes: string; no: string }> = {
  hi: { yes: 'हाँ', no: 'नहीं' },
  en: { yes: 'Yes', no: 'No' },
  ta: { yes: 'ஆம்', no: 'இல்லை' },
  te: { yes: 'అవును', no: 'లేదు' },
  bn: { yes: 'হ্যাঁ', no: 'না' },
  mr: { yes: 'होय', no: 'नाही' },
};

const WARM_RESPONSES: Record<LangCode, string[]> = {
  hi: ['बहुत अच्छा! 👍', 'शुक्रिया! 🙏', 'समझ गया! ✓', 'ठीक है! 👌', 'बढ़िया! 🎉', 'अच्छा! 👍', 'बिल्कुल! ✓'],
  en: ['Great! 👍', 'Thank you! 🙏', 'Got it! ✓', 'Okay! 👌', 'Wonderful! 🎉', 'Good! 👍', 'Perfect! ✓'],
  ta: ['மிகவும் நல்லது! 👍', 'நன்றி! 🙏', 'புரிந்தது! ✓', 'சரி! 👌', 'அருமை! 🎉', 'நல்லது! 👍', 'சரி! ✓'],
  te: ['చాలా బాగుంది! 👍', 'ధన్యవాదాలు! 🙏', 'అర్థమైంది! ✓', 'సరే! 👌', 'అద్భుతం! 🎉', 'బాగుంది! 👍', 'సరే! ✓'],
  bn: ['খুব ভালো! 👍', 'ধন্যবাদ! 🙏', 'বুঝেছি! ✓', 'ঠিক আছে! 👌', 'দারুণ! 🎉', 'ভালো! 👍', 'ঠিক! ✓'],
  mr: ['छान! 👍', 'धन्यवाद! 🙏', 'समजले! ✓', 'ठीक आहे! 👌', 'अद्भुत! 🎉', 'चांगले! 👍', 'बरोबर! ✓'],
};

const COMPLETION_MSG: Record<LangCode, string> = {
  hi: '🎉 शुक्रिया! आपका प्रोफ़ाइल तैयार हो गया है। अब मैं आपके लिए सरकारी योजनाएं खोज रहा हूँ...',
  en: '🎉 Thank you! Your profile is ready. I am now finding government schemes for you...',
  ta: '🎉 நன்றி! உங்கள் சுயவிவரம் தயார். இப்போது உங்களுக்கான அரசு திட்டங்களை தேடுகிறேன்...',
  te: '🎉 ధన్యవాదాలు! మీ ప్రొఫైల్ సిద్ధం. ఇప్పుడు మీ కోసం పథకాలు వెతుకుతున్నాను...',
  bn: '🎉 ধন্যবাদ! আপনার প্রোফাইল তৈরি। এখন আপনার জন্য সরকারি প্রকল্প খুঁজছি...',
  mr: '🎉 धन्यवाद! तुमचे प्रोफाइल तयार आहे. आता तुमच्यासाठी सरकारी योजना शोधत आहे...',
};

const WelcomeBot = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [phase, setPhase] = useState<'language' | 'questions' | 'done'>('language');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check if user already registered
  useEffect(() => {
    const saved = localStorage.getItem('sahaaya_user');
    if (saved) setIsVisible(false);
  }, []);

  // Initial language prompt
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setMessages([{
        id: '0',
        role: 'bot',
        text: '🙏 Welcome to Sahaaya AI!\nकृपया अपनी भाषा चुनें / Please select your language:',
        type: 'language-select',
      }]);
    }, 800);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speechCode = LANGUAGES.find(l => l.code === lang)?.speechCode || 'hi-IN';

  const speak = (text: string): Promise<void> => {
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
  };

  const addBotMessage = (text: string, extra?: Partial<ChatMessage>) => {
    const msg: ChatMessage = { id: Date.now().toString(), role: 'bot', text, ...extra };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + 'u', role: 'user', text }]);
  };

  const handleLanguageSelect = async (selectedLang: LangCode) => {
    const langLabel = LANGUAGES.find(l => l.code === selectedLang)?.nativeLabel || selectedLang;
    addUserMessage(langLabel);
    setLang(selectedLang);
    setPhase('questions');

    await new Promise(r => setTimeout(r, 500));
    const greeting = LANG_GREETINGS[selectedLang];
    addBotMessage(greeting);
    speak(greeting);

    await new Promise(r => setTimeout(r, 1500));
    const firstQ = QUESTIONS_BY_LANG[selectedLang][0];
    if (firstQ.type === 'yesno') {
      addBotMessage(firstQ.text, {
        type: 'options',
        options: [
          { label: YES_NO_LABELS[selectedLang].yes, value: 'yes' },
          { label: YES_NO_LABELS[selectedLang].no, value: 'no' },
        ],
      });
    } else {
      addBotMessage(firstQ.text);
    }
    speak(firstQ.text);
  };

  const processAnswer = async (answerText: string) => {
    const questions = QUESTIONS_BY_LANG[lang];
    const currentQ = questions[currentStep];
    addUserMessage(answerText);
    const newAnswers = { ...answers, [currentQ.field]: answerText };
    setAnswers(newAnswers);
    setTextInput('');

    const nextStep = currentStep + 1;

    if (nextStep < questions.length) {
      // Warm response
      await new Promise(r => setTimeout(r, 400));
      const warm = WARM_RESPONSES[lang][currentStep] || '👍';
      addBotMessage(warm);

      // Next question
      await new Promise(r => setTimeout(r, 800));
      const nextQ = questions[nextStep];
      if (nextQ.type === 'yesno') {
        addBotMessage(nextQ.text, {
          type: 'options',
          options: [
            { label: YES_NO_LABELS[lang].yes, value: 'yes' },
            { label: YES_NO_LABELS[lang].no, value: 'no' },
          ],
        });
      } else {
        addBotMessage(nextQ.text);
      }
      speak(nextQ.text);
      setCurrentStep(nextStep);
    } else {
      // Complete
      await new Promise(r => setTimeout(r, 500));
      addBotMessage(COMPLETION_MSG[lang]);
      speak(COMPLETION_MSG[lang]);
      setPhase('done');

      // Build profile and navigate
      const profile = {
        id: crypto.randomUUID(),
        name: newAnswers.name || 'User',
        district: newAnswers.location?.split(',')[0]?.trim() || newAnswers.location || '',
        state: newAnswers.location?.split(',')[1]?.trim() || '',
        occupation: newAnswers.occupation || '',
        family_size: parseInt(newAnswers.family_size) || 4,
        monthly_income: parseInt(newAnswers.monthly_income?.replace(/[^\d]/g, '')) || 10000,
        has_disability: newAnswers.has_disability === 'yes',
        has_bpl_card: newAnswers.has_bpl_card === 'yes',
        language: lang,
        created_at: new Date().toISOString(),
        schemes_matched: 0,
      };
      localStorage.setItem('sahaaya_user', JSON.stringify(profile));
      setTimeout(() => navigate('/profile'), 2500);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && phase === 'questions') {
      processAnswer(textInput.trim());
    }
  };

  const handleOptionSelect = (value: string, label: string) => {
    if (phase === 'questions') processAnswer(value);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = speechCode;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTextInput(transcript);
      processAnswer(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleDismiss = () => {
    window.speechSynthesis?.cancel();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card w-full sm:max-w-md sm:rounded-card rounded-t-[24px] shadow-elevated flex flex-col overflow-hidden"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="bg-secondary text-secondary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Sahaaya AI</h3>
                <p className="text-[11px] text-secondary-foreground/70">
                  {phase === 'language' ? 'Choose Language' : phase === 'done' ? '✓ Complete' : `Question ${currentStep + 1}/7`}
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-secondary-foreground/60 hover:text-secondary-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          {phase === 'questions' && (
            <div className="h-1 bg-muted shrink-0">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((currentStep + 1) / 7) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
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

                      {/* Language selection buttons */}
                      {msg.type === 'language-select' && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {LANGUAGES.map(l => (
                            <motion.button
                              key={l.code}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleLanguageSelect(l.code)}
                              className="bg-card text-foreground border border-border rounded-button px-3 py-2 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2"
                            >
                              <Globe className="w-3.5 h-3.5 text-primary" />
                              {l.nativeLabel}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Yes/No option buttons */}
                      {msg.type === 'options' && msg.options && (
                        <div className="flex gap-2 mt-3">
                          {msg.options.map(opt => (
                            <motion.button
                              key={opt.value}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOptionSelect(opt.value, opt.label)}
                              className="bg-card text-foreground border border-border rounded-button px-4 py-2 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all"
                            >
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
          {phase === 'questions' && (
            <div className="border-t border-border p-3 shrink-0 bg-card">
              <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                  disabled={isSpeaking}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isListening ? 'bg-destructive text-destructive-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={isListening ? '🎤 ...' : '✍️ Type here...'}
                  className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={!textInput.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
              {isListening && (
                <p className="text-xs text-primary text-center mt-2 animate-pulse">
                  {lang === 'hi' ? 'सुन रहा हूँ...' : lang === 'en' ? 'Listening...' : lang === 'ta' ? 'கேட்கிறேன்...' : lang === 'te' ? 'వింటున్నాను...' : lang === 'bn' ? 'শুনছি...' : 'ऐकतोय...'}
                </p>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div className="border-t border-border p-4 shrink-0 bg-card">
              <div className="flex items-center justify-center gap-2 text-primary">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                />
                <span className="text-sm font-medium">
                  {lang === 'hi' ? 'योजनाएं खोज रहे हैं...' : lang === 'en' ? 'Finding schemes...' : lang === 'ta' ? 'திட்டங்களை தேடுகிறேன்...' : lang === 'te' ? 'పథకాలు వెతుకుతున్నాను...' : lang === 'bn' ? 'প্রকল্প খুঁজছি...' : 'योजना शोधत आहे...'}
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
