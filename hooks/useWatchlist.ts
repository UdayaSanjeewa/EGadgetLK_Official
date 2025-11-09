'use client';

import { useState, useEffect } from 'react';
import { WatchlistItem, Product } from '@/types';
import { WatchlistManager } from '@/lib/watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialWatchlist = WatchlistManager.getWatchlist();
    console.log('Initial watchlist load:', initialWatchlist); // Debug log
    setWatchlist(initialWatchlist);
    setIsLoading(false);
    
    // Listen for storage changes to sync watchlist across tabs
    const handleStorageChange = () => {
      const updatedWatchlist = WatchlistManager.getWatchlist();
      console.log('Storage change detected, updating watchlist:', updatedWatchlist); // Debug log
      setWatchlist(updatedWatchlist);
    };
    
    // Listen for custom watchlist update events
    const handleWatchlistUpdate = () => {
      const updatedWatchlist = WatchlistManager.getWatchlist();
      console.log('Watchlist update event, refreshing watchlist:', updatedWatchlist); // Debug log
      setWatchlist(updatedWatchlist);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
    };
  }, []);

  const addToWatchlist = (product: Product) => {
    const updatedWatchlist = WatchlistManager.addToWatchlist(product);
    console.log('Adding to watchlist, new watchlist state:', updatedWatchlist); // Debug log
    setWatchlist(updatedWatchlist);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const removeFromWatchlist = (productId: string) => {
    const updatedWatchlist = WatchlistManager.removeFromWatchlist(productId);
    setWatchlist(updatedWatchlist);
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const clearWatchlist = () => {
    WatchlistManager.clearWatchlist();
    setWatchlist([]);
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const isInWatchlist = (productId: string) => {
    return watchlist.some(item => item.product.id === productId);
  };

  const itemCount = watchlist.length;

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
    isInWatchlist,
    itemCount,
    isLoading
  };
}