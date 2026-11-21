export type Role = "customer" | "owner" | "admin";

/** Shape returned by publicUser() on the server. */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  photoURL: string;
  phone: string;
  address: string;
  createdAt?: string;
  /** Only present on the admin user list (never on publicUser). */
  provider?: "password" | "google";
  /** Suspended accounts are rejected by verifyToken on every protected request. */
  banned?: boolean;
}

export type EquipmentStatus = "pending" | "approved" | "rejected";
export type RentalType = "Daily" | "Weekly" | "Monthly";

/** Shape of an equipment document as returned by the API. */
export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rentalType: RentalType;
  quantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  rentalTerms: string;
  status: EquipmentStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhoto: string;
  favoriteId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Review {
  _id: string;
  bookingId?: string;
  equipmentId?: string;
  equipmentName: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "expired";

/** Shape of a booking document as returned by the API. */
export interface Booking {
  _id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  days: number;
  rentalType: RentalType;
  rentalUnits: number;
  pricePerUnit: number;
  quantity: number;
  totalAmount: number;
  phone: string;
  address: string;
  notes: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  holdUntil?: string;
  stripeSessionId?: string;
  paidAt?: string;
  transactionId?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

/* ---------------- dashboard analytics ---------------- */

export interface AdminStats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenue: number;
  monthlyBookings: { month: string; bookings: number }[];
  usersByRole: { role: Role; count: number }[];
}

export interface OwnerStats {
  totalListed: number;
  completedRentals: number;
  totalEarnings: number;
  monthlyEarnings: { month: string; earnings: number }[];
}

export interface CustomerStats {
  totalRentals: number;
  activeRentals: number;
  completedRentals: number;
  favorites: number;
  totalSpent: number;
}

/* ---------------- query params for GET /api/equipment ---------------- */

export interface EquipmentQuery {
  search?: string;
  location?: string;
  category?: string;
  rentalType?: RentalType | "";
  available?: boolean;
  minPrice?: number | "";
  maxPrice?: number | "";
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
}
