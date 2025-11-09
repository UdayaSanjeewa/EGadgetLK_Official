/*
  # Create Category Images Storage

  1. Storage Setup
    - Create storage bucket for category images
    - Set up public access policies for the bucket
    - Configure upload policies for admins

  2. Security
    - Public read access for all users
    - Upload/delete access only for authenticated admin users
*/

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete category images" ON storage.objects;

-- Allow public read access to category images
CREATE POLICY "Public read access for category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

-- Allow authenticated admin users to upload category images
CREATE POLICY "Admin users can upload category images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'category-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated admin users to update category images
CREATE POLICY "Admin users can update category images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'category-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated admin users to delete category images
CREATE POLICY "Admin users can delete category images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'category-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
