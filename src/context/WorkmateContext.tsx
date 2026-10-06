import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Worker,
  AttendanceRecord,
  Expense,
  WagePayout,
  BudgetConfig,
  AppSettings,
  AttendanceStatus,
  ExpenseCategory,
  Project,
  User,
  ChatMessage,
  ChatRoom,
  EmergencyContact,
  EmergencyEvent,
  EmergencyType,
  Material,
  MaterialTransaction,
  ScannedBill,
  NotificationItem,
  SiteProgress,
  DailyReport,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_BUDGET,
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_EXPENSES,
  INITIAL_PAYOUTS,
  INITIAL_PROJECTS,
  INITIAL_USERS,
  CURRENT_USER,
  INITIAL_MATERIALS,
  INITIAL_MATERIAL_TRANSACTIONS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_EMERGENCY_EVENTS,
  INITIAL_SCANNED_BILLS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SITE_PROGRESS,
  INITIAL_DAILY_REPORTS,
  getTodayDateString,
} from '../utils/initialData';

export type AppTab =
  | 'dashboard'
  | 'workers'
  | 'attendance'
  | 'reports'
  | 'wages'
  | 'budget'
  | 'expenses'
  | 'materials'
  | 'scanner'
  | 'chat'
  | 'emergency'
  | 'notifications'
  | 'profile'
  | 'site_progress'
  | 'daily_report'
  | 'location_attendance'
  | 'settings'
  | 'voice';

export interface WorkerWageStats {
  workerId: string;
  workerName: string;
  role: string;
  dailyRate: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  overtimeHours: number;
  totalEarnedWage: number;
  totalPaidWage: number;
  balanceDue: number;
}

export interface AddExpenseResult {
  success: boolean;
  error?: string;
  shortfall?: number;
  remaining?: number;
}

