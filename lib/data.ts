import { Category, Product } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Vehicles',
    slug: 'vehicles',
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 1234
  },
  {
    id: '2',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 2156
  },
  {
    id: '3',
    name: 'Property',
    slug: 'property',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 856
  },
  {
    id: '4',
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 3421
  },
  {
    id: '5',
    name: 'Home & Garden',
    slug: 'home-garden',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 1876
  },
  {
    id: '6',
    name: 'Services',
    slug: 'services',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 965
  },
  {
    id: '7',
    name: 'Jobs',
    slug: 'jobs',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 542
  },
  {
    id: '8',
    name: 'Sports',
    slug: 'sports',
    image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 743
  }
];

export const featuredProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro - Excellent Condition',
    description: 'iPhone 14 Pro in excellent condition with all accessories included. Battery health 98%. No scratches or dents.',
    price: 185000,
    originalPrice: 220000,
    images: [
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[1],
    condition: 'used',
    location: 'Colombo 03',
    seller_id: 'admin',
    seller: {
      id: 'seller1',
      name: 'TechStore LK',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8
    },
    features: ['128GB Storage', 'Face ID', 'Wireless Charging', '5G Compatible'],
    tags: ['smartphone', 'apple', 'iphone', 'mobile'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Toyota Aqua 2019 - Low Mileage',
    description: 'Toyota Aqua 2019 model with only 25,000km mileage. Excellent fuel economy and well maintained.',
    price: 4500000,
    images: [
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[0],
    condition: 'used',
    location: 'Kandy',
    seller_id: 'admin',
    seller: {
      id: 'seller2',
      name: 'AutoDealer Pro',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9
    },
    features: ['Hybrid Engine', 'Automatic Transmission', 'Full Service History', 'Accident Free'],
    tags: ['car', 'toyota', 'aqua', 'hybrid'],
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    isFeatured: true
  },
  {
    id: '3',
    title: '3 Bedroom House - Nugegoda',
    description: 'Beautiful 3 bedroom house in prime location Nugegoda. Close to schools and shopping centers.',
    price: 25000000,
    images: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[2],
    condition: 'used',
    location: 'Nugegoda',
    seller_id: 'admin',
    seller: {
      id: 'seller3',
      name: 'PropertyPro LK',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.7
    },
    features: ['3 Bedrooms', '2 Bathrooms', 'Car Parking', 'Garden'],
    tags: ['house', 'property', 'nugegoda', 'residential'],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    isFeatured: true
  },
  {
    id: '4',
    title: 'MacBook Pro 13" M1 Chip',
    description: 'MacBook Pro with M1 chip in excellent condition. Perfect for professionals and students.',
    price: 240000,
    originalPrice: 280000,
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/459653/pexels-photo-459653.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[1],
    condition: 'used',
    location: 'Colombo 05',
    seller_id: 'admin',
    seller: {
      id: 'seller4',
      name: 'AppleStore Lanka',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9
    },
    features: ['M1 Chip', '8GB RAM', '256GB SSD', 'Retina Display'],
    tags: ['laptop', 'macbook', 'apple', 'computer'],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
    isFeatured: true,
    isNew: true
  },
  {
    id: '5',
    title: 'Designer Sofa Set - 3+2+1',
    description: 'Beautiful designer sofa set in excellent condition. Perfect for modern living rooms.',
    price: 95000,
    originalPrice: 120000,
    images: [
      'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[4],
    condition: 'used',
    location: 'Maharagama',
    seller_id: 'admin',
    seller: {
      id: 'seller5',
      name: 'FurniturePlus',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.6
    },
    features: ['Genuine Leather', 'Reclining Seats', 'Warranty Included', 'Home Delivery'],
    tags: ['furniture', 'sofa', 'living room', 'leather'],
    createdAt: '2024-01-11T11:45:00Z',
    updatedAt: '2024-01-11T11:45:00Z',
    isFeatured: true
  },
  {
    id: '6',
    title: 'Gaming PC - RTX 3070 Setup',
    description: 'High-performance gaming PC with RTX 3070, perfect for gaming and professional work.',
    price: 320000,
    images: [
      'https://images.pexels.com/photos/2148222/pexels-photo-2148222.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[1],
    condition: 'used',
    location: 'Colombo 07',
    seller_id: 'admin',
    seller: {
      id: 'seller6',
      name: 'GamerHub LK',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8
    },
    features: ['RTX 3070', '16GB RAM', '1TB SSD', 'RGB Lighting'],
    tags: ['computer', 'gaming', 'pc', 'rtx'],
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
    isFeatured: true
  }
];