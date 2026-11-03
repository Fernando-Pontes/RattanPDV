export interface SystemUser {
  id: string;
  name: string;
  username: string;
  role?: string;
  active?: boolean;
}

export type CategoryId = string;

export interface Category {
  id: string;
  name: string;
  iconName?: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  image: string;
  available: boolean;
  prepTimeMinutes: number;
  hasCustomizations?: boolean;
  allowedDoneness?: string[];
  allowedExtras?: ExtraOption[];
  removableIngredients?: string[];
}

export interface OrderItemCustomization {
  doneness?: string;
  extras?: ExtraOption[];
  removals?: string[];
  notes?: string;
}

export interface OrderItem {
  id: string; // unique instance id
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  customization?: OrderItemCustomization;
  itemTotal: number;
}

export type OrderStatus = 'queued' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

export type PaymentStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  orderNumber: number; // e.g. 42
  customerName: string;
  customerPhone?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cashReceived?: number;
  cashChange?: number;
  status: OrderStatus;
  createdAt: string; // ISO
  startedPrepAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface DailySummary {
  totalRevenue: number;
  ordersCount: number;
  averageTicket: number;
  avgPrepMinutes: number;
  byPaymentMethod: Record<PaymentMethod, { count: number; total: number }>;
  topItems: { name: string; quantity: number; revenue: number }[];
}
