/**
 * Thirdwave Shared TypeScript Interfaces
 */

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image: string;
  status: string;
}

export interface Order {
  id: number;
  product_id: number;
  product_name?: string;
  unit_price?: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface SellRequest {
  id: number;
  seller_name: string;
  email: string;
  phone: string;
  component_name: string;
  category: string;
  expected_price: number;
  component_condition: string;
  description: string;
  status: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface OverviewStats {
  total_products: number;
  total_orders: number;
  total_sell_requests: number;
  total_messages: number;
}
