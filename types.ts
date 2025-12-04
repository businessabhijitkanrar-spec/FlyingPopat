
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Selling Price
  mrp?: number;  // Maximum Retail Price
  category: SareeCategory;
  image: string; // Main image for backward compatibility
  images?: string[]; // Array of up to 3 images
  colors: string[];
  fabric: string;
  occasion: string[];
  details?: string[];
  care?: string[];
  tags?: string[]; // 'New Arrival', 'Hot Selling', 'Best Value'
}

export enum SareeCategory {
  BANARASI = 'Banarasi',
  KANJEEVARAM = 'Kanjeevaram',
  CHIFFON = 'Chiffon',
  COTTON = 'Cotton',
  GEORGETTE = 'Georgette',
  LINEN = 'Linen'
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // Added for admin panel requirement
  joinedDate?: string;
  phone?: string;
  countryCode?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type RefundStatus = 'Pending' | 'Processed' | 'Failed';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  date: string;
  status: OrderStatus;
  statusNote?: string; // Added for admin notes
  refundStatus?: RefundStatus;
  total: number; // Final payable amount
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  itemsSummary: string;
}

export type FeedbackType = 'cancellation' | 'review';

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  rating?: number; // 1-5 for reviews
  reason?: string; // For cancellations
  comment: string;
  date: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read';
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
}
