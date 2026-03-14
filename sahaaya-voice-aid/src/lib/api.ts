// ================================================================
// src/lib/api.ts
// Place this file at: sahaaya-voice-aid/src/lib/api.ts
// All backend API calls go through here
// ================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Types ────────────────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  name: string | null;
  district: string | null;
  state: string | null;
  occupation: string | null;
  family_size: number | null;
  monthly_income: number | null;
  has_disability: boolean;
  has_bpl_card: boolean;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  language?: string;
  schemes_matched?: number;
  created_at?: string;
}

export interface Scheme {
  id: string;
  name_hindi: string;
  name_english: string;
  description: string;
  ministry: string;
  benefit_amount: string;
  category: string;
  apply_url: string;
  is_central: boolean;
  match_reason?: string;
}

export interface Job {
  id: string;
  title: string;
  employer_name: string;
  district: string;
  state: string;
  daily_wage: number;
  sector: string;
  contact_number: string;
  description: string;
  created_at: string;
}

export interface AidCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  services: string[];
  timing: string;
  contact: string;
}

// ── Helper ───────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'API request failed');
  }
  return data as T;
}

// ── 1. STT — Convert recorded audio to text (Groq Whisper) ───────
// Usage: const { transcript } = await stt(audioBase64, 'hi')
export async function stt(
  audioBase64: string,
  language = 'hi',
  mimeType = 'audio/webm'
): Promise<{ transcript: string }> {
  return request('/api/stt', {
    method: 'POST',
    body: JSON.stringify({ audioBase64, language, mimeType }),
  });
}

// ── 2. TTS — Convert text to spoken audio (Sarvam AI) ────────────
// Usage: const { audioBase64 } = await tts('Namaste', 'hi')
// If Sarvam fails, falls back to browser speechSynthesis automatically
export async function tts(
  text: string,
  language = 'hi',
  gender: 'male' | 'female' = 'female'
): Promise<{ audioBase64?: string; format?: string; fallback?: string }> {
  try {
    return await request('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language, gender }),
    });
  } catch {
    // Auto fallback to browser TTS
    browserSpeak(text, language);
    return { fallback: 'use_browser_tts' };
  }
}

// Browser TTS fallback (no API needed)
export function browserSpeak(text: string, language = 'hi') {
  const langMap: Record<string, string> = {
    hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
    bn: 'bn-IN', mr: 'mr-IN', en: 'en-IN',
  };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langMap[language] || 'hi-IN';
  utterance.rate = 0.85;
  utterance.volume = 1;
  window.speechSynthesis.cancel(); // stop any current speech
  window.speechSynthesis.speak(utterance);
}

// Play base64 audio returned by Sarvam TTS
export function playAudio(audioBase64: string) {
  const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
  audio.play();
  return audio;
}

// ── 3. Extract profile from transcript (Groq LLM) ─────────────────
// Usage: const { profile } = await extractProfile(transcript, 'hi')
export async function extractProfile(
  transcript: string,
  language = 'hi'
): Promise<{ profile: UserProfile }> {
  return request('/api/extract-profile', {
    method: 'POST',
    body: JSON.stringify({ transcript, language }),
  });
}

// ── 4. Match schemes to user profile (Groq LLM) ──────────────────
// Usage: const { schemes } = await matchSchemes(userProfile)
export async function matchSchemes(
  profile: UserProfile
): Promise<{ schemes: Scheme[]; total: number }> {
  return request('/api/match-schemes', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
}

// ── 5. Save user profile to Supabase ─────────────────────────────
// Usage: const { user } = await saveUser(profile)
export async function saveUser(
  profile: UserProfile
): Promise<{ user: UserProfile }> {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
}

// ── 6. Get user by ID ─────────────────────────────────────────────
// Usage: const { user } = await getUser(userId)
export async function getUser(
  id: string
): Promise<{ user: UserProfile }> {
  return request(`/api/users/${id}`);
}

// ── 7. Get jobs (optionally filter by district/sector) ───────────
// Usage: const { jobs } = await getJobs({ district: 'Delhi' })
export async function getJobs(filters?: {
  district?: string;
  sector?: string;
}): Promise<{ jobs: Job[] }> {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  return request(`/api/jobs${params ? '?' + params : ''}`);
}

// ── 8. Post a new job listing ─────────────────────────────────────
export async function postJob(
  job: Omit<Job, 'id' | 'created_at'>
): Promise<{ job: Job }> {
  return request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });
}

// ── 9. Get aid centers ────────────────────────────────────────────
// Usage: const { centers } = await getAidCenters('Delhi')
export async function getAidCenters(
  district?: string
): Promise<{ centers: AidCenter[] }> {
  const params = district ? `?district=${encodeURIComponent(district)}` : '';
  return request(`/api/aid-centers${params}`);
}

// ── 10. Geocode location name to lat/lng ──────────────────────────
// Usage: const { lat, lng } = await geocode('Pune')
export async function geocode(
  location: string
): Promise<{ lat: number; lng: number }> {
  return request(`/api/geocode?location=${encodeURIComponent(location)}`);
}

// ── 11. AI chatbot ────────────────────────────────────────────────
// Usage: const { reply } = await chat('PM Kisan kya hai?', 'hi', profile)
export async function chat(
  message: string,
  language = 'hi',
  userProfile?: Partial<UserProfile>
): Promise<{ reply: string }> {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language, userProfile }),
  });
}

// ── 12. Admin stats ───────────────────────────────────────────────
export async function getAdminStats(): Promise<{
  stats: { total_users: number; total_jobs: number; total_schemes: number };
}> {
  return request('/api/admin/stats');
}

// ── Voice Registration Flow ───────────────────────────────────────
// Complete end-to-end: record → transcribe → extract → save → match

export const REGISTRATION_QUESTIONS = [
  { id: 'name',           hi: 'आपका नाम क्या है?',                    en: 'What is your name?' },
  { id: 'location',       hi: 'आप किस जिले और राज्य में रहते हैं?',    en: 'Which district and state do you live in?' },
  { id: 'occupation',     hi: 'आप क्या काम करते हैं?',                 en: 'What work do you do?' },
  { id: 'family',         hi: 'आपके परिवार में कितने लोग हैं?',         en: 'How many people are in your family?' },
  { id: 'income',         hi: 'आपकी महीने की आमदनी कितनी है?',          en: 'What is your monthly income in rupees?' },
  { id: 'disability',     hi: 'क्या आपके परिवार में कोई विकलांग है?',   en: 'Is anyone in your family disabled?' },
  { id: 'bpl',            hi: 'क्या आपके पास BPL कार्ड है?',             en: 'Do you have a BPL card?' },
];

// Record audio from mic and return base64
export async function recordAudio(durationMs = 5000): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), durationMs);
    } catch (err) {
      reject(err);
    }
  });
}