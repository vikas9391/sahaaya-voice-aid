import { useState, useCallback, useRef } from 'react';

export interface RegistrationQuestion {
  id: string;
  text_hi: string;
  text_en: string;
  field: string;
  type: 'text' | 'number' | 'boolean';
}

const QUESTIONS: RegistrationQuestion[] = [
  { id: '1', text_hi: 'आपका नाम क्या है?', text_en: 'What is your name?', field: 'name', type: 'text' },
  { id: '2', text_hi: 'आप कहाँ रहते हैं? अपना जिला और राज्य बताइये।', text_en: 'Where do you live? Tell your district and state.', field: 'location', type: 'text' },
  { id: '3', text_hi: 'आप क्या काम करते हैं?', text_en: 'What is your occupation?', field: 'occupation', type: 'text' },
  { id: '4', text_hi: 'आपके परिवार में कितने लोग हैं?', text_en: 'How many family members?', field: 'family_size', type: 'number' },
  { id: '5', text_hi: 'आपकी महीने की कमाई कितनी है?', text_en: 'What is your monthly income?', field: 'monthly_income', type: 'number' },
  { id: '6', text_hi: 'क्या आपके परिवार में कोई विकलांग हैं?', text_en: 'Is anyone in your family disabled?', field: 'has_disability', type: 'boolean' },
  { id: '7', text_hi: 'क्या आपके पास BPL कार्ड है?', text_en: 'Do you have a BPL card?', field: 'has_bpl_card', type: 'boolean' },
];

const WARM_RESPONSES_HI = [
  'बहुत अच्छा! अगला सवाल सुनिये...',
  'शुक्रिया! चलिये आगे बढ़ते हैं...',
  'समझ गया! अब अगला सवाल...',
  'ठीक है! बस कुछ और सवाल...',
  'बहुत बढ़िया! अब बताइये...',
  'अच्छा! लगभग हो गया...',
  'बिल्कुल! यह आखिरी सवाल है...',
];

export function useVoiceRegistration() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = QUESTIONS[step] || QUESTIONS[0];
  const totalQuestions = QUESTIONS.length;

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('आपके ब्राउज़र में वॉइस सुविधा उपलब्ध नहीं है। कृपया टेक्स्ट फॉर्म का उपयोग करें।');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
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
        setError('माइक्रोफ़ोन की अनुमति दें / Please allow microphone access');
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const submitAnswer = useCallback(async (answerText: string) => {
    const field = currentQuestion.field;
    setAnswers(prev => ({ ...prev, [field]: answerText }));
    setTranscript('');

    if (step < QUESTIONS.length - 1) {
      const warmResponse = WARM_RESPONSES_HI[step];
      await speak(warmResponse);
      setStep(s => s + 1);
      await speak(QUESTIONS[step + 1].text_hi);
    } else {
      await speak('शुक्रिया! आपका प्रोफ़ाइल बन रहा है...');
      setIsComplete(true);
    }
  }, [step, currentQuestion, speak]);

  const askCurrentQuestion = useCallback(async () => {
    await speak(currentQuestion.text_hi);
  }, [currentQuestion, speak]);

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setTranscript('');
    setIsComplete(false);
    setError(null);
  }, []);

  return {
    step, currentQuestion, totalQuestions, answers,
    isListening, isSpeaking, transcript, isComplete, error,
    startListening, stopListening, submitAnswer, askCurrentQuestion, speak, reset,
  };
}
