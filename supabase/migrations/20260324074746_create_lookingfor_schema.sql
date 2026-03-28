/*
  # Lookingfor.in Database Schema

  ## Overview
  Creates the core database structure for a reverse classified platform where users post what they're looking for in real estate and services.

  ## New Tables
  
  ### profiles
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User's email
  - `full_name` (text) - User's display name
  - `phone` (text, optional) - Contact phone number
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last profile update
  
  ### listings
  - `id` (uuid, primary key) - Unique listing identifier
  - `user_id` (uuid, foreign key) - References profiles(id)
  - `category` (text) - Either 'real_estate' or 'services'
  - `title` (text) - What the user is looking for
  - `description` (text) - Detailed description
  - `location` (text) - Location/area preference
  - `budget_min` (numeric, optional) - Minimum budget
  - `budget_max` (numeric, optional) - Maximum budget
  - `contact_preference` (text) - How to contact (email, phone, both)
  - `status` (text) - active, fulfilled, expired
  - `created_at` (timestamptz) - When posted
  - `updated_at` (timestamptz) - Last update
  - `expires_at` (timestamptz) - When the listing expires

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read all profiles, but only update their own
  - Listings: Anyone can read active listings, only owners can create/update/delete their listings
  
  ## Important Notes
  1. All timestamps use timestamptz for proper timezone handling
  2. Budget fields are optional as some services may not have a budget
  3. Listings automatically expire after 30 days but can be renewed
  4. Contact preferences ensure users control how they're contacted
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('real_estate', 'services')),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  budget_min numeric,
  budget_max numeric,
  contact_preference text DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'both')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '30 days') NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Listings Policies
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Users can view their own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();