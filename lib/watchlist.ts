'use client';

import { Product } from '@/types';

export interface WatchlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

// Watchlist management functions
export class WatchlistManager {
  private static STORAGE_KEY = 'sibn-ecommerce-watchlist';

  static getWatchlist(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const watchlist = localStorage.getItem(this.STORAGE_KEY);
      console.log('Getting watchlist from localStorage:', watchlist); // Debug log
      return watchlist ? JSON.parse(watchlist) : [];
    } catch {
      return [];
    }
  }

  static saveWatchlist(watchlist: WatchlistItem[]): void {
    if (typeof window === 'undefined') return;
    console.log('Saving watchlist to localStorage:', watchlist); // Debug log
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.STORAGE_KEY,
      newValue: JSON.stringify(watchlist)
    }));
  }

  static addToWatchlist(product: Product): WatchlistItem[] {
    const watchlist = this.getWatchlist();
    const existingItemIndex = watchlist.findIndex(item => item.product.id === product.id);

    if (existingItemIndex === -1) {
      const newItem: WatchlistItem = {
        id: `watchlist-${product.id}-${Date.now()}`,
        product,
        addedAt: new Date().toISOString()
      };
      watchlist.push(newItem);
      this.saveWatchlist(watchlist);
      console.log('Watchlist after adding:', watchlist); // Debug log
    }

    return watchlist;
  }

  static removeFromWatchlist(productId: string): WatchlistItem[] {
    const watchlist = this.getWatchlist();
    const updatedWatchlist = watchlist.filter(item => item.product.id !== productId);
    this.saveWatchlist(updatedWatchlist);
    return updatedWatchlist;
  }

  static clearWatchlist(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isInWatchlist(productId: string): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.product.id === productId);
  }

  static getWatchlistCount(): number {
    const watchlist = this.getWatchlist();
    return watchlist.length;
  }
}