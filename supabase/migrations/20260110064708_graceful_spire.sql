/*
  # Create restaurants and reviews tables with pgvector support

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text, restaurant name)
      - `email` (text, unique, for authentication)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `table_id` (text, optional table identifier)
      - `content` (text, the feedback content)
      - `embedding` (vector(384), for semantic search using gte-small model)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated restaurant owners to read their own data
    - Add policy for anonymous users to insert reviews

  3. Extensions
    - Enable pgvector extension for vector operations
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table with vector column for embeddings
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id text,
  content text NOT NULL,
  embedding vector(384), -- gte-small model uses 384 dimensions
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for restaurants table
CREATE POLICY "Restaurant owners can read own data"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Policies for reviews table
CREATE POLICY "Anyone can insert reviews"
  ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Restaurant owners can read own reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_embedding ON reviews USING ivfflat (embedding vector_cosine_ops);

-- Insert a sample restaurant for testing
INSERT INTO restaurants (name, email) 
VALUES ('Test Restaurant', 'test@restaurant.se')
ON CONFLICT (email) DO NOTHING;