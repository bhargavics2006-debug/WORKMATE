export type WorkerRole = 
  | 'General Labor'
  | 'Mason / Builder'
  | 'Carpenter'
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Driver'
  | 'Farm Hand / Harvester'
  | 'Machine Operator'
  | 'Helper'
  | 'Cook / Kitchen Staff'
  | 'Cleaner / Housekeeping'
  | 'Supervisor / Foreman'
  | 'Other';

export type WageType = 'daily' | 'hourly' | 'monthly';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: string;
  wageType: WageType;
  dailyRate: number; // base rate per day
  overtimeHourlyRate: number; // rate per hour of OT
  status: 'active' | 'inactive';
  joinedDate: string; // YYYY-MM-DD
  notes?: string;
  avatarColor?: string;
  photo?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  projectId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bloodGroup?: string;
  medicalNotes?: string;
}

export type AttendanceStatus = 'present' | 'half_day' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string; // typically `${workerId}_${date}`
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number; // e.g. 0, 1, 2, 2.5
  note?: string;
  calculatedWage: number; // auto-computed based on worker dailyRate + OT
  projectId?: string;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export type ExpenseCategory = 
  | 'Cement'
  | 'Materials'
  | 'Materials & Supplies'
  | 'Labour'
  | 'Wages'
  | 'Food'
  | 'Food & Meals'
  | 'Travel'
  | 'Transport & Fuel'
  | 'Equipment'
  | 'Tools & Equipment'
  | 'Fuel'
  | 'Utilities & Rent'
  | 'Emergency & Medical'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other';
  paidTo?: string;
  notes?: string;
  isWagePayout?: boolean;
  workerId?: string; // if linked to a wage payout
  projectId?: string;
  isMaterialPurchase?: boolean;
  materialId?: string;
  billId?: string;
  billAttachment?: string;
}

export interface WagePayout {
  id: string;
  workerId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other';
  notes?: string;
  periodDescription?: string; // e.g. "Week 1", "October 2026"
  projectId?: string;
}

export interface BudgetConfig {
  totalBudget: number; // Target budget (monthly or project)
  periodName: string; // e.g. "October 2026"
  warningThresholdPercent: number; // default 80%
  dangerThresholdPercent: number; // default 95%
  preventOverbudgetExpenses: boolean; // default true
  categoryLimits?: Partial<Record<ExpenseCategory, number>>;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  manager: string;
  status: 'active' | 'completed' | 'on_hold';
  budget: number;
  startDate: string;
  description?: string;
  progressPercent?: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Worker';
  phone: string;
  email?: string;
  avatarColor: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface SiteProgress {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  overallProgress: number; // 0 - 100
  todayWorkDescription: string;
  completedTasks: string[];
  pendingTasks: string[];
  photos: string[];
  status: 'completed' | 'in_progress' | 'pending';
  recordedBy: string;
  updatedAt?: string;
}

export interface DailyReport {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  workersCount: number;
  presentWorkersCount: number;
  workCompleted: string;
  materialsUsed: { materialName: string; quantity: number; unit: string }[];
  expensesTotal: number;
  issues?: string;
  safetyNotes?: string;
  photos: string[];
  progressPercentage: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; // 'group-general' | 'group-site-a' | 'group-site-b' | direct message id
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  attachmentName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  projectId?: string;
}

export type EmergencyType = 'Medical' | 'Accident' | 'Fire' | 'Security' | 'Other';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  contactName: string;
  contactPhone: string;
  triggeredBy: string;
  timestamp: string;
  location?: string;
  notes?: string;
  status: 'reported' | 'in_progress' | 'resolved';
}

export interface ScannedBill {
  id: string;
  billNumber: string;
  vendor: string;
  date: string;
  totalAmount: number;
  taxAmount?: number;
  category: ExpenseCategory;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other';
  notes?: string;
  imageDataUrl?: string;
  expenseId?: string;
  projectId?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number; // remaining stock
  openingStock: number;
  addedStock: number;
  usedStock: number;
  minStockLevel: number;
  purchasePrice: number; // price per unit
  supplier: string;
  purchaseDate: string;
  projectId?: string;
  notes?: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: 'add' | 'use' | 'transfer' | 'adjust';
  quantity: number;
  unit: string;
  date: string;
  performedBy: string;
  projectId?: string;
  notes?: string;
  expenseCreated?: boolean;
  expenseId?: string;
}

export type NotificationType =
  | 'low_stock'
  | 'out_of_stock'
  | 'budget_alert'
  | 'budget_exceeded'
  | 'wage_pending'
  | 'chat_message'
  | 'emergency'
  | 'expense_added'
  | 'bill_scanned'
  | 'material_activity'
  | 'daily_report'
  | 'attendance_reminder';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface AppSettings {
  currencySymbol: string; // '$', '₹', '€', '£', '₦', 'R', etc.
  sectorPreset: string; // 'construction' | 'agriculture' | 'manufacturing' | 'hospitality' | 'general'
  organizationName: string;
  language: string; // 'en' | 'hi' | 'es' | 'te' | 'ta' | 'ar' | 'fr'
  currentProjectId?: string; // 'all' or specific project id
  notificationsEnabled?: boolean;
  themePreference?: 'dark' | 'light';
  currentUser?: User;
  isAuthenticated?: boolean;
}
