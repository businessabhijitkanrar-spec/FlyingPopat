
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Selling Price
  mrp?: number;  // Maximum Retail Price
  stock: number; // Inventory Count
  section: 'Saree' | 'Kids'; // New field to separate catalog pages
  category: string; // Changed from enum to string to allow flexibility, but we will still use the enum for dropdowns
  image: string; // Main image for backward compatibility
  images?: string[]; // Array of up to 3 images
  colors: string[];
  fabric: string;
  occasion: string[];
  details?: string[];
  care?: string[];
  tags?: string[]; // 'New Arrival', 'Hot Selling', 'Best Value'
}

export enum ProductCategory {
  // Sarees
  COTTON = 'Cotton',
  LINEN = 'Linen',
  TISSUE = 'Tissue',
  TAANT = 'Taant',
  JAMDANI = 'Jamdani',
  
  // Kids
  DUNGAREES = 'Dungarees',
  DRESSES = 'Dresses',
  SWEAT_WEAR = 'Sweat Wear',
  WAIST_COAT = 'Waist Coat'
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

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Exchange Requested' | 'Returned' | 'Exchanged';
export type RefundStatus = 'Pending' | 'Processed' | 'Failed';

export interface ReturnRequest {
  type: 'Return' | 'Exchange';
  reason: string;
  comment: string;
  image: string; // Base64 or URL
  requestDate: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  date: string;
  timestamp?: string; // ISO String for precise sorting and time display
  deliveryDate?: string; // Added to track 3-day return policy
  status: OrderStatus;
  statusNote?: string; // Added for admin notes
  refundStatus?: RefundStatus;
  returnRequest?: ReturnRequest; // Store return details
  total: number; // Final payable amount
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  itemsSummary: string;
  paymentMethod: 'cod' | 'online';
  paymentId?: string; // Optional now
  paymentScreenshot?: string; // New field for manual UPI
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
