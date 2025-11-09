'use client';

import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { CartManager } from '@/lib/cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialCart = CartManager.getCart();
    console.log('Initial cart load:', initialCart); // Debug log
    setCart(initialCart);
    setIsLoading(false);
    
    // Listen for storage changes to sync cart across tabs
    const handleStorageChange = () => {
      const updatedCart = CartManager.getCart();
      console.log('Storage change detected, updating cart:', updatedCart); // Debug log
      setCart(updatedCart);
    };
    
    // Listen for custom cart update events
    const handleCartUpdate = () => {
      const updatedCart = CartManager.getCart();
      console.log('Cart update event, refreshing cart:', updatedCart); // Debug log
      setCart(updatedCart);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    const updatedCart = CartManager.addToCart(product, quantity);
    console.log('Adding to cart, new cart state:', updatedCart); // Debug log
    setCart(updatedCart);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = CartManager.removeFromCart(productId);
    setCart(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = CartManager.updateQuantity(productId, quantity);
    setCart(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const clearCart = () => {
    CartManager.clearCart();
    setCart([]);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const cartTotal = CartManager.getCartTotal(cart);
  const itemCount = CartManager.getCartItemCount(cart);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    cartTotal,
    itemCount,
    isLoading
  };
}