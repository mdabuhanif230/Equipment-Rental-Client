export type Role = "customer" | "owner" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  address?: string;
  role: Role;
  provider?: "local" | "google";
  createdAt?: string;
}

export type EquipmentStatus = "pending" | "approved" | "rejected";

export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  pricePerHour?: number;
  pricePerWeek?: number;
  location: string;
  rentalType: "day" | "hour" | "week";
  available: boolean;
  quantity: number;
  images: string[];
  featured?: boolean;
  status: EquipmentStatus;
  owner: Pick<User, "_id" | "name" | "email" | "photo"> | string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: Pick<User, "_id" | "name" | "photo"> | string;
  equipment: string;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface Booking {
  _id: string;
  equipment: Equipment | string;
  customer: User | string;
  startDate: string;
  endDate: string;
  quantity: number;
  phone: string;
  address: string;
  notes?: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
