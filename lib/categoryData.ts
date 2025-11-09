import { Product, Category } from '@/types';
import { categories, featuredProducts } from './data';

// Extended product data for different categories
export const vehicleProducts: Product[] = [
  {
    id: 'v1',
    title: 'Toyota Aqua 2019 - Hybrid',
    description: 'Toyota Aqua 2019 model with only 25,000km mileage. Excellent fuel economy, well maintained, full service history.',
    price: 4500000,
    originalPrice: 4800000,
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
    id: 'v2',
    title: 'Honda Vezel 2018 - SUV',
    description: 'Honda Vezel 2018 in excellent condition. Low mileage, well maintained, perfect for family use.',
    price: 5200000,
    images: [
      'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[0],
    condition: 'used',
    location: 'Colombo 05',
    seller_id: 'admin',
    seller: {
      id: 'seller7',
      name: 'Honda Center',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.7
    },
    features: ['SUV', 'Automatic', 'Low Mileage', 'Family Car'],
    tags: ['car', 'honda', 'vezel', 'suv'],
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  },
  {
    id: 'v3',
    title: 'Suzuki Alto 2020 - Compact',
    description: 'Brand new Suzuki Alto 2020. Perfect city car with excellent fuel efficiency.',
    price: 2800000,
    images: [
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[0],
    condition: 'new',
    location: 'Gampaha',
    seller_id: 'admin',
    seller: {
      id: 'seller8',
      name: 'Suzuki Lanka',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8
    },
    features: ['Compact Car', 'Manual', 'Fuel Efficient', 'City Car'],
    tags: ['car', 'suzuki', 'alto', 'compact'],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
    isNew: true
  }
];

export const electronicsProducts: Product[] = [
  {
    id: 'e1',
    title: 'iPhone 14 Pro - 128GB',
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
    id: 'e2',
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
    id: 'e3',
    title: 'Samsung Galaxy S23 Ultra',
    description: 'Latest Samsung Galaxy S23 Ultra with S Pen. 256GB storage, excellent camera system.',
    price: 195000,
    images: [
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[1],
    condition: 'new',
    location: 'Negombo',
    seller_id: 'admin',
    seller: {
      id: 'seller9',
      name: 'Samsung Store',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.6
    },
    features: ['S Pen', '256GB Storage', '108MP Camera', '5G Ready'],
    tags: ['smartphone', 'samsung', 'galaxy', 'android'],
    createdAt: '2024-01-11T09:15:00Z',
    updatedAt: '2024-01-11T09:15:00Z',
    isNew: true
  }
];

export const propertyProducts: Product[] = [
  {
    id: 'p1',
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
    id: 'p2',
    title: 'Luxury Apartment - Colombo 07',
    description: 'Modern 2 bedroom apartment with city view. Fully furnished with premium amenities.',
    price: 18000000,
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[2],
    condition: 'new',
    location: 'Colombo 07',
    seller_id: 'admin',
    seller: {
      id: 'seller10',
      name: 'Luxury Homes',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9
    },
    features: ['2 Bedrooms', 'City View', 'Furnished', 'Swimming Pool'],
    tags: ['apartment', 'luxury', 'colombo', 'furnished'],
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
    isNew: true
  }
];

export const fashionProducts: Product[] = [
  {
    id: 'f1',
    title: 'Designer Dress - Evening Wear',
    description: 'Elegant designer evening dress, perfect for special occasions. Size M, excellent condition.',
    price: 15000,
    originalPrice: 25000,
    images: [
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    category: categories[3],
    condition: 'used',
    location: 'Colombo 03',
    seller_id: 'admin',
    seller: {
      id: 'seller11',
      name: 'Fashion Hub',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.5
    },
    features: ['Size M', 'Designer Brand', 'Evening Wear', 'Excellent Condition'],
    tags: ['dress', 'fashion', 'designer', 'evening'],
    createdAt: '2024-01-09T12:30:00Z',
    updatedAt: '2024-01-09T12:30:00Z'
  }
];

// Function to get products by category
export function getProductsByCategory(categorySlug: string, searchParams?: { [key: string]: string | string[] | undefined }): Product[] {
  let categoryProducts: Product[] = [];
  
  switch (categorySlug) {
    case 'vehicles':
      categoryProducts = vehicleProducts;
      break;
    case 'electronics':
      categoryProducts = electronicsProducts;
      break;
    case 'property':
      categoryProducts = propertyProducts;
      break;
    case 'fashion':
      categoryProducts = fashionProducts;
      break;
    case 'home-garden':
      categoryProducts = []; // Add home & garden products later
      break;
    case 'services':
      categoryProducts = []; // Add services later
      break;
    case 'jobs':
      categoryProducts = []; // Add jobs later
      break;
    case 'sports':
      categoryProducts = []; // Add sports products later
      break;
    default:
      categoryProducts = [];
  }

  if (!searchParams) return categoryProducts;

  let filteredProducts = [...categoryProducts];

  // Filter by search term
  const search = searchParams.search as string;
  if (search) {
    filteredProducts = filteredProducts.filter(product =>
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filter by conditions
  const conditions = searchParams.conditions as string;
  if (conditions) {
    const conditionArray = conditions.split(',');
    filteredProducts = filteredProducts.filter(product =>
      conditionArray.includes(product.condition)
    );
  }

  // Filter by price range
  const minPrice = parseInt(searchParams.minPrice as string) || 0;
  const maxPrice = parseInt(searchParams.maxPrice as string) || 1000000;
  filteredProducts = filteredProducts.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );

  // Filter by location
  const location = searchParams.location as string;
  if (location) {
    filteredProducts = filteredProducts.filter(product =>
      product.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  return filteredProducts;
}

// Function to get all products from all categories
export function getAllProducts(): Product[] {
  return [
    ...featuredProducts,
    ...vehicleProducts,
    ...electronicsProducts,
    ...propertyProducts,
    ...fashionProducts
  ].filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );
}

// Function to get category filters
export function getCategoryFilters(categorySlug: string) {
  const baseFilters = {
    condition: ['new', 'used', 'refurbished'],
    priceRanges: [
      { label: 'Under Rs. 50,000', min: 0, max: 50000 },
      { label: 'Rs. 50,000 - Rs. 100,000', min: 50000, max: 100000 },
      { label: 'Rs. 100,000 - Rs. 500,000', min: 100000, max: 500000 },
      { label: 'Rs. 500,000 - Rs. 1,000,000', min: 500000, max: 1000000 },
      { label: 'Above Rs. 1,000,000', min: 1000000, max: Infinity }
    ]
  };

  switch (categorySlug) {
    case 'vehicles':
      return {
        ...baseFilters,
        brands: ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Mitsubishi'],
        fuelTypes: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
        transmissions: ['Manual', 'Automatic', 'CVT'],
        bodyTypes: ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe']
      };
    case 'electronics':
      return {
        ...baseFilters,
        brands: ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP'],
        categories: ['Smartphones', 'Laptops', 'Tablets', 'Cameras', 'Audio']
      };
    case 'property':
      return {
        ...baseFilters,
        propertyTypes: ['House', 'Apartment', 'Land', 'Commercial'],
        bedrooms: ['1', '2', '3', '4', '5+'],
        bathrooms: ['1', '2', '3', '4+']
      };
    case 'fashion':
      return {
        ...baseFilters,
        categories: ['Clothing', 'Shoes', 'Accessories', 'Bags'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        genders: ['Men', 'Women', 'Unisex']
      };
    default:
      return baseFilters;
  }
}