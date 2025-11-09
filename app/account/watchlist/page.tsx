'use client';

import { useAuth } from '@/hooks/useAuth';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, Search, ShoppingCart, Trash2, Star, MapPin, Clock, Grid2x2 as Grid, List, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function WatchlistPage() {
  const { user, isLoading } = useAuth();
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const { addToCart, isInCart } = useCart();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredWatchlist, setFilteredWatchlist] = useState(watchlist);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let filtered = [...watchlist];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort items
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.product.price - b.product.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.product.price - a.product.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.product.title.localeCompare(b.product.title));
        break;
    }

    setFilteredWatchlist(filtered);
  }, [watchlist, searchTerm, sortBy]);

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

  const handleAddToCart = (item: any) => {
    addToCart(item.product, 1);
    toast.success(`${item.product.title} added to cart!`);
  };

  const handleRemoveFromWatchlist = (productId: string) => {
    removeFromWatchlist(productId);
    toast.success('Item removed from watchlist');
  };

  const handleClearWatchlist = () => {
    clearWatchlist();
    toast.success('Watchlist cleared');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-600">
              {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {watchlist.length > 0 && (
            <Button variant="outline" onClick={handleClearWatchlist}>
              Clear All
            </Button>
          )}
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-600 mb-6">
                Save products you're interested in to view them later
              </p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filters and Controls */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search your saved items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                      <option value="newest">Recently Added</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watchlist Items */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredWatchlist.map((item) => (
                <Card
                  key={item.id}
                  className={
                    viewMode === 'grid'
                      ? "group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      : "group hover:shadow-xl transition-all duration-300 flex"
                  }
                >
                  <Link href={`/product/${item.product.id}`} className="contents">
                    {/* Product Image */}
                    <div className={
                      viewMode === 'grid'
                        ? "relative aspect-[4/3] overflow-hidden rounded-t-lg"
                        : "relative w-48 h-36 overflow-hidden rounded-l-lg flex-shrink-0"
                    }>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {item.product.isFeatured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                            Featured
                          </Badge>
                        )}
                        {item.product.isNew && (
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Remove Button */}
                      <div className="absolute top-3 right-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWatchlist(item.product.id);
                          }}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-5 flex-1">
                      <div className="mb-3">
                        <h3 className={
                          viewMode === 'grid'
                            ? "font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2"
                            : "font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2"
                        }>
                          {item.product.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={
                            viewMode === 'grid' ? "text-2xl font-bold text-blue-600" : "text-3xl font-bold text-blue-600"
                          }>
                            {formatPrice(item.product.price)}
                          </span>
                          {item.product.originalPrice && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {item.product.seller.name[0]}
                        </div>
                        <span className="text-sm text-gray-600">{item.product.seller.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{item.product.seller.rating}</span>
                        </div>
                      </div>

                      {/* Location & Time */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.product.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Saved {formatTimeAgo(item.addedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!isInCart(item.product.id) ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            className="flex-1"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled
                            className="flex-1"
                          >
                            In Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {filteredWatchlist.length === 0 && searchTerm && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search term
                  </p>
                  <Button onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}