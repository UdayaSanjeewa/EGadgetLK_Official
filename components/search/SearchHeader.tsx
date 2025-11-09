'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchHeaderProps {
  query: string;
  resultCount: number;
  onSearch: (query: string) => void;
}

export function SearchHeader({ query, resultCount, onSearch }: SearchHeaderProps) {
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Products
          </h1>
          <p className="text-blue-100">
            Find exactly what you're looking for from thousands of products
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-lg bg-white text-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            className="w-full mt-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 rounded-xl"
          >
            Search Products
          </Button>
        </form>

        {/* Results Summary */}
        {query && (
          <div className="text-center mt-6">
            <p className="text-blue-100">
              Found <span className="font-bold text-white">{resultCount}</span> products
              {query && (
                <>
                  {' '}matching "<span className="font-semibold text-white">{query}</span>"
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}