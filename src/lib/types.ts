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

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface CheckoutOrderPayload {
  email: string;
  phone: string;
  customer_name: string;          // "firstName lastName"
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  delivery_option: string;        // e.g. "courier" (matches DeliveryOption.name)
  items: Array<{
    product_id: string | null;
    title: string;
    quantity: number;
    unit_price: number;            // in euros
  }>;
}

export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;        // euros
    wholesalePrice?: number; // euros (same as price for past orders)
  };
  quantity: number;
}

export interface Order {
  id: string;
  date: string;           // ISO string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;          // euros
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string | number;
  phone?: string | null;
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
