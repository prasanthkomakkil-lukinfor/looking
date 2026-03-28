/*
  # LookingFor.in MVP - Complete Database Schema
  
  ## Overview
  Complete MVP schema for reverse classifieds platform with OTP auth, approval-based chat,
  premium plans, and admin controls.
  
  ## Tables
  1. users - User profiles
  2. user_roles - Seeker/Provider roles
  3. subcategories - Dynamic subcategories for real estate and services
  4. requirements - Posted by seekers
  5. chat_requests - Approval-based chat initiation
  6. chat_messages - Actual messages
  7. premium_plans - Subscription tiers
  8. subscriptions - User plan purchases
  9. otp_sessions - OTP verification
*/

-- Create enum tables
CREATE TABLE IF NOT EXISTS user_roles (
  id text PRIMARY KEY,
  name text NOT NULL
);

INSERT INTO user_roles (id, name) VALUES
  ('seeker', 'Seeker'),
  ('provider', 'Provider'),
  ('admin', 'Admin')
ON CONFLICT DO NOTHING;

-- Subcategories for real estate and services
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('real_estate', 'services')),
  name text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO subcategories (category, name, icon) VALUES
  -- Real Estate
  ('real_estate', 'Apartment/Flat', '🏢'),
  ('real_estate', 'House/Villa', '🏠'),
  ('real_estate', 'Office Space', '🏢'),
  ('real_estate', 'Shop/Commercial', '🏪'),
  ('real_estate', 'Land/Plot', '📍'),
  ('real_estate', 'PG/Hostel', '🛏️'),
  -- Services
  ('services', 'Plumbing', '🔧'),
  ('services', 'Electrical', '⚡'),
  ('services', 'Carpentry', '🪵'),
  ('services', 'Painting', '🎨'),
  ('services', 'Cleaning', '🧹'),
  ('services', 'Web Development', '💻'),
  ('services', 'App Development', '📱'),
  ('services', 'Graphics Design', '🎨'),
  ('services', 'Content Writing', '✍️'),
  ('services', 'Digital Marketing', '📊'),
  ('services', 'Photography', '📸'),
  ('services', 'Videography', '🎥'),
  ('services', 'Education/Tutoring', '📚'),
  ('services', 'Fitness/Gym', '💪')
ON CONFLICT DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  name text,
  is_verified boolean DEFAULT false,
  primary_role text REFERENCES user_roles(id),
  can_be_provider boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OTP Sessions for authentication
CREATE TABLE IF NOT EXISTS otp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_sessions_phone ON otp_sessions(phone_number);

-- Premium Plans
CREATE TABLE IF NOT EXISTS premium_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('individual', 'service_provider', 'real_estate_agent')),
  price_annual numeric NOT NULL,
  posts_limit integer,
  chat_responses_limit integer,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO premium_plans (name, user_type, price_annual, posts_limit, chat_responses_limit, features) VALUES
  ('Individual Basic', 'individual', 499, 5, NULL, '{"unlimited_chat": true, "contact_visible": true, "anonymous_post": true}'::jsonb),
  ('Service Provider Starter', 'service_provider', 1499, NULL, 25, '{"unlimited_posts": false, "contact_visible": true}'::jsonb),
  ('Service Provider Pro', 'service_provider', 2499, NULL, NULL, '{"unlimited_posts": false, "unlimited_chat": true, "contact_visible": true}'::jsonb),
  ('Real Estate Agent Starter', 'real_estate_agent', 3000, 30, NULL, '{"contact_visible": true}'::jsonb),
  ('Real Estate Agent Pro', 'real_estate_agent', 3999, NULL, NULL, '{"unlimited_posts": true, "unlimited_chat": true, "contact_visible": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES premium_plans(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  razorpay_order_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Requirements (Posts by seekers)
CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('real_estate', 'services')),
  subcategory_id uuid REFERENCES subcategories(id),
  city text NOT NULL,
  area text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  budget_min numeric,
  budget_max numeric,
  is_anonymous boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'fulfilled')),
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requirements_user_id ON requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_city ON requirements(city);
CREATE INDEX IF NOT EXISTS idx_requirements_category ON requirements(category);

-- Chat Requests (Approval flow)
CREATE TABLE IF NOT EXISTS chat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intro_message text NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_requests_seeker ON chat_requests(seeker_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_provider ON chat_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_chat_requests_status ON chat_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_requests_unique ON chat_requests(requirement_id, provider_id);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_request_id uuid NOT NULL REFERENCES chat_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_contact_revealed boolean DEFAULT false,
  message_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_request ON chat_messages(chat_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Anyone can view public info
CREATE POLICY "Users can view other public profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Requirements: Anyone can view active requirements
CREATE POLICY "Anyone can view active requirements"
  ON requirements FOR SELECT
  USING (status = 'active');

CREATE POLICY "Seekers can view own requirements"
  ON requirements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create requirements"
  ON requirements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requirements"
  ON requirements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat Requests: Both parties can view
CREATE POLICY "Chat request parties can view"
  ON chat_requests FOR SELECT
  USING (auth.uid() = seeker_id OR auth.uid() = provider_id);

CREATE POLICY "Providers can create chat requests"
  ON chat_requests FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Seekers can update chat request status"
  ON chat_requests FOR UPDATE
  USING (auth.uid() = seeker_id)
  WITH CHECK (auth.uid() = seeker_id);

-- Chat Messages: Both parties can view
CREATE POLICY "Chat participants can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_requests cr
      WHERE cr.id = chat_messages.chat_request_id
      AND (cr.seeker_id = auth.uid() OR cr.provider_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in accepted chats"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_requests cr
      WHERE cr.id = chat_messages.chat_request_id
      AND cr.status = 'ACCEPTED'
      AND (cr.seeker_id = auth.uid() OR cr.provider_id = auth.uid())
    )
  );

-- Function to get user subscription
CREATE OR REPLACE FUNCTION get_active_subscription(user_id uuid)
RETURNS subscriptions AS $$
  SELECT * FROM subscriptions
  WHERE subscriptions.user_id = user_id
  AND is_active = true
  AND end_date >= CURRENT_DATE
  ORDER BY end_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to check message limit
CREATE OR REPLACE FUNCTION check_message_limit(chat_request_id uuid)
RETURNS integer AS $$
  SELECT COALESCE(COUNT(*), 0)::integer FROM chat_messages
  WHERE chat_messages.chat_request_id = check_message_limit.chat_request_id;
$$ LANGUAGE sql STABLE;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_timestamp BEFORE UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_requests_timestamp BEFORE UPDATE ON chat_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
