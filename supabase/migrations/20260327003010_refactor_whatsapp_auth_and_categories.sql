/*
  # Refactor: WhatsApp Auth and Strict Categories
  
  ## Changes
  1. Remove OTP sessions table
  2. Add WhatsApp verification table
  3. Simplify categories to essential only
  4. Add contact_locked field to users
  5. Add message_count tracking to chat_messages
*/

-- Drop old OTP table
DROP TABLE IF EXISTS otp_sessions CASCADE;

-- Create WhatsApp verifications table
CREATE TABLE IF NOT EXISTS whatsapp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  verification_code text NOT NULL,
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_phone ON whatsapp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_code ON whatsapp_verifications(verification_code);

-- Add contact_locked field to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'contact_locked') THEN
    ALTER TABLE users ADD COLUMN contact_locked boolean DEFAULT true;
  END IF;
END $$;

-- Clear and refactor subcategories to ONLY essential ones
DELETE FROM subcategories;

-- Real Estate Categories
INSERT INTO subcategories (category, name, icon) VALUES
  ('real_estate', 'Rent', '🏠'),
  ('real_estate', 'Buy', '🏡'),
  ('real_estate', 'Commercial', '🏢'),
  ('real_estate', 'PG / Shared', '🛏️'),
  ('real_estate', 'Flatmate / Roommate', '🤝'),
  -- Services Categories
  ('services', 'Electrician', '⚡'),
  ('services', 'Plumber', '🔧'),
  ('services', 'Cleaner', '🧹'),
  ('services', 'AC Repair', '❄️'),
  ('services', 'Carpenter', '🪵'),
  ('services', 'Painter', '🎨'),
  ('services', 'Housemaid', '👩‍🍳'),
  ('services', 'Houseman', '👨‍🍳')
ON CONFLICT DO NOTHING;

-- Add contact_visibility field to chat_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_requests' AND column_name = 'contact_visible') THEN
    ALTER TABLE chat_requests ADD COLUMN contact_visible boolean DEFAULT false;
  END IF;
END $$;

-- Add message_count tracking to users for premium enforcement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'posts_created') THEN
    ALTER TABLE users ADD COLUMN posts_created integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on WhatsApp verifications
ALTER TABLE whatsapp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create verification"
  ON whatsapp_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view own verification"
  ON whatsapp_verifications FOR SELECT
  USING (true);

-- Add function to unlock contact after chat acceptance
CREATE OR REPLACE FUNCTION unlock_contact_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACCEPTED' THEN
    UPDATE chat_requests
    SET contact_visible = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unlock_contact_trigger
AFTER UPDATE ON chat_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION unlock_contact_on_accept();

-- Function to check message limit
CREATE OR REPLACE FUNCTION can_send_message(chat_id uuid, sender_id uuid, user_id uuid)
RETURNS boolean AS $$
DECLARE
  msg_count integer;
  has_premium boolean;
BEGIN
  -- Count messages from this sender in this chat
  SELECT COUNT(*) INTO msg_count FROM chat_messages
  WHERE chat_request_id = chat_id AND sender_id = sender_id;
  
  -- Check if user has premium subscription
  SELECT COUNT(*) > 0 INTO has_premium FROM subscriptions
  WHERE user_id = user_id AND is_active = true AND end_date >= CURRENT_DATE;
  
  -- Free users: max 3 messages, Premium: unlimited
  IF has_premium THEN
    RETURN true;
  ELSE
    RETURN msg_count < 3;
  END IF;
END;
$$ LANGUAGE plpgsql;
