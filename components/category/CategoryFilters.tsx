'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  Search,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Tag,
  Star
} from 'lucide-react';

interface CategoryFiltersProps {
  categorySlug: string;
  filters: any;
}

export function CategoryFilters({ categorySlug, filters }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.get('conditions')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '1000000')
  ]);
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala', 
    'Anuradhapura', 'Ratnapura', 'Batticaloa', 'Jaffna', 'Matara'
  ];

  const updateURL = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === '0,1000000') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/category/${categorySlug}${query}`);
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    let newConditions;
    if (checked) {
      newConditions = [...selectedConditions, condition];
    } else {
      newConditions = selectedConditions.filter(c => c !== condition);
    }
    setSelectedConditions(newConditions);
    updateURL({ conditions: newConditions.length > 0 ? newConditions.join(',') : null });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL({ search: value || null });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateURL({ 
      minPrice: value[0] > 0 ? value[0].toString() : null,
      maxPrice: value[1] < 1000000 ? value[1].toString() : null
    });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    updateURL({ location: value || null });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedConditions([]);
    setPriceRange([0, 1000000]);
    setSelectedLocation('');
    router.push(`/category/${categorySlug}`);
  };

  const activeFiltersCount = selectedConditions.length + 
    (selectedLocation ? 1 : 0) + 
    (searchTerm ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4 space-y-6`}>
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10"
            />
            {searchTerm && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={1000000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Rs. {priceRange[0].toLocaleString()}</span>
              <span>Rs. {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Condition
          </Label>
          <div className="space-y-2">
            {filters.condition?.map((condition: string) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => 
                    handleConditionChange(condition, checked as boolean)
                  }
                />
                <Label
                  htmlFor={condition}
                  className="text-sm font-normal capitalize cursor-pointer"
                >
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Category Specific Filters */}
        {categorySlug === 'vehicles' && filters.brands && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Brand</Label>
            <div className="grid grid-cols-2 gap-2">
              {filters.brands.slice(0, 6).map((brand: string) => (
                <Button
                  key={brand}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        )}

        {categorySlug === 'electronics' && filters.brands && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Brand</Label>
            <div className="grid grid-cols-2 gap-2">
              {filters.brands.slice(0, 6).map((brand: string) => (
                <Button
                  key={brand}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {selectedConditions.map((condition) => (
                <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                  {condition}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleConditionChange(condition, false)}
                  />
                </Badge>
              ))}
              {selectedLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedLocation}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleLocationChange('')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}