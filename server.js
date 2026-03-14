const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Sahaaya AI backend running ✓', version: '2.2' }));


// ══════════════════════════════════════════════════════════════
// STT — Groq Whisper Turbo (4x faster than large-v3)
// ══════════════════════════════════════════════════════════════
app.post('/api/stt', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm', language = 'hi' } = req.body;
  if (!audioBase64) return res.status(400).json({ success: false, error: 'No audio' });

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.webm', contentType: mimeType });
    form.append('model', 'whisper-large-v3-turbo'); // 4x faster, minimal accuracy loss
    form.append('language', language);
    form.append('response_format', 'json');
    form.append('temperature', '0');
    form.append('prompt', 'Welfare registration in Indian language. Name, location, income, family size.');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.json({ success: true, transcript: response.data.text });
  } catch (err) {
    console.error('STT error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: 'Voice recognition failed. Please type instead.',
      error_hi: 'आवाज़ पहचान में समस्या। कृपया टाइप करें।',
    });
  }
});


// ══════════════════════════════════════════════════════════════
// TTS — Sarvam AI Bulbul v3 with in-memory cache
// ══════════════════════════════════════════════════════════════
const SARVAM_LANG = {
  hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN',
  mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN',
  ml: 'ml-IN', or: 'od-IN', en: 'en-IN',
};

const SPEAKER = {
  female: 'priya',
  male:   'rahul',
};

// Cache repeated phrases (greetings, prompts, questions) — avoids redundant API calls
const ttsCache = new Map();
const TTS_CACHE_MAX = 150;

app.post('/api/tts', async (req, res) => {
  const { text, language = 'hi', gender = 'female' } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'No text' });

  const cacheKey = `${language}:${gender}:${text}`;
  if (ttsCache.has(cacheKey)) {
    return res.json({ success: true, audioBase64: ttsCache.get(cacheKey), format: 'wav', cached: true });
  }

  const targetLang = SARVAM_LANG[language] || 'hi-IN';
  const speaker    = SPEAKER[gender] || 'priya';

  try {
    const response = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        inputs: [text],
        target_language_code: targetLang,
        speaker,
        model: 'bulbul:v3',
        pace: 0.9,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
      },
      {
        headers: {
          'api-subscription-key': process.env.SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    const audio = response.data.audios[0];
    if (ttsCache.size < TTS_CACHE_MAX) ttsCache.set(cacheKey, audio);
    res.json({ success: true, audioBase64: audio, format: 'wav' });
  } catch (err) {
    console.error('Sarvam TTS error:', err.response?.data || err.message);
    res.status(500).json({ success: false, fallback: 'use_browser_tts' });
  }
});


// ══════════════════════════════════════════════════════════════
// AI — Extract profile from transcript
// ══════════════════════════════════════════════════════════════
app.post('/api/extract-profile', async (req, res) => {
  const { transcript, language = 'hi' } = req.body;
  if (!transcript) return res.status(400).json({ success: false, error: 'No transcript' });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Extract welfare profile data from Indian language input. Return ONLY JSON:
{"name":string|null,"district":string|null,"state":string|null,"occupation":string|null,
"family_size":number|null,"monthly_income":number|null,"has_disability":boolean,
"has_bpl_card":boolean,"age":number|null,"gender":"male"|"female"|"other"|null}
Booleans default false. Income in rupees/month.`,
          },
          { role: 'user', content: `Language: ${language}\nTranscript: ${transcript}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, profile: JSON.parse(response.data.choices[0].message.content) });
  } catch (err) {
    console.error('Extract profile error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: 'Extraction failed' });
  }
});


