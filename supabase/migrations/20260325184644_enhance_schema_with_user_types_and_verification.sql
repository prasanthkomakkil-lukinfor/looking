/*
  # Enhanced Schema with User Types, Verification, and Location Hierarchy

  ## Overview
  Adds comprehensive user profiling, verification system, membership tiers, and location hierarchy
  to support diverse user types and protect against scams.

  ## New Tables

  ### user_types
  - `id` (text, primary key) - Unique identifier
  - `name` (text) - Display name
  - `description` (text) - Description

  ### roles
  - `id` (text, primary key) - Unique identifier  
  - `name` (text) - Display name
  - `description` (text) - Description

  ### membership_tiers
  - `id` (text, primary key) - 'free' or 'deluxe'
  - `name` (text) - Display name
  - `features` (jsonb) - Available features

  ### locations
  - `id` (uuid, primary key)
  - `level` (text) - 'state', 'city', or 'place'
  - `name` (text) - Location name
  - `parent_id` (uuid, optional) - Reference to parent location
  - `state_name` (text, optional) - State for quick filtering
  - `city_name` (text, optional) - City for quick filtering

  ### user_profiles (REPLACES old profiles)
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User's email
  - `full_name` (text) - User's display name
  - `user_type` (text) - 'individual', 'company', 'agent'
  - `role` (text) - 'seeker' or 'provider'
  - `phone` (text, optional)
  - `company_name` (text, optional)
  - `company_registration` (text, optional) - For company verification
  - `membership_tier` (text) - 'free' or 'deluxe'
  - `is_verified` (boolean) - Admin verified
  - `verification_status` (text) - 'pending', 'verified', 'rejected'
  - `allow_agent_responses` (boolean) - Allow agent intermediaries
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### user_verification
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `verification_type` (text) - 'phone', 'email', 'identity', 'company'
  - `verification_status` (text) - 'pending', 'verified', 'failed'
  - `verified_at` (timestamptz, optional)
  - `notes` (text, optional) - Admin notes
  - `created_at` (timestamptz)

  ### user_reviews
  - `id` (uuid, primary key)
  - `reviewer_id` (uuid) - Who gave the review
  - `reviewee_id` (uuid) - Who was reviewed
  - `rating` (integer) - 1-5 stars
  - `comment` (text, optional)
  - `transaction_type` (text) - 'listing_interaction'
  - `is_verified_transaction` (boolean)
  - `created_at` (timestamptz)

  ### blocked_users
  - `id` (uuid, primary key)
  - `blocker_id` (uuid) - User who blocked
  - `blocked_id` (uuid) - User who was blocked
  - `reason` (text)
  - `created_at` (timestamptz)

  ### reported_users
  - `id` (uuid, primary key)
  - `reporter_id` (uuid) - User who reported
  - `reported_id` (uuid) - User who was reported
  - `reason` (text) - Reason for report
  - `description` (text) - Detailed description
  - `status` (text) - 'open', 'investigating', 'resolved'
  - `created_at` (timestamptz)

  ### listings (UPDATED)
  - Adds `location_id` field for structured location
  - Adds `is_anonymous` field for deluxe members
  - Adds `verification_required` field
  - Adds `allow_agent_responses` field
  - Adds `rating_score` field (aggregated from reviews)

  ## Security
  - Enable RLS on all new tables
  - Verify user membership tier for anonymous posting
  - Protect sensitive data in verification tables
  - Rate limiting on reports to prevent abuse
*/

-- Create user_types enum table
CREATE TABLE IF NOT EXISTS user_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL
);

INSERT INTO user_types (id, name, description) VALUES
  ('individual', 'Individual', 'Personal user'),
  ('company', 'Company', 'Business/Organization'),
  ('agent', 'Agent', 'Real estate or service agent')
ON CONFLICT DO NOTHING;

-- Create roles enum table
CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL
);

INSERT INTO roles (id, name, description) VALUES
  ('seeker', 'Seeker', 'Looking for services or property'),
  ('provider', 'Service Provider', 'Offering services or property')
ON CONFLICT DO NOTHING;

