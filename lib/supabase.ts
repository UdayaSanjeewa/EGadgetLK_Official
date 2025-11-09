import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image: string;
          description: string | null;
          product_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image: string;
          description?: string | null;
          product_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image?: string;
          description?: string | null;
          product_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          original_price: number | null;
          images: string[];
          category_id: string | null;
          condition: 'new' | 'used' | 'refurbished';
          location: string;
          seller_id: string | null;
          seller_name: string;
          seller_avatar: string | null;
          seller_rating: number;
          features: string[];
          tags: string[];
          is_new: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          images?: string[];
          category_id?: string | null;
          condition: 'new' | 'used' | 'refurbished';
          location: string;
          seller_id?: string | null;
          seller_name: string;
          seller_avatar?: string | null;
          seller_rating?: number;
          features?: string[];
          tags?: string[];
          is_new?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          images?: string[];
          category_id?: string | null;
          condition?: 'new' | 'used' | 'refurbished';
          location?: string;
          seller_id?: string | null;
          seller_name?: string;
          seller_avatar?: string | null;
          seller_rating?: number;
          features?: string[];
          tags?: string[];
          is_new?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
