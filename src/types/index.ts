export type TripType = 'ROUND_TRIP' | 'ONE_WAY' | 'AIRPORT';

export type ThemeMode = 'alternating' | 'black' | 'white';

export type PackageCategory = 'spiritual' | 'hill' | 'beach' | 'heritage';

export interface TourPackage {
  id: string;
  category: PackageCategory;
  categoryLabel: string;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  fromPrice: number;
  ratePerKm: number;
  estimatedDistanceKm: number;
  featured: boolean;
  imageUrl: string;
  highlights: string[];
  recommendedCar: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Hatchback' | 'Sedan' | 'Executive Sedan' | 'MUV / Family' | 'Premium SUV' | 'Luxury Coach';
  capacity: string;
  luggage: string;
  ratePerKm: number;
  driverAllowancePerDay: number;
  minimumKmPerDay: number;
  features: string[];
  imageUrl: string;
  popular: boolean;
}

export type BookingStatus = 'New' | 'Confirmed' | 'Assigned' | 'En Route' | 'Completed' | 'Cancelled';

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  createdAt: string;
}

export interface CaptainProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  vehicleModel: string;
  vehicleNumber: string;
  photoUrl: string;
  rating: number;
  totalTrips: number;
  dutyStatus: 'On Duty' | 'On Trip' | 'Off Duty';
  drivingLicenseNumber: string;
  fastagBalance: number;
  todayEarnings: number;
  joinedYear: number;
}

export interface Booking {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  destination: string;
  travelDate: string;
  travelTime: string;
  tripType: TripType;
  passengers: number;
  vehicleName: string;
  ratePerKm: number;
  advancePaymentType: '25%' | '100%';
  estimatedTotal: number;
  advancePaid: number;
  status: BookingStatus;
  assignedDriver?: string;
  assignedCarNumber?: string;
  startKm?: number;
  endKm?: number;
  tollCharges?: number;
  parkingCharges?: number;
  finalPaidAmount?: number;
  notes?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  readTime: string;
  category: string;
  publishedDate: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}

export interface CompanySettings {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  baseCity: string;
  startingKmRate: number;
  freeCancellationHours: number;
}
