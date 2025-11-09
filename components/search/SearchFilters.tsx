'use client';

import { useState } from 'react';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  DollarSign,
  Tag,
  MapPin,
  Grid3x3,
  Star,
  Package
} from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: Record<string, string | null>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  currentFilters: {
    query: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    condition: string;
    location: string;
    brand: string;
  };
}

export function SearchFilters({ 
  onFilterChange, 
  onClearFilters, 
  activeFiltersCount,
  currentFilters 
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    currentFilters.minPrice,
    currentFilters.maxPrice
  ]);

  const conditions = ['new', 'used', 'refurbished'];
  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala', 
    'Anuradhapura', 'Ratnapura', 'Batticaloa', 'Jaffna', 'Matara'
  ];
  const brands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Toyota', 'Honda', 
    'Suzuki', 'Nissan', 'Dell', 'HP', 'Lenovo', 'Asus'
  ];

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFilterChange({ 
      minPrice: value[0] > 0 ? value[0].toString() : null,
      maxPrice: value[1] < 10000000 ? value[1].toString() : null
    });
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const currentConditions = currentFilters.condition ? currentFilters.condition.split(',') : [];
    let newConditions;
    
    if (checked) {
      newConditions = [...currentConditions, condition];
    } else {
      newConditions = currentConditions.filter(c => c !== condition);
    }
    
    onFilterChange({ 
      condition: newConditions.length > 0 ? newConditions.join(',') : null 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary">
            {activeFiltersCount} active
          </Badge>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Grid3x3 className="h-4 w-4" />
          Category
        </Label>
        <select
          value={currentFilters.category}
          onChange={(e) => onFilterChange({ category: e.target.value || null })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
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
            max={10000000}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Rs. {priceRange[0].toLocaleString()}</span>
            <span>Rs. {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">Min Price</Label>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handlePriceChange([value, priceRange[1]]);
              }}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Max Price</Label>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 10000000;
                handlePriceChange([priceRange[0], value]);
              }}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Condition Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Condition
        </Label>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={currentFilters.condition.split(',').includes(condition)}
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

      {/* Location Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <select
          value={currentFilters.location}
          onChange={(e) => onFilterChange({ location: e.target.value || null })}
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

      {/* Brand Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Brand
        </Label>
        <select
          value={currentFilters.brand}
          onChange={(e) => onFilterChange({ brand: e.target.value || null })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Price Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900">Quick Price Filters</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePriceChange([0, 50000])}
            className="justify-start text-xs"
          >
            Under Rs. 50,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePriceChange([50000, 200000])}
            className="justify-start text-xs"
          >
            Rs. 50,000 - Rs. 200,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePriceChange([200000, 1000000])}
            className="justify-start text-xs"
          >
            Rs. 200,000 - Rs. 1,000,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePriceChange([1000000, 10000000])}
            className="justify-start text-xs"
          >
            Above Rs. 1,000,000
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}