interface WorkmateContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  // Data
  workers: Worker[];
  attendance: AttendanceRecord[];
  expenses: Expense[];
  payouts: WagePayout[];
  budget: BudgetConfig;
  settings: AppSettings;
  projects: Project[];
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  users: User[];
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  scannedBills: ScannedBill[];
  chatRooms: ChatRoom[];
  chatMessages: ChatMessage[];
  activeChatRoomId: string;
  setActiveChatRoomId: (id: string) => void;
  emergencyContacts: EmergencyContact[];
  emergencyEvents: EmergencyEvent[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  unreadChatCount: number;

  // Calculated financial metrics
  totalOperationalExpenses: number;
  totalWagePayouts: number;
  totalExpenses: number;
  remainingBudget: number;
  budgetUsedPercent: number;
  budgetStatus: 'healthy' | 'warning' | 'danger' | 'exceeded';
  
  // Materials metrics
  totalStockValue: number;
  lowStockMaterialsCount: number;
  outOfStockMaterialsCount: number;

  // Today's attendance metrics
  todayStats: {
    totalWorkers: number;
    present: number;
    halfDay: number;
    absent: number;
    late?: number;
    unmarked: number;
    todayWageLiability: number;
  };

  // Wages metrics
  allWorkersWageStats: WorkerWageStats[];
  totalWageLiabilityEarned: number;
  totalWageLiabilityPaid: number;
  totalWageLiabilityPending: number;
  laborCost: number;
  materialCost: number;
  operationalCost: number;

  // Site Progress & Daily Reports
  siteProgress: SiteProgress[];
  dailyReports: DailyReport[];
  addSiteProgress: (progress: Omit<SiteProgress, 'id'>) => SiteProgress;
  updateSiteProgress: (progress: SiteProgress) => void;
  deleteSiteProgress: (id: string) => void;
  addDailyReport: (report: Omit<DailyReport, 'id' | 'createdAt'>) => DailyReport;
  deleteDailyReport: (id: string) => void;

  // Authentication & UI state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  login: (emailOrPhone: string, role?: User['role'], name?: string) => void;
  logout: () => void;
  
  // Navigation & Voice Modals
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;

  // Actions - Core
  addWorker: (worker: Omit<Worker, 'id'>) => Worker;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  
  markAttendance: (
    workerId: string,
    date: string,
    status: AttendanceStatus,
    overtimeHours?: number,
    note?: string,
    checkInTime?: string,
    checkOutTime?: string,
    location?: { latitude?: number; longitude?: number; locationName?: string }
  ) => void;
  markAllAttendance: (date: string, status: AttendanceStatus) => void;
  getAttendanceForDate: (date: string) => Map<string, AttendanceRecord>;
  
  addExpense: (expense: Omit<Expense, 'id'>, forceOverride?: boolean) => AddExpenseResult;
  updateExpense: (expense: Expense) => AddExpenseResult;
  deleteExpense: (id: string) => void;
  
  recordWagePayout: (payout: Omit<WagePayout, 'id'>, forceOverride?: boolean) => AddExpenseResult;
  deleteWagePayout: (id: string) => void;
  
  updateBudget: (budget: Partial<BudgetConfig>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Actions - Projects
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (project: Project) => void;

  // Actions - Materials
  addMaterial: (material: Omit<Material, 'id'>, autoCreateExpense?: boolean) => { material: Material; expenseResult?: AddExpenseResult };
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  addMaterialStock: (materialId: string, qty: number, unitCost?: number, autoCreateExpense?: boolean, notes?: string) => AddExpenseResult;
  useMaterialStock: (materialId: string, qty: number, performedBy: string, notes?: string) => { success: boolean; error?: string };

  // Actions - Bill Scanner
  saveScannedBill: (bill: Omit<ScannedBill, 'id'>, autoAddToExpenses?: boolean) => { bill: ScannedBill; expenseResult?: AddExpenseResult };
  deleteScannedBill: (id: string) => void;

  // Actions - Team Chat
  sendChatMessage: (roomId: string, text: string, isEmergency?: boolean, attachmentName?: string) => void;
  clearChatRoom: (roomId: string) => void;
  startDirectChat: (targetUser: User) => string;

  // Actions - Emergency / SOS
  triggerEmergencySOS: (type: EmergencyType, contactName: string, contactPhone: string, notes?: string, location?: string) => EmergencyEvent;
  resolveEmergencyEvent: (id: string) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => EmergencyContact;
  updateEmergencyContact: (contact: EmergencyContact) => void;
  deleteEmergencyContact: (id: string) => void;

  // Actions - Notifications
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // Actions - Backup & Export
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  exportCSV: (type: 'attendance' | 'expenses' | 'wages' | 'workers' | 'materials' | 'emergency') => void;
}

const STORAGE_KEYS = {
  WORKERS: 'workmate_workers_v3',
  ATTENDANCE: 'workmate_attendance_v3',
  EXPENSES: 'workmate_expenses_v3',
  PAYOUTS: 'workmate_payouts_v3',
  BUDGET: 'workmate_budget_v3',
  SETTINGS: 'workmate_settings_v3',
  PROJECTS: 'workmate_projects_v3',
  MATERIALS: 'workmate_materials_v3',
  MATERIAL_TX: 'workmate_material_tx_v3',
  SCANNED_BILLS: 'workmate_scanned_bills_v3',
  CHAT_ROOMS: 'workmate_chat_rooms_v3',
  CHAT_MESSAGES: 'workmate_chat_msgs_v3',
  EMERGENCY_CONTACTS: 'workmate_em_contacts_v3',
  EMERGENCY_EVENTS: 'workmate_em_events_v3',
  NOTIFICATIONS: 'workmate_notifications_v3',
  SITE_PROGRESS: 'workmate_site_progress_v3',
  DAILY_REPORTS: 'workmate_daily_reports_v3',
};

const WorkmateContext = createContext<WorkmateContextType | undefined>(undefined);

export const WorkmateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentProjectId, setCurrentProjectId] = useState<string>('all');
  const [activeChatRoomId, setActiveChatRoomId] = useState<string>('room-general');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Load state from localStorage or initialize with defaults
  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKERS);
      return stored ? JSON.parse(stored) : INITIAL_WORKERS;
    } catch {
      return INITIAL_WORKERS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return stored ? JSON.parse(stored) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [payouts, setPayouts] = useState<WagePayout[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
      return stored ? JSON.parse(stored) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return stored ? JSON.parse(stored) : DEFAULT_BUDGET;
    } catch {
      return DEFAULT_BUDGET;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return stored ? JSON.parse(stored) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return stored ? JSON.parse(stored) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [materialTransactions, setMaterialTransactions] = useState<MaterialTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATERIAL_TX);
      return stored ? JSON.parse(stored) : INITIAL_MATERIAL_TRANSACTIONS;
    } catch {
      return INITIAL_MATERIAL_TRANSACTIONS;
    }
  });

  const [scannedBills, setScannedBills] = useState<ScannedBill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCANNED_BILLS);
      return stored ? JSON.parse(stored) : INITIAL_SCANNED_BILLS;
    } catch {
      return INITIAL_SCANNED_BILLS;
    }
  });

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
      return stored ? JSON.parse(stored) : INITIAL_CHAT_ROOMS;
    } catch {
      return INITIAL_CHAT_ROOMS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return stored ? JSON.parse(stored) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      return stored ? JSON.parse(stored) : INITIAL_EMERGENCY_CONTACTS;
    } catch {
      return INITIAL_EMERGENCY_CONTACTS;
    }
  });

  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS);
      return stored ? JSON.parse(stored) : INITIAL_EMERGENCY_EVENTS;
    } catch {
      return INITIAL_EMERGENCY_EVENTS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [siteProgress, setSiteProgress] = useState<SiteProgress[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SITE_PROGRESS);
      return stored ? JSON.parse(stored) : INITIAL_SITE_PROGRESS;
    } catch {
      return INITIAL_SITE_PROGRESS;
    }
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS);
      return stored ? JSON.parse(stored) : INITIAL_DAILY_REPORTS;
    } catch {
      return INITIAL_DAILY_REPORTS;
    }
  });

  // LocalStorage Persistence
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SITE_PROGRESS, JSON.stringify(siteProgress)); } catch {}
  }, [siteProgress]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.DAILY_REPORTS, JSON.stringify(dailyReports)); } catch {}
  }, [dailyReports]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers)); } catch {}
  }, [workers]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance)); } catch {}
  }, [attendance]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); } catch {}
  }, [expenses]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts)); } catch {}
  }, [payouts]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget)); } catch {}
  }, [budget]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects)); } catch {}
  }, [projects]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials)); } catch {}
  }, [materials]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.MATERIAL_TX, JSON.stringify(materialTransactions)); } catch {}
  }, [materialTransactions]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SCANNED_BILLS, JSON.stringify(scannedBills)); } catch {}
  }, [scannedBills]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(chatRooms)); } catch {}
  }, [chatRooms]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages)); } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(emergencyContacts)); } catch {}
  }, [emergencyContacts]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(emergencyEvents)); } catch {}
  }, [emergencyEvents]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  // Financial Calculations:
  // Expenses contains operational expenses + material purchase expenses.
  // Payouts contains wage payments.
  // No double counting!
  const totalOperationalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  const totalWagePayouts = useMemo(() => {
    return payouts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [payouts]);

  const totalExpenses = useMemo(() => {
    return totalOperationalExpenses + totalWagePayouts;
  }, [totalOperationalExpenses, totalWagePayouts]);

  const remainingBudget = useMemo(() => {
    return budget.totalBudget - totalExpenses;
  }, [budget.totalBudget, totalExpenses]);

  const budgetUsedPercent = useMemo(() => {
    if (!budget.totalBudget || budget.totalBudget <= 0) return 0;
    return (totalExpenses / budget.totalBudget) * 100;
  }, [totalExpenses, budget.totalBudget]);

  const budgetStatus = useMemo<'healthy' | 'warning' | 'danger' | 'exceeded'>(() => {
    if (totalExpenses > budget.totalBudget) return 'exceeded';
    if (budgetUsedPercent >= (budget.dangerThresholdPercent || 95)) return 'danger';
    if (budgetUsedPercent >= (budget.warningThresholdPercent || 80)) return 'warning';
    return 'healthy';
  }, [totalExpenses, budget.totalBudget, budgetUsedPercent, budget.dangerThresholdPercent, budget.warningThresholdPercent]);

  // Materials Metrics
  const totalStockValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + (m.quantity * (m.purchasePrice || 0)), 0);
  }, [materials]);

  const lowStockMaterialsCount = useMemo(() => {
    return materials.filter(m => m.quantity > 0 && m.quantity <= m.minStockLevel).length;
  }, [materials]);

  const outOfStockMaterialsCount = useMemo(() => {
    return materials.filter(m => m.quantity <= 0).length;
  }, [materials]);

  // Notification & Chat Badges
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const unreadChatCount = useMemo(() => {
    return chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  }, [chatRooms]);

  // Attendance lookup for quick date queries
  const getAttendanceForDate = (date: string) => {
    const map = new Map<string, AttendanceRecord>();
    attendance.forEach(rec => {
      if (rec.date === date) {
        map.set(rec.workerId, rec);
      }
    });
    return map;
  };

  // Metrics for selectedDate
  const todayStats = useMemo(() => {
    const activeWorkers = workers.filter(w => w.status === 'active');
    const dayRecords = attendance.filter(a => a.date === selectedDate);
    
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let late = 0;
    let todayWageLiability = 0;

    dayRecords.forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'half_day') halfDay++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') { late++; present++; }
      todayWageLiability += r.calculatedWage || 0;
    });

    const recordedWorkerIds = new Set(dayRecords.map(r => r.workerId));
    const unmarked = activeWorkers.filter(w => !recordedWorkerIds.has(w.id)).length;

    return {
      totalWorkers: activeWorkers.length,
      present,
      halfDay,
      absent,
      late,
      unmarked,
      todayWageLiability,
    };
  }, [workers, attendance, selectedDate]);

  // Worker wage statistics calculation
  const allWorkersWageStats = useMemo<WorkerWageStats[]>(() => {
    return workers.map(worker => {
      const workerAttendance = attendance.filter(a => a.workerId === worker.id);
      let presentDays = 0;
      let halfDays = 0;
      let absentDays = 0;
      let overtimeHours = 0;
      let totalEarnedWage = 0;

      workerAttendance.forEach(a => {
        if (a.status === 'present' || a.status === 'late') {
          presentDays++;
          totalEarnedWage += a.calculatedWage;
        } else if (a.status === 'half_day') {
          halfDays++;
          totalEarnedWage += a.calculatedWage;
        } else if (a.status === 'absent') {
          absentDays++;
        }
        overtimeHours += a.overtimeHours || 0;
      });

      const workerPayouts = payouts.filter(p => p.workerId === worker.id);
      const totalPaidWage = workerPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
      const balanceDue = Math.max(0, totalEarnedWage - totalPaidWage);

      return {
        workerId: worker.id,
        workerName: worker.name,
        role: worker.role,
        dailyRate: worker.dailyRate,
        presentDays,
        halfDays,
        absentDays,
        overtimeHours,
        totalEarnedWage,
        totalPaidWage,
        balanceDue,
      };
    });
  }, [workers, attendance, payouts]);

  const totalWageLiabilityEarned = useMemo(() => {
    return allWorkersWageStats.reduce((sum, w) => sum + w.totalEarnedWage, 0);
  }, [allWorkersWageStats]);

  const totalWageLiabilityPaid = useMemo(() => {
    return allWorkersWageStats.reduce((sum, w) => sum + w.totalPaidWage, 0);
  }, [allWorkersWageStats]);

  const totalWageLiabilityPending = useMemo(() => {
    return allWorkersWageStats.reduce((sum, w) => sum + w.balanceDue, 0);
  }, [allWorkersWageStats]);

  const laborCost = useMemo(() => {
    return totalWagePayouts;
  }, [totalWagePayouts]);

  const materialCost = useMemo(() => {
    return expenses
      .filter(e => e.category === 'Materials' || e.category === 'Materials & Supplies' || e.category === 'Cement' || e.isMaterialPurchase)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  const operationalCost = useMemo(() => {
    return expenses
      .filter(e => !(e.category === 'Materials' || e.category === 'Materials & Supplies' || e.category === 'Cement' || e.isMaterialPurchase))
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  // Actions - Core
  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    const avatarColors = [
      'bg-amber-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-purple-600',
      'bg-rose-600',
      'bg-cyan-600',
      'bg-indigo-600',
      'bg-teal-600',
    ];
    const newWorker: Worker = {
      ...workerData,
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      avatarColor: workerData.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };
    setWorkers(prev => [...prev, newWorker]);
    return newWorker;
  };

  const updateWorker = (updated: Worker) => {
    setWorkers(prev => prev.map(w => (w.id === updated.id ? updated : w)));
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const calculateWorkerWageForDay = (worker: Worker, status: AttendanceStatus, otHours: number = 0): number => {
    if (status === 'absent') return 0;
    const base = status === 'half_day' ? worker.dailyRate * 0.5 : worker.dailyRate;
    const otWage = (otHours || 0) * (worker.overtimeHourlyRate || 0);
    return Math.round((base + otWage) * 100) / 100;
  };

  const markAttendance = (
    workerId: string,
    date: string,
    status: AttendanceStatus,
    overtimeHours: number = 0,
    note?: string,
    checkInTime?: string,
    checkOutTime?: string,
    location?: { latitude?: number; longitude?: number; locationName?: string }
  ) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    const calculatedWage = calculateWorkerWageForDay(worker, status, overtimeHours);
    const key = `${workerId}_${date}`;

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.workerId === workerId && a.date === date));
      const record: AttendanceRecord = {
        id: key,
        workerId,
        date,
        status,
        overtimeHours,
        note: note || '',
        calculatedWage,
        projectId: worker.projectId,
        checkInTime: checkInTime || (status !== 'absent' ? '08:30' : undefined),
        checkOutTime: checkOutTime || (status !== 'absent' ? '17:30' : undefined),
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationName: location?.locationName,
      };
      return [...filtered, record];
    });
  };

  const markAllAttendance = (date: string, status: AttendanceStatus) => {
    const activeWorkers = workers.filter(w => w.status === 'active');
    setAttendance(prev => {
      const otherRecords = prev.filter(a => a.date !== date);
      const newRecords = activeWorkers.map(w => ({
        id: `${w.id}_${date}`,
        workerId: w.id,
        date,
        status,
        overtimeHours: 0,
        note: `Bulk marked as ${status}`,
        calculatedWage: calculateWorkerWageForDay(w, status, 0),
        projectId: w.projectId,
      }));
      return [...otherRecords, ...newRecords];
    });
  };

  // Add Expense with Budget Guard
  const addExpense = (
    expenseData: Omit<Expense, 'id'>,
    forceOverride: boolean = false
  ): AddExpenseResult => {
    const amount = Number(expenseData.amount) || 0;

    // Budget Guard: Prevent expense if it exceeds remaining budget
    if (budget.preventOverbudgetExpenses && !forceOverride) {
      if (amount > remainingBudget) {
        const shortfall = amount - remainingBudget;
        return {
          success: false,
          error: `Expense of ${settings.currencySymbol}${amount.toLocaleString()} exceeds your remaining budget of ${settings.currencySymbol}${remainingBudget.toLocaleString()} by ${settings.currencySymbol}${shortfall.toLocaleString()}.`,
          shortfall,
          remaining: remainingBudget,
        };
      }
    }

    const newExpense: Expense = {
      ...expenseData,
      amount,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Check budget alert notification
    const newTotal = totalExpenses + amount;
    const newUsedPct = (newTotal / (budget.totalBudget || 1)) * 100;
    if (newUsedPct >= (budget.warningThresholdPercent || 80)) {
      addNotification({
        type: newUsedPct >= 100 ? 'budget_exceeded' : 'budget_alert',
        title: newUsedPct >= 100 ? 'Budget Limit Exceeded' : 'Budget Warning Alert',
        message: `Spending reached ${Math.round(newUsedPct)}% of total budget limit.`,
        linkTab: 'budget',
      });
    }

    return { success: true };
  };

  const updateExpense = (updated: Expense): AddExpenseResult => {
    const existing = expenses.find(e => e.id === updated.id);
    const delta = (updated.amount || 0) - (existing?.amount || 0);

    if (budget.preventOverbudgetExpenses && delta > remainingBudget) {
      const shortfall = delta - remainingBudget;
      return {
        success: false,
        error: `Updating this expense exceeds remaining budget by ${settings.currencySymbol}${shortfall.toLocaleString()}.`,
        shortfall,
        remaining: remainingBudget,
      };
    }

    setExpenses(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    return { success: true };
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Record Wage Payout with Budget Guard
  const recordWagePayout = (
    payoutData: Omit<WagePayout, 'id'>,
    forceOverride: boolean = false
  ): AddExpenseResult => {
    const amount = Number(payoutData.amount) || 0;

    if (budget.preventOverbudgetExpenses && !forceOverride) {
      if (amount > remainingBudget) {
        const shortfall = amount - remainingBudget;
        return {
          success: false,
          error: `Wage payout of ${settings.currencySymbol}${amount.toLocaleString()} exceeds remaining budget (${settings.currencySymbol}${remainingBudget.toLocaleString()}) by ${settings.currencySymbol}${shortfall.toLocaleString()}.`,
          shortfall,
          remaining: remainingBudget,
        };
      }
    }

    const newPayout: WagePayout = {
      ...payoutData,
      amount,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    setPayouts(prev => [newPayout, ...prev]);
    return { success: true };
  };

  const deleteWagePayout = (id: string) => {
    setPayouts(prev => prev.filter(p => p.id !== id));
  };

  const updateBudget = (updates: Partial<BudgetConfig>) => {
    setBudget(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Project Actions
  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setProjects(prev => [...prev, newProj]);
    return newProj;
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  // Material Management Actions
  const addMaterial = (materialData: Omit<Material, 'id'>, autoCreateExpense: boolean = true) => {
    const newMat: Material = {
      ...materialData,
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      quantity: materialData.openingStock + materialData.addedStock - materialData.usedStock,
    };

    let expenseRes: AddExpenseResult | undefined;
    const purchaseCost = (materialData.addedStock > 0 ? materialData.addedStock : materialData.openingStock) * (materialData.purchasePrice || 0);

    if (autoCreateExpense && purchaseCost > 0) {
      expenseRes = addExpense({
        title: `Material Purchase: ${newMat.name} (${newMat.addedStock || newMat.openingStock} ${newMat.unit})`,
        amount: purchaseCost,
        category: 'Materials & Supplies',
        date: materialData.purchaseDate || getTodayDateString(),
        paymentMethod: 'Bank Transfer',
        paidTo: materialData.supplier,
        notes: `Auto-recorded from Materials inventory. Rate: ${settings.currencySymbol}${materialData.purchasePrice}/${materialData.unit}`,
        projectId: materialData.projectId,
        isMaterialPurchase: true,
        materialId: newMat.id,
      });

      if (!expenseRes.success) {
        return { material: newMat, expenseResult: expenseRes };
      }
    }

    setMaterials(prev => [...prev, newMat]);

    // Record transaction
    const newTx: MaterialTransaction = {
      id: `m-tx-${Date.now()}`,
      materialId: newMat.id,
      materialName: newMat.name,
      type: 'add',
      quantity: newMat.addedStock || newMat.openingStock,
      unit: newMat.unit,
      date: newMat.purchaseDate || getTodayDateString(),
      performedBy: settings.currentUser?.name || 'Admin',
      projectId: newMat.projectId,
      notes: `Initial stock added from ${newMat.supplier}`,
      expenseCreated: autoCreateExpense && purchaseCost > 0,
    };
    setMaterialTransactions(prev => [newTx, ...prev]);

    return { material: newMat, expenseResult: expenseRes };
  };

  const updateMaterial = (updated: Material) => {
    const finalMat = {
      ...updated,
      quantity: Math.max(0, updated.openingStock + updated.addedStock - updated.usedStock),
    };
    setMaterials(prev => prev.map(m => (m.id === updated.id ? finalMat : m)));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addMaterialStock = (
    materialId: string,
    qty: number,
    unitCost?: number,
    autoCreateExpense: boolean = true,
    notes?: string
  ): AddExpenseResult => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return { success: false, error: 'Material not found.' };

    const effectivePrice = unitCost !== undefined ? unitCost : mat.purchasePrice;
    const totalCost = qty * effectivePrice;
    let expenseId: string | undefined;

    if (autoCreateExpense && totalCost > 0) {
      const expRes = addExpense({
        title: `Restocked Material: ${mat.name} (+${qty} ${mat.unit})`,
        amount: totalCost,
        category: 'Materials & Supplies',
        date: getTodayDateString(),
        paymentMethod: 'Bank Transfer',
        paidTo: mat.supplier,
        notes: notes || `Restocked ${qty} ${mat.unit} @ ${settings.currencySymbol}${effectivePrice}/${mat.unit}`,
        projectId: mat.projectId,
        isMaterialPurchase: true,
        materialId: mat.id,
      });

      if (!expRes.success) {
        return expRes;
      }
    }

    setMaterials(prev =>
      prev.map(m => {
        if (m.id === materialId) {
          const newAdded = m.addedStock + qty;
          const newQty = m.openingStock + newAdded - m.usedStock;
          return { ...m, addedStock: newAdded, quantity: newQty };
        }
        return m;
      })
    );

    const tx: MaterialTransaction = {
      id: `m-tx-${Date.now()}`,
      materialId: mat.id,
      materialName: mat.name,
      type: 'add',
      quantity: qty,
      unit: mat.unit,
      date: getTodayDateString(),
      performedBy: settings.currentUser?.name || 'Site Manager',
      projectId: mat.projectId,
      notes: notes || 'Stock replenishment',
      expenseCreated: autoCreateExpense && totalCost > 0,
    };
    setMaterialTransactions(prev => [tx, ...prev]);

    return { success: true };
  };

  const useMaterialStock = (
    materialId: string,
    qty: number,
    performedBy: string,
    notes?: string
  ) => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return { success: false, error: 'Material not found.' };

    if (qty > mat.quantity) {
      return {
        success: false,
        error: `Insufficient stock! Only ${mat.quantity} ${mat.unit} available in inventory.`,
      };
    }

    const newUsed = mat.usedStock + qty;
    const newQty = mat.openingStock + mat.addedStock - newUsed;

    setMaterials(prev =>
      prev.map(m => (m.id === materialId ? { ...m, usedStock: newUsed, quantity: newQty } : m))
    );

    const tx: MaterialTransaction = {
      id: `m-tx-${Date.now()}`,
      materialId: mat.id,
      materialName: mat.name,
      type: 'use',
      quantity: qty,
      unit: mat.unit,
      date: getTodayDateString(),
      performedBy,
      projectId: mat.projectId,
      notes: notes || 'Material issued for site work',
    };
    setMaterialTransactions(prev => [tx, ...prev]);

    // Check low stock triggers
    if (newQty <= 0) {
      addNotification({
        type: 'out_of_stock',
        title: `Out of Stock: ${mat.name}`,
        message: `Inventory depleted to 0 ${mat.unit}. Immediate re-order required.`,
        linkTab: 'materials',
      });
    } else if (newQty <= mat.minStockLevel) {
      addNotification({
        type: 'low_stock',
        title: `Low Stock Alert: ${mat.name}`,
        message: `${newQty} ${mat.unit} remaining (minimum threshold: ${mat.minStockLevel}).`,
        linkTab: 'materials',
      });
    }

    return { success: true };
  };

  // Bill Scanner Actions
  const saveScannedBill = (billData: Omit<ScannedBill, 'id'>, autoAddToExpenses: boolean = true) => {
    const newBillId = `bill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let expenseRes: AddExpenseResult | undefined;

    if (autoAddToExpenses && billData.totalAmount > 0) {
      expenseRes = addExpense({
        title: `Scanned Bill #${billData.billNumber} (${billData.vendor})`,
        amount: billData.totalAmount,
        category: billData.category,
        date: billData.date || getTodayDateString(),
        paymentMethod: billData.paymentMethod,
        paidTo: billData.vendor,
        notes: billData.notes || `Scanned Invoice #${billData.billNumber}`,
        projectId: billData.projectId,
        billId: newBillId,
      });

      if (!expenseRes.success) {
        const newBill: ScannedBill = { ...billData, id: newBillId };
        return { bill: newBill, expenseResult: expenseRes };
      }
    }

    const newBill: ScannedBill = {
      ...billData,
      id: newBillId,
    };
    setScannedBills(prev => [newBill, ...prev]);

    addNotification({
      type: 'bill_scanned',
      title: `Invoice Scanned: #${newBill.billNumber}`,
      message: `Verified and saved ${settings.currencySymbol}${newBill.totalAmount.toLocaleString()} from ${newBill.vendor}.`,
      linkTab: 'expenses',
    });

    return { bill: newBill, expenseResult: expenseRes };
  };

  const deleteScannedBill = (id: string) => {
    setScannedBills(prev => prev.filter(b => b.id !== id));
  };

  // Chat Actions
  const sendChatMessage = (
    roomId: string,
    text: string,
    isEmergency: boolean = false,
    attachmentName?: string
  ) => {
    if (!text.trim() && !attachmentName) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      roomId,
      senderId: settings.currentUser?.id || 'usr-admin',
      senderName: settings.currentUser?.name || 'Alex Morgan',
      senderRole: settings.currentUser?.role || 'Admin',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isEmergency,
      attachmentName,
    };

    setChatMessages(prev => [...prev, newMsg]);

    setChatRooms(prev =>
      prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            lastMessage: isEmergency ? `🚨 EMERGENCY: ${text}` : text,
            lastMessageTime: 'Just now',
          };
        }
        return r;
      })
    );

    if (isEmergency) {
      addNotification({
        type: 'emergency',
        title: 'Emergency Alert in Chat',
        message: text,
        linkTab: 'chat',
      });
    }
  };

  const clearChatRoom = (roomId: string) => {
    setChatMessages(prev => prev.filter(m => m.roomId !== roomId));
    setChatRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, lastMessage: '', lastMessageTime: '' } : r))
    );
  };

  const startDirectChat = (targetUser: User): string => {
    const myId = settings.currentUser?.id || 'usr-admin';
    const existingRoom = chatRooms.find(
      r => r.type === 'direct' && r.participantIds.includes(targetUser.id)
    );
    if (existingRoom) {
      setActiveChatRoomId(existingRoom.id);
      return existingRoom.id;
    }

    const newRoomId = `dm-${targetUser.id}`;
    const newRoom: ChatRoom = {
      id: newRoomId,
      name: `${targetUser.name} (${targetUser.role})`,
      type: 'direct',
      participantIds: [myId, targetUser.id],
      lastMessage: 'Direct chat conversation started',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };

    setChatRooms(prev => [newRoom, ...prev]);
    setActiveChatRoomId(newRoomId);
    return newRoomId;
  };

  // Emergency / SOS Actions
  const triggerEmergencySOS = (
    type: EmergencyType,
    contactName: string,
    contactPhone: string,
    notes?: string,
    location?: string
  ) => {
    const newEvent: EmergencyEvent = {
      id: `em-${Date.now()}`,
      type,
      contactName,
      contactPhone,
      triggeredBy: settings.currentUser?.name || 'On-site Supervisor',
      timestamp: new Date().toISOString(),
      location: location || 'Current Active Site',
      notes,
      status: 'reported',
    };

    setEmergencyEvents(prev => [newEvent, ...prev]);

    // Send high-priority alert into General Team Chat
    sendChatMessage('room-general', `🚨 SOS BROADCAST: ${type} incident reported! Designated contact: ${contactName} (${contactPhone}). Location: ${location || 'Site'}.`, true);

    // Push notification
    addNotification({
      type: 'emergency',
      title: `🚨 EMERGENCY ALERT: ${type}`,
      message: `SOS reported by ${newEvent.triggeredBy}. Contact: ${contactName} (${contactPhone}).`,
      linkTab: 'emergency',
    });

    return newEvent;
  };

  const resolveEmergencyEvent = (id: string) => {
    setEmergencyEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'resolved' } : e))
    );
  };

  const addEmergencyContact = (contactData: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contactData,
      id: `ec-${Date.now()}`,
    };
    setEmergencyContacts(prev => [...prev, newContact]);
    return newContact;
  };

  const updateEmergencyContact = (updated: EmergencyContact) => {
    setEmergencyContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  // Site Progress Actions
  const addSiteProgress = (progressData: Omit<SiteProgress, 'id'>): SiteProgress => {
    const newProgress: SiteProgress = {
      ...progressData,
      id: `sp-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setSiteProgress(prev => [newProgress, ...prev]);
    addNotification({
      type: 'daily_report',
      title: `Site Progress Logged: ${newProgress.projectName}`,
      message: `${newProgress.overallProgress}% complete: ${newProgress.todayWorkDescription}`,
      linkTab: 'site_progress',
    });
    return newProgress;
  };

  const updateSiteProgress = (updated: SiteProgress) => {
    setSiteProgress(prev => prev.map(p => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p)));
  };

  const deleteSiteProgress = (id: string) => {
    setSiteProgress(prev => prev.filter(p => p.id !== id));
  };

  // Daily Report Actions
  const addDailyReport = (reportData: Omit<DailyReport, 'id' | 'createdAt'>): DailyReport => {
    const newReport: DailyReport = {
      ...reportData,
      id: `dr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDailyReports(prev => [newReport, ...prev]);
    addNotification({
      type: 'daily_report',
      title: `Daily Site Report: ${newReport.projectName}`,
      message: `${newReport.presentWorkersCount}/${newReport.workersCount} workers present. Work logged.`,
      linkTab: 'daily_report',
    });
    return newReport;
  };

  const deleteDailyReport = (id: string) => {
    setDailyReports(prev => prev.filter(r => r.id !== id));
  };

  // Authentication Actions
  const login = (emailOrPhone: string, role: User['role'] = 'Admin', name?: string) => {
    const matched = INITIAL_USERS.find(u => u.phone === emailOrPhone || u.email === emailOrPhone || u.role.toLowerCase() === role.toLowerCase());
    const authUser: User = matched || {
      id: `usr-${Date.now()}`,
      name: name || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Site Supervisor'),
      role: role,
      phone: emailOrPhone,
      email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
      avatarColor: 'bg-blue-600',
      isOnline: true,
    };
    updateSettings({ currentUser: authUser, isAuthenticated: true });
    setIsAuthModalOpen(false);
    addNotification({
      type: 'chat_message',
      title: `Welcome back, ${authUser.name}`,
      message: `Signed in as ${authUser.role} on ${settings.organizationName}.`,
    });
  };

  const logout = () => {
    updateSettings({ isAuthenticated: false });
    setIsAuthModalOpen(true);
  };

  // Notification Actions
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newItem, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setWorkers(INITIAL_WORKERS);
    setAttendance(INITIAL_ATTENDANCE);
    setExpenses(INITIAL_EXPENSES);
    setPayouts(INITIAL_PAYOUTS);
    setBudget(DEFAULT_BUDGET);
    setSettings(DEFAULT_SETTINGS);
    setProjects(INITIAL_PROJECTS);
    setMaterials(INITIAL_MATERIALS);
    setMaterialTransactions(INITIAL_MATERIAL_TRANSACTIONS);
    setScannedBills(INITIAL_SCANNED_BILLS);
    setChatRooms(INITIAL_CHAT_ROOMS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
    setEmergencyEvents(INITIAL_EMERGENCY_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSiteProgress(INITIAL_SITE_PROGRESS);
    setDailyReports(INITIAL_DAILY_REPORTS);
  };

  const clearAllData = () => {
    setWorkers([]);
    setAttendance([]);
    setExpenses([]);
    setPayouts([]);
    setMaterials([]);
    setMaterialTransactions([]);
    setScannedBills([]);
    setEmergencyEvents([]);
    setChatMessages([]);
    setSiteProgress([]);
    setDailyReports([]);
    setBudget({
      totalBudget: 5000,
      periodName: 'New Period',
      warningThresholdPercent: 80,
      dangerThresholdPercent: 95,
      preventOverbudgetExpenses: true,
    });
  };

  const exportDataJSON = () => {
    const dump = {
      exportedAt: new Date().toISOString(),
      appName: 'WORKMATE – Smart Workforce & Site Management',
      version: '3.5',
      settings,
      budget,
      projects,
      workers,
      attendance,
      expenses,
      payouts,
      materials,
      materialTransactions,
      scannedBills,
      emergencyContacts,
      emergencyEvents,
      chatRooms,
      chatMessages,
      notifications,
      siteProgress,
      dailyReports,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.workers)) {
        return { success: false, error: 'Invalid WORKMATE backup file format.' };
      }
      if (data.workers) setWorkers(data.workers);
      if (data.attendance) setAttendance(data.attendance);
      if (data.expenses) setExpenses(data.expenses);
      if (data.payouts) setPayouts(data.payouts);
      if (data.budget) setBudget(data.budget);
      if (data.settings) setSettings(data.settings);
      if (data.projects) setProjects(data.projects);
      if (data.materials) setMaterials(data.materials);
      if (data.materialTransactions) setMaterialTransactions(data.materialTransactions);
      if (data.scannedBills) setScannedBills(data.scannedBills);
      if (data.emergencyContacts) setEmergencyContacts(data.emergencyContacts);
      if (data.emergencyEvents) setEmergencyEvents(data.emergencyEvents);
      if (data.chatRooms) setChatRooms(data.chatRooms);
      if (data.chatMessages) setChatMessages(data.chatMessages);
      if (data.notifications) setNotifications(data.notifications);
      if (data.siteProgress) setSiteProgress(data.siteProgress);
      if (data.dailyReports) setDailyReports(data.dailyReports);
      return { success: true };
    } catch {
      return { success: false, error: 'Malformed JSON data provided.' };
    }
  };

  const exportCSV = (type: 'attendance' | 'expenses' | 'wages' | 'workers' | 'materials' | 'emergency') => {
    let csvContent = '';
    const dateStamp = getTodayDateString();

    if (type === 'workers') {
      csvContent = 'ID,Name,Phone,Role,WageType,DailyRate,OvertimeRate,Status,JoinedDate,Project\n';
      workers.forEach(w => {
        csvContent += `"${w.id}","${w.name}","${w.phone}","${w.role}","${w.wageType}",${w.dailyRate},${w.overtimeHourlyRate},"${w.status}","${w.joinedDate}","${w.projectId || ''}"\n`;
      });
    } else if (type === 'attendance') {
      csvContent = 'Date,WorkerID,WorkerName,Status,OvertimeHours,CalculatedWage,Note,Project\n';
      attendance.forEach(a => {
        const w = workers.find(work => work.id === a.workerId);
        csvContent += `"${a.date}","${a.workerId}","${w?.name || ''}","${a.status}",${a.overtimeHours},${a.calculatedWage},"${a.note || ''}","${a.projectId || ''}"\n`;
      });
    } else if (type === 'expenses') {
      csvContent = 'Date,Title,Category,Amount,PaymentMethod,PaidTo,Notes,Project\n';
      expenses.forEach(e => {
        csvContent += `"${e.date}","${e.title}","${e.category}",${e.amount},"${e.paymentMethod}","${e.paidTo || ''}","${e.notes || ''}","${e.projectId || ''}"\n`;
      });
    } else if (type === 'wages') {
      csvContent = 'WorkerID,WorkerName,Role,DailyRate,PresentDays,HalfDays,AbsentDays,OT_Hours,TotalEarned,TotalPaid,BalanceDue\n';
      allWorkersWageStats.forEach(s => {
        csvContent += `"${s.workerId}","${s.workerName}","${s.role}",${s.dailyRate},${s.presentDays},${s.halfDays},${s.absentDays},${s.overtimeHours},${s.totalEarnedWage},${s.totalPaidWage},${s.balanceDue}\n`;
      });
    } else if (type === 'materials') {
      csvContent = 'MaterialID,Name,Category,Unit,OpeningStock,AddedStock,UsedStock,RemainingStock,MinStock,PurchasePrice,StockValue,Supplier\n';
      materials.forEach(m => {
        const val = m.quantity * (m.purchasePrice || 0);
        csvContent += `"${m.id}","${m.name}","${m.category}","${m.unit}",${m.openingStock},${m.addedStock},${m.usedStock},${m.quantity},${m.minStockLevel},${m.purchasePrice},${val},"${m.supplier}"\n`;
      });
    } else if (type === 'emergency') {
      csvContent = 'IncidentID,Type,TriggeredBy,ContactName,ContactPhone,Timestamp,Location,Status,Notes\n';
      emergencyEvents.forEach(e => {
        csvContent += `"${e.id}","${e.type}","${e.triggeredBy}","${e.contactName}","${e.contactPhone}","${e.timestamp}","${e.location || ''}","${e.status}","${e.notes || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workmate_${type}_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    workers,
    attendance,
    expenses,
    payouts,
    budget,
    settings,
    projects,
    currentProjectId,
    setCurrentProjectId,
    users: INITIAL_USERS,
    materials,
    materialTransactions,
    scannedBills,
    chatRooms,
    chatMessages,
    activeChatRoomId,
    setActiveChatRoomId,
    emergencyContacts,
    emergencyEvents,
    notifications,
    unreadNotificationsCount,
    unreadChatCount,
    totalOperationalExpenses,
    totalWagePayouts,
    totalExpenses,
    remainingBudget,
    budgetUsedPercent,
    budgetStatus,
    totalStockValue,
    lowStockMaterialsCount,
    outOfStockMaterialsCount,
    todayStats,
    allWorkersWageStats,
    totalWageLiabilityEarned,
    totalWageLiabilityPaid,
    totalWageLiabilityPending,
    laborCost,
    materialCost,
    operationalCost,
    siteProgress,
    dailyReports,
    addSiteProgress,
    updateSiteProgress,
    deleteSiteProgress,
    addDailyReport,
    deleteDailyReport,
    isAuthModalOpen,
    setIsAuthModalOpen,
    showSplash,
    setShowSplash,
    login,
    logout,
    isMoreMenuOpen,
    setIsMoreMenuOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    addWorker,
    updateWorker,
    deleteWorker,
    markAttendance,
    markAllAttendance,
    getAttendanceForDate,
    addExpense,
    updateExpense,
    deleteExpense,
    recordWagePayout,
    deleteWagePayout,
    updateBudget,
    updateSettings,
    addProject,
    updateProject,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addMaterialStock,
    useMaterialStock,
    saveScannedBill,
    deleteScannedBill,
    sendChatMessage,
    clearChatRoom,
    startDirectChat,
    triggerEmergencySOS,
    resolveEmergencyEvent,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    resetToSampleData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    exportCSV,
  };

  return <WorkmateContext.Provider value={value}>{children}</WorkmateContext.Provider>;
};

export const useWorkmate = (): WorkmateContextType => {
  const context = useContext(WorkmateContext);
  if (!context) {
    throw new Error('useWorkmate must be used within a WorkmateProvider');
  }
  return context;
};
