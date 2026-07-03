
export enum Role {
  USER = 'USER',
  BORDER_OFFICER = 'BORDER_OFFICER',
  CITY_ADMIN = 'CITY_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum EntryStatus {
  PENDING_CITY = 'PENDING_CITY',
  RETURNED = 'RETURNED',
  PENDING_SUPER = 'PENDING_SUPER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type EntryType = 'PASSENGER' | 'DRIVER' | 'DRIVER_ID' | 'OFFICIAL_ID';

export interface AuditLogEntry {
  timestamp: string;
  actorName: string;
  role: Role;
  action: string;
  comments?: string;
}

export interface BlacklistEntry {
    id: string;
    fullName: string;
    passportNumber: string; // or ID number
    nationality: string;
    reason: string;
    addedBy: string;
    addedAt: string;
    photoUrl?: string;
    lastAttemptAt?: string; // New: Track when they tried to enter
    phoneNumber?: string;
    age?: number;
    maritalStatus?: string;
    listType?: 'BLACKLIST' | 'WATCHLIST';
}

export interface Incident {
  id: string;
  userId: string;
  reportedBy: string;
  type:
    | 'Suspicious Person'
    | 'Suspicious Vehicle'
    | 'Illegal Border Crossing'
    | 'Document Forgery'
    | 'Smuggling Activities'
    | 'Security Threat'
    | 'Vehicle Breakdown'
    | 'Medical Emergency'
    | 'Route Delay'
    | 'Other';
  description: string;
  location: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  status: 'REPORTED' | 'REVIEWING' | 'ESCALATED' | 'RESOLVED';
  photoUrl?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  location: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface VehicleInfo {
  type: string;
  registrationNumber: string;
  driverName?: string;
}

export interface GuarantorInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface Passenger {
  fullName: string;
  contactNumber: string;
  photoUrl: string;
  maritalStatus?: string;
  age?: number;
  placeOfBirth?: string;
  guarantor?: GuarantorInfo;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees
  lastUpdated: string;
  status: 'MOVING' | 'IDLE' | 'STOPPED';
  batteryLevel?: number;
  signalStrength?: 'WEAK' | 'GOOD' | 'STRONG';
}

export interface UserEntry {
  id: string;
  userId?: string; // Link to specific user account
  fullName: string; // Primary User or Driver Name
  contactNumber: string; // Primary Contact
  photoUrl: string; // Primary Photo or Driver Photo
  maritalStatus?: string;
  age?: number;
  placeOfBirth?: string;
  guarantor?: GuarantorInfo;
  
  // Vehicle Details
  vehicle: VehicleInfo;
  vehicleModel?: string; // New: Model of the vehicle
  vehicleOwner?: string; // New: Owner of the vehicle
  vehicleOwnership?: 'OWNER' | 'HIRED' | 'COMPANY'; // For Driver ID
  cargoType?: string; // New: Cargo details
  driverLicenseNumber?: string; // New: Driver License/ID
  gps?: GPSData; // New: GPS Tracking Data
  
  originCity: string;
  destinationCity: string;
  purpose: string;
  journeyDate?: string;
  
  // ID Card Specifics
  issueDate?: string;
  expiryDate?: string;
  
  // Official ID Specifics
  officialRole?: string; // e.g. Doctor, Police Officer, Minister
  department?: string; // e.g. Ministry of Health, Puntland Police Force
  badgeNumber?: string; // Official ID Number
  
  accompanyingPersons: string; // Comma separated summary
  passengers?: Passenger[]; // Detailed list of other travelers
  status: EntryStatus;
  entryType: EntryType; // New: Distinguish between Passenger and Driver entries
  
  adminComments?: string;
  auditHistory?: AuditLogEntry[]; // New: Track status changes
  submittedAt: string;
  updatedAt: string;
  tripStatus?: string;
  createdByOfficerId?: string;
  assignedCity?: string;
  permitId?: string;
  qrCode?: string;
  biometricFingerprint?: string;
  biometricFace?: string;
  securityClearance?: string;
}

export interface UserPreferences {
  emailAlerts: boolean;
  dailySummary: boolean;
  theme: 'LIGHT' | 'DARK';
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string; // Added for login
  passwordHash?: string; // Added for login
  phone?: string;
  photoUrl?: string; // Added for profile picture
  responsibility?: string;
  role: Role.CITY_ADMIN | Role.SUPER_ADMIN | Role.BORDER_OFFICER;
  assignedCity?: string; // Only for City Admin
  preferences?: UserPreferences;
  status?: 'ACTIVE' | 'INACTIVE'; // Added status
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // Simulated bcrypt
  phone: string;
  photoUrl?: string; // Added for profile picture
  city: string;
  role: Role.USER | Role.BORDER_OFFICER;
  responsibility?: string; // Role/Responsibility description
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  verificationCode?: string;
  verificationExpiresAt?: number;
  failedAttempts: number;
  createdByAdminId?: string; // Link to the admin who created this user
  preferences?: UserPreferences;
  isTransferred?: boolean; // New: Marks if user was transferred to current admin
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string; // For verification links
}

// --- Messaging System Types ---
export interface HumanMessage {
  id: string;
  senderId: string;
  receiverId: string; // 'ADMIN' for user->admin, or specific userId for admin->user
  senderName: string;
  senderRole: Role;
  content: string;
  timestamp: string;
  read: boolean;
  type?: 'text' | 'audio' | 'image' | 'document' | 'call' | 'radio';
  mediaUrl?: string;
  duration?: number;
  fileName?: string;
  fileSize?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

// Added Message for ChatContainer
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

// Added LoadingState for ChatContainer
export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}

// Added updateCurrentUserProfile
export interface StoreContextType {
  entries: UserEntry[];
  addEntry: (entry: Omit<UserEntry, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'auditHistory'>) => void;
  editEntry: (id: string, data: Partial<UserEntry>) => void;
  transferEntry: (id: string, city: string, comments?: string) => Promise<void>;
  updateEntryStatus: (id: string, status: EntryStatus, comments?: string) => void;
  deleteEntry: (id: string) => void;
  