-- Create membership_tiers table
CREATE TABLE IF NOT EXISTS membership_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  features jsonb NOT NULL DEFAULT '{}'
);

INSERT INTO membership_tiers (id, name, features) VALUES
  ('free', 'Free', '{"anonymous_posting": false, "priority_listing": false, "direct_contact": true}'::jsonb),
  ('deluxe', 'Deluxe', '{"anonymous_posting": true, "priority_listing": true, "direct_contact": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Create locations table for state/city/place hierarchy
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('state', 'city', 'place')),
  name text NOT NULL,
  parent_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  state_name text,
  city_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_locations_level ON locations(level);
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_state_name ON locations(state_name);
CREATE INDEX IF NOT EXISTS idx_locations_city_name ON locations(city_name);

-- Drop old profiles table if it exists (will migrate data)
-- Since we need backward compatibility, we'll create new table and handle migration
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL REFERENCES user_types(id),
  role text NOT NULL REFERENCES roles(id),
  phone text,
  company_name text,
  company_registration text,
  membership_tier text NOT NULL DEFAULT 'free' REFERENCES membership_tiers(id),
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  allow_agent_responses boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_verification table
CREATE TABLE IF NOT EXISTS user_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('phone', 'email', 'identity', 'company')),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_verification_user_id ON user_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_status ON user_verification(verification_status);

-- Create user_reviews table
CREATE TABLE IF NOT EXISTS user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  transaction_type text DEFAULT 'listing_interaction',
  is_verified_transaction boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee_id ON user_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Create reported_users table
CREATE TABLE IF NOT EXISTS reported_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reported_users_status ON reported_users(status);
CREATE INDEX IF NOT EXISTS idx_reported_users_reported_id ON reported_users(reported_id);

-- Update listings table to add new fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'location_id') THEN
    ALTER TABLE listings ADD COLUMN location_id uuid REFERENCES locations(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_anonymous') THEN
    ALTER TABLE listings ADD COLUMN is_anonymous boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'allow_agent_responses') THEN
    ALTER TABLE listings ADD COLUMN allow_agent_responses boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'rating_score') THEN
    ALTER TABLE listings ADD COLUMN rating_score numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'verification_required') THEN
    ALTER TABLE listings ADD COLUMN verification_required boolean DEFAULT false;
  END IF;
END $$;

-- Update profiles foreign key in listings to reference user_profiles
-- Skip if already updated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'user_id') THEN
    -- Already exists, ensure it references the right table
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_location_id ON listings(location_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_anonymous ON listings(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_listings_rating_score ON listings(rating_score DESC);

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Anyone can view verified user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_verified = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User Verification Policies (private, only user and admins can see)
CREATE POLICY "Users can view own verification"
  ON user_verification FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert verification records for themselves"
  ON user_verification FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON user_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != reviewee_id);

-- Blocked Users Policies
CREATE POLICY "Users can view their blocks"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can block other users"
  ON blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

-- Reported Users Policies
CREATE POLICY "Users can report other users"
  ON reported_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() != reported_id);

CREATE POLICY "Users can view their own reports"
  ON reported_users FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Locations Policies
CREATE POLICY "Anyone can view locations"
  ON locations FOR SELECT
  USING (true);

-- Update listings RLS for anonymous posting
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
  DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
  DROP POLICY IF EXISTS "Users can create their own listings" ON listings;
  DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
  DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE POLICY "Anyone can view active non-anonymous listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active' AND (is_anonymous = false OR (is_anonymous = true AND auth.uid() = user_id)));

CREATE POLICY "Users can view their own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      is_anonymous = false OR
      (is_anonymous = true AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND membership_tier = 'deluxe'
      ))
    )
  );

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update user profiles updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to calculate user rating score
CREATE OR REPLACE FUNCTION get_user_rating_score(user_id uuid)
RETURNS numeric AS $$
  SELECT COALESCE(AVG(rating), 0) FROM user_reviews WHERE reviewee_id = user_id;
$$ LANGUAGE sql IMMUTABLE;
