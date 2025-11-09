export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  seller_id: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  features: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface WatchlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  condition?: string[];
  location?: string;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular';
}