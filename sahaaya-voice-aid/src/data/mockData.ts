// src/data/mockData.ts
// Types only — all data comes from the backend API / Supabase

import { type LangCode } from '@/contexts/LanguageContext';

export interface Scheme {
  id: string;
  name_hi: string;
  name_en: string;
  name_hindi?: string;
  name_english?: string;
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
  language: LangCode;
  created_at: string;
  schemes_matched: number;
}