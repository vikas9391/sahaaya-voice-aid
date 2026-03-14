-- ============================================================
-- Sahaaya AI — Complete Database Schema
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- 1. USERS TABLE
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  district        text,
  state           text,
  occupation      text,
  family_size     integer default 4,
  monthly_income  integer default 0,
  has_disability  boolean default false,
  has_bpl_card    boolean default false,
  language        text default 'hi',
  schemes_matched integer default 0,
  created_at      timestamptz default now()
);

-- 2. SCHEMES TABLE
create table if not exists public.schemes (
  id                        uuid primary key default gen_random_uuid(),
  name_hindi                text not null,
  name_english              text not null,
  description               text,
  ministry                  text,
  benefit_amount            text,
  eligibility_income_max    integer default 999999999,
  eligibility_bpl_required  boolean default false,
  eligibility_disability    boolean default false,
  category                  text default 'employment',
  apply_url                 text,
  is_central                boolean default true,
  state_name                text,
  created_at                timestamptz default now()
);

-- 3. JOBS TABLE
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  employer_name   text,
  district        text,
  state           text,
  daily_wage      integer default 0,
  sector          text default 'other',
  contact_number  text,
  description     text,
  is_active       boolean default true,
  lat             float,
  lng             float,
  created_at      timestamptz default now()
);

-- 4. AID CENTERS TABLE
create table if not exists public.aid_centers (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  address   text,
  district  text,
  lat       float,
  lng       float,
  services  text[] default array[]::text[],
  timing    text,
  contact   text,
  created_at timestamptz default now()
);

-- ============================================================
-- SEED: 10 Government Schemes
-- ============================================================
insert into public.schemes
  (name_hindi, name_english, description, ministry, benefit_amount,
   eligibility_income_max, eligibility_bpl_required, eligibility_disability,
   category, apply_url, is_central)
values
  ('प्रधानमंत्री किसान सम्मान निधि', 'PM Kisan Samman Nidhi',
   'Small and marginal farmers receive ₹6,000 per year in three installments directly to bank accounts.',
   'Ministry of Agriculture', '₹6,000/year',
   200000, false, false, 'employment', 'https://pmkisan.gov.in/', true),

  ('आयुष्मान भारत', 'Ayushman Bharat (PMJAY)',
   'Health insurance cover of ₹5 lakh per family per year for secondary and tertiary hospitalization.',
   'Ministry of Health', '₹5,00,000/year health cover',
   100000, true, false, 'health', 'https://pmjay.gov.in/', true),

  ('मनरेगा', 'MGNREGA',
   '100 days of guaranteed wage employment per year for rural households.',
   'Ministry of Rural Development', '100 days employment/year',
   300000, false, false, 'employment', 'https://nrega.nic.in/', true),

  ('प्रधानमंत्री आवास योजना', 'PM Awas Yojana (Gramin)',
   'Financial assistance for construction of pucca houses for BPL families in rural areas.',
   'Ministry of Rural Development', '₹1,20,000 - ₹1,30,000',
   100000, true, false, 'housing', 'https://pmayg.nic.in/', true),

  ('उज्ज्वला योजना', 'Ujjwala Yojana',
   'Free LPG connection to women from BPL households.',
   'Ministry of Petroleum', 'Free LPG connection + refill subsidy',
   100000, true, false, 'food', 'https://www.pmuy.gov.in/', true),

  ('राष्ट्रीय छात्रवृत्ति पोर्टल', 'National Scholarship Portal',
   'Scholarships for students from economically weaker sections for higher education.',
   'Ministry of Education', '₹10,000 - ₹50,000/year',
   250000, false, false, 'education', 'https://scholarships.gov.in/', true),

  ('विधवा पेंशन योजना', 'Widow Pension Scheme',
   'Monthly pension for widowed women below poverty line.',
   'Ministry of Women & Child Development', '₹500 - ₹1,500/month',
   100000, false, false, 'employment', 'https://nsap.nic.in/', true),

  ('विकलांगता पेंशन', 'Disability Pension',
   'Monthly pension for persons with 40% or more disability.',
   'Ministry of Social Justice', '₹500 - ₹1,500/month',
   300000, false, true, 'health', 'https://nsap.nic.in/', true),

  ('अंत्योदय अन्न योजना', 'Antyodaya Anna Yojana',
   'Subsidized food grains (35 kg/month) for the poorest families at ₹2-3/kg.',
   'Ministry of Consumer Affairs', '35 kg food grain/month at ₹2-3/kg',
   60000, true, false, 'food', 'https://dfpd.gov.in/', true),

  ('जननी सुरक्षा योजना', 'Janani Suraksha Yojana',
   'Cash assistance for pregnant women from BPL families for institutional delivery.',
   'Ministry of Health', '₹700 - ₹1,400 per delivery',
   100000, true, false, 'health', 'https://nhm.gov.in/', true)
on conflict do nothing;

-- ============================================================
-- Enable Row Level Security (allow all for now — lock down later)
-- ============================================================
alter table public.users       enable row level security;
alter table public.schemes     enable row level security;
alter table public.jobs        enable row level security;
alter table public.aid_centers enable row level security;

-- Allow anon read/write (needed for frontend without auth)
create policy if not exists "allow_all_users"       on public.users       for all using (true) with check (true);
create policy if not exists "allow_all_schemes"     on public.schemes     for all using (true) with check (true);
create policy if not exists "allow_all_jobs"        on public.jobs        for all using (true) with check (true);
create policy if not exists "allow_all_aid_centers" on public.aid_centers for all using (true) with check (true);

-- ============================================================
-- Verify everything was created
-- ============================================================
select 'users'       as table_name, count(*) as rows from public.users
union all
select 'schemes',    count(*) from public.schemes
union all
select 'jobs',       count(*) from public.jobs
union all
select 'aid_centers',count(*) from public.aid_centers;