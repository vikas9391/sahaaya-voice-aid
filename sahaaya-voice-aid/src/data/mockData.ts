export interface Scheme {
  id: string;
  name_hi: string;
  name_en: string;
  description: string;
  ministry: string;
  benefit_amount: string;
  eligibility_income_max: number;
  eligibility_bpl_required: boolean;
  eligibility_disability: boolean;
  category: 'food' | 'housing' | 'health' | 'education' | 'employment';
  apply_url: string;
  is_central: boolean;
  state_name: string | null;
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
  is_active: boolean;
  lat?: number;
  lng?: number;
}

export interface AidCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  services: string[];
  timing: string;
  contact: string;
}

export interface UserProfile {
  id: string;
  name: string;
  district: string;
  state: string;
  occupation: string;
  family_size: number;
  monthly_income: number;
  has_disability: boolean;
  has_bpl_card: boolean;
  language: string;
  created_at: string;
  schemes_matched: number;
}

export const SCHEMES: Scheme[] = [
  {
    id: '1', name_hi: 'प्रधानमंत्री किसान सम्मान निधि', name_en: 'PM Kisan Samman Nidhi',
    description: 'Small and marginal farmers receive ₹6,000 per year in three installments directly to their bank accounts.',
    ministry: 'Ministry of Agriculture', benefit_amount: '₹6,000/year',
    eligibility_income_max: 200000, eligibility_bpl_required: false, eligibility_disability: false,
    category: 'employment', apply_url: 'https://pmkisan.gov.in/', is_central: true, state_name: null
  },
  {
    id: '2', name_hi: 'आयुष्मान भारत', name_en: 'Ayushman Bharat (PMJAY)',
    description: 'Health insurance cover of ₹5 lakh per family per year for secondary and tertiary hospitalization.',
    ministry: 'Ministry of Health', benefit_amount: '₹5,00,000/year health cover',
    eligibility_income_max: 100000, eligibility_bpl_required: true, eligibility_disability: false,
    category: 'health', apply_url: 'https://pmjay.gov.in/', is_central: true, state_name: null
  },
  {
    id: '3', name_hi: 'मनरेगा', name_en: 'MGNREGA',
    description: '100 days of guaranteed wage employment per year for rural households.',
    ministry: 'Ministry of Rural Development', benefit_amount: '100 days employment/year',
    eligibility_income_max: 300000, eligibility_bpl_required: false, eligibility_disability: false,
    category: 'employment', apply_url: 'https://nrega.nic.in/', is_central: true, state_name: null
  },
  {
    id: '4', name_hi: 'प्रधानमंत्री आवास योजना (ग्रामीण)', name_en: 'PM Awas Yojana (Gramin)',
    description: 'Financial assistance for construction of pucca houses for BPL families in rural areas.',
    ministry: 'Ministry of Rural Development', benefit_amount: '₹1,20,000 - ₹1,30,000',
    eligibility_income_max: 100000, eligibility_bpl_required: true, eligibility_disability: false,
    category: 'housing', apply_url: 'https://pmayg.nic.in/', is_central: true, state_name: null
  },
  {
    id: '5', name_hi: 'उज्ज्वला योजना', name_en: 'Ujjwala Yojana',
    description: 'Free LPG connection to women from BPL households.',
    ministry: 'Ministry of Petroleum', benefit_amount: 'Free LPG connection + refill',
    eligibility_income_max: 100000, eligibility_bpl_required: true, eligibility_disability: false,
    category: 'food', apply_url: 'https://www.pmuy.gov.in/', is_central: true, state_name: null
  },
  {
    id: '6', name_hi: 'राष्ट्रीय छात्रवृत्ति पोर्टल', name_en: 'National Scholarship Portal',
    description: 'Scholarships for students from economically weaker sections.',
    ministry: 'Ministry of Education', benefit_amount: '₹10,000 - ₹50,000/year',
    eligibility_income_max: 250000, eligibility_bpl_required: false, eligibility_disability: false,
    category: 'education', apply_url: 'https://scholarships.gov.in/', is_central: true, state_name: null
  },
  {
    id: '7', name_hi: 'विधवा पेंशन योजना', name_en: 'Widow Pension Scheme',
    description: 'Monthly pension for widowed women below poverty line.',
    ministry: 'Ministry of Women & Child Development', benefit_amount: '₹500 - ₹1,500/month',
    eligibility_income_max: 100000, eligibility_bpl_required: false, eligibility_disability: false,
    category: 'employment', apply_url: 'https://nsap.nic.in/', is_central: true, state_name: null
  },
  {
    id: '8', name_hi: 'विकलांगता पेंशन', name_en: 'Disability Pension',
    description: 'Monthly pension for persons with 40% or more disability.',
    ministry: 'Ministry of Social Justice', benefit_amount: '₹500 - ₹1,500/month',
    eligibility_income_max: 300000, eligibility_bpl_required: false, eligibility_disability: true,
    category: 'health', apply_url: 'https://nsap.nic.in/', is_central: true, state_name: null
  },
  {
    id: '9', name_hi: 'अंत्योदय अन्न योजना', name_en: 'Antyodaya Anna Yojana',
    description: 'Subsidized food grains (35 kg) for the poorest of the poor families.',
    ministry: 'Ministry of Consumer Affairs', benefit_amount: '35 kg food grain/month at ₹2-3/kg',
    eligibility_income_max: 60000, eligibility_bpl_required: true, eligibility_disability: false,
    category: 'food', apply_url: 'https://dfpd.gov.in/', is_central: true, state_name: null
  },
  {
    id: '10', name_hi: 'जननी सुरक्षा योजना', name_en: 'Janani Suraksha Yojana',
    description: 'Cash assistance for pregnant women from BPL families for institutional delivery.',
    ministry: 'Ministry of Health', benefit_amount: '₹700 - ₹1,400 per delivery',
    eligibility_income_max: 100000, eligibility_bpl_required: true, eligibility_disability: false,
    category: 'health', apply_url: 'https://nhm.gov.in/', is_central: true, state_name: null
  },
];

