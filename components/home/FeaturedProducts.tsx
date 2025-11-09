'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Heart, Star, MapPin, Clock, Eye, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { WatchlistButton } from '@/components/watchlist/WatchlistButton';

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Get all products, prioritizing featured ones
    const { data: categoriesData } = await supabase.from('categories').select('*');
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12);

    if (!productsData || !categoriesData) {
      setIsLoading(false);
      return;
    }

    const formattedProducts = productsData.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      originalPrice: p.original_price,
      images: p.images,
      category: categoriesData.find((c: any) => c.id === p.category_id) || {
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
        name: p.seller_name,
        avatar: p.seller_avatar,
        rating: p.seller_rating
      },
      features: p.features || [],
      tags: p.tags || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isNew: p.is_new,
      isFeatured: p.is_featured
    }));

    setProducts(formattedProducts);
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our newest and featured listings
            </p>
          </div>
          <Link
            href="/featured"
            className="mt-4 md:mt-0 text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center"
          >
            View All Featured
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured products available</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <Link href={`/product/${product.id}`}>
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-semibold">
                      Featured
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-semibold">
                      New
                    </Badge>
                  )}
                  {!product.isNew && (
                    <Badge variant="secondary" className="bg-black/70 text-white border-0 capitalize">
                      {product.condition}
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <div className="absolute top-3 right-3">
                  <WatchlistButton
                    product={product}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                  />
                </div>

                {/* Image Count */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {product.images.length}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                {/* Title & Price */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Seller Info */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {product.seller.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm text-gray-900">
                          {product.seller.name}
                        </span>
                        <BadgeCheck className="h-3 w-3 text-blue-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">{product.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Time */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(product.createdAt)}</span>
                  </div>
                </div>

                {/* Features */}
                {product.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-blue-200 text-blue-700"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {product.features.length > 2 && (
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                        +{product.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>

              {/* Add to Cart Button */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-gray-100">
                  <AddToCartButton
                    product={product}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
}