// ══════════════════════════════════════════════════════════════
// AI — Match schemes to user profile
// ══════════════════════════════════════════════════════════════
app.post('/api/match-schemes', async (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ success: false, error: 'No profile' });

  const { data: schemes, error } = await supabase.from('schemes').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  if (!schemes?.length) return res.json({ success: true, schemes: [] });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Match Indian welfare schemes to user. Return ONLY JSON: {"matched_scheme_ids":[],"reasons":{"id":"reason in Hindi and English"}}',
          },
          {
            role: 'user',
            content: `Profile: ${JSON.stringify(profile)}\n\nSchemes: ${JSON.stringify(
              schemes.map(s => ({
                id: s.id,
                name: s.name_english,
                income_max: s.eligibility_income_max,
                bpl_required: s.eligibility_bpl_required,
                disability: s.eligibility_disability,
                category: s.category,
              }))
            )}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    const matched = schemes
      .filter(s => result.matched_scheme_ids.includes(s.id))
      .map(s => ({ ...s, match_reason: result.reasons?.[s.id] || 'Eligible based on your profile' }));
    res.json({ success: true, schemes: matched, total: matched.length });
  } catch (err) {
    console.error('Scheme match error:', err.response?.data || err.message);
    const matched = schemes.filter(s => {
      if (s.eligibility_bpl_required && !profile.has_bpl_card) return false;
      if (s.eligibility_disability && !profile.has_disability) return false;
      if (s.eligibility_income_max && profile.monthly_income > s.eligibility_income_max / 12) return false;
      return true;
    });
    res.json({ success: true, schemes: matched, total: matched.length, fallback: true });
  }
});


// ══════════════════════════════════════════════════════════════
// AI — Welfare chatbot
// ══════════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, language = 'hi', userProfile = {} } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'No message' });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Sahaaya, a kind AI assistant for poor families in India.
Respond in ${language === 'hi' ? 'simple Hindi' : 'simple English'}. Under 80 words. Warm and helpful.
User context: ${JSON.stringify(userProfile)}`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: 'Chat unavailable' });
  }
});


// ══════════════════════════════════════════════════════════════
// USERS — Save profile (Create)
// ══════════════════════════════════════════════════════════════
app.post('/api/users', async (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ success: false, error: 'No profile' });

  const { data, error } = await supabase
    .from('users')
    .insert([profile])
    .select()
    .single();

  if (error) {
    console.error('Save user error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true, user: data });
});


// ══════════════════════════════════════════════════════════════
// USERS — Get all (Admin dashboard)
// ══════════════════════════════════════════════════════════════
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, users: data });
});


// ══════════════════════════════════════════════════════════════
// USERS — Search by name + district (Login)
// ⚠️  MUST be defined BEFORE /api/users/:id
// ══════════════════════════════════════════════════════════════
app.get('/api/users/search', async (req, res) => {
  const { name, district } = req.query;
  if (!name || !district) {
    return res.status(400).json({ success: false, error: 'Name and district are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('name',     `%${name.trim()}%`)
    .ilike('district', `%${district.trim()}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return res.status(404).json({ success: false, error: 'No profile found. Please register first.' });
  }

  const { data: schemes } = await supabase.from('schemes').select('*');
  res.json({ success: true, user: data, schemes: schemes || [] });
});


// ══════════════════════════════════════════════════════════════
// USERS — Get by ID
// ⚠️  MUST be defined AFTER /api/users/search
// ══════════════════════════════════════════════════════════════
app.get('/api/users/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user: data });
});


// ══════════════════════════════════════════════════════════════
// USERS — Full update (PUT) — replaces the whole record
// ══════════════════════════════════════════════════════════════
app.put('/api/users/:id', async (req, res) => {
  const allowed = [
    'name', 'district', 'state', 'occupation',
    'monthly_income', 'family_size', 'age', 'gender',
    'has_bpl_card', 'has_disability',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, user: data });
});


// ══════════════════════════════════════════════════════════════
// USERS — Partial update (PATCH) — updates one or more fields
// ══════════════════════════════════════════════════════════════
app.patch('/api/users/:id', async (req, res) => {
  const allowed = [
    'name', 'district', 'state', 'occupation',
    'monthly_income', 'family_size', 'age', 'gender',
    'has_bpl_card', 'has_disability',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, user: data });
});


// ══════════════════════════════════════════════════════════════
// USERS — Delete
// ══════════════════════════════════════════════════════════════
app.delete('/api/users/:id', async (req, res) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'User deleted' });
});


// ══════════════════════════════════════════════════════════════
// JOBS — Get (filter by district / sector)
// ══════════════════════════════════════════════════════════════
app.get('/api/jobs', async (req, res) => {
  let query = supabase.from('jobs').select('*').eq('is_active', true);
  if (req.query.district) query = query.ilike('district', `%${req.query.district}%`);
  if (req.query.sector)   query = query.eq('sector', req.query.sector);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, jobs: data });
});


// ══════════════════════════════════════════════════════════════
// JOBS — Post new listing
// ══════════════════════════════════════════════════════════════
app.post('/api/jobs', async (req, res) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ ...req.body, is_active: true }])
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, job: data });
});


// ══════════════════════════════════════════════════════════════
// JOBS — Update
// ══════════════════════════════════════════════════════════════
app.patch('/api/jobs/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, job: data });
});


// ══════════════════════════════════════════════════════════════
// JOBS — Delete / deactivate
// ══════════════════════════════════════════════════════════════
app.delete('/api/jobs/:id', async (req, res) => {
  // Soft delete — set is_active = false
  const { data, error } = await supabase
    .from('jobs')
    .update({ is_active: false })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Job deactivated', job: data });
});


// ══════════════════════════════════════════════════════════════
// AID CENTERS
// ══════════════════════════════════════════════════════════════
app.get('/api/aid-centers', async (req, res) => {
  let query = supabase.from('aid_centers').select('*');
  if (req.query.district) query = query.ilike('district', `%${req.query.district}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, centers: data });
});


// ══════════════════════════════════════════════════════════════
// GEOCODE — OpenStreetMap Nominatim (free)
// ══════════════════════════════════════════════════════════════
app.get('/api/geocode', async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ success: false, error: 'No location' });

  try {
    const geoRes = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', India')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SahaayaAI/1.0 welfare-platform' } }
    );
    if (!geoRes.data.length) return res.json({ success: false, error: 'Location not found' });
    const { lat, lon } = geoRes.data[0];
    res.json({ success: true, lat: parseFloat(lat), lng: parseFloat(lon) });
  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ success: false, error: 'Geocoding failed' });
  }
});


