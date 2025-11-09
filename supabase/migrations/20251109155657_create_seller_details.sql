/*
  # Create Seller Details Table

  1. New Tables
    - `seller_details`
      - `id` (uuid, primary key, references profiles)
      - `business_name` (text)
      - `business_type` (text)
      - `district` (text)
      - `gstin` (text)
      - `bank_account_number` (text)
      - `bank_ifsc_code` (text)
      - `bank_account_holder` (text)
      - `is_verified` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Sellers can read/update their own details
    - Admins can read all seller details
*/

-- Create seller_details table
CREATE TABLE IF NOT EXISTS seller_details (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text DEFAULT 'individual' CHECK (business_type IN ('individual', 'partnership', 'company')),
  district text NOT NULL,
  gstin text DEFAULT '',
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seller_details ENABLE ROW LEVEL SECURITY;

-- Policies for seller_details
CREATE POLICY "Sellers can read own details"
  ON seller_details FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Sellers can insert own details"
  ON seller_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Sellers can update own details"
  ON seller_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Admins can read all seller details"
  ON seller_details FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
