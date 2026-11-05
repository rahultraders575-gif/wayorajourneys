export type TripType = 'ROUND_TRIP' | 'ONE_WAY' | 'AIRPORT';

export type ThemeMode = 'alternating' | 'black' | 'white';

export type PackageCategory = 'spiritual' | 'hill' | 'beach' | 'heritage';

export interface DayItinerary {
  dayNumber: number;
  title: string;
  description: string;
  highlights: string[];
  hotelNotes?: string;
}

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
  // Module 5 Enhancements
  itinerary?: DayItinerary[];
  terrainRestrictedVehicles?: string[];
  seasonality?: 'All Year' | 'Monsoon & Winter' | 'Summer Peak' | 'Festival Special';
  inclusionsList?: string[];
  exclusionsList?: string[];
}

export interface VehicleCompliance {
  rcExpiry: string;
  fitnessExpiry: string;
  insuranceExpiry: string;
  permitExpiry: string;
  pucExpiry: string;
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
  // Module 3 Enhancements
  plateNumber?: string;
  vehicleYear?: number | string;
  ownershipType?: 'Company Owned' | 'Chauffeur Attached' | 'Leased';
  compliance?: VehicleCompliance;
  inMaintenance?: boolean;
}

export type BookingStatus = 'New' | 'Confirmed' | 'Assigned' | 'En Route' | 'Completed' | 'Cancelled';

export interface RiderSavedAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Airport' | 'Other';
  label: string;
  address: string;
  city: string;
}

export interface FamilyPassengerProfile {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  pickupAddress: string;
  specialNotes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifyOnTripStart: boolean;
  notifyOnTripEnd: boolean;
}

export interface RiderPaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'corporate';
  title: string;
  subtitle: string;
  isDefault: boolean;
}

export interface RiderPreferences {
  acTemperature: 'Chilled (19°C)' | 'Comfort (22°C)' | 'Normal (25°C)';
  quietRideMode: boolean;
  preferredMusic: 'No Music' | 'Instrumental & Soft' | 'FM Radio';
  luggagePorter: boolean;
  infantSeat: boolean;
  petFriendly: boolean;
  gentleDriving: boolean;
  pushNotifications: boolean;
  whatsappUpdates: boolean;
  promoSms: boolean;
  twoFactorAuth: boolean;
  corporateDomain?: string;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  createdAt: string;
  // Rider Dashboard Enhancements
  walletBalance?: number;
  savedAddresses?: RiderSavedAddress[];
  familyProfiles?: FamilyPassengerProfile[];
  emergencyContacts?: EmergencyContact[];
  preferences?: RiderPreferences;
  savedPaymentMethods?: RiderPaymentMethod[];
}

export interface VehicleInspectionAudit {
  tireTreadCondition: boolean;
  acCoolingCheck: boolean;
  spareTireAvailable: boolean;
  interiorSanitized: boolean;
  waterBottlesStocked: boolean;
  lastAuditedAt?: string;
}

export interface CaptainExpenseEntry {
  id: string;
  bookingId?: string;
  category: 'State Border Tax' | 'Physical Toll' | 'Airport Parking' | 'Fuel Slip' | 'Emergency Repair';
  amount: number;
  receiptPhotoUrl?: string;
  notes?: string;
  status: 'Pending Dispatch Review' | 'Approved & Credited' | 'Rejected';
  timestamp: string;
}

export interface IncidentBreakdownReport {
  id: string;
  captainId: string;
  captainName: string;
  vehicleNumber: string;
  issueType: 'Flat Tire' | 'Engine Overheating' | 'Battery Drain' | 'Minor Collision' | 'Severe Route Blockage';
  locationDescription: string;
  locationCoords?: { lat: number; lng: number };
  photoUrl?: string;
  reliefVehicleRequested: boolean;
  status: 'Reported' | 'Relief Dispatched' | 'Resolved';
  reportedAt: string;
}

