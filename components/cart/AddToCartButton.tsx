'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showQuantity?: boolean;
  className?: string;
}

export function AddToCartButton({ 
  product, 
  variant = 'default', 
  size = 'default',
  showQuantity = false,
  className = ''
}: AddToCartButtonProps) {
  const { addToCart, updateQuantity, isInCart, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const currentQuantity = getItemQuantity(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      console.log('Adding product to cart:', product.title, 'quantity:', quantity); // Debug log
      addToCart(product, quantity);
      toast.success(`${product.title} added to cart!`, {
        description: `Quantity: ${quantity}`,
        action: {
          label: 'View Cart',
          onClick: () => {
            // This will be handled by the cart drawer
            document.dispatchEvent(new CustomEvent('openCart'));
          }
        }
      });
      // Reset quantity to 1 after adding
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error); // Debug log
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  if (inCart && showQuantity) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(currentQuantity - 1)}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[2rem] text-center font-semibold">
          {currentQuantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(currentQuantity + 1)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (inCart) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={`${className} bg-green-100 text-green-700 hover:bg-green-200`}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        In Cart
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[2rem] text-center font-semibold">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Button
        variant={variant}
        size={size}
        onClick={handleAddToCart}
        disabled={isAdding}
        className="flex items-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
}