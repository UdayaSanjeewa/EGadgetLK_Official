'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function WatchlistButton({ 
  product, 
  variant = 'ghost', 
  size = 'icon',
  className = '',
  showText = false
}: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [isToggling, setIsToggling] = useState(false);
  
  const inWatchlist = isInWatchlist(product.id);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToggling(true);
    
    try {
      if (inWatchlist) {
        removeFromWatchlist(product.id);
        toast.success('Removed from watchlist');
      } else {
        addToWatchlist(product);
        toast.success(`${product.title} added to watchlist!`, {
          description: 'View your saved items anytime',
          action: {
            label: 'View Watchlist',
            onClick: () => {
              document.dispatchEvent(new CustomEvent('openWatchlist'));
            }
          }
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWatchlist}
      disabled={isToggling}
      className={`${className} ${inWatchlist ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'} transition-colors`}
    >
      <Heart 
        className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''} ${showText ? 'mr-2' : ''}`} 
      />
      {showText && (
        <span>{inWatchlist ? 'Saved' : 'Save'}</span>
      )}
    </Button>
  );
}