  admins: AdminUser[];
  addAdmin: (admin: Omit<AdminUser, 'id'>) => void;
  updateAdmin: (id: string, data: Partial<AdminUser>) => void; // Added
  deleteAdmin: (id: string) => void;
  resetAdminPassword: (id: string, newPassword: string) => void;
  toggleAdminStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => void; // Added

  users: RegisteredUser[];
  currentUser: RegisteredUser | AdminUser | null;
  registerUser: (email: string, password: string, responsibility: string, creatorId?: string) => Promise<{success: boolean, message: string}>;
  updateUser: (id: string, data: Partial<RegisteredUser>) => void; // Added for editing users
  verifyUser: (email: string, code: string) => Promise<{success: boolean, message: string}>;
  loginUser: (email: string, password: string) => Promise<{success: boolean, user?: RegisteredUser | AdminUser, message?: string}>;
  logoutUser: () => void;
  deleteUser: (userId: string) => void;
  resendVerification: (email: string) => void;
  
  updateCurrentUserProfile: (data: Partial<AdminUser | RegisteredUser>) => void;
  changeCurrentUserPassword: (oldPassword: string, newPassword: string) => Promise<{success: boolean, message: string}>;

  notifications: Notification[];
  addNotification: (message: string, actionUrl?: string) => void;
  
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  
  systemLogo: string;

  // Blacklist Management
  blacklist: BlacklistEntry[];
  addToBlacklist: (entry: Omit<BlacklistEntry, 'id' | 'addedAt' | 'addedBy'>) => void;
  removeFromBlacklist: (id: string) => void;

  // Human Messaging
  humanMessages: HumanMessage[];
  sendHumanMessage: (content: string, receiverId?: string, type?: 'text' | 'audio' | 'image' | 'document' | 'call' | 'radio', mediaUrl?: string, duration?: number, fileName?: string, fileSize?: string) => void;
  markMessagesAsRead: (userId?: string) => void;

  // Incident Management
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => void;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;

  // Emergency System
  emergencyAlerts: EmergencyAlert[];
  triggerEmergency: () => void;
  resolveEmergency: (id: string) => void;

  broadcasts: { id: string; title: string; message: string; sentAt: string; sentByName: string }[];
  sendBroadcast: (title: string, message: string, targetRole?: string, targetCity?: string) => Promise<void>;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  dob: string;
  gender: string;
  guardianPhone: string;
  status: 'Active' | 'Inactive';
}

// --- Additional Types for Extended Dashboard Modules ---

export enum UserRole {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
    id: string;
    name: string;
    role: UserRole | Role;
    email?: string;
    [key: string]: any;
}

export interface FuelTransaction {
    id: string;
    date: string;
    operatorId: string;
    operatorName: string;
    customerName: string;
    vehicleId: string;
    fuelType: string;
    amount: number;
    cost: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface FuelStock {
    type: string;
    currentLevel: number;
    capacity: number;
    unit: string;
    status: 'OK' | 'LOW' | 'CRITICAL';
}

export interface SystemLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export interface Well {
    id: string;
    name: string;
    status: 'Active' | 'Maintenance' | 'Inactive';
    currentOutput: number;
    dailyCapacity: number;
    location: string;
    nextInspectionDate: string;
}

export interface Vehicle {
    id: string;
    status: 'In-Transit' | 'Available' | 'Maintenance';
    plate: string;
    brand: string;
}

export interface InventoryBatch {
    id: string;
    entryDate: string;
    fuelType: string;
    batchNumber: string;
    quantityLiters: number;
}

export interface Transaction {
    id: string;
    type: 'Income' | 'Expense';
    status: 'Approved' | 'Pending';
    amount: number;
    description: string;
    date: string;
}

export interface Staff {
    id: string;
    status: 'Active' | 'Inactive';
    monthlySalary: number;
    department: string;
    profilePhoto?: string;
    fullName: string;
    employeeId: string;
}

export interface Report {
    id: string;
    title: string;
    date: string;
    type: string;
}

export interface Trip {
    id: string;
    vehicleId: string;
    cargoType: string;
    driverId: string;
    progress: number;
    routeStart: string;
    routeEnd: string;
    eta: string;
}

export interface StorageTank {
    id: string;
    currentLevel: number;
    capacityLiters: number;
    name: string;
    fuelType: string;
}