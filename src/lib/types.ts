export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  subCategory: string;
  image: string;
  inStock: boolean;
  brand: string;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string | number;
  phone: string;
  email?: string | null;
  first_name?: string;
  last_name?: string;
  address: Address;
  is_company: boolean;
  is_superuser?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}
