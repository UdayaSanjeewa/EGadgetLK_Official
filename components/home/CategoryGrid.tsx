'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/products';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Category } from '@/types';

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Shop by Category</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover premium products across diverse categories, all curated for your needs
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No categories available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{
                  animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-all duration-300">
                    <h3 className="font-bold text-xl mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-200">
                        {category.productCount.toLocaleString()} items
                      </p>
                      <div className="flex items-center gap-1 text-sm font-semibold group-hover:text-cyan-300 transition-colors duration-300">
                        <span>Shop</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-xs font-bold text-white">View All</span>
                  </div>
                </div>

                {category.productCount > 100 && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      Trending
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-blue-400 rounded-2xl transition-all duration-300"></div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group"
          >
            View All Categories
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .bg-size-200 {
          background-size: 200% auto;
        }

        .bg-pos-0 {
          background-position: 0% center;
        }

        .bg-pos-100 {
          background-position: 100% center;
        }
      `}</style>
    </section>
  );
}
