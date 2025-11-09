'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductGrid } from '@/components/category/ProductGrid';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchHeader } from '@/components/search/SearchHeader';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid2x2 as Grid, List, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = parseInt(searchParams.get('minPrice') || '0');
  const maxPrice = parseInt(searchParams.get('maxPrice') || '10000000');
  const condition = searchParams.get('condition') || '';
  const location = searchParams.get('location') || '';
  const brand = searchParams.get('brand') || '';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            image
          )
        `);

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
        images: product.images || [],
        category: {
          id: product.categories?.id || '',
          name: product.categories?.name || 'Uncategorized',
          slug: product.categories?.slug || 'uncategorized',
          image: product.categories?.image || '',
          productCount: 0
        },
        condition: product.condition,
        location: product.location,
        seller_id: product.seller_id || '',
        seller: {
          id: product.seller_id || '',
          name: product.seller_name || 'Unknown',
          avatar: product.seller_avatar,
          rating: parseFloat(product.seller_rating) || 0
        },
        features: product.features || [],
        tags: product.tags || [],
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        isFeatured: product.is_featured || false,
        isNew: product.is_new || false
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    // Search by query
    if (query) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        product.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(product =>
        product.category.slug === category
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );

    // Filter by condition
    if (condition) {
      const conditions = condition.split(',');
      filtered = filtered.filter(product =>
        conditions.includes(product.condition)
      );
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(product =>
        product.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by brand (check in features and tags)
    if (brand) {
      filtered = filtered.filter(product =>
        product.features.some(feature => feature.toLowerCase().includes(brand.toLowerCase())) ||
        product.tags.some(tag => tag.toLowerCase().includes(brand.toLowerCase()))
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.seller.rating * 100) - (a.seller.rating * 100));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, query, category, minPrice, maxPrice, condition, location, brand, sortBy]);

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === '' || value === '0,10000000') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const search = params.toString();
    const query = search ? `?${search}` : '';
    router.push(`/search${query}`);
  };

  const clearAllFilters = () => {
    router.push('/search');
  };

  const activeFiltersCount = 
    (query ? 1 : 0) +
    (category ? 1 : 0) +
    (condition ? 1 : 0) +
    (location ? 1 : 0) +
    (brand ? 1 : 0) +
    (minPrice > 0 || maxPrice < 10000000 ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader 
        query={query}
        resultCount={filteredProducts.length}
        onSearch={(newQuery) => updateFilters({ q: newQuery })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters
              onFilterChange={updateFilters}
              onClearFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              currentFilters={{
                query,
                category,
                minPrice,
                maxPrice,
                condition,
                location,
                brand
              }}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredProducts.length} Products Found
                    {query && (
                      <span className="text-blue-600"> for "{query}"</span>
                    )}
                  </h2>
                  {activeFiltersCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none border-r"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Dropdown */}
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  {query && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {query}
                      <button
                        onClick={() => updateFilters({ q: null })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {category}
                      <button
                        onClick={() => updateFilters({ category: null })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {condition && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Condition: {condition}
                      <button
                        onClick={() => updateFilters({ condition: null })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {location && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Location: {location}
                      <button
                        onClick={() => updateFilters({ location: null })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {brand && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Brand: {brand}
                      <button
                        onClick={() => updateFilters({ brand: null })}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid products={filteredProducts} viewMode={viewMode} />

            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" className="px-8">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}