export interface SafetyEquipmentCheck {
  stepneyTire: boolean;        // Working spare tire (stepney)
  hydraulicJackKit: boolean;   // Mechanical/hydraulic jack & wheel spanner
  fireExtinguisher: boolean;   // Onboard certified fire extinguisher
  firstAidKit: boolean;        // Medical first-aid kit with antiseptic & bandages
  hazardTriangle: boolean;     // Emergency warning reflective hazard triangle
}

export interface CaptainBankAccountDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  payoutCycle: string;
  cancelledChequePhoto?: string;
  upiId?: string;
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
  dutyStatus: 'Available (Standby)' | 'En Route to Pickup' | 'On Trip' | 'Off Duty' | 'On Duty';
  drivingLicenseNumber: string;
  fastagBalance: number;
  todayEarnings: number;
  joinedYear: number;
  email?: string;

  // PILLAR 1: PERSONAL IDENTITY & BACKGROUND VERIFICATION
  badgeNumber?: string;
  licensePhoto?: string;
  licenseExpiry?: string;
  aadhaarNumber?: string;
  aadhaarDocPhoto?: string;
  aadhaarVerified?: boolean;
  panCardNumber?: string;
  panCardDocPhoto?: string;
  policeClearanceStatus?: 'Verified' | 'Pending' | 'Rejected';
  policeClearanceDocPhoto?: string;
  policeClearanceDate?: string;
  uniformPortraitPhoto?: string;

  // PILLAR 2: VEHICLE REGISTRATION & REGULATORY COMPLIANCE
  vehicleYear?: number | string;
  rcOwnerName?: string;
  rcDocumentPhoto?: string;
  rcExpiry?: string;
  insurancePolicyNumber?: string;
  insuranceDocPhoto?: string;
  insuranceExpiry?: string;
  fcNumber?: string;
  fcCertificatePhoto?: string;
  fcExpiry?: string;
  permitType?: 'All-India Tourist Permit (AITP)' | 'State Commercial Permit' | 'National Permit';
  permitNumber?: string;
  permitDocPhoto?: string;
  permitExpiry?: string;
  pucNumber?: string;
  pucDocPhoto?: string;
  pucExpiry?: string;
  fastagBarcodeId?: string;

  // PILLAR 3: VEHICLE QUALITY & SAFETY AUDIT (LIVE PHOTO INSPECTION)
  vehicleFrontPhoto?: string;
  vehicleRearPhoto?: string;
  vehicleLeftPhoto?: string;
  vehicleRightPhoto?: string;
  clusterPhoto?: string;
  currentOdometerReading?: number;
  clusterWarningsClear?: boolean; // No check engine or ABS warning lights
  vehicleInteriorPhoto?: string;
  bootSpacePhoto?: string;
  cabinCleanlinessVerified?: boolean;
  safetyEquipmentCheck?: SafetyEquipmentCheck;
  inspectionAudit?: VehicleInspectionAudit;

  // PILLAR 4: PAYOUT & OPERATIONAL CONFIGURATION
  bankAccountDetails?: CaptainBankAccountDetails;
  operatingZones?: string[]; // e.g. ['Airport Transfers', 'Outstation Round-Trips', 'Intercity Hourly Rentals']
  primaryCity?: string;
  preferredRoutes?: string[];

  // AUDIT & APPROVAL STATUS
  verificationStatus?: 'Verified' | 'Pending Verification';
  onboardingStatus?: 'Approved' | 'Pending Approval' | 'Under Review' | 'Suspended';
  rejectionReason?: string;
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
  // Module 1 & 3 Enhancements
  emergencyFlag?: boolean;
  pickupCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  startOdometerPhotoUrl?: string;
  endOdometerPhotoUrl?: string;
  startOtpVerified?: boolean;
  specialInstructions?: string[];
  riderPreferencesSummary?: string;
  cashCollected?: number;
  nightAllowanceCharges?: number;
  minimumDistanceBilled?: number;
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

