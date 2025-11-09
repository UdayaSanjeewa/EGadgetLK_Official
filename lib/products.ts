import { supabase } from './supabase';
import type { Product, Category } from '@/types';

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*');

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (!productsData || !categoriesData) return [];

  return productsData.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    originalPrice: p.original_price,
    images: p.images || [],
    category: categoriesData.find(c => c.id === p.category_id) || {
      id: '',
      name: 'Uncategorized',
      slug: 'uncategorized',
      image: '',
      productCount: 0
    },
    condition: p.condition,
    location: p.location || 'Sri Lanka',
    seller_id: p.seller_id || '',
    seller: {
      id: p.seller_id || 'admin',
      name: p.seller_name || 'Admin',
      avatar: p.seller_avatar || '',
      rating: p.seller_rating || 5
    },
    features: p.features || [],
    tags: p.tags || [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    isNew: p.is_new,
    isFeatured: p.is_featured
  }));
}

export async function getAllProducts(): Promise<Product[]> {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*');

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (!productsData || !categoriesData) return [];

  return productsData.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    originalPrice: p.original_price,
    images: p.images || [],
    category: categoriesData.find(c => c.id === p.category_id) || {
      id: '',
      name: 'Uncategorized',
      slug: 'uncategorized',
      image: '',
      productCount: 0
    },
    condition: p.condition,
    location: p.location || 'Sri Lanka',
    seller_id: p.seller_id || '',
    seller: {
      id: p.seller_id || 'admin',
      name: p.seller_name || 'Admin',
      avatar: p.seller_avatar || '',
      rating: p.seller_rating || 5
    },
    features: p.features || [],
    tags: p.tags || [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    isNew: p.is_new,
    isFeatured: p.is_featured
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*');

  const { data: productData } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!productData || !categoriesData) return null;

  return {
    id: productData.id,
    title: productData.title,
    description: productData.description,
    price: productData.price,
    originalPrice: productData.original_price,
    images: productData.images || [],
    category: categoriesData.find(c => c.id === productData.category_id) || {
      id: '',
      name: 'Uncategorized',
      slug: 'uncategorized',
      image: '',
      productCount: 0
    },
    condition: productData.condition,
    location: productData.location || 'Sri Lanka',
    seller_id: productData.seller_id || '',
    seller: {
      id: productData.seller_id || 'admin',
      name: productData.seller_name || 'Admin',
      avatar: productData.seller_avatar || '',
      rating: productData.seller_rating || 5
    },
    features: productData.features || [],
    tags: productData.tags || [],
    createdAt: productData.created_at,
    updatedAt: productData.updated_at,
    isNew: productData.is_new,
    isFeatured: productData.is_featured
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (!categoriesData) return [];

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categoriesData.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image_url || '',
        description: category.description || '',
        productCount: count || 0
      };
    })
  );

  return categoriesWithCounts;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*');

  const category = categoriesData?.find(c => c.slug === categorySlug);
  if (!category) return [];

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (!productsData) return [];

  return productsData.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    originalPrice: p.original_price,
    images: p.images || [],
    category: category,
    condition: p.condition,
    location: p.location || 'Sri Lanka',
    seller_id: p.seller_id || '',
    seller: {
      id: p.seller_id || 'admin',
      name: p.seller_name || 'Admin',
      avatar: p.seller_avatar || '',
      rating: p.seller_rating || 5
    },
    features: p.features || [],
    tags: p.tags || [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    isNew: p.is_new,
    isFeatured: p.is_featured
  }));
}