export const JOBS: Job[] = [
  { id: 'j1', title: 'Construction Worker', employer_name: 'Sharma Builders', district: 'South Delhi', state: 'Delhi', daily_wage: 600, sector: 'construction', contact_number: '+919876543210', description: 'Daily wage construction work. Experience preferred.', is_active: true, lat: 28.52, lng: 77.22 },
  { id: 'j2', title: 'Farm Labour (Harvesting)', employer_name: 'Rajesh Farms', district: 'Pune', state: 'Maharashtra', daily_wage: 450, sector: 'farming', contact_number: '+919876543211', description: 'Seasonal farm labour for wheat harvesting.', is_active: true, lat: 18.52, lng: 73.86 },
  { id: 'j3', title: 'Delivery Partner', employer_name: 'Quick Deliver', district: 'Mumbai', state: 'Maharashtra', daily_wage: 700, sector: 'delivery', contact_number: '+919876543212', description: 'Bike required. Earn per delivery + daily minimum guarantee.', is_active: true, lat: 19.08, lng: 72.88 },
  { id: 'j4', title: 'Domestic Help', employer_name: 'Urban Clap Partners', district: 'Gurugram', state: 'Haryana', daily_wage: 500, sector: 'domestic', contact_number: '+919876543213', description: 'Part-time house cleaning. 4-5 houses per day.', is_active: true, lat: 28.46, lng: 77.03 },
  { id: 'j5', title: 'Security Guard', employer_name: 'SafeGuard Services', district: 'Chennai', state: 'Tamil Nadu', daily_wage: 550, sector: 'security', contact_number: '+919876543214', description: 'Night shift security for residential complex.', is_active: true, lat: 13.08, lng: 80.27 },
];

export const AID_CENTERS: AidCenter[] = [
  { id: 'a1', name: 'Akshaya Patra Foundation - Delhi', address: 'Sector 29, Dwarka, New Delhi 110077', district: 'South West Delhi', lat: 28.58, lng: 77.05, services: ['food'], timing: '11:00 AM - 2:00 PM', contact: '+911145678901' },
  { id: 'a2', name: 'Missionaries of Charity - Mumbai', address: 'Asha Dan, 30 Bazar Gate St, Mumbai 400001', district: 'Mumbai City', lat: 18.93, lng: 72.84, services: ['food', 'medicine', 'shelter'], timing: '8:00 AM - 6:00 PM', contact: '+912222345678' },
  { id: 'a3', name: 'Banyan - Chennai', address: '6th Main Rd, Mogappair East, Chennai 600037', district: 'Chennai', lat: 13.07, lng: 80.18, services: ['medicine', 'shelter', 'legal'], timing: '9:00 AM - 5:00 PM', contact: '+914426543210' },
];

export const DEMO_USER: UserProfile = {
  id: 'demo-001',
  name: 'राम कुमार',
  district: 'वाराणसी',
  state: 'उत्तर प्रदेश',
  occupation: 'किसान',
  family_size: 5,
  monthly_income: 8000,
  has_disability: false,
  has_bpl_card: true,
  language: 'hi',
  created_at: new Date().toISOString(),
  schemes_matched: 7,
};

export function matchSchemes(profile: Partial<UserProfile>): Scheme[] {
  const income = (profile.monthly_income || 0) * 12;
  return SCHEMES.filter(s => {
    if (income > s.eligibility_income_max) return false;
    if (s.eligibility_bpl_required && !profile.has_bpl_card) return false;
    if (s.eligibility_disability && !profile.has_disability) return false;
    return true;
  });
}
