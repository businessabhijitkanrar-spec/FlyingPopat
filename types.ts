
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: SareeCategory;
  image: string;
  colors: string[];
  fabric: string;
  occasion: string[];
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
  total: number;
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