// ══════════════════════════════════════════════════════════════
// ADMIN STATS
// ══════════════════════════════════════════════════════════════
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [usersRes, jobsRes, schemesRes] = await Promise.all([
      supabase.from('users').select('id, district, created_at', { count: 'exact' }),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('schemes').select('id', { count: 'exact' }),
    ]);

    res.json({
      success: true,
      stats: {
        total_users:   usersRes.count   || 0,
        total_jobs:    jobsRes.count    || 0,
        total_schemes: schemesRes.count || 0,
        recent_users:  usersRes.data?.slice(-5).reverse() || [],
      },
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, error: 'Stats unavailable' });
  }
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Get all
// ══════════════════════════════════════════════════════════════
app.get('/api/schemes', async (req, res) => {
  const { data, error } = await supabase.from('schemes').select('*').order('name_english');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, schemes: data });
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Get by ID
// ══════════════════════════════════════════════════════════════
app.get('/api/schemes/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ success: false, error: 'Scheme not found' });
  res.json({ success: true, scheme: data });
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Create
// ══════════════════════════════════════════════════════════════
app.post('/api/schemes', async (req, res) => {
  const allowed = [
    'name_english', 'name_hindi', 'category', 'description',
    'eligibility_income_max', 'eligibility_bpl_required', 'eligibility_disability',
  ];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  const { data, error } = await supabase
    .from('schemes')
    .insert([payload])
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, scheme: data });
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Full update (PUT)
// ══════════════════════════════════════════════════════════════
app.put('/api/schemes/:id', async (req, res) => {
  const allowed = [
    'name_english', 'name_hindi', 'category', 'description',
    'eligibility_income_max', 'eligibility_bpl_required', 'eligibility_disability',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('schemes')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, scheme: data });
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Partial update (PATCH)
// ══════════════════════════════════════════════════════════════
app.patch('/api/schemes/:id', async (req, res) => {
  const allowed = [
    'name_english', 'name_hindi', 'category', 'description',
    'eligibility_income_max', 'eligibility_bpl_required', 'eligibility_disability',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('schemes')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, scheme: data });
});


// ══════════════════════════════════════════════════════════════
// SCHEMES — Delete
// ══════════════════════════════════════════════════════════════
app.delete('/api/schemes/:id', async (req, res) => {
  const { error } = await supabase
    .from('schemes')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Scheme deleted' });
});


// ══════════════════════════════════════════════════════════════
// Keepalive — prevents Supabase free tier from pausing
// ══════════════════════════════════════════════════════════════
setInterval(async () => {
  try {
    await supabase.from('schemes').select('id').limit(1);
    console.log(`[${new Date().toISOString()}] Supabase keepalive ✓`);
  } catch (err) {
    console.error('Keepalive failed:', err.message);
  }
}, 1000 * 60 * 60 * 24 * 5);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   Sahaaya AI Backend running ✓       ║
  ║   Port: ${PORT}                         ║
  ║   Whisper: turbo (4x faster)         ║
  ║   TTS: cached + browser fallback     ║
  ╚══════════════════════════════════════╝
  `);
});