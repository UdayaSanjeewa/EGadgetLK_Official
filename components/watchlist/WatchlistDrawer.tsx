'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from '@/components/ui/sheet';
import { 
  Heart, 
  X,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Star,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistDrawerProps {
  children: React.ReactNode;
}

export function WatchlistDrawer({ children }: WatchlistDrawerProps) {
  const { 
    watchlist, 
    removeFromWatchlist, 
    clearWatchlist, 
    itemCount 
  } = useWatchlist();
  const { addToCart, isInCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Debug log to see watchlist state
  useEffect(() => {
    console.log('WatchlistDrawer watchlist state:', watchlist, 'itemCount:', itemCount);
  }, [watchlist, itemCount]);

  useEffect(() => {
    const handleOpenWatchlist = () => setIsOpen(true);
    document.addEventListener('openWatchlist', handleOpenWatchlist);
    return () => document.removeEventListener('openWatchlist', handleOpenWatchlist);
  }, []);

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

  const handleRemoveFromWatchlist = (productId: string) => {
    removeFromWatchlist(productId);
    toast.success('Item removed from watchlist');
  };

  const handleClearWatchlist = () => {
    clearWatchlist();
    toast.success('Watchlist cleared');
  };

  const handleAddToCart = (item: any) => {
    addToCart(item.product, 1);
    toast.success(`${item.product.title} added to cart!`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Watchlist
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {!watchlist || watchlist.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Heart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your watchlist is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Save products you're interested in to view them later
              </p>
              <Button onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
              {/* Debug info */}
              <div className="mt-4 text-xs text-gray-400">
                Debug: Watchlist length: {watchlist?.length || 0}, Items: {itemCount}
              </div>
            </div>
          ) : (
            <>
              {/* Watchlist Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {item.product.title}
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{item.product.location}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(item.addedAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {item.product.seller.name[0]}
                          </div>
                          <span className="text-sm text-gray-600">{item.product.seller.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{item.product.seller.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isInCart(item.product.id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                className="h-8 px-3 text-xs"
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Add to Cart
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromWatchlist(item.product.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watchlist Footer */}
              <SheetFooter className="border-t pt-4">
                <div className="w-full space-y-4">
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearWatchlist}
                      className="flex-1"
                    >
                      Clear Watchlist
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}