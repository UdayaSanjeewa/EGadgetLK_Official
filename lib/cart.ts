'use client';

import { Product, CartItem } from '@/types';

// Cart management functions
export class CartManager {
  private static STORAGE_KEY = 'sibn-ecommerce-cart';

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem(this.STORAGE_KEY);
      console.log('Getting cart from localStorage:', cart); // Debug log
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  static saveCart(cart: CartItem[]): void {
    if (typeof window === 'undefined') return;
    console.log('Saving cart to localStorage:', cart); // Debug log
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.STORAGE_KEY,
      newValue: JSON.stringify(cart)
    }));
  }

  static addToCart(product: Product, quantity: number = 1): CartItem[] {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: `cart-${product.id}-${Date.now()}`,
        product,
        quantity
      });
    }

    this.saveCart(cart);
    console.log('Cart after adding:', cart); // Debug log
    return cart;
  }

  static removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.product.id !== productId);
    this.saveCart(updatedCart);
    return updatedCart;
  }

  static updateQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }

    this.saveCart(cart);
    return cart;
  }

  static clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCartTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  static getCartItemCount(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
}