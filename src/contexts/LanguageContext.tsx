import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type LangCode = 'hi' | 'en' | 'ta' | 'te' | 'bn' | 'mr';

export const LANGUAGES: { code: LangCode; label: string; nativeLabel: string; speechCode: string }[] = [
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', speechCode: 'mr-IN' },
];

// Translation keys
type TranslationKeys = {
  // Nav
  admin: string;
  
  // Landing
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  registerCTA: string;
  demoMode: string;
  schemesAvailable: string;
  usersHelped: string;
  statesCovered: string;
  howItWorks: string;
  stepSpeak: string;
  stepSpeakDesc: string;
  stepProfile: string;
  stepProfileDesc: string;
  stepMatch: string;
  stepMatchDesc: string;
  whatWeCover: string;
  food: string;
  housing: string;
  health: string;
  education: string;
  jobs: string;
  footer: string;

  // Register
  back: string;
  question: string;
  of: string;
  listening: string;
  speaking: string;
  tapToSpeak: string;
  confirm: string;
  retry: string;
  typeInstead: string;
  useVoice: string;
  yourAnswers: string;
  profileCreating: string;
  profileCreatingDesc: string;
  micNotSupported: string;

  // Register questions
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  warmResponse1: string;
  warmResponse2: string;
  warmResponse3: string;
  warmResponse4: string;
  warmResponse5: string;
  warmResponse6: string;
  warmResponse7: string;
  thankYouProfile: string;

  // Profile
  yourQRCode: string;
  schemesMatched: string;
  schemes: string;
  jobsTab: string;
  aidCenters: string;
  all: string;
  central: string;
  eligible: string;
  applyNow: string;
  noSchemesFound: string;
  callEmployer: string;
  family: string;
  members: string;
  income: string;
  perMonth: string;
  bplCard: string;
  disability: string;
  yes: string;
  no: string;
  downloadQR: string;

  // Verify
  verification: string;
  registered: string;
  eligibleSchemes: string;
  markAsAided: string;
  markedAsAided: string;
  userNotFound: string;
  userNotFoundDesc: string;
  homePage: string;

  // Admin
  adminPortal: string;
  ngoLogin: string;
  login: string;
  invalidCredentials: string;
  totalRegistrations: string;
  schemesMatchedAdmin: string;
  districts: string;
  thisWeek: string;
  searchUsers: string;
  name: string;
  district: string;
  postJob: string;

  // Post Job
  postJobTitle: string;
  postJobSubtitle: string;
  jobTitle: string;
  employerName: string;
  state: string;
  dailyWage: string;
  contactNumber: string;
  sector: string;
  description: string;
  postJobBtn: string;
  jobPosted: string;
  jobPostedDesc: string;
  postAnother: string;
  home: string;
};

const translations: Record<LangCode, TranslationKeys> = {
  hi: {
    admin: 'एडमिन',
    heroTitle: 'अपना हक़ पाएं',
    heroSubtitle: 'वॉइस-पावर्ड कल्याण सहायता',
    heroDescription: 'बस बोलिये, और Sahaaya AI आपके लिए सरकारी योजनाएं, नौकरी, और सहायता केंद्र खोजेगा।',
    registerCTA: 'रजिस्टर करें',
    demoMode: 'डेमो मोड',
    schemesAvailable: 'योजनाएं',
    usersHelped: 'लोगों की मदद',
    statesCovered: 'राज्य',
    howItWorks: 'कैसे काम करता है?',
    stepSpeak: 'बोलिये',
    stepSpeakDesc: 'माइक बटन दबाएं और अपनी जानकारी बोलें। AI आपसे आपकी भाषा में बात करेगा।',
    stepProfile: 'प्रोफ़ाइल',
    stepProfileDesc: 'आपका प्रोफ़ाइल बनेगा और QR कोड मिलेगा जो कहीं भी दिखा सकते हैं।',
    stepMatch: 'योजनाएं पाएं',
    stepMatchDesc: 'AI आपके लिए सही सरकारी योजनाएं, नौकरी और सहायता केंद्र खोजेगा।',
    whatWeCover: 'हम कैसे मदद करते हैं',
    food: 'खाद्य',
    housing: 'आवास',
    health: 'स्वास्थ्य',
    education: 'शिक्षा',
    jobs: 'रोज़गार',
    footer: '© 2026 Sahaaya AI — सबके लिए सहायता | भारत के लिए बना 🇮🇳',
    back: 'वापस',
    question: 'सवाल',
    of: 'में से',
    listening: 'सुन रहा हूँ... बोलिये',
    speaking: 'बोल रहा हूँ...',
    tapToSpeak: 'माइक दबाएं',
    confirm: 'सही है',
    retry: 'फिर से',
    typeInstead: 'टाइप करें',
    useVoice: 'वॉइस से जवाब दें',
    yourAnswers: 'आपके जवाब',
    profileCreating: 'आपका प्रोफ़ाइल बन रहा है...',
    profileCreatingDesc: 'योजनाएं खोज रहे हैं',
    micNotSupported: 'आपके ब्राउज़र में वॉइस सुविधा उपलब्ध नहीं है। कृपया टेक्स्ट फॉर्म का उपयोग करें।',
    q1: 'आपका नाम क्या है?',
    q2: 'आप कहाँ रहते हैं? अपना जिला और राज्य बताइये।',
    q3: 'आप क्या काम करते हैं?',
    q4: 'आपके परिवार में कितने लोग हैं?',
    q5: 'आपकी महीने की कमाई कितनी है?',
    q6: 'क्या आपके परिवार में कोई विकलांग हैं?',
    q7: 'क्या आपके पास BPL कार्ड है?',
    warmResponse1: 'बहुत अच्छा! अगला सवाल सुनिये...',
    warmResponse2: 'शुक्रिया! चलिये आगे बढ़ते हैं...',
    warmResponse3: 'समझ गया! अब अगला सवाल...',
    warmResponse4: 'ठीक है! बस कुछ और सवाल...',
    warmResponse5: 'बहुत बढ़िया! अब बताइये...',
    warmResponse6: 'अच्छा! लगभग हो गया...',
    warmResponse7: 'बिल्कुल! यह आखिरी सवाल है...',
    thankYouProfile: 'शुक्रिया! आपका प्रोफ़ाइल बन रहा है...',
    yourQRCode: 'आपका QR कोड',
    schemesMatched: 'योजनाएं मैच हुईं',
    schemes: 'योजनाएं',
    jobsTab: 'नौकरी',
    aidCenters: 'सहायता केंद्र',
    all: 'सभी',
    central: 'केंद्रीय',
    eligible: 'पात्र',
    applyNow: 'आवेदन करें',
    noSchemesFound: 'इस श्रेणी में कोई योजना नहीं मिली',
    callEmployer: 'कॉल करें',
    family: 'परिवार',
    members: 'सदस्य',
    income: 'आय',
    perMonth: '/माह',
    bplCard: 'BPL कार्ड',
    disability: 'विकलांगता',
    yes: 'हाँ ✓',
    no: 'नहीं',
    downloadQR: 'QR डाउनलोड करें',
    verification: 'सत्यापन',
    registered: 'पंजीकरण',
    eligibleSchemes: 'पात्र योजनाएं',
    markAsAided: 'सहायता दी गई',
    markedAsAided: 'सहायता दर्ज की गई',
    userNotFound: 'उपयोगकर्ता नहीं मिला',
    userNotFoundDesc: 'QR कोड अमान्य हो सकता है।',
    homePage: 'होम पेज',
    adminPortal: 'एडमिन पोर्टल',
    ngoLogin: 'NGO / एडमिन लॉगिन',
    login: 'लॉगिन',
    invalidCredentials: 'गलत लॉगिन',
    totalRegistrations: 'कुल पंजीकरण',
    schemesMatchedAdmin: 'योजनाएं मैच',
    districts: 'जिले',
    thisWeek: 'इस सप्ताह',
    searchUsers: 'खोजें...',
    name: 'नाम',
    district: 'जिला',
    postJob: 'नौकरी पोस्ट',
    postJobTitle: 'नौकरी पोस्ट करें',
    postJobSubtitle: 'नौकरी लिस्टिंग पोस्ट करें',
    jobTitle: 'पद का नाम',
    employerName: 'नियोक्ता',
    state: 'राज्य',
    dailyWage: 'दैनिक मजदूरी (₹)',
    contactNumber: 'संपर्क नंबर',
    sector: 'क्षेत्र',
    description: 'विवरण',
    postJobBtn: 'पोस्ट करें',
    jobPosted: 'नौकरी पोस्ट हो गई!',
    jobPostedDesc: 'सफलतापूर्वक पोस्ट हो गई!',
    postAnother: 'एक और पोस्ट करें',
    home: 'होम',
  },
  en: {
    admin: 'Admin',
    heroTitle: 'Get Your Rights',
    heroSubtitle: 'Voice-powered welfare assistance',
    heroDescription: 'Just speak, and Sahaaya AI will find government schemes, jobs, and aid centers for you.',
    registerCTA: 'Register Now',
    demoMode: 'Demo Mode',
    schemesAvailable: 'Schemes',
    usersHelped: 'Users Helped',
    statesCovered: 'States',
    howItWorks: 'How It Works',
    stepSpeak: 'Speak',
    stepSpeakDesc: 'Tap the mic button and speak your details. AI will talk to you in your language.',
    stepProfile: 'Profile',
    stepProfileDesc: 'Your profile will be created with a QR code you can show anywhere.',
    stepMatch: 'Get Matched',
    stepMatchDesc: 'AI will find the right government schemes, jobs, and aid centers for you.',
    whatWeCover: 'What We Cover',
    food: 'Food',
    housing: 'Housing',
    health: 'Health',
    education: 'Education',
    jobs: 'Jobs',
    footer: '© 2026 Sahaaya AI — Assistance for all | Built for India 🇮🇳',
    back: 'Back',
    question: 'Question',
    of: 'of',
    listening: 'Listening... speak now',
    speaking: 'Speaking...',
    tapToSpeak: 'Tap to speak',
    confirm: 'Confirm',
    retry: 'Retry',
    typeInstead: 'Type Instead',
    useVoice: 'Use Voice',
    yourAnswers: 'Your answers',
    profileCreating: 'Creating your profile...',
    profileCreatingDesc: 'Matching schemes for you',
    micNotSupported: 'Voice feature not available in your browser. Please use the text form.',
    q1: 'What is your name?',
    q2: 'Where do you live? Tell your district and state.',
    q3: 'What is your occupation?',
    q4: 'How many family members?',
    q5: 'What is your monthly income in rupees?',
    q6: 'Is anyone in your family disabled?',
    q7: 'Do you have a BPL card?',
    warmResponse1: 'Great! Listen to the next question...',
    warmResponse2: 'Thank you! Let\'s move on...',
    warmResponse3: 'Got it! Next question...',
    warmResponse4: 'Okay! Just a few more questions...',
    warmResponse5: 'Wonderful! Now tell me...',
    warmResponse6: 'Good! Almost done...',
    warmResponse7: 'Perfect! This is the last question...',
    thankYouProfile: 'Thank you! Creating your profile...',
    yourQRCode: 'Your QR Code',
    schemesMatched: 'schemes matched',
    schemes: 'Schemes',
    jobsTab: 'Jobs',
    aidCenters: 'Aid Centers',
    all: 'All',
    central: 'Central',
    eligible: 'Eligible',
    applyNow: 'Apply Now',
    noSchemesFound: 'No schemes found in this category',
    callEmployer: 'Call',
    family: 'Family',
    members: 'members',
    income: 'Income',
    perMonth: '/month',
    bplCard: 'BPL Card',
    disability: 'Disability',
    yes: 'Yes ✓',
    no: 'No',
    downloadQR: 'Download QR',
    verification: 'Verification',
    registered: 'Registered',
    eligibleSchemes: 'Eligible Schemes',
    markAsAided: 'Mark as Aided',
    markedAsAided: 'Marked as Aided',
    userNotFound: 'User Not Found',
    userNotFoundDesc: 'The QR code may be invalid.',
    homePage: 'Home Page',
    adminPortal: 'Admin Portal',
    ngoLogin: 'NGO / Admin Login',
    login: 'Login',
    invalidCredentials: 'Invalid credentials',
    totalRegistrations: 'Registrations',
    schemesMatchedAdmin: 'Schemes Matched',
    districts: 'Districts',
    thisWeek: 'This Week',
    searchUsers: 'Search users...',
    name: 'Name',
    district: 'District',
    postJob: 'Post Job',
    postJobTitle: 'Post a Job',
    postJobSubtitle: 'Post a Job Listing',
    jobTitle: 'Job Title',
    employerName: 'Employer Name',
    state: 'State',
    dailyWage: 'Daily Wage (₹)',
    contactNumber: 'Contact Number',
    sector: 'Sector',
    description: 'Description',
    postJobBtn: 'Post Job',
    jobPosted: 'Job Posted!',
    jobPostedDesc: 'Successfully posted!',
    postAnother: 'Post Another',
    home: 'Home',
  },
  ta: {
    admin: 'நிர்வாகி',
    heroTitle: 'உங்கள் உரிமையைப் பெறுங்கள்',
    heroSubtitle: 'குரல் அடிப்படையிலான நலத்திட்ட உதவி',
    heroDescription: 'பேசுங்கள், Sahaaya AI உங்களுக்கான அரசு திட்டங்கள், வேலைகள் மற்றும் உதவி மையங்களைக் கண்டறியும்.',
    registerCTA: 'பதிவு செய்யுங்கள்',
    demoMode: 'டெமோ பயன்முறை',
    schemesAvailable: 'திட்டங்கள்',
    usersHelped: 'பயனர்களுக்கு உதவி',
    statesCovered: 'மாநிலங்கள்',
    howItWorks: 'இது எப்படி வேலை செய்கிறது?',
    stepSpeak: 'பேசுங்கள்',
    stepSpeakDesc: 'மைக் பட்டனை அழுத்தி உங்கள் விவரங்களைச் சொல்லுங்கள். AI உங்கள் மொழியில் பேசும்.',
    stepProfile: 'சுயவிவரம்',
    stepProfileDesc: 'உங்கள் சுயவிவரம் QR குறியீட்டுடன் உருவாக்கப்படும்.',
    stepMatch: 'பொருத்தம் பெறுங்கள்',
    stepMatchDesc: 'AI உங்களுக்கான சரியான அரசு திட்டங்கள், வேலைகள் மற்றும் உதவி மையங்களைக் கண்டறியும்.',
    whatWeCover: 'நாங்கள் எவ்வாறு உதவுகிறோம்',
    food: 'உணவு',
    housing: 'வீட்டுவசதி',
    health: 'சுகாதாரம்',
    education: 'கல்வி',
    jobs: 'வேலை',
    footer: '© 2026 Sahaaya AI — அனைவருக்கும் உதவி | இந்தியாவுக்காக உருவாக்கப்பட்டது 🇮🇳',
    back: 'பின்செல்',
    question: 'கேள்வி',
    of: 'இல்',
    listening: 'கேட்கிறேன்... பேசுங்கள்',
    speaking: 'பேசுகிறேன்...',
    tapToSpeak: 'பேச தட்டுங்கள்',
    confirm: 'சரி',
    retry: 'மீண்டும்',
    typeInstead: 'டைப் செய்யுங்கள்',
    useVoice: 'குரல் பயன்படுத்துங்கள்',
    yourAnswers: 'உங்கள் பதில்கள்',
    profileCreating: 'உங்கள் சுயவிவரம் உருவாகிறது...',
    profileCreatingDesc: 'திட்டங்களைப் பொருத்துகிறோம்',
    micNotSupported: 'உங்கள் உலாவியில் குரல் வசதி இல்லை. உரை படிவத்தைப் பயன்படுத்தவும்.',
    q1: 'உங்கள் பெயர் என்ன?',
    q2: 'நீங்கள் எங்கே வசிக்கிறீர்கள்? உங்கள் மாவட்டம் மற்றும் மாநிலத்தைச் சொல்லுங்கள்.',
    q3: 'உங்கள் தொழில் என்ன?',
    q4: 'உங்கள் குடும்பத்தில் எத்தனை பேர்?',
    q5: 'உங்கள் மாத வருமானம் எவ்வளவு?',
    q6: 'உங்கள் குடும்பத்தில் யாரேனும் மாற்றுத்திறனாளியா?',
    q7: 'உங்களிடம் BPL அட்டை உள்ளதா?',
    warmResponse1: 'மிகவும் நல்லது! அடுத்த கேள்வி...',
    warmResponse2: 'நன்றி! தொடர்வோம்...',
    warmResponse3: 'புரிந்தது! அடுத்த கேள்வி...',
    warmResponse4: 'சரி! இன்னும் சில கேள்விகள்...',
    warmResponse5: 'அருமை! இப்போது சொல்லுங்கள்...',
    warmResponse6: 'நல்லது! கிட்டத்தட்ட முடிந்தது...',
    warmResponse7: 'சரி! இது கடைசி கேள்வி...',
    thankYouProfile: 'நன்றி! உங்கள் சுயவிவரம் உருவாகிறது...',
    yourQRCode: 'உங்கள் QR குறியீடு',
    schemesMatched: 'திட்டங்கள் பொருந்தின',
    schemes: 'திட்டங்கள்',
    jobsTab: 'வேலைகள்',
    aidCenters: 'உதவி மையங்கள்',
    all: 'அனைத்தும்',
    central: 'மத்திய',
    eligible: 'தகுதியுள்ள',
    applyNow: 'விண்ணப்பிக்கவும்',
    noSchemesFound: 'இந்த வகையில் திட்டங்கள் இல்லை',
    callEmployer: 'அழைக்கவும்',
    family: 'குடும்பம்',
    members: 'உறுப்பினர்கள்',
    income: 'வருமானம்',
    perMonth: '/மாதம்',
    bplCard: 'BPL அட்டை',
    disability: 'மாற்றுத்திறன்',
    yes: 'ஆம் ✓',
    no: 'இல்லை',
    downloadQR: 'QR பதிவிறக்கம்',
    verification: 'சரிபார்ப்பு',
    registered: 'பதிவு',
    eligibleSchemes: 'தகுதியான திட்டங்கள்',
    markAsAided: 'உதவி அளிக்கப்பட்டது',
    markedAsAided: 'உதவி பதிவு செய்யப்பட்டது',
    userNotFound: 'பயனர் கிடைக்கவில்லை',
    userNotFoundDesc: 'QR குறியீடு தவறானதாக இருக்கலாம்.',
    homePage: 'முகப்பு',
    adminPortal: 'நிர்வாகி போர்டல்',
    ngoLogin: 'NGO / நிர்வாகி உள்நுழைவு',
    login: 'உள்நுழை',
    invalidCredentials: 'தவறான உள்நுழைவு',
    totalRegistrations: 'மொத்த பதிவுகள்',
    schemesMatchedAdmin: 'திட்டங்கள் பொருத்தம்',
    districts: 'மாவட்டங்கள்',
    thisWeek: 'இந்த வாரம்',
    searchUsers: 'தேடுங்கள்...',
    name: 'பெயர்',
    district: 'மாவட்டம்',
    postJob: 'வேலை பதிவு',
    postJobTitle: 'வேலை பதிவு செய்யுங்கள்',
    postJobSubtitle: 'வேலை பட்டியலை பதிவு செய்யுங்கள்',
    jobTitle: 'பதவி பெயர்',
    employerName: 'நிறுவனம்',
    state: 'மாநிலம்',
    dailyWage: 'தினசரி ஊதியம் (₹)',
    contactNumber: 'தொடர்பு எண்',
    sector: 'துறை',
    description: 'விளக்கம்',
    postJobBtn: 'பதிவு செய்',
    jobPosted: 'வேலை பதிவு ஆனது!',
    jobPostedDesc: 'வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    postAnother: 'மேலும் ஒன்று பதிவு',
    home: 'முகப்பு',
  },
  te: {
    admin: 'అడ్మిన్',
    heroTitle: 'మీ హక్కు పొందండి',
    heroSubtitle: 'వాయిస్ ఆధారిత సంక్షేమ సహాయం',
    heroDescription: 'మాట్లాడండి, Sahaaya AI మీ కోసం ప్రభుత్వ పథకాలు, ఉద్యోగాలు మరియు సహాయ కేంద్రాలను కనుగొంటుంది.',
    registerCTA: 'నమోదు చేయండి',
    demoMode: 'డెమో మోడ్',
    schemesAvailable: 'పథకాలు',
    usersHelped: 'సహాయం చేసిన వారు',
    statesCovered: 'రాష్ట్రాలు',
    howItWorks: 'ఇది ఎలా పని చేస్తుంది?',
    stepSpeak: 'మాట్లాడండి',
    stepSpeakDesc: 'మైక్ బటన్ నొక్కి మీ వివరాలు చెప్పండి. AI మీ భాషలో మాట్లాడుతుంది.',
    stepProfile: 'ప్రొఫైల్',
    stepProfileDesc: 'మీ ప్రొఫైల్ QR కోడ్‌తో సృష్టించబడుతుంది.',
    stepMatch: 'పొందండి',
    stepMatchDesc: 'AI మీకు సరైన ప్రభుత్వ పథకాలు, ఉద్యోగాలు మరియు సహాయ కేంద్రాలను కనుగొంటుంది.',
    whatWeCover: 'మేము ఎలా సహాయం చేస్తాము',
    food: 'ఆహారం',
    housing: 'గృహ నిర్మాణం',
    health: 'ఆరోగ్యం',
    education: 'విద్య',
    jobs: 'ఉద్యోగాలు',
    footer: '© 2026 Sahaaya AI — అందరికీ సహాయం | భారతదేశం కోసం 🇮🇳',
    back: 'వెనుకకు',
    question: 'ప్రశ్న',
    of: 'లో',
    listening: 'వింటున్నాను... మాట్లాడండి',
    speaking: 'మాట్లాడుతున్నాను...',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    confirm: 'సరే',
    retry: 'మళ్ళీ',
    typeInstead: 'టైప్ చేయండి',
    useVoice: 'వాయిస్ ఉపయోగించండి',
    yourAnswers: 'మీ సమాధానాలు',
    profileCreating: 'మీ ప్రొఫైల్ సృష్టిస్తున్నాము...',
    profileCreatingDesc: 'పథకాలను సరిపోల్చుతున్నాము',
    micNotSupported: 'మీ బ్రౌజర్‌లో వాయిస్ సౌకర్యం అందుబాటులో లేదు. టెక్స్ట్ ఫారం ఉపయోగించండి.',
    q1: 'మీ పేరు ఏమిటి?',
    q2: 'మీరు ఎక్కడ నివసిస్తున్నారు? మీ జిల్లా మరియు రాష్ట్రం చెప్పండి.',
    q3: 'మీ వృత్తి ఏమిటి?',
    q4: 'మీ కుటుంబంలో ఎంతమంది ఉన్నారు?',
    q5: 'మీ నెలవారీ ఆదాయం ఎంత?',
    q6: 'మీ కుటుంబంలో ఎవరైనా వికలాంగులు ఉన్నారా?',
    q7: 'మీ దగ్గర BPL కార్డ్ ఉందా?',
    warmResponse1: 'చాలా బాగుంది! తదుపరి ప్రశ్న...',
    warmResponse2: 'ధన్యవాదాలు! ముందుకు వెళ్దాం...',
    warmResponse3: 'అర్థమైంది! తదుపరి ప్రశ్న...',
    warmResponse4: 'సరే! ఇంకా కొన్ని ప్రశ్నలు...',
    warmResponse5: 'అద్భుతం! ఇప్పుడు చెప్పండి...',
    warmResponse6: 'బాగుంది! దాదాపు పూర్తయింది...',
    warmResponse7: 'సరే! ఇది చివరి ప్రశ్న...',
    thankYouProfile: 'ధన్యవాదాలు! మీ ప్రొఫైల్ సృష్టిస్తున్నాము...',
    yourQRCode: 'మీ QR కోడ్',
    schemesMatched: 'పథకాలు సరిపోలాయి',
    schemes: 'పథకాలు',
    jobsTab: 'ఉద్యోగాలు',
    aidCenters: 'సహాయ కేంద్రాలు',
    all: 'అన్నీ',
    central: 'కేంద్ర',
    eligible: 'అర్హత',
    applyNow: 'దరఖాస్తు చేయండి',
    noSchemesFound: 'ఈ వర్గంలో పథకాలు లేవు',
    callEmployer: 'కాల్ చేయండి',
    family: 'కుటుంబం',
    members: 'సభ్యులు',
    income: 'ఆదాయం',
    perMonth: '/నెల',
    bplCard: 'BPL కార్డ్',
    disability: 'వికలాంగత',
    yes: 'అవును ✓',
    no: 'లేదు',
    downloadQR: 'QR డౌన్‌లోడ్',
    verification: 'ధృవీకరణ',
    registered: 'నమోదు',
    eligibleSchemes: 'అర్హత గల పథకాలు',
    markAsAided: 'సహాయం అందించబడింది',
    markedAsAided: 'సహాయం నమోదు చేయబడింది',
    userNotFound: 'వినియోగదారు కనుగొనబడలేదు',
    userNotFoundDesc: 'QR కోడ్ చెల్లనిది కావచ్చు.',
    homePage: 'హోమ్ పేజీ',
    adminPortal: 'అడ్మిన్ పోర్టల్',
    ngoLogin: 'NGO / అడ్మిన్ లాగిన్',
    login: 'లాగిన్',
    invalidCredentials: 'తప్పు లాగిన్',
    totalRegistrations: 'మొత్తం నమోదులు',
    schemesMatchedAdmin: 'పథకాలు సరిపోలాయి',
    districts: 'జిల్లాలు',
    thisWeek: 'ఈ వారం',
    searchUsers: 'వెతకండి...',
    name: 'పేరు',
    district: 'జిల్లా',
    postJob: 'ఉద్యోగం పోస్ట్',
    postJobTitle: 'ఉద్యోగం పోస్ట్ చేయండి',
    postJobSubtitle: 'ఉద్యోగ జాబితా పోస్ట్ చేయండి',
    jobTitle: 'ఉద్యోగం పేరు',
    employerName: 'యజమాని',
    state: 'రాష్ట్రం',
    dailyWage: 'రోజువారీ వేతనం (₹)',
    contactNumber: 'సంప్రదింపు నంబర్',
    sector: 'రంగం',
    description: 'వివరణ',
    postJobBtn: 'పోస్ట్ చేయండి',
    jobPosted: 'ఉద్యోగం పోస్ట్ అయింది!',
    jobPostedDesc: 'విజయవంతంగా పోస్ట్ చేయబడింది!',
    postAnother: 'మరొకటి పోస్ట్ చేయండి',
    home: 'హోమ్',
  },
  bn: {
    admin: 'অ্যাডমিন',
    heroTitle: 'আপনার অধিকার পান',
    heroSubtitle: 'ভয়েস-ভিত্তিক কল্যাণ সহায়তা',
    heroDescription: 'শুধু বলুন, এবং Sahaaya AI আপনার জন্য সরকারি প্রকল্প, চাকরি এবং সাহায্য কেন্দ্র খুঁজে বের করবে।',
    registerCTA: 'নিবন্ধন করুন',
    demoMode: 'ডেমো মোড',
    schemesAvailable: 'প্রকল্প',
    usersHelped: 'সাহায্যপ্রাপ্ত',
    statesCovered: 'রাজ্য',
    howItWorks: 'এটি কিভাবে কাজ করে?',
    stepSpeak: 'বলুন',
    stepSpeakDesc: 'মাইক বোতাম টিপুন এবং আপনার তথ্য বলুন। AI আপনার ভাষায় কথা বলবে।',
    stepProfile: 'প্রোফাইল',
    stepProfileDesc: 'আপনার প্রোফাইল QR কোড সহ তৈরি হবে।',
    stepMatch: 'মিলান পান',
    stepMatchDesc: 'AI আপনার জন্য সঠিক সরকারি প্রকল্প, চাকরি এবং সাহায্য কেন্দ্র খুঁজবে।',
    whatWeCover: 'আমরা কিভাবে সাহায্য করি',
    food: 'খাদ্য',
    housing: 'বাসস্থান',
    health: 'স্বাস্থ্য',
    education: 'শিক্ষা',
    jobs: 'চাকরি',
    footer: '© 2026 Sahaaya AI — সকলের জন্য সহায়তা | ভারতের জন্য তৈরি 🇮🇳',
    back: 'ফিরে যান',
    question: 'প্রশ্ন',
    of: 'এর মধ্যে',
    listening: 'শুনছি... বলুন',
    speaking: 'বলছি...',
    tapToSpeak: 'বলতে ট্যাপ করুন',
    confirm: 'ঠিক আছে',
    retry: 'আবার',
    typeInstead: 'টাইপ করুন',
    useVoice: 'ভয়েস ব্যবহার করুন',
    yourAnswers: 'আপনার উত্তর',
    profileCreating: 'আপনার প্রোফাইল তৈরি হচ্ছে...',
    profileCreatingDesc: 'প্রকল্প মিলাচ্ছি',
    micNotSupported: 'আপনার ব্রাউজারে ভয়েস সুবিধা নেই। টেক্সট ফর্ম ব্যবহার করুন।',
    q1: 'আপনার নাম কী?',
    q2: 'আপনি কোথায় থাকেন? আপনার জেলা ও রাজ্য বলুন।',
    q3: 'আপনার পেশা কী?',
    q4: 'আপনার পরিবারে কতজন সদস্য?',
    q5: 'আপনার মাসিক আয় কত?',
    q6: 'আপনার পরিবারে কি কেউ প্রতিবন্ধী?',
    q7: 'আপনার কি BPL কার্ড আছে?',
    warmResponse1: 'খুব ভালো! পরের প্রশ্ন শুনুন...',
    warmResponse2: 'ধন্যবাদ! এগিয়ে যাই...',
    warmResponse3: 'বুঝেছি! পরের প্রশ্ন...',
    warmResponse4: 'ঠিক আছে! আর কিছু প্রশ্ন...',
    warmResponse5: 'দারুণ! এবার বলুন...',
    warmResponse6: 'ভালো! প্রায় শেষ...',
    warmResponse7: 'ঠিক আছে! এটা শেষ প্রশ্ন...',
    thankYouProfile: 'ধন্যবাদ! আপনার প্রোফাইল তৈরি হচ্ছে...',
    yourQRCode: 'আপনার QR কোড',
    schemesMatched: 'প্রকল্প মিলেছে',
    schemes: 'প্রকল্প',
    jobsTab: 'চাকরি',
    aidCenters: 'সাহায্য কেন্দ্র',
    all: 'সব',
    central: 'কেন্দ্রীয়',
    eligible: 'যোগ্য',
    applyNow: 'আবেদন করুন',
    noSchemesFound: 'এই বিভাগে কোনো প্রকল্প নেই',
    callEmployer: 'কল করুন',
    family: 'পরিবার',
    members: 'সদস্য',
    income: 'আয়',
    perMonth: '/মাস',
    bplCard: 'BPL কার্ড',
    disability: 'প্রতিবন্ধিতা',
    yes: 'হ্যাঁ ✓',
    no: 'না',
    downloadQR: 'QR ডাউনলোড',
    verification: 'যাচাইকরণ',
    registered: 'নিবন্ধিত',
    eligibleSchemes: 'যোগ্য প্রকল্প',
    markAsAided: 'সাহায্য দেওয়া হয়েছে',
    markedAsAided: 'সাহায্য নথিভুক্ত হয়েছে',
    userNotFound: 'ব্যবহারকারী পাওয়া যায়নি',
    userNotFoundDesc: 'QR কোড অবৈধ হতে পারে।',
    homePage: 'হোম পেজ',
    adminPortal: 'অ্যাডমিন পোর্টাল',
    ngoLogin: 'NGO / অ্যাডমিন লগইন',
    login: 'লগইন',
    invalidCredentials: 'ভুল লগইন',
    totalRegistrations: 'মোট নিবন্ধন',
    schemesMatchedAdmin: 'প্রকল্প মিলেছে',
    districts: 'জেলা',
    thisWeek: 'এই সপ্তাহ',
    searchUsers: 'খুঁজুন...',
    name: 'নাম',
    district: 'জেলা',
    postJob: 'চাকরি পোস্ট',
    postJobTitle: 'চাকরি পোস্ট করুন',
    postJobSubtitle: 'চাকরির তালিকা পোস্ট করুন',
    jobTitle: 'পদের নাম',
    employerName: 'নিয়োগকর্তা',
    state: 'রাজ্য',
    dailyWage: 'দৈনিক মজুরি (₹)',
    contactNumber: 'যোগাযোগ নম্বর',
    sector: 'ক্ষেত্র',
    description: 'বিবরণ',
    postJobBtn: 'পোস্ট করুন',
    jobPosted: 'চাকরি পোস্ট হয়েছে!',
    jobPostedDesc: 'সফলভাবে পোস্ট হয়েছে!',
    postAnother: 'আরেকটি পোস্ট করুন',
    home: 'হোম',
  },
  mr: {
    admin: 'अॅडमिन',
    heroTitle: 'तुमचा हक्क मिळवा',
    heroSubtitle: 'व्हॉइस-आधारित कल्याण सहाय्य',
    heroDescription: 'फक्त बोला, आणि Sahaaya AI तुमच्यासाठी सरकारी योजना, नोकऱ्या आणि सहाय्य केंद्र शोधेल.',
    registerCTA: 'नोंदणी करा',
    demoMode: 'डेमो मोड',
    schemesAvailable: 'योजना',
    usersHelped: 'लोकांना मदत',
    statesCovered: 'राज्ये',
    howItWorks: 'हे कसे काम करते?',
    stepSpeak: 'बोला',
    stepSpeakDesc: 'माइक बटण दाबा आणि तुमची माहिती सांगा. AI तुमच्या भाषेत बोलेल.',
    stepProfile: 'प्रोफाइल',
    stepProfileDesc: 'तुमचे प्रोफाइल QR कोडसह तयार होईल.',
    stepMatch: 'जुळवा',
    stepMatchDesc: 'AI तुमच्यासाठी योग्य सरकारी योजना, नोकऱ्या आणि सहाय्य केंद्र शोधेल.',
    whatWeCover: 'आम्ही कशी मदत करतो',
    food: 'अन्न',
    housing: 'घरकुल',
    health: 'आरोग्य',
    education: 'शिक्षण',
    jobs: 'नोकऱ्या',
    footer: '© 2026 Sahaaya AI — सर्वांसाठी सहाय्य | भारतासाठी बनवलेले 🇮🇳',
    back: 'मागे',
    question: 'प्रश्न',
    of: 'पैकी',
    listening: 'ऐकतोय... बोला',
    speaking: 'बोलतोय...',
    tapToSpeak: 'बोलण्यासाठी टॅप करा',
    confirm: 'बरोबर',
    retry: 'पुन्हा',
    typeInstead: 'टाइप करा',
    useVoice: 'व्हॉइस वापरा',
    yourAnswers: 'तुमची उत्तरे',
    profileCreating: 'तुमचे प्रोफाइल तयार होतेय...',
    profileCreatingDesc: 'योजना जुळवत आहोत',
    micNotSupported: 'तुमच्या ब्राउझरमध्ये व्हॉइस सुविधा उपलब्ध नाही. टेक्स्ट फॉर्म वापरा.',
    q1: 'तुमचे नाव काय आहे?',
    q2: 'तुम्ही कुठे राहता? तुमचा जिल्हा आणि राज्य सांगा.',
    q3: 'तुमचा व्यवसाय काय आहे?',
    q4: 'तुमच्या कुटुंबात किती सदस्य आहेत?',
    q5: 'तुमचे महिन्याचे उत्पन्न किती आहे?',
    q6: 'तुमच्या कुटुंबात कोणी अपंग आहे का?',
    q7: 'तुमच्याकडे BPL कार्ड आहे का?',
    warmResponse1: 'छान! पुढचा प्रश्न ऐका...',
    warmResponse2: 'धन्यवाद! पुढे जाऊया...',
    warmResponse3: 'समजले! पुढचा प्रश्न...',
    warmResponse4: 'ठीक आहे! आणखी काही प्रश्न...',
    warmResponse5: 'खूप छान! आता सांगा...',
    warmResponse6: 'चांगले! जवळजवळ झाले...',
    warmResponse7: 'बरोबर! हा शेवटचा प्रश्न आहे...',
    thankYouProfile: 'धन्यवाद! तुमचे प्रोफाइल तयार होतेय...',
    yourQRCode: 'तुमचा QR कोड',
    schemesMatched: 'योजना जुळल्या',
    schemes: 'योजना',
    jobsTab: 'नोकऱ्या',
    aidCenters: 'सहाय्य केंद्रे',
    all: 'सर्व',
    central: 'केंद्रीय',
    eligible: 'पात्र',
    applyNow: 'अर्ज करा',
    noSchemesFound: 'या श्रेणीत कोणतीही योजना नाही',
    callEmployer: 'कॉल करा',
    family: 'कुटुंब',
    members: 'सदस्य',
    income: 'उत्पन्न',
    perMonth: '/महिना',
    bplCard: 'BPL कार्ड',
    disability: 'अपंगत्व',
    yes: 'होय ✓',
    no: 'नाही',
    downloadQR: 'QR डाउनलोड',
    verification: 'सत्यापन',
    registered: 'नोंदणी',
    eligibleSchemes: 'पात्र योजना',
    markAsAided: 'सहाय्य दिले',
    markedAsAided: 'सहाय्य नोंदवले',
    userNotFound: 'वापरकर्ता सापडला नाही',
    userNotFoundDesc: 'QR कोड अवैध असू शकतो.',
    homePage: 'मुख्यपृष्ठ',
    adminPortal: 'अॅडमिन पोर्टल',
    ngoLogin: 'NGO / अॅडमिन लॉगिन',
    login: 'लॉगिन',
    invalidCredentials: 'चुकीचे लॉगिन',
    totalRegistrations: 'एकूण नोंदणी',
    schemesMatchedAdmin: 'योजना जुळल्या',
    districts: 'जिल्हे',
    thisWeek: 'या आठवड्यात',
    searchUsers: 'शोधा...',
    name: 'नाव',
    district: 'जिल्हा',
    postJob: 'नोकरी पोस्ट',
    postJobTitle: 'नोकरी पोस्ट करा',
    postJobSubtitle: 'नोकरी लिस्टिंग पोस्ट करा',
    jobTitle: 'पदाचे नाव',
    employerName: 'नियोक्ता',
    state: 'राज्य',
    dailyWage: 'दैनिक मजुरी (₹)',
    contactNumber: 'संपर्क क्रमांक',
    sector: 'क्षेत्र',
    description: 'वर्णन',
    postJobBtn: 'पोस्ट करा',
    jobPosted: 'नोकरी पोस्ट झाली!',
    jobPostedDesc: 'यशस्वीरित्या पोस्ट झाली!',
    postAnother: 'आणखी एक पोस्ट करा',
    home: 'मुख्यपृष्ठ',
  },
};

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: TranslationKeys;
  speechCode: string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  t: translations.hi,
  speechCode: 'hi-IN',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem('sahaaya_lang');
    return (saved as LangCode) || 'hi';
  });

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem('sahaaya_lang', newLang);
  }, []);

  const langInfo = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], speechCode: langInfo.speechCode }}>
      {children}
    </LanguageContext.Provider>
  );
};