// ==========================================
// ADMIN DASHBOARD ENTERPRISE EXTENSIONS
// ==========================================

// Module 1: Dispatch & Operations
export interface EmergencyAlert {
  id: string;
  bookingId: string;
  type: 'Route Deviation' | 'Delayed Check-In' | 'SOS Distress' | 'Vehicle Breakdown';
  customerName: string;
  customerPhone: string;
  driverName: string;
  driverPhone: string;
  carNumber: string;
  location: string;
  timestamp: string;
  status: 'Active' | 'Investigating' | 'Resolved';
  severity: 'critical' | 'high' | 'medium';
  notes?: string;
}

export interface FleetTelemetryVehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  city: string;
  lat: number;
  lng: number;
  speedKmH: number;
  status: 'active' | 'assigned' | 'idle' | 'maintenance' | 'sos';
  batteryOrFuelPercent: number;
  currentBookingId?: string;
  destination?: string;
}

// Module 2: Captain KYC & Settlements & Odometer
export interface OdometerAuditRecord {
  id: string;
  bookingId: string;
  captainName: string;
  carNumber: string;
  route: string;
  date: string;
  startKm: number;
  endKm: number;
  totalKmBilled: number;
  gpsDistanceKm: number;
  variancePercent: number;
  startPhotoUrl?: string;
  endPhotoUrl?: string;
  flagDiscrepancy: boolean;
  status: 'Verified' | 'Flagged' | 'Resolved';
  notes?: string;
}

export interface CaptainSettlementRecord {
  captainId: string;
  captainName: string;
  phone: string;
  vehicleNumber: string;
  completedTrips: number;
  grossFareCollected: number;
  platformCommission: number;
  nightAllowances: number;
  tollParkingReimbursement: number;
  tipsEarned: number;
  netPayoutDue: number;
  payoutStatus: 'Pending' | 'Paid' | 'Processing';
  lastPayoutDate?: string;
}

// Module 3: Fleet Maintenance Logs
export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  serviceType: 'Oil & Filter Change' | 'Tire Rotation & Alignment' | 'Brake Pad Replacement' | 'AC Overhaul' | 'General Inspection';
  serviceDate: string;
  odometerKm: number;
  cost: number;
  workshopName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  nextServiceKm: number;
}

// Module 4: Tariffs & Geo-Distance Engine
export interface BaseTariffRule {
  vehicleTier: string;
  modelExamples: string;
  baseFare: number;
  ratePerKm: number;
  minDailyKm: number;
  deadheadMultiplier: number;
  driverAllowancePerDay: number;
  nightAllowanceCharge: number;
}

export interface HourlyRentalSlot {
  id: string;
  title: string;
  hours: number;
  km: number;
  sedanRate: number;
  innovaRate: number;
  fortunerRate: number;
  extraKmRate: number;
  extraHourRate: number;
}

export interface SurchargeRule {
  id: string;
  name: string;
  type: 'Night Driving' | 'Airport Toll' | 'State Border Tax' | 'Festival Peak';
  fee: number;
  unit: 'fixed' | 'percent';
  isActive: boolean;
  description: string;
}

// Module 6: Billing & Invoices
export interface GSTTaxInvoice {
  invoiceNumber: string;
  bookingId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  pickupLocation: string;
  destination: string;
  sacCode: string;
  vehicleName: string;
  totalDistanceKm: number;
  baseFare: number;
  driverAllowance: number;
  tollAndParking: number;
  subTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  paymentStatus: 'Advance Paid' | 'Fully Paid' | 'Pending';
}

export interface PromoCoupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minBookingAmount: number;
  expiryDate: string;
  usageCount: number;
  maxUsageLimit: number;
  isActive: boolean;
}

// Module 7: RBAC & Audit Trail
export type AdminRole = 'Super Admin' | 'Fleet Dispatcher' | 'Support Staff' | 'Accounts & Finance';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: AdminRole;
  module: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}
