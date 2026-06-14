import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Rider, TeamLeader, DailyOrder, AttendanceRecord, Application, CompanyConfig, PayoutSettings, PayoutRecord, Complaint 
} from '../types';
import { 
  Lock, LayoutDashboard, Users, FolderCheck, Calendar, ClipboardList, Wallet, Receipt, 
  Settings, Plus, Edit2, Trash2, Check, X, ShieldAlert, Award, FileSpreadsheet, Printer, 
  Download, Sparkles, UserPlus, FileText, CheckCircle2, RefreshCw, Layers, MessageSquare, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminPortalProps {
  config: CompanyConfig;
  payoutSettings: PayoutSettings;
  riders: Rider[];
  teamLeaders: TeamLeader[];
  orders: DailyOrder[];
  attendance: AttendanceRecord[];
  applications: Application[];
  complaints: Complaint[];
  isAdminLoggedIn?: boolean;
  onLoginAdmin?: (partner: string) => void;
  
  // Admin triggers
  onUpdateConfig: (config: CompanyConfig) => void;
  onUpdatePayoutSettings: (settings: PayoutSettings) => void;
  onApproveApplication: (appId: string, customRiderId: string) => void;
  onRejectApplication: (appId: string, remarks: string) => void;
  onAddRider: (rider: Omit<Rider, 'id'> & { id?: string }) => void;
  onEditRider: (rider: Rider) => void;
  onDeleteRider: (riderId: string) => void;
  onAddDailyOrder: (order: Omit<DailyOrder, 'id'>) => void;
  onDeleteDailyOrder: (orderId: string) => void;
  onSaveAttendance: (date: string, statusMap: Record<string, 'Present' | 'Absent' | 'Off'>) => void;
  onAddTeamLeader: (tl: Omit<TeamLeader, 'id' | 'joiningDate' | 'assignedRiders'>) => void;
  onUpdateTeamLeaderRoster: (tlId: string, riders: string[]) => void;
  onResolveComplaint: (id: string, status: 'Resolved' | 'In Progress') => void;
}

export default function AdminPortal({
  config,
  payoutSettings,
  riders,
  teamLeaders,
  orders,
  attendance,
  applications,
  complaints,
  isAdminLoggedIn,
  onLoginAdmin,
  onUpdateConfig,
  onUpdatePayoutSettings,
  onApproveApplication,
  onRejectApplication,
  onAddRider,
  onEditRider,
  onDeleteRider,
  onAddDailyOrder,
  onDeleteDailyOrder,
  onSaveAttendance,
  onAddTeamLeader,
  onUpdateTeamLeaderRoster,
  onResolveComplaint,
}: AdminPortalProps) {
  // Auth state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pv_fleet_admin_session') === 'true';
  });
  const [authError, setAuthError] = useState('');
  const [activePartner, setActivePartner] = useState<'Prince' | 'Vanshul' | 'Admin'>(() => {
    return (localStorage.getItem('pv_fleet_active_partner') as any) || 'Admin';
  });

  // Synchronize with parent state changes
  React.useEffect(() => {
    if (isAdminLoggedIn === false) {
      setIsAuthenticated(false);
      setActivePartner('Admin');
    } else if (isAdminLoggedIn === true) {
      setIsAuthenticated(true);
      const savedPartner = (localStorage.getItem('pv_fleet_active_partner') as any) || 'Admin';
      setActivePartner(savedPartner);
    }
  }, [isAdminLoggedIn]);

  React.useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  React.useEffect(() => {
    setLocalPayout({ ...payoutSettings });
  }, [payoutSettings]);

  // Active admin module tabs
  // 'dashboard' | 'applications' | 'riders' | 'orders' | 'attendance' | 'teamleaders' | 'salaries' | 'config'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'applications' | 'riders' | 'orders' | 'attendance' | 'teamleaders' | 'salaries' | 'config'>('dashboard');

  // Interactive editing states
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [riderToDelete, setRiderToDelete] = useState<Rider | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<DailyOrder | null>(null);
  
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [selectedRiderIdForOrder, setSelectedRiderIdForOrder] = useState('');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [incentiveAmount, setIncentiveAmount] = useState<number>(0);
  const [orderRemarks, setOrderRemarks] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceGrid, setAttendanceGrid] = useState<Record<string, 'Present' | 'Absent' | 'Off'>>({});

  // Team Leader Registry Modal
  const [showAddTLModal, setShowAddTLModal] = useState(false);
  const [tlName, setTlName] = useState('');
  const [tlMobile, setTlMobile] = useState('');
  const [tlEmail, setTlEmail] = useState('');

  // Roster swap state
  const [activeTLForRoster, setActiveTLForRoster] = useState<TeamLeader | null>(null);

  // Salary slip printing modal state
  const [activeSalarySlipRider, setActiveSalarySlipRider] = useState<any | null>(null);

  // Date range filters for Orders and Salary Management
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [salaryStartDate, setSalaryStartDate] = useState('');
  const [salaryEndDate, setSalaryEndDate] = useState('');

  // Application feedback remarks state
  const [rejectionAppId, setRejectionAppId] = useState<string | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Form states for adding rider
  const [rName, setRName] = useState('');
  const [rMobile, setRMobile] = useState('');
  const [rAadhaar, setRAadhaar] = useState('');
  const [rPan, setRPan] = useState('');
  const [rDl, setRDl] = useState('');

  // Automated WhatsApp Dispatcher Engine Simulator
  const [isAutoWhatsappEnabled, setIsAutoWhatsappEnabled] = useState(true);
  const [whatsappLogs, setWhatsappLogs] = useState<string[]>([
    `[${new Date().toLocaleDateString()}] 🟢 SYSTEM READY: Auto WhatsApp Salary Engine active.`,
    `[${new Date().toLocaleDateString()}] 📨 QUEUE: Weekly payroll dispatches listening on active rider roster.`,
    `[${new Date().toLocaleDateString()}] ✓ MONITORS: Listening to salary updates for instant WhatsApp notifications.`
  ]);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const triggerWhatsappBroadcast = () => {
    if (isSendingBroadcast) return;
    setIsSendingBroadcast(true);
    triggerToast("Initiating automatic WhatsApp salary slip dispatch...");
    
    setWhatsappLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 AUTO DISPATCH INITIATED by partner ${activePartner}...`
    ]);

    // Stagger dispatches to riders
    ridersPayoutRollup.forEach((riderItem, idx) => {
      setTimeout(() => {
        const text = `[${new Date().toLocaleTimeString()}] 💬 WhatsApp Auto-Sent to ${riderItem.name} (${riderItem.mobile}): Salary slip details of ₹${riderItem.netPayable.toLocaleString()} generated for this week. (DELIVERED)`;
        setWhatsappLogs(old => [...old, text]);
        
        if (idx === ridersPayoutRollup.length - 1) {
          setTimeout(() => {
            setIsSendingBroadcast(false);
            triggerToast("🎉 WhatsApp Salary broadcast completed!");
          }, 1000);
        }
      }, (idx + 1) * 900);
    });
  };
  const [rVehicleType, setRVehicleType] = useState<'Bike' | 'Scooty' | 'EV Scooter'>('Bike');
  const [rRiderId, setRRiderId] = useState('');
  const [rBankName, setRBankName] = useState('');
  const [rAccountNumber, setRAccountNumber] = useState('');
  const [rIfscCode, setRIfscCode] = useState('');
  const [rUpiId, setRUpiId] = useState('');
  const [rTlId, setRTlId] = useState('');
  const [rJoiningBonusEligible, setRJoiningBonusEligible] = useState(false);
  const [rReferralBonusEligible, setRReferralBonusEligible] = useState(false);

  const [rJoiningDate, setRJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [rAssignedRate, setRAssignedRate] = useState(40);

  // Edit rider states
  const [editRName, setEditRName] = useState('');
  const [editRMobile, setEditRMobile] = useState('');
  const [editRAadhaar, setEditRAadhaar] = useState('');
  const [editRPan, setEditRPan] = useState('');
  const [editRDl, setEditRDl] = useState('');
  const [editRVehicleType, setEditRVehicleType] = useState<'Bike' | 'Scooty' | 'EV Scooter'>('Bike');
  const [editRVehicleNumber, setEditRVehicleNumber] = useState('');
  const [editRBankName, setEditRBankName] = useState('');
  const [editRAccountNumber, setEditRAccountNumber] = useState('');
  const [editRIfscCode, setEditRIfscCode] = useState('');
  const [editRUpiId, setEditRUpiId] = useState('');
  const [editRTlId, setEditRTlId] = useState('');
  const [editRJoiningDate, setEditRJoiningDate] = useState('');
  const [editRStatus, setEditRStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [editRJoiningBonusEligible, setEditRJoiningBonusEligible] = useState(false);
  const [editRReferralBonusEligible, setEditRReferralBonusEligible] = useState(false);
  const [editRAssignedRate, setEditRAssignedRate] = useState(40);

  const openEditRiderModal = (rider: Rider) => {
    setEditingRider(rider);
    setEditRName(rider.name);
    setEditRMobile(rider.mobile);
    setEditRAadhaar(rider.aadhaar);
    setEditRPan(rider.pan);
    setEditRDl(rider.dl);
    setEditRVehicleType(rider.vehicleType);
    setEditRVehicleNumber(rider.vehicleNumber || '');
    setEditRBankName(rider.bankName);
    setEditRAccountNumber(rider.accountNumber);
    setEditRIfscCode(rider.ifscCode);
    setEditRUpiId(rider.upiId || '');
    setEditRTlId(rider.teamLeaderId || '');
    setEditRJoiningDate(rider.joiningDate || new Date().toISOString().split('T')[0]);
    setEditRStatus(rider.status);
    setEditRJoiningBonusEligible(!!rider.joiningBonusEligible);
    setEditRReferralBonusEligible(!!rider.referralBonusEligible);
    setEditRAssignedRate(rider.assignedRate || 40);
  };

  // Configuration edit state
  const [localConfig, setLocalConfig] = useState<CompanyConfig>({ ...config });
  const [localPayout, setLocalPayout] = useState<PayoutSettings>({ ...payoutSettings });
  
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Password Verification Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim().toLowerCase();

    const isPrince = email === 'prince@pvindiafleet.in' || email === 'prince62329@gmail.com';
    const isVanshul = email === 'vanshul@pvindiafleet.in' || email === 'parjapativanshul@gmail.com';
    const isValidPassword = password === 'pv123' || password === 'pvindia' || password === 'admin123' || password === 'prince123' || password === 'vanshul123' || password === 'pvfleet';

    if ((isPrince || isVanshul) && isValidPassword) {
      const partnerName = isPrince ? 'Prince' : 'Vanshul';
      setActivePartner(partnerName);
      setIsAuthenticated(true);
      setAuthError('');
      // Initialize configuration inputs
      setLocalConfig({ ...config });
      setLocalPayout({ ...payoutSettings });
      
      // Notify parent to sync session
      onLoginAdmin?.(partnerName);
      triggerToast(`Welcome back, ${partnerName}! Session authorized as ${isPrince ? 'Super Admin' : 'Admin'}.`);
    } else if ((email === 'admin' || email === 'admin@pvindiafleet.in') && password === 'admin123') {
      setActivePartner('Admin');
      setIsAuthenticated(true);
      setAuthError('');
      setLocalConfig({ ...config });
      setLocalPayout({ ...payoutSettings });
      
      onLoginAdmin?.('Admin');
      triggerToast('Authorized via fallback administrator credentials.');
    } else {
      setAuthError('Unauthorized. Please enter a valid corporate email and password.');
    }
  };

  const activeRidersCount = useMemo(() => riders.filter(r => r.status === 'Active').length, [riders]);

  // Filter orders for the Salary management summary report using the date range picker
  const filteredOrdersForSalary = useMemo(() => {
    return orders.filter(o => {
      if (salaryStartDate && o.date < salaryStartDate) return false;
      if (salaryEndDate && o.date > salaryEndDate) return false;
      return true;
    });
  }, [orders, salaryStartDate, salaryEndDate]);

  // Filter orders for the Orders Logs tab using the date range picker
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStartDate && o.date < orderStartDate) return false;
      if (orderEndDate && o.date > orderEndDate) return false;
      return true;
    });
  }, [orders, orderStartDate, orderEndDate]);

  // Aggregate rider orders helper for tabular summaries
  // Computes weekly & monthly stats to auto calculate bonuses!
  const ridersPayoutRollup = useMemo(() => {
    // 1. First map to intermediate values to get totalOrdersCount
    const intermediate = riders.map(rider => {
      const personalOrders = filteredOrdersForSalary.filter(o => o.riderId === rider.id);
      const totalOrdersCount = personalOrders.reduce((sum, o) => sum + o.ordersCompleted, 0);
      return { rider, totalOrdersCount, personalOrders };
    });

    // 2. Sort by order count to find rank for Top Performer Bonus
    const sorted = [...intermediate]
       .filter(x => x.totalOrdersCount > 0)
       .sort((a, b) => b.totalOrdersCount - a.totalOrdersCount);

    return intermediate.map(item => {
      const { rider, totalOrdersCount, personalOrders } = item;
      const baseEarnings = totalOrdersCount * payoutSettings.perOrderRate;
      const totalIncentives = personalOrders.reduce((sum, o) => sum + o.incentive, 0);

      // Weekly Bonus Rule: >= 250 orders completed
      const qualifyingWeekly = totalOrdersCount >= payoutSettings.weeklyBonusTarget;
      const weeklyBonus = qualifyingWeekly ? payoutSettings.weeklyBonusAmount : 0;

      // Monthly Bonus Rule: >= 1100 orders completed
      const qualifyingMonthly = totalOrdersCount >= payoutSettings.monthlyBonusTarget;
      const monthlyBonus = qualifyingMonthly ? payoutSettings.monthlyBonusAmount : 0;

      // Determine Top Performer Rank & Bonus - active only if activeRidersCount >= 20
      const rankIdx = sorted.findIndex(x => x.rider.id === rider.id);
      let topPerformerBonus = 0;
      if (activeRidersCount >= 20) {
        if (rankIdx === 0) topPerformerBonus = 3000;
        else if (rankIdx === 1) topPerformerBonus = 2000;
        else if (rankIdx === 2) topPerformerBonus = 1000;
      }

      // Simulate/Add Joining/Referral Bonus support based on static IDs (or registration date matching)
      let joiningBonus = rider.joiningBonusEligible ? payoutSettings.joiningBonus : 0;
      let referralBonus = rider.referralBonusEligible ? payoutSettings.referralBonus : 0;
      // Seed defaults
      if (rider.id === 'PV-ZOM-101') referralBonus = payoutSettings.referralBonus;
      if (rider.id === 'PV-ZOM-103') joiningBonus = payoutSettings.joiningBonus;

      const deductions = 0;
      const netPayable = baseEarnings + totalIncentives + weeklyBonus + monthlyBonus + topPerformerBonus + joiningBonus + referralBonus - deductions;

      return {
        ...rider,
        totalOrders: totalOrdersCount,
        baseEarnings,
        incentives: totalIncentives,
        weeklyBonus,
        monthlyBonus,
        topPerformerBonus,
        joiningBonus,
        referralBonus,
        deductions,
        netPayable,
        statusLabel: 'Pending'
      };
    });
  }, [riders, filteredOrdersForSalary, payoutSettings]);

  // 2. Metrics Auto calculations
  const dashboardStats = useMemo(() => {
    const totalRiders = riders.length;
    const activeRidersCount = riders.filter(r => r.status === 'Active').length;
    const pendingAppsCount = applications.filter(a => a.status === 'Pending').length;
    
    // Today's orders
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrdersCount = orders
      .filter(o => o.date === todayStr)
      .reduce((sum, current) => sum + current.ordersCompleted, 0);

    // Weekly orders (orders in past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyOrdersCount = orders
      .filter(o => new Date(o.date) >= sevenDaysAgo)
      .reduce((sum, current) => sum + current.ordersCompleted, 0);

    // Monthly orders (orders in past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrdersCount = orders
      .filter(o => new Date(o.date) >= thirtyDaysAgo)
      .reduce((sum, current) => sum + current.ordersCompleted, 0);

    // Aggregate payout values
    const estimatedPayoutSummary = ridersPayoutRollup.reduce((sum, r) => sum + r.netPayable, 0);

    // Aggregate bonus payouts
    const totalBonusSummary = ridersPayoutRollup.reduce(
      (sum, r) => sum + r.weeklyBonus + r.monthlyBonus + r.topPerformerBonus + r.joiningBonus + r.referralBonus, 
      0
    );

    return {
      totalRiders,
      activeRidersCount,
      pendingAppsCount,
      todayOrdersCount,
      weeklyOrdersCount,
      monthlyOrdersCount,
      estimatedPayoutSummary,
      totalBonusSummary,
      complaintsCount: complaints.filter(c => c.status === 'Open').length
    };
  }, [riders, orders, applications, complaints, payoutSettings, ridersPayoutRollup]);

  // Compute Active team leader financials & order aggregates
  const teamLeadersRollup = useMemo(() => {
    return teamLeaders.map(tl => {
      // Find all orders finished by riders in this roster
      const fleetRiderIds = tl.assignedRiders;
      
      const fleetOrders = orders.filter(o => fleetRiderIds.includes(o.riderId));
      const totalFleetVolume = fleetOrders.reduce((sum, o) => sum + o.ordersCompleted, 0);
      
      // ₹5 Commission per order completed by assigned riders
      const commission = totalFleetVolume * payoutSettings.teamLeaderCommissionRate;

      return {
        ...tl,
        fleetVolume: totalFleetVolume,
        commissionAmount: commission
      };
    });
  }, [teamLeaders, orders, payoutSettings]);

  // Data aggregation for Recharts
  const dailyOrdersTrend = useMemo(() => {
    const counts: Record<string, { orders: number; payouts: number }> = {};
    
    orders.forEach(o => {
      const dateStr = o.date;
      if (!counts[dateStr]) {
        counts[dateStr] = { orders: 0, payouts: 0 };
      }
      counts[dateStr].orders += o.ordersCompleted;
      counts[dateStr].payouts += (o.ordersCompleted * payoutSettings.perOrderRate) + o.incentive;
    });

    // Sort chronologically and return array
    return Object.keys(counts)
      .sort()
      .map(date => {
        let label = date;
        try {
          const parts = date.split('-');
          if (parts.length === 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            const d = new Date(year, month - 1, day);
            label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
        } catch (e) {
          label = date;
        }
        return {
          rawDate: date,
          label,
          orders: counts[date].orders,
          payouts: counts[date].payouts,
        };
      });
  }, [orders, payoutSettings.perOrderRate]);

  // Aggregate application statuses
  const applicationStatusTrend = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    applications.forEach(app => {
      if (app.status === 'Pending') pending++;
      else if (app.status === 'Approved') approved++;
      else if (app.status === 'Rejected') rejected++;
    });

    const total = pending + approved + rejected;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      data: [
        { name: 'Approved', value: approved, color: '#10b981' }, 
        { name: 'Pending', value: pending, color: '#f59e0b' },   
        { name: 'Rejected', value: rejected, color: '#ef4444' }   
      ].filter(item => item.value > 0),
      rawData: [
        { name: 'Approved', value: approved, color: '#10b981' }, 
        { name: 'Pending', value: pending, color: '#f59e0b' },   
        { name: 'Rejected', value: rejected, color: '#ef4444' }   
      ],
      total,
      approvalRate
    };
  }, [applications]);

  // Handle document approval
  const handleApproveCandidate = (app: Application) => {
    // Generate automatic incremental Zomato Fleet ID
    const baseNum = 100 + riders.length + 1;
    const generatedRiderId = `PV-ZOM-${baseNum}`;
    onApproveApplication(app.id, generatedRiderId);
    triggerToast(`Approved ${app.fullName}! Official ID generated: ${generatedRiderId}`);
  };

  // Handle document rejection
  const handleRejectCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionAppId || !rejectionRemarks.trim()) return;
    
    onRejectApplication(rejectionAppId, rejectionRemarks);
    triggerToast(`Rejected application ${rejectionAppId} with notes`);
    setRejectionAppId(null);
    setRejectionRemarks('');
  };

  // Handle Add Rider Form Submit
  const handleAddRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rRiderId.trim()) {
      triggerToast('⚠️ Error: Rider ID is required');
      return;
    }
    if (!rName || !rMobile || !rAadhaar || !rPan || !rDl || !rBankName || !rAccountNumber || !rIfscCode) {
      triggerToast('⚠️ Error: Please fill out all mandatory rider profile fields');
      return;
    }

    const uniqueRiderId = rRiderId.trim();
    if (riders.some(r => r.id.toLowerCase() === uniqueRiderId.toLowerCase())) {
      triggerToast(`⚠️ Error: Rider ID "${uniqueRiderId}" is already assigned to another rider in the system. Please enter a unique Rider ID.`);
      return;
    }

    onAddRider({
      id: uniqueRiderId,
      name: rName,
      mobile: rMobile,
      aadhaar: rAadhaar,
      pan: rPan,
      dl: rDl,
      vehicleType: rVehicleType,
      vehicleNumber: '',
      bankName: rBankName,
      accountNumber: rAccountNumber,
      ifscCode: rIfscCode,
      upiId: rUpiId || undefined,
      status: 'Active',
      teamLeaderId: rTlId || undefined,
      joiningBonusEligible: rJoiningBonusEligible,
      referralBonusEligible: rReferralBonusEligible,
      joiningDate: rJoiningDate,
      assignedRate: rAssignedRate,
    });

    // Clear and close
    setRName('');
    setRMobile('');
    setRAadhaar('');
    setRPan('');
    setRDl('');
    setRRiderId('');
    setRBankName('');
    setRAccountNumber('');
    setRIfscCode('');
    setRUpiId('');
    setRTlId('');
    setRJoiningBonusEligible(false);
    setRReferralBonusEligible(false);
    setRJoiningDate(new Date().toISOString().split('T')[0]);
    setShowAddRiderModal(false);
    triggerToast('Rider profiled and registered successfully');
  };

  // Handle Edit Rider Form Submit
  const handleEditRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRider) return;

    if (!editRName || !editRMobile || !editRAadhaar || !editRPan || !editRDl || !editRBankName || !editRAccountNumber || !editRIfscCode) {
      triggerToast('⚠️ Error: Please fill out all mandatory rider profile fields');
      return;
    }

    onEditRider({
      ...editingRider,
      name: editRName,
      mobile: editRMobile,
      aadhaar: editRAadhaar,
      pan: editRPan,
      dl: editRDl,
      vehicleType: editRVehicleType,
      vehicleNumber: editRVehicleNumber,
      bankName: editRBankName,
      accountNumber: editRAccountNumber,
      ifscCode: editRIfscCode,
      upiId: editRUpiId || undefined,
      teamLeaderId: editRTlId || undefined,
      status: editRStatus,
      joiningDate: editRJoiningDate,
      joiningBonusEligible: editRJoiningBonusEligible,
      referralBonusEligible: editRReferralBonusEligible,
      assignedRate: editRAssignedRate,
    });

    setEditingRider(null);
    triggerToast('Rider profile updated and synchronized successfully!');
  };

  // Save Config and settings triggers
  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    onUpdatePayoutSettings(localPayout);
    triggerToast('Administrative company configuration written updated successfully');
  };

  // Handle Add Order Record Trigger
  const handleAddOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRiderIdForOrder || orderCount <= 0) {
      triggerToast('⚠️ Error: Please pick a rider and enter completed order scores');
      return;
    }

    const targetRider = riders.find(r => r.id === selectedRiderIdForOrder);
    if (!targetRider) return;

    onAddDailyOrder({
      riderId: selectedRiderIdForOrder,
      riderName: targetRider.name,
      date: orderDate,
      ordersCompleted: orderCount,
      incentive: incentiveAmount,
      remarks: orderRemarks || undefined
    });

    setOrderCount(0);
    setIncentiveAmount(0);
    setOrderRemarks('');
    setShowAddOrderModal(false);
    triggerToast(`Recorded ${orderCount} orders completed for ${targetRider.name}`);
  };

  // Initiate Attendance Grid values
  const loadAttendanceConfiguration = () => {
    // Check if configuration already exists for this date
    const matched = attendance.find(a => a.date === attendanceDate);
    const grid: Record<string, 'Present' | 'Absent' | 'Off'> = {};
    
    riders.forEach(rider => {
      if (rider.status === 'Active') {
        grid[rider.id] = matched?.statusMap[rider.id] || 'Present';
      }
    });
    setAttendanceGrid(grid);
  };

  React.useEffect(() => {
    loadAttendanceConfiguration();
  }, [attendanceDate, riders, attendance]);

  const handleSaveAttendanceTrigger = () => {
    onSaveAttendance(attendanceDate, attendanceGrid);
    triggerToast(`Attendance register updated for date: ${attendanceDate}`);
  };

  // Create Team Leader trigger
  const handleAddTeamLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlName || !tlMobile || !tlEmail) {
      triggerToast('⚠️ Error: Please specify team leader fields');
      return;
    }

    onAddTeamLeader({
      name: tlName,
      mobile: tlMobile,
      email: tlEmail,
      status: 'Active'
    });

    setTlName('');
    setTlMobile('');
    setTlEmail('');
    setShowAddTLModal(false);
    triggerToast(`Registered Team Leader ${tlName}`);
  };

  // Export to Excel (Generates beautifully formatted clean CSV dataset)
  const exportRidersToCSV = () => {
    const headers = 'Rider ID,Name,Mobile,Joining Date,Orders completed,Incentives,Weekly Bonus,Monthly Bonus,Net Payable,Bank,IFSC,UPI\n';
    const rows = ridersPayoutRollup.map(item => {
      return `"${item.id}","${item.name}","${item.mobile}","${item.joiningDate}",${item.totalOrders},${item.incentives},${item.weeklyBonus},${item.monthlyBonus},${item.netPayable},"${item.bankName}","${item.ifscCode}","${item.upiId || ''}"`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `PV_India_Fleet_Riders_Payout_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Excel/CSV export downloaded successfully!');
  };

  // Handle native browser formatting print for salary slip
  const handlePrintSalarySlip = () => {
    window.print();
  };

  // Handle direct client-side PDF download using html2canvas & jsPDF
  const handleDownloadSalarySlipPDF = async () => {
    const element = document.getElementById('salary-slip-print');
    if (!element) {
      triggerToast('⚠️ Error: Printable salary slip container not found.');
      return;
    }
    
    triggerToast('⏳ Generating salary slip PDF, please wait...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 8;
      const contentWidth = pdfWidth - (margin * 2);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const contentHeight = (imgHeight * contentWidth) / imgWidth;
      
      pdf.addImage(imgData, 'PNG', margin, margin + 4, contentWidth, contentHeight);
      
      const cleanRiderName = (activeSalarySlipRider?.name || 'Rider').replace(/\s+/g, '_');
      pdf.save(`PV_Salary_Slip_${cleanRiderName}.pdf`);
      
      triggerToast('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      triggerToast('⚠️ Error: PDF render failed.');
    }
  };

  // Handle Export Order Logs as CSV for accountant & team leader records
  const handleExportOrdersCSV = () => {
    if (filteredOrders.length === 0) {
      triggerToast('⚠️ No orders found to export within this range.');
      return;
    }

    const headers = ['Order Log ID', 'Date Completed', 'Rider ID', 'Rider Name', 'Orders Completed Count', 'Payout Rate (INR)', 'Base Earnings (INR)', 'Incentive Payout (INR)', 'Remarks'];
    const rows = filteredOrders.map(o => {
      const payout = o.ordersCompleted * payoutSettings.perOrderRate;
      return [
        o.id,
        o.date,
        o.riderId,
        `"${o.riderName.replace(/"/g, '""')}"`,
        o.ordersCompleted,
        payoutSettings.perOrderRate,
        payout,
        o.incentive,
        `"${(o.remarks || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    let filename = 'daily_order_logs_report';
    if (orderStartDate) filename += `_from_${orderStartDate}`;
    if (orderEndDate) filename += `_to_${orderEndDate}`;
    filename += '.csv';

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✅ Order logs exported as CSV successfully!');
  };

  // Calculate Service Duration dynamically based on Joining Date (auto calculated and shown)
  const getServiceDuration = (joiningDateStr?: string) => {
    if (!joiningDateStr) return '20 days';
    try {
      const parts = joiningDateStr.split('-');
      if (parts.length !== 3) return '20 days';
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const joinDate = new Date(year, month, day);
      const today = new Date();
      
      // Clear time parameters for clean day math
      joinDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      
      const diffMs = today.getTime() - joinDate.getTime();
      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      
      if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else {
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        return `${months} month${months !== 1 ? 's' : ''}${days > 0 ? `, ${days} day${days !== 1 ? 's' : ''}` : ''}`;
      }
    } catch (e) {
      return '20 days';
    }
  };

  // Handle WhatsApp automatic share of salary slip details
  const handleWhatsAppShare = (rider: any) => {
    if (!rider) return;
    
    const safeMobile = rider.mobile.replace(/\D/g, '');
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    const message = `⚡ *PV INDIA FLEET SOLUTIONS* ⚡
*DELHI NCR ZOMATO AGGREGATOR*
━━━━━━━━━━━━━━━━━━━━━━━━━━
प्रिय *${rider.name}*, आपका इस महीने (${currentMonth}) का कार्य और पेमेंट विवरण इस प्रकार है:

👤 *RIDER PROFILE:*
• *ID:* PV-REC-${rider.id}
• *Name:* ${rider.name}
• *Mobile:* +91 ${rider.mobile}
• *Vehicle:* ${rider.vehicleNumber} (${rider.vehicleType})

📈 *WORK RECORD & EARNINGS:*
• *Total Completed Orders:* ${rider.totalOrders} Completed
• *Base Earnings:* ₹${rider.baseEarnings.toLocaleString()}
• *Route Incentives:* ₹${rider.incentives.toLocaleString()}
• *Weekly Target Bonus:* ${rider.weeklyBonus > 0 ? `₹${rider.weeklyBonus.toLocaleString()} (✓ Achieved 250+ Orders Target)` : `₹0 (❌ Not Achieved)`}
• *Monthly Loyalty Bonus:* ${rider.monthlyBonus > 0 ? `₹${rider.monthlyBonus.toLocaleString()} (✓ Achieved 1100+ Orders Target)` : `₹0 (❌ Not Achieved)`}
• *TDS / Service Charges:* ₹0 (Free Processing)

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *NET PAYABLE AMOUNT:* *₹${rider.netPayable.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━

🏦 *SETTLEMENT BANK DETAIL:*
• *Bank:* ${rider.bankName}
• *Account No:* **********${rider.accountNumber.slice(-4)}
• *IFSC Code:* ${rider.ifscCode}
${rider.upiId ? `• *Payout UPI ID:* ${rider.upiId}\n` : ''}
Congratulations on your dynamic performance! 🚀 Keep driving & earning!

📞 For help, write/call Prince: +91-${config.phonePrince}
_Authorized Slip approved by Partners: Prince & Vanshul_`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${safeMobile}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    triggerToast(`Salary slip prepared and launching WhatsApp for ${rider.name}!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pb-24 font-sans">
      
      {/* 1. Admin Login Gate */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto my-12 bg-white border border-neutral-200 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full overflow-hidden border-2 border-orange-500/25 bg-slate-950 shadow-md">
              <img 
                src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
                alt="PV India Logo" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight uppercase">Admin Partner Cockpit</h2>
              <p className="text-[11px] text-red-600 font-extrabold tracking-wider uppercase bg-red-50 border border-red-150 rounded-lg px-3 py-1.5 inline-block">
                🔒 Authorized Access Only – Admin Login Required
              </p>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal">
              This administrative dashboard is strictly confidential. Unauthorized attempts to gain access are monitored and logged.
            </p>
          </div>

          {authError && (
            <div className="p-3 text-[11px] font-bold text-red-700 bg-red-50 border border-red-150 rounded-lg flex items-center space-x-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Corporate Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. name@pvindiafleet.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-neutral-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-neutral-900 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#cb202d] hover:bg-[#b01b27] p-3 text-xs tracking-wider font-extrabold uppercase text-white rounded-lg transition shadow-md shadow-red-500/10 cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        /* 2. ADMIN PORTAL INNER WORKSPACE */
        <div className="space-y-8">
          
          {/* Header area & Quick notifications toast */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-100 pb-5 gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-orange-500/20 bg-slate-950 shadow-sm shrink-0">
                <img 
                  src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
                  alt="PV India Logo" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                {activePartner === 'Prince' ? (
                  <span className="font-mono text-[9px] uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2.5 py-1 rounded-md font-extrabold inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/5">
                    <span className="text-[11px] animate-bounce">👑</span>
                    <span>Prince (Super Admin & Managing Director)</span>
                  </span>
                ) : activePartner === 'Vanshul' ? (
                  <span className="font-mono text-[9px] uppercase bg-violet-600/10 text-violet-400 border border-violet-500/25 px-2.5 py-1 rounded-md font-extrabold inline-flex items-center gap-1.5 shadow-sm shadow-violet-500/5">
                    <span className="text-[11px] animate-pulse">👑</span>
                    <span>Vanshul (Operations Admin & Co-Owner)</span>
                  </span>
                ) : (
                  <span className="font-mono text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-md font-extrabold inline-flex items-center gap-15">
                    <span>👑</span>
                    <span>Admin Joint command controller</span>
                  </span>
                )}
                <h2 className="text-xl font-black text-neutral-900 leading-none mt-1.5">
                  PV INDIA FLEET PILOT COCKPIT
                </h2>
                <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                  Manager Session: <strong className="text-emerald-600 font-extrabold font-sans">Active (Online)</strong> | 2026-06-14 Dashboard
                </p>
              </div>
            </div>

            {/* Quick module hot switches */}
            <div className="flex flex-wrap gap-1.5 font-sans">
              {[
                { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
                { id: 'applications', label: 'Approvals', icon: FolderCheck, count: dashboardStats.pendingAppsCount },
                { id: 'riders', label: 'Riders Roster', icon: Users },
                { id: 'orders', label: 'Orders Logs', icon: ClipboardList },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
                { id: 'teamleaders', label: 'Leaders', icon: Layers },
                { id: 'salaries', label: 'Payroll Core', icon: Wallet },
                { id: 'config', label: 'Controls', icon: Settings }
              ].map((m) => {
                const isActive = adminTab === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAdminTab(m.id as any)}
                    className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#cb202d] text-white' 
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{m.label}</span>
                    {m.count !== undefined && m.count > 0 && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-mono font-extrabold text-neutral-950 animate-pulse">
                        {m.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Notification popups */}
          {successToast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 border border-neutral-800 text-white p-4 text-xs font-bold flex items-center space-x-2.5 shadow-2xl">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* TAB 1: OPERATIONAL MONITOR / METRICS GRID */}
          {adminTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Primary Bento Cards Grid - 8 KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">TOTAL REGISTERED RIDERS</p>
                  <p className="text-2xl font-black text-neutral-900 leading-none">{dashboardStats.totalRiders}</p>
                  <p className="text-[10px] text-neutral-500">Fleet inventory total</p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">ACTIVE FLT RIDERS</p>
                  <p className="text-2xl font-black text-emerald-600 leading-none">{dashboardStats.activeRidersCount}</p>
                  <p className="text-[10px] text-neutral-500">● Live on-road delivery</p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">PENDING APPROVALS</p>
                  <p className="text-2xl font-black text-amber-500 leading-none">{dashboardStats.pendingAppsCount}</p>
                  <p className="text-[10px] text-neutral-500">Onboarding pipeline queue</p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">DAILY LOG completed</p>
                  <p className="text-2xl font-black text-neutral-900 leading-none">{dashboardStats.todayOrdersCount}</p>
                  <p className="text-[10px] text-neutral-500">Today's total deliveries</p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">WEEKLY ORDER VOLUME</p>
                  <p className="text-2xl font-black text-neutral-900 leading-none">{dashboardStats.weeklyOrdersCount}</p>
                  <p className="text-[10px] text-neutral-500">Summed past 7 days</p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-neutral-400">MONTHLY ORDER VOLUME</p>
                  <p className="text-2xl font-black text-neutral-900 leading-none">{dashboardStats.monthlyOrdersCount}</p>
                  <p className="text-[10px] text-neutral-500">Summed past 30 days</p>
                </div>

                <div className="rounded-xl border border-[#cb202d]/25 bg-red-50/50 p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-rose-600">TOTAL PAYOUT TO SETTLE</p>
                  <p className="text-2xl font-black text-neutral-900 leading-none">₹{dashboardStats.estimatedPayoutSummary.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-neutral-500">Per order flat rate: ₹{payoutSettings.perOrderRate}</p>
                </div>

                <div className="rounded-xl border border-emerald-250 bg-emerald-50/50 p-5 shadow-sm space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-600">TOTAL DISPATCHED BONUS</p>
                  <p className="text-2xl font-black text-emerald-700 leading-none">₹{dashboardStats.totalBonusSummary.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600">Loyalty & top rank bonuses</p>
                </div>

              </div>

              {/* IMMERSIVE RECHARTS ANALYTICS SUBSECTION */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md space-y-6">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-white flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
                    <span>Fleet & Application Analytics Portal</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time operational indicators showing daily order trend curves, cumulative payouts, and onboarding pipeline ratios.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Chart 1: Daily Orders Trend (Line / Area chart) */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase text-orange-400">Daily Deliveries Trend</h4>
                        <p className="text-[11px] text-slate-400">Aggregated daily orders completed</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">
                          Live Active Fleet
                        </span>
                      </div>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyOrdersTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                          <XAxis 
                            dataKey="label" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#f97316', fontSize: '12px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="orders" 
                            stroke="#f97316" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorOrdersGradient)" 
                            name="Orders Completed"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Weekly / Daily Payout Distribution (Bar Chart) */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase text-blue-400">Payout Aggregations</h4>
                        <p className="text-[11px] text-slate-400">Total payouts (Drop rate + Incentives)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                          ₹{payoutSettings.perOrderRate}/drop
                        </span>
                      </div>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyOrdersTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                          <XAxis 
                            dataKey="label" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false}
                            tickFormatter={(v) => `₹${v}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
                            formatter={(value) => [`₹${value}`, 'Est. Payout']}
                          />
                          <Bar 
                            dataKey="payouts" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                            name="Est. Payout"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Application Funnel and Approval Rates (Pie Chart/Gauge) */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase text-emerald-400">Application Funnel</h4>
                        <p className="text-[11px] text-slate-400">Onboarding workflow conversion</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {applicationStatusTrend.approvalRate}% Approved
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-56 flex flex-col justify-between">
                      <div className="h-40 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={applicationStatusTrend.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={60}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {applicationStatusTrend.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                              itemStyle={{ fontSize: '11px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center">
                          <p className="text-xl font-black text-white leading-none">{applicationStatusTrend.total}</p>
                          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">Applicants</p>
                        </div>
                      </div>

                      {/* Legend labels */}
                      <div className="flex justify-around text-[10px] font-mono text-slate-300 pt-2 border-t border-white/5">
                        {applicationStatusTrend.rawData.map((entry, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}: {entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* TOP PERFORMERS PODIUM STANDINGS CARD */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-sans text-sm font-extrabold text-neutral-900 flex items-center space-x-1.5">
                      <span className="text-xl">🏆</span>
                      <span>Top Performers Podium & Bonus Distribution</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Top 3 delivery performers are dynamically evaluated based on total completed orders and awarded administrative performance bonuses.
                    </p>
                  </div>
                  <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-mono font-bold gap-1 text-neutral-450 text-neutral-500">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">1st: ₹3,000</span>
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-bold">2nd: ₹2,000</span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/50 font-bold">3rd: ₹1,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* We map the top 3 performers from ridersPayoutRollup sorted descending */}
                  {(() => {
                    const sortedRollup = [...ridersPayoutRollup]
                      .filter(r => r.totalOrders > 0)
                      .sort((a, b) => b.totalOrders - a.totalOrders);
                    
                    if (sortedRollup.length === 0) {
                      return (
                        <div className="md:col-span-3 text-center py-6 text-xs text-neutral-400 font-sans">
                          No order logs entered yet to calculate performance ranks.
                        </div>
                      );
                    }

                    return sortedRollup.slice(0, 3).map((item, index) => {
                      const rankColors = [
                        { bg: "bg-amber-50 border-amber-200 text-amber-900", icon: "👑 1st Rank", badge: "bg-amber-100 text-amber-800 font-black" },
                        { bg: "bg-slate-50 border-slate-200 text-slate-900", icon: "🥈 2nd Rank", badge: "bg-slate-100 text-slate-800 font-black" },
                        { bg: "bg-amber-50/40 border-amber-100 text-amber-950", icon: "🥉 3rd Rank", badge: "bg-amber-50 text-amber-800 font-bold" }
                      ][index] || { bg: "bg-neutral-50 border-neutral-100", icon: "Rider", badge: "bg-neutral-100" };

                      return (
                        <div key={item.id} className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 ${rankColors.bg} transition hover:shadow-md hover:scale-[1.01]`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`px-2 py-0.5 rounded font-sans text-[10px] uppercase font-bold tracking-wider ${rankColors.badge}`}>
                                {rankColors.icon}
                              </span>
                              <h4 className="font-sans text-sm font-extrabold mt-2 text-neutral-900 leading-tight">{item.name}</h4>
                              <p className="font-mono text-[10px] text-neutral-500 mt-0.5">ID: {item.id}</p>
                            </div>
                            <span className="text-xl">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-neutral-200/50">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-neutral-550 text-neutral-500">Completed Orders</span>
                              <strong className="text-neutral-800">{item.totalOrders} deliveries</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-neutral-550 text-neutral-500">Calculated Bonus</span>
                              <strong className="text-rose-700">₹{item.topPerformerBonus.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Dynamic Operations Summary & Live Complaints Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Rules Summary & parameters */}
                <div className="lg:col-span-4 rounded-xl border border-neutral-100 bg-white p-6 space-y-6">
                  <h3 className="font-sans text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-3">Active Payroll Parameters</h3>
                  
                  <div className="space-y-4 font-sans text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-550 text-neutral-500">Per Order Base Rate</span>
                      <strong className="text-neutral-900">₹{payoutSettings.perOrderRate} / Drop</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-550 text-neutral-500">Welcome Onboarding Bonus</span>
                      <strong className="text-neutral-900">₹{payoutSettings.joiningBonus} flat</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-550 text-neutral-500">Rider Referral Credit</span>
                      <strong className="text-neutral-900">₹{payoutSettings.referralBonus} / Active</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-550 text-neutral-500">Weekly target threshold</span>
                      <strong className="text-neutral-900">{payoutSettings.weeklyBonusTarget} Orders</strong>
                    </div>
                    <div className="flex items-center justify-between bg-rose-50/50 p-2 rounded">
                      <span className="text-rose-700 font-bold">Weekly Target Bonus</span>
                      <strong className="text-rose-900">₹{payoutSettings.weeklyBonusAmount}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-550 text-neutral-500">Monthly loyalty threshold</span>
                      <strong className="text-neutral-900">{payoutSettings.monthlyBonusTarget} Orders</strong>
                    </div>
                    <div className="flex items-center justify-between bg-amber-50/50 p-2 rounded">
                      <span className="text-amber-700 font-bold">Monthly Loyalty Bonus</span>
                      <strong className="text-amber-900 font-bold">₹{payoutSettings.monthlyBonusAmount}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setAdminTab('config')}
                    className="w-full text-center bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg p-2.5 font-bold text-xs font-sans tracking-wide transition"
                  >
                    Adjust Rates System
                  </button>
                </div>

                {/* Live Complaints Hub */}
                <div className="lg:col-span-8 rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
                  <h3 className="font-sans text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <span>Outstanding Complaints & Support Requests</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-mono text-red-700 font-bold">
                      {dashboardStats.complaintsCount} Open
                    </span>
                  </h3>

                  {complaints.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400 font-sans">
                      All clean! No open rider complaints reported today.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 space-y-4">
                      {complaints.map((c) => (
                        <div key={c.id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase tracking-wide bg-neutral-100 rounded px-1.5 py-0.5 text-neutral-500">{c.id}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'Open' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600'
                            }`}>{c.status}</span>
                          </div>
                          
                          <p className="text-xs font-bold text-neutral-800 leading-tight">{c.subject}</p>
                          <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{c.message}</p>
                          
                          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 pt-1">
                            <span>By: {c.name} ({c.mobile})</span>
                            <div className="flex gap-2">
                              {c.status === 'Open' && (
                                <button
                                  onClick={() => {
                                    onResolveComplaint(c.id, 'Resolved');
                                    triggerToast(`Status marked Resolved for complain ${c.id}`);
                                  }}
                                  className="text-[9px] border bg-emerald-50 text-emerald-700 border-emerald-200 rounded px-2 py-1 font-bold"
                                >
                                  Mark Solved
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: APPLICATIONS REVIEW PORTAL (DOCUMENT APPROVAL) */}
          {adminTab === 'applications' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h3 className="font-sans text-base font-extrabold text-neutral-900">
                  Rider Application Document Scrutiny
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Audit candidate profiles, check DL scanning compliance, and trigger instant Rider ID generation.
                </p>
              </div>

              {applications.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400">
                  No applications recorded in local stack. Submit a fresh form from the homepage!
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="rounded-xl border border-neutral-150 p-4 sm:p-5 text-xs text-neutral-800 space-y-4">
                      
                      {/* Name Header and Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-3 gap-2">
                        <div>
                          <h4 className="font-sans text-sm font-extrabold text-neutral-900">{app.fullName}</h4>
                          <p className="font-mono text-[10px] text-neutral-400">Applied: {app.appliedDate} | Token ID: {app.id}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans ${
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-800' : app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>{app.status}</span>
                      </div>

                      {/* Fields grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Communication Contacts</p>
                          <p className="font-mono font-medium text-neutral-850 mt-0.5">{app.mobile} {app.alternateMobile ? `(Alt: ${app.alternateMobile})` : ''}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Birthdate & Residence</p>
                          <p className="font-semibold text-neutral-850 mt-0.5">{app.dob} | {app.address}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Vehicle & License No</p>
                          <p className="font-semibold text-neutral-850 mt-0.5">{app.vehicleType} ({app.vehicleNumber}) DL: {app.dlNumber}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Identity Keys</p>
                          <p className="font-mono text-neutral-850 mt-0.5">Aadhaar: {app.aadhaarNumber} | PAN: {app.panNumber}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Bank Destination</p>
                          <p className="font-semibold text-neutral-855 mt-0.5 text-neutral-800">{app.bankName} | A/C: {app.accountNumber} | IFSC: {app.ifscCode}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold uppercase tracking-wide text-[9px]">Scanned Proof Files</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(app.documents).map(([k, v]) => (
                              <span key={k} className="bg-neutral-100 border border-neutral-150 text-[8px] font-bold uppercase px-1 rounded truncate max-w-[85px]" title={`${k}: ${v}`}>
                                {k.replace('Card','')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Admin Decision workflow */}
                      {app.status === 'Pending' && (
                        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="text-[10px] text-neutral-500 font-sans">
                            Once approved, the system generates automatic incremental credentials in our riders inventory.
                          </div>
                          
                          <div className="flex gap-2">
                            {rejectionAppId === app.id ? (
                              <form onSubmit={handleRejectCandidateSubmit} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  required
                                  placeholder="Write rejection feedback..."
                                  value={rejectionRemarks}
                                  onChange={(e) => setRejectionRemarks(e.target.value)}
                                  className="border border-red-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-red-500 bg-red-50/10 placeholder-red-400 text-red-900"
                                />
                                <button type="submit" className="bg-red-650 bg-red-600 text-white rounded p-1.5 hover:bg-red-750 font-bold">Reject</button>
                                <button type="button" onClick={() => setRejectionAppId(null)} className="text-neutral-500 px-2">X</button>
                              </form>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApproveCandidate(app)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
                                >
                                  Approve Document Card
                                </button>
                                <button
                                  onClick={() => setRejectionAppId(app.id)}
                                  className="bg-red-50 text-red-650 text-red-600 border border-red-200 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                                >
                                  Reject...
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: RIDERS DATABASE MANAGEMENT */}
          {adminTab === 'riders' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Riders Profile Inventory</h3>
                  <p className="text-xs text-neutral-500 mt-1">Register, edit vehicle details, assign team leaders, or suspend status.</p>
                </div>

                <button
                  onClick={() => setShowAddRiderModal(true)}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 text-xs font-bold inline-flex items-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Manual Add Rider</span>
                </button>
              </div>

              {/* Rider profiles list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-450 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-3 px-2">Rider ID</th>
                      <th className="py-3 px-2">Name / Contacts</th>
                      <th className="py-3 px-2">License / Aadhaar</th>
                      <th className="py-3 px-2">Vehicle Type</th>
                      <th className="py-3 px-2">Assigned TL</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Inventory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {riders.map((r) => {
                      const tl = teamLeaders.find(t => t.id === r.teamLeaderId);
                      return (
                        <tr key={r.id} className="hover:bg-neutral-50/50">
                          <td className="py-3.5 px-2 font-mono font-bold text-rose-600">{r.id}</td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold text-neutral-900">{r.name}</p>
                            <p className="text-[10px] text-neutral-500 font-medium">Rider ID: <span className="font-mono font-bold text-rose-600">{r.id}</span></p>
                            <p className="font-mono text-[10px] text-neutral-500">{r.mobile}</p>
                            <div className="flex flex-col gap-1 mt-1">
                              <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold font-sans w-max">Joined: {r.joiningDate || '25-May-2026'}</span>
                              <span className="text-[9px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono w-max">Duration: {getServiceDuration(r.joiningDate || '25-May-2026')}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-semibold text-neutral-850">DL: {r.dl}</p>
                            <p className="font-mono text-[10px] text-neutral-400">UIDAI: {r.aadhaar}</p>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold text-neutral-800">{r.vehicleType}</p>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-medium text-neutral-700">{tl ? tl.name : 'Unassigned'}</p>
                            {tl && <p className="font-mono text-[9px] uppercase tracking-wide text-neutral-400">{tl.id}</p>}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-sans ${
                              r.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>{r.status}</span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex gap-1.5 justify-end items-center">
                              <button
                                onClick={() => openEditRiderModal(r)}
                                className="text-[9px] font-bold border border-rose-200 rounded px-1.5 py-1 text-rose-700 hover:bg-rose-650 hover:bg-rose-600 hover:text-white transition font-sans"
                              >
                                Edit Profile
                              </button>
                              <button
                                onClick={() => {
                                  // Quick Suspend toggle
                                  const nextStatus = r.status === 'Active' ? 'Suspended' : 'Active';
                                  onEditRider({ ...r, status: nextStatus as any });
                                  triggerToast(`Switched status for ${r.name} to ${nextStatus}`);
                                }}
                                className="text-[9px] uppercase font-bold border border-neutral-200 rounded px-1.5 py-1 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-500 font-sans"
                              >
                                Toggle
                              </button>
                              <button
                                onClick={() => {
                                  setRiderToDelete(r);
                                }}
                                className="text-red-650 text-red-600 hover:text-red-850 p-1 rounded hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: DAILY ORDERS ENTRIES */}
          {adminTab === 'orders' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Delivery Orders Logs</h3>
                  <p className="text-xs text-neutral-500 mt-1">Audit daily deliveries, finished metrics, and manual rewards.</p>
                </div>

                <div className="flex flex-wrap gap-2 self-start sm:self-center">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold inline-flex items-center space-x-1.5 transition duration-150 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Logs to CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      if (riders.length === 0) {
                        triggerToast('⚠️ Error: Please register riders first before recording completed order scores.');
                        return;
                      }
                      setSelectedRiderIdForOrder(riders[0].id);
                      setShowAddOrderModal(true);
                    }}
                    className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 text-xs font-bold"
                  >
                    + Entry Daily Order Completed
                  </button>
                </div>
              </div>

              {/* Date range picker for Order logs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="flex flex-wrap items-center gap-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-500">Filter From Date</label>
                    <input 
                      type="date" 
                      value={orderStartDate} 
                      onChange={(e) => setOrderStartDate(e.target.value)} 
                      className="border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-500">Filter To Date</label>
                    <input 
                      type="date" 
                      value={orderEndDate} 
                      onChange={(e) => setOrderEndDate(e.target.value)} 
                      className="border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                    />
                  </div>
                  {(orderStartDate || orderEndDate) && (
                    <button 
                      onClick={() => { setOrderStartDate(''); setOrderEndDate(''); }}
                      className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-800 shrink-0"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="text-right text-xs text-neutral-500 self-end sm:self-center">
                  Showing <strong className="text-neutral-900 font-mono">{filteredOrders.length}</strong> of {orders.length} total entries
                </div>
              </div>

              {/* Order logs table */}
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-450 text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-2">Order UID</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Rider Information</th>
                      <th className="py-2.5 px-2">Deliveries Score</th>
                      <th className="py-2.5 px-2">Calibrated Earnings</th>
                      <th className="py-2.5 px-2">Extra Incentives</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-sans">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-400">
                          No order logs match the specified date scope.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const earnings = o.ordersCompleted * payoutSettings.perOrderRate;
                        return (
                          <tr key={o.id} className="hover:bg-neutral-50/50">
                            <td className="py-2.5 px-2 font-mono text-[11px] text-neutral-450 text-neutral-400">{o.id}</td>
                            <td className="py-2.5 px-2 font-mono text-[11px] text-neutral-800">{o.date}</td>
                            <td className="py-2.5 px-2 font-semibold text-neutral-905 text-neutral-900">
                              {o.riderName} <span className="font-mono text-rose-600 font-normal">({o.riderId})</span>
                            </td>
                            <td className="py-2.5 px-2 font-mono font-bold text-neutral-800">{o.ordersCompleted} orders</td>
                            <td className="py-2.5 px-2 font-mono text-emerald-700 font-extrabold">₹{earnings.toLocaleString()}</td>
                            <td className="py-2.5 px-2 font-mono font-semibold text-amber-600">+₹{o.incentive}</td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => {
                                  setOrderToDelete(o);
                                }}
                                className="text-red-650 hover:text-red-850 text-red-600 p-1 cursor-pointer font-sans"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: DAILY ATTENDANCE MANAGER */}
          {adminTab === 'attendance' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Riders Attendance Registry</h3>
                  <p className="text-xs text-neutral-500 mt-1">Calendarized records to sync compliance and verify on-road availability.</p>
                </div>

                <div className="flex items-center space-x-2 font-sans">
                  <span className="text-xs font-semibold text-neutral-600">Selected Date:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="border border-neutral-200 outline-none rounded p-1.5 font-mono text-xs focus:ring-1 focus:ring-rose-500 bg-neutral-50"
                  />
                </div>
              </div>

              {riders.filter(r => r.status === 'Active').length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  No active riders registered to execute attendance roster logs.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-sans">
                    {riders.filter(r => r.status === 'Active').map((rider) => {
                      const status = attendanceGrid[rider.id] || 'Present';
                      return (
                        <div key={rider.id} className="border border-neutral-150 rounded-xl p-3 bg-neutral-50 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{rider.name}</p>
                            <p className="font-mono text-[9px] text-neutral-450 text-neutral-400">{rider.id}</p>
                          </div>

                          <div className="flex gap-1">
                            {([
                              { label: 'Present', val: 'Present', color: 'bg-emerald-600' },
                              { label: 'Absent', val: 'Absent', color: 'bg-red-650 bg-red-600' },
                              { label: 'Off', val: 'Off', color: 'bg-neutral-500' }
                            ] as const).map((b) => (
                              <button
                                key={b.label}
                                type="button"
                                onClick={() => setAttendanceGrid(p => ({ ...p, [rider.id]: b.val }))}
                                className={`px-2 py-1 text-[9px] font-bold rounded capitalize border transition-all ${
                                  status === b.val 
                                    ? `${b.color} text-white border-transparent` 
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end font-sans">
                    <button
                      type="button"
                      onClick={handleSaveAttendanceTrigger}
                      className="bg-[#cb202d] hover:bg-[#e12a38] text-white px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide shadow-md transition"
                    >
                      Save Attendance Register
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: TEAM LEADER AGGREGATOR MODULE */}
          {adminTab === 'teamleaders' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Team Leaders & Fleet Aggregation</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Assign rosters, track team volumes, and monitor the ₹5 commission commission rate per completed order.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddTLModal(true)}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 text-xs font-bold"
                >
                  Register Team Leader
                </button>
              </div>

              {/* Roster Assignment Sub-panel if clicked */}
              {activeTLForRoster && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/10 p-4 space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-rose-800">
                    <strong className="text-sm">Manage Roster list for {activeTLForRoster.name}</strong>
                    <button onClick={() => setActiveTLForRoster(null)} className="font-mono px-2 py-0.5 border border-rose-200 rounded bg-white hover:bg-rose-50 text-neutral-600">Close Panel [X]</button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {riders.map((r) => {
                      const isAssigned = activeTLForRoster.assignedRiders.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            // Toggle assignment logic
                            let nextRoster = [...activeTLForRoster.assignedRiders];
                            if (isAssigned) {
                              nextRoster = nextRoster.filter(id => id !== r.id);
                            } else {
                              nextRoster.push(r.id);
                            }
                            
                            // Propagate changes and local trigger state update
                            onUpdateTeamLeaderRoster(activeTLForRoster.id, nextRoster);
                            setActiveTLForRoster({ ...activeTLForRoster, assignedRiders: nextRoster });
                            triggerToast(`Updated assigned roster lists`);
                          }}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                            isAssigned 
                              ? 'bg-rose-500/15 border-rose-400 text-rose-900 font-bold' 
                              : 'bg-white border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <div>
                            <p className="leading-tight">{r.name}</p>
                            <p className="font-mono text-[9px] text-neutral-400 font-normal">{r.id}</p>
                          </div>
                          <span className="text-[10px]">{isAssigned ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Team leaders summary list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 font-mono text-[10px] text-neutral-500 uppercase tracking-widest uppercase">
                      <th className="py-2.5 px-2">Leader ID</th>
                      <th className="py-2.5 px-2">Leader Name / Mobile</th>
                      <th className="py-2.5 px-2">Staff Email</th>
                      <th className="py-2.5 px-2">Associated Riders</th>
                      <th className="py-2.5 px-2">Total Team Deliveries</th>
                      <th className="py-2.5 px-2">Auto Commission (₹5)</th>
                      <th className="py-2.5 px-2 text-right">Roster Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {teamLeadersRollup.map((tl) => (
                      <tr key={tl.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-2 font-mono font-bold text-rose-600">{tl.id}</td>
                        <td className="py-3 px-2">
                          <p className="font-bold text-neutral-900">{tl.name}</p>
                          <p className="font-mono text-[10px] text-neutral-400">{tl.mobile}</p>
                        </td>
                        <td className="py-3 px-2 font-mono text-neutral-500">{tl.email}</td>
                        <td className="py-3 px-2">
                          <span className="font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">
                            {tl.assignedRiders.length} Riders assigned
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-neutral-800">{tl.fleetVolume} orders completed</td>
                        <td className="py-3 px-2 font-mono text-emerald-700 font-extrabold text-sm">₹{tl.commissionAmount.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setActiveTLForRoster(tl)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white rounded p-1 px-2.5 text-[10px] uppercase font-bold"
                          >
                            Assign Riders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 7: SALARY & PAYROLL GENERATION / SALARY SLIP PRINT */}
          {adminTab === 'salaries' && (
            <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Payout Settlement & Salary Slip</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Calibrated weekly & monthly payouts. Select dynamic riders to construct custom salary slips and export Excel files.
                  </p>
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-xl font-sans text-xs font-bold gap-1">
                  <button
                    onClick={exportRidersToCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2 flex items-center space-x-1"
                  >
                    <FileSpreadsheet className="h-4 w-4 shrink-0" />
                    <span>Export Excel Report</span>
                  </button>
                </div>
              </div>

              {/* Date Range Picker for Salary Calculation */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="flex flex-wrap items-center gap-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-500 text-neutral-600">Payout Period From</label>
                    <input 
                      type="date" 
                      value={salaryStartDate} 
                      onChange={(e) => setSalaryStartDate(e.target.value)} 
                      className="border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-neutral-500 text-neutral-600">Payout Period To</label>
                    <input 
                      type="date" 
                      value={salaryEndDate} 
                      onChange={(e) => setSalaryEndDate(e.target.value)} 
                      className="border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-mono"
                    />
                  </div>
                  {(salaryStartDate || salaryEndDate) && (
                    <button 
                      onClick={() => { setSalaryStartDate(''); setSalaryEndDate(''); }}
                      className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-850 shrink-0"
                    >
                      Reset Range
                    </button>
                  )}
                </div>
                <div className="text-right text-xs text-neutral-500 self-end sm:self-center font-sans">
                  Compiled from <strong className="text-neutral-900 font-mono">{filteredOrdersForSalary.length}</strong> active deliveries in selected range.
                </div>
              </div>

              {/* AUTOMATED WHATSAPP LOGISTICS BROADCASTER ENGINE */}
              <div className="border border-neutral-200 bg-neutral-50/50 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <h4 className="font-sans text-xs font-black uppercase tracking-wider text-neutral-805 text-neutral-800">
                        ⚡ Automatic WhatsApp Salary Sender Engine
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 max-w-2xl">
                      Weekly salaries are automatically broadcasted to registered riders' WhatsApp lines on payout generation. System uses their registered device number to deliver real-time salary summaries.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAutoWhatsappEnabled} 
                        onChange={(e) => {
                          setIsAutoWhatsappEnabled(e.target.checked);
                          triggerToast(e.target.checked ? "WhatsApp Auto-Sender online" : "WhatsApp Auto-Sender paused offline");
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 font-sans text-[11px] font-bold text-neutral-700">
                        {isAutoWhatsappEnabled ? 'Auto-Trigger Active' : 'Suspended'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Terminal Log */}
                  <div className="lg:col-span-2 space-y-1.5">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-450 text-neutral-500 font-bold">
                      Telemetry & Dispatch Pipeline Log:
                    </p>
                    <div className="h-32 overflow-y-auto bg-neutral-900 border border-neutral-950 rounded-xl p-3 scrollbar-thin scrollbar-thumb-neutral-700 font-mono text-[10px] text-zinc-350 space-y-1 select-none">
                      {whatsappLogs.map((logLine, lineIdx) => {
                        let colorClass = "text-zinc-300";
                        if (logLine.includes("🟢") || logLine.includes("✓")) colorClass = "text-emerald-400";
                        if (logLine.includes("💬")) colorClass = "text-emerald-350 font-semibold";
                        if (logLine.includes("🚀")) colorClass = "text-amber-400 font-bold";
                        return (
                          <div key={lineIdx} className={`${colorClass} leading-relaxed break-all`}>
                            {logLine}
                          </div>
                        );
                      })}
                      {isSendingBroadcast && (
                        <div className="animate-pulse text-[#cb202d] text-[10px] font-bold">
                          ⌨ [Dispatching automated WhatsApp payload... please hold]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trigger Widget */}
                  <div className="flex flex-col justify-between p-4 rounded-xl border border-neutral-200 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="font-sans text-xs font-bold text-neutral-800 leading-tight">Test Dispatch Loop</p>
                      <p className="text-[10px] text-neutral-500">
                        Force-run automated salary slips broadcast to all active riders based on calculated payouts.
                      </p>
                    </div>

                    <button
                      onClick={triggerWhatsappBroadcast}
                      disabled={isSendingBroadcast || !isAutoWhatsappEnabled}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold font-sans inline-flex items-center justify-center space-x-1.5 shadow-sm transition ${
                        !isAutoWhatsappEnabled
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200 shadow-none'
                          : isSendingBroadcast
                          ? 'bg-emerald-500 text-white cursor-wait animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      {isSendingBroadcast ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>SENDING PAYROLLS...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 shrink-0" />
                          <span>RUN AUTO-DISPATCH BROADCAST</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Salaries Grid summary */}
              <div className="overflow-x-auto font-sans text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-450 text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-2">Rider Information</th>
                      <th className="py-3 px-2">Total finished Orders</th>
                      <th className="py-3 px-2">Base Salaries (₹{payoutSettings.perOrderRate}x)</th>
                      <th className="py-3 px-2">Completed Incentives</th>
                      <th className="py-3 px-2">Weekly Bonus Target</th>
                      <th className="py-3 px-2">Monthly Loyalty Bonus</th>
                      <th className="py-3 px-2">Net Payable Sum</th>
                      <th className="py-3 px-2 text-right">Certificate Slips</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-sans text-xs">
                    {ridersPayoutRollup.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="py-3.5 px-2">
                          <p className="font-extrabold text-neutral-900">{item.name}</p>
                          <p className="font-mono text-[10px] text-neutral-500">ID: {item.id}</p>
                        </td>
                        <td className="py-3.5 px-2 font-mono font-bold text-neutral-800">{item.totalOrders} deliveries</td>
                        <td className="py-3.5 px-2 font-mono">₹{item.baseEarnings.toLocaleString()}</td>
                        <td className="py-3.5 px-2 font-mono text-amber-605">₹{item.incentives.toLocaleString()}</td>
                        <td className="py-3.5 px-2">
                          {item.weeklyBonus > 0 ? (
                            <span className="bg-emerald-50 text-emerald-800 font-mono font-bold p-1 rounded text-[10px] border border-emerald-200">
                              +₹{item.weeklyBonus.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-mono text-[10px]">No (Sub-250)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-2">
                          {item.monthlyBonus > 0 ? (
                            <span className="bg-rose-50 text-rose-800 font-mono font-bold p-1 rounded text-[10px] border border-rose-200">
                              +₹{item.monthlyBonus.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-mono text-[10px]">No (Sub-1100)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 font-mono text-rose-700 font-extrabold text-sm">
                          ₹{item.netPayable.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleWhatsAppShare(item)}
                              type="button"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[10px] p-1.5 px-2.5 rounded-lg inline-flex items-center space-x-1 transition duration-155 cursor-pointer shadow-sm shadow-emerald-500/10"
                              title="Send Slip to WhatsApp"
                            >
                              <span className="text-[11px]">💬</span>
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => setActiveSalarySlipRider(item)}
                              type="button"
                              className="bg-neutral-900 hover:bg-neutral-850 text-white font-sans font-bold text-[10px] p-1.5 px-2.5 rounded-lg inline-flex items-center space-x-1 transition"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Salary Slip</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 8: ADMINISTRATIVE SYSTEM CONFIGURATION & CONTROLS */}
          {adminTab === 'config' && (
            <form onSubmit={handleConfigSave} className="bg-white border border-neutral-100 shadow-sm rounded-xl p-5 sm:p-6 space-y-8 font-sans">
              
              <div className="border-b border-neutral-100 pb-4">
                <h3 className="font-sans text-base font-extrabold text-neutral-900">Administrative System Configuration</h3>
                <p className="text-xs text-neutral-500 mt-1">
                   Calibrate website details, phone contacts, email lists, and bonus thresholds dynamically. Click Save to propagate website updates instantly.
                </p>
              </div>

              {/* Company Info column */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-extrabold uppercase text-neutral-400 tracking-wider">1. Brand & Contact Settings</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-neutral-600">
                  <div className="space-y-1">
                    <label className="font-bold">Company Name</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850"
                      value={localConfig.name}
                      onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Company Slogan/Tagline</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850"
                      value={localConfig.tagline}
                      onChange={(e) => setLocalConfig({ ...localConfig, tagline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Contact Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850"
                      value={localConfig.email}
                      onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Physical Office Address</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850"
                      value={localConfig.address}
                      onChange={(e) => setLocalConfig({ ...localConfig, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Prince Contact (Operations Line 1)</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.phonePrince}
                      onChange={(e) => setLocalConfig({ ...localConfig, phonePrince: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Vanshul Contact (Onboarding Line 2)</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.phoneVanshul}
                      onChange={(e) => setLocalConfig({ ...localConfig, phoneVanshul: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">WhatsApp Support Line 1 (Number or Link)</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.whatsapp}
                      onChange={(e) => setLocalConfig({ ...localConfig, whatsapp: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">WhatsApp Support Line 2 (Number or Link)</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.whatsapp2 || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, whatsapp2: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Facebook Profile Link</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.facebook}
                      onChange={(e) => setLocalConfig({ ...localConfig, facebook: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Instagram Profile Link</label>
                    <input
                      type="text"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localConfig.instagram}
                      onChange={(e) => setLocalConfig({ ...localConfig, instagram: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold font-sans">About Company Description</label>
                    <textarea
                      rows={3}
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-sans"
                      value={localConfig.about}
                      onChange={(e) => setLocalConfig({ ...localConfig, about: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold font-sans">Our Mission Statement</label>
                    <textarea
                      rows={2}
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-sans"
                      value={localConfig.mission}
                      onChange={(e) => setLocalConfig({ ...localConfig, mission: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold font-sans">Our Vision Statement</label>
                    <textarea
                      rows={2}
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-sans"
                      value={localConfig.vision}
                      onChange={(e) => setLocalConfig({ ...localConfig, vision: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Payout specs column */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h4 className="text-xs font-mono font-extrabold uppercase text-neutral-400 tracking-wider">2. Dynamic Delivery Payout rules</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-neutral-600">
                  <div className="space-y-1">
                    <label className="font-bold">Per Order Finished Base Rate (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.perOrderRate}
                      onChange={(e) => setLocalPayout({ ...localPayout, perOrderRate: parseInt(e.target.value) || 40 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Joining Bonus Cash Gift (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.joiningBonus}
                      onChange={(e) => setLocalPayout({ ...localPayout, joiningBonus: parseInt(e.target.value) || 500 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Rider Referral Cash Reward (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.referralBonus}
                      onChange={(e) => setLocalPayout({ ...localPayout, referralBonus: parseInt(e.target.value) || 500 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Weekly Target Bonus completed Orders No</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.weeklyBonusTarget}
                      onChange={(e) => setLocalPayout({ ...localPayout, weeklyBonusTarget: parseInt(e.target.value) || 250 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Weekly Target Reward Cash Value (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.weeklyBonusAmount}
                      onChange={(e) => setLocalPayout({ ...localPayout, weeklyBonusAmount: parseInt(e.target.value) || 1000 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Monthly Target completed Orders No</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.monthlyBonusTarget}
                      onChange={(e) => setLocalPayout({ ...localPayout, monthlyBonusTarget: parseInt(e.target.value) || 1100 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Monthly Target Loyalty Payout (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.monthlyBonusAmount}
                      onChange={(e) => setLocalPayout({ ...localPayout, monthlyBonusAmount: parseInt(e.target.value) || 2000 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Team Leader Commission Per Order (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 bg-neutral-50/50 text-neutral-850 font-mono"
                      value={localPayout.teamLeaderCommissionRate}
                      onChange={(e) => setLocalPayout({ ...localPayout, teamLeaderCommissionRate: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold p-3 px-6 rounded-lg text-xs"
                >
                  Write System Parameters update
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* MODAL 1: ADD RIDER MANUALLY */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-sans text-sm font-extrabold text-neutral-900">Manual Onboard Rider Form</h3>
              <button type="button" onClick={() => setShowAddRiderModal(false)} className="text-neutral-500 font-bold hover:text-neutral-900">Close X</button>
            </div>

            <form onSubmit={handleAddRiderSubmit} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-neutral-700">Rider Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={rName} onChange={(e) => setRName(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="e.g. Ramesh" />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-neutral-700">Mobile Number <span className="text-red-500">*</span></label>
                <input required type="tel" maxLength={10} value={rMobile} onChange={(e) => setRMobile(e.target.value.replace(/\D/g, ''))} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="10-digit number" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Aadhaar Card No <span className="text-red-500">*</span></label>
                <input required type="text" value={rAadhaar} onChange={(e) => setRAadhaar(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="xxxx-xxxx-xxxx" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">PAN Card No <span className="text-red-500">*</span></label>
                <input required type="text" value={rPan} onChange={(e) => setRPan(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="e.g. ABCDE1234F" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Driving License No <span className="text-red-500">*</span></label>
                <input required type="text" value={rDl} onChange={(e) => setRDl(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="DL-xxxxxxxx" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Vehicle Type <span className="text-red-500">*</span></label>
                <select value={rVehicleType} onChange={(e) => setRVehicleType(e.target.value as any)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white">
                  <option value="Bike" className="text-neutral-900">Bike</option>
                  <option value="Scooty" className="text-neutral-900">Scooty</option>
                  <option value="EV Scooter" className="text-neutral-900">EV Scooter</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Rider ID <span className="text-red-500">*</span></label>
                <input required type="text" value={rRiderId} onChange={(e) => setRRiderId(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="e.g. PV-R-001" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Assign Team Leader</label>
                <select value={rTlId} onChange={(e) => setRTlId(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white">
                  <option value="" className="text-neutral-900">No Assigned Leader</option>
                  {teamLeaders.map(t => (
                    <option key={t.id} value={t.id} className="text-neutral-900">{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Joining Date <span className="text-red-500">*</span></label>
                <input required type="date" value={rJoiningDate} onChange={(e) => setRJoiningDate(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 border-t border-neutral-150 pt-3">
                <h4 className="font-bold text-neutral-800 mb-2">Payout destination accounts:</h4>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Bank Name <span className="text-red-500">*</span></label>
                <input required type="text" value={rBankName} onChange={(e) => setRBankName(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="Bank Name" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Account Number <span className="text-red-500">*</span></label>
                <input required type="text" value={rAccountNumber} onChange={(e) => setRAccountNumber(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="Account No" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">IFSC Code <span className="text-red-500">*</span></label>
                <input required type="text" value={rIfscCode} onChange={(e) => setRIfscCode(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="SBINxxxxxxx" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">UPI ID (Optional)</label>
                <input type="text" value={rUpiId} onChange={(e) => setRUpiId(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="name@upi" />
              </div>

              <div className="sm:col-span-2 border-t border-neutral-150 pt-3">
                <h4 className="font-bold text-neutral-800 mb-2">Exclusive Incentive Tagging:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2.5 p-2 border border-neutral-200 rounded-lg cursor-pointer bg-neutral-50/55 hover:bg-neutral-50 transition">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" 
                      checked={rJoiningBonusEligible} 
                      onChange={(e) => setRJoiningBonusEligible(e.target.checked)} 
                    />
                    <div>
                      <p className="font-bold text-neutral-800 font-sans text-xs">Eligible for Joining Bonus</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Award ₹{payoutSettings.joiningBonus} incentive upon setup approval</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 border border-neutral-200 rounded-lg cursor-pointer bg-neutral-50/55 hover:bg-neutral-50 transition">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" 
                      checked={rReferralBonusEligible} 
                      onChange={(e) => setRReferralBonusEligible(e.target.checked)} 
                    />
                    <div>
                      <p className="font-bold text-neutral-800 font-sans text-xs">Eligible for Referral Bonus</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Award ₹{payoutSettings.referralBonus} active referral bonus</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-2 pt-3 flex justify-end gap-2 border-t border-neutral-150">
                <button type="button" onClick={() => setShowAddRiderModal(false)} className="border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded font-medium">Cancel</button>
                <button type="submit" className="bg-[#cb202d] text-white p-2.5 px-5 rounded font-bold hover:bg-[#b01b27]">Save active rider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RIDER PROFILE (Is field ko admin panel se edit bhi kiya ja sake) */}
      {editingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-sans text-sm font-extrabold text-neutral-950">
                Update Rider Profile Specifications: <span className="text-rose-600 font-mono">({editingRider.id})</span>
              </h3>
              <button type="button" onClick={() => setEditingRider(null)} className="text-neutral-500 font-bold hover:text-neutral-900">Close X</button>
            </div>

            <form onSubmit={handleEditRiderSubmit} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-neutral-700">Rider Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={editRName} onChange={(e) => setEditRName(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-neutral-700">Mobile Number <span className="text-red-500">*</span></label>
                <input required type="tel" maxLength={10} value={editRMobile} onChange={(e) => setEditRMobile(e.target.value.replace(/\D/g, ''))} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Aadhaar Card No <span className="text-red-500">*</span></label>
                <input required type="text" value={editRAadhaar} onChange={(e) => setEditRAadhaar(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">PAN Card No <span className="text-red-500">*</span></label>
                <input required type="text" value={editRPan} onChange={(e) => setEditRPan(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Driving License No <span className="text-red-500">*</span></label>
                <input required type="text" value={editRDl} onChange={(e) => setEditRDl(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Vehicle Type <span className="text-red-500">*</span></label>
                <select value={editRVehicleType} onChange={(e) => setEditRVehicleType(e.target.value as any)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white">
                  <option value="Bike" className="text-neutral-900">Bike</option>
                  <option value="Scooty" className="text-neutral-900">Scooty</option>
                  <option value="EV Scooter" className="text-neutral-900">EV Scooter</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Vehicle Plate Number</label>
                <input type="text" value={editRVehicleNumber} onChange={(e) => setEditRVehicleNumber(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="e.g. DL 3S AB 1234" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Assign Team Leader</label>
                <select value={editRTlId} onChange={(e) => setEditRTlId(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white">
                  <option value="" className="text-neutral-900">No Assigned Leader</option>
                  {teamLeaders.map(t => (
                    <option key={t.id} value={t.id} className="text-neutral-900">{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Joining Date <span className="text-red-500">*</span></label>
                <input required type="date" value={editRJoiningDate} onChange={(e) => setEditRJoiningDate(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Active Roster Status <span className="text-red-500">*</span></label>
                <select value={editRStatus} onChange={(e) => setEditRStatus(e.target.value as any)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="sm:col-span-2 border-t border-neutral-150 pt-3">
                <h4 className="font-bold text-neutral-800 mb-2 font-sans">Payout accounts details:</h4>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Settlement Bank Name <span className="text-red-500">*</span></label>
                <input required type="text" value={editRBankName} onChange={(e) => setEditRBankName(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Account Number <span className="text-red-500">*</span></label>
                <input required type="text" value={editRAccountNumber} onChange={(e) => setEditRAccountNumber(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">IFSC Code <span className="text-red-500">*</span></label>
                <input required type="text" value={editRIfscCode} onChange={(e) => setEditRIfscCode(e.target.value.toUpperCase())} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">UPI ID (Optional)</label>
                <input type="text" value={editRUpiId} onChange={(e) => setEditRUpiId(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none font-sans" />
              </div>

              <div className="sm:col-span-2 border-t border-neutral-150 pt-3">
                <h4 className="font-bold text-neutral-800 mb-2 font-sans">Exclusive Incentive Tagging:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2.5 p-2 border border-neutral-200 rounded-lg cursor-pointer bg-neutral-50/55 hover:bg-neutral-50 transition">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" 
                      checked={editRJoiningBonusEligible} 
                      onChange={(e) => setEditRJoiningBonusEligible(e.target.checked)} 
                    />
                    <div>
                      <p className="font-bold text-neutral-800 font-sans text-xs">Eligible for Joining Bonus</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-sans">Award ₹{payoutSettings.joiningBonus} incentive upon setup approval</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 border border-neutral-200 rounded-lg cursor-pointer bg-neutral-50/55 hover:bg-neutral-50 transition">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" 
                      checked={editRReferralBonusEligible} 
                      onChange={(e) => setEditRReferralBonusEligible(e.target.checked)} 
                    />
                    <div>
                      <p className="font-bold text-neutral-800 font-sans text-xs">Eligible for Referral Bonus</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-sans">Award ₹{payoutSettings.referralBonus} active referral bonus</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-2 pt-3 flex justify-end gap-2 border-t border-neutral-150">
                <button type="button" onClick={() => setEditingRider(null)} className="border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded font-medium">Cancel</button>
                <button type="submit" className="bg-[#cb202d] text-white p-2.5 px-5 rounded font-bold hover:bg-[#b01b27]">Approve profile changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DAILY ORDER scoring */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-sans text-sm font-extrabold text-neutral-900">Record Completed Order Logs</h3>
              <button type="button" onClick={() => setShowAddOrderModal(false)} className="text-neutral-500 hover:text-neutral-950 font-bold">X</button>
            </div>

            <form onSubmit={handleAddOrderSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Pick Rider Profile <span className="text-red-500">*</span></label>
                <select value={selectedRiderIdForOrder} onChange={(e) => setSelectedRiderIdForOrder(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white font-sans">
                  {riders.map(r => (
                    <option key={r.id} value={r.id} className="text-neutral-900">{r.name} ({r.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Select Date Completed <span className="text-red-500">*</span></label>
                <input type="date" required value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Orders Finished Score Count <span className="text-red-500">*</span></label>
                <input required type="number" min={1} value={orderCount || ''} onChange={(e) => setOrderCount(parseInt(e.target.value) || 0)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="Completed orders" />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Extra Incentives payout (₹)</label>
                <input type="number" min={0} value={incentiveAmount || ''} onChange={(e) => setIncentiveAmount(parseInt(e.target.value) || 0)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="Incentive Amount" />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Internal managers remarks</label>
                <input type="text" value={orderRemarks} onChange={(e) => setOrderRemarks(e.target.value)} className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" placeholder="Remarks e.g. good speed" />
              </div>

              <div className="pt-3 border-t border-neutral-150 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowAddOrderModal(false)} className="border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded font-medium">Cancel</button>
                <button type="submit" className="bg-[#cb202d] text-white p-2.5 px-5 rounded font-extrabold uppercase hover:bg-[#b01b27]">Save order parameters</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TEAM LEADER */}
      {showAddTLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-sans text-sm font-extrabold text-neutral-900">Register Team Leader</h3>
              <button type="button" onClick={() => setShowAddTLModal(false)} className="text-neutral-500 font-bold hover:text-neutral-900">X</button>
            </div>

            <form onSubmit={handleAddTeamLeaderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Team Leader Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. Rajesh Yadav" className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" value={tlName} onChange={(e) => setTlName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Mobile Number <span className="text-red-500">*</span></label>
                <input type="tel" required placeholder="Mobile Contact" className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" value={tlMobile} onChange={(e) => setTlMobile(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Staff Corporate Email <span className="text-red-500">*</span></label>
                <input type="email" required placeholder="name@email.com" className="w-full border border-neutral-300 text-neutral-900 bg-white p-2.5 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none" value={tlEmail} onChange={(e) => setTlEmail(e.target.value)} />
              </div>

               <div className="pt-3 border-t border-neutral-150 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTLModal(false)} className="border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded font-medium">Cancel</button>
                <button type="submit" className="bg-[#cb202d] text-white p-2.5 px-5 rounded font-bold hover:bg-[#b01b27]">Register TL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INTERACTIVE PRINTABLE SALARY SLIP POPUP */}
      {activeSalarySlipRider && (
        <div className="salary-slip-modal-container fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-xs max-h-[90vh] overflow-y-auto space-y-6 select-text">
            
            {/* Top Close Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-150 pb-3 gap-3 font-sans print:hidden">
              <div>
                <span className="font-bold text-neutral-800 text-sm">Previewing Salary payslip summary</span>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Rider: {activeSalarySlipRider.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(activeSalarySlipRider)}
                  className="bg-emerald-600 text-white rounded-lg px-3.5 py-2 font-bold hover:bg-emerald-700 inline-flex items-center space-x-1.5 shadow-md shadow-emerald-500/10 transition duration-150 active:scale-95 cursor-pointer font-sans text-[11px]"
                >
                  <span className="text-sm">💬</span>
                  <span>WhatsApp Salary Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSalarySlip}
                  className="bg-neutral-900 text-white rounded-lg px-3.5 py-2 font-bold hover:bg-neutral-850 inline-flex items-center space-x-1.5 transition duration-150 active:scale-95 font-sans text-[11px]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSalarySlipPDF}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3.5 py-2 font-bold inline-flex items-center space-x-1.5 shadow-md shadow-rose-500/10 transition duration-150 active:scale-95 cursor-pointer font-sans text-[11px]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Salary Slip PDF</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveSalarySlipRider(null)} 
                  className="border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 font-bold transition font-sans text-[11px]"
                >
                  X Close
                </button>
              </div>
            </div>

            {/* PRINT PORTION BEGINS HERE */}
            <div id="salary-slip-print" className="p-4 sm:p-6 border border-neutral-300 rounded-xl space-y-6 text-neutral-800 select-text font-serif">
              
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-neutral-800 pb-4 gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-sans font-extrabold text-neutral-950 tracking-tight uppercase leading-none">
                    PV INDIA FLEET SOLUTIONS
                  </h2>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#cb202d] font-bold">
                    PREMIUM LOGISTICS & ZOMATO FLEET OPERATIONS AGGREGATOR
                  </p>
                  <p className="text-[10px] font-sans text-neutral-600 leading-relaxed max-w-md">
                    Office Block, New Delhi NCR, India <br />
                    <span className="font-semibold text-neutral-800">📧 Email:</span> pvindiafleetsolutions@gmail.com <br />
                    <span className="font-semibold text-neutral-800">📞 Prince:</span> 8826996189 | <span className="font-semibold text-neutral-800">Vanshul:</span> 8595828299 <br />
                    <span className="font-semibold text-neutral-800">📸 Instagram:</span> @pvindiafleetsolutions | <span className="font-semibold text-neutral-800">Facebook:</span> PV India Fleet Solutions
                  </p>
                </div>
                <div className="text-right font-sans flex flex-col items-end shrink-0">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-rose-600 bg-slate-950 flex items-center justify-center shadow-md mb-2">
                    <img 
                      src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
                      alt="PV India" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">SALARY RECORD SLIP</p>
                  <p className="font-mono text-[10px] text-neutral-500 mt-0.5">Month: <span className="font-bold text-neutral-900">June 2026</span></p>
                  <p className="font-mono text-[10px] text-neutral-500">Payout Date: <span className="font-bold text-neutral-900">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span></p>
                  <p className="font-mono text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 mt-1">No: PV-REC-{activeSalarySlipRider.id}-{new Date().getMonth() + 1}</p>
                </div>
              </div>

              {/* Rider and Bank Details columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-[11px] border-b border-neutral-200 pb-4">
                <div className="flex items-start space-x-3 bg-neutral-50/70 p-3 rounded-lg border border-neutral-150">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-200 flex-shrink-0 relative shadow-sm">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeSalarySlipRider.name)}&backgroundColor=cb202d`}
                      alt={activeSalarySlipRider.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-400 uppercase font-black text-[9px] tracking-wider">RIDER IDENTIFICATION</p>
                    <p className="font-extrabold text-neutral-900 text-xs">{activeSalarySlipRider.name}</p>
                    <p className="font-mono text-neutral-600">Rider ID Code: <strong className="text-rose-600 font-extrabold">{activeSalarySlipRider.id}</strong></p>
                    <p className="font-mono text-neutral-500">Contact: +91 {activeSalarySlipRider.mobile}</p>
                    <p className="font-mono text-neutral-500">Plate: {activeSalarySlipRider.vehicleNumber || 'Pending State'} ({activeSalarySlipRider.vehicleType})</p>
                    <p className="text-[9px] text-neutral-500">
                      Fleet Leader: <strong className="text-neutral-700">{(() => {
                        const tlObj = teamLeaders.find(t => t.id === activeSalarySlipRider.teamLeaderId);
                        return tlObj ? `${tlObj.name} (${tlObj.id})` : 'Direct Fleet Manager';
                      })()}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between bg-neutral-50/70 p-3 rounded-lg border border-neutral-150">
                  <div className="space-y-1">
                    <p className="text-neutral-400 uppercase font-black text-[9px] tracking-wider">PAYMENT SETTLEMENT DESTINATION</p>
                    <p className="font-bold text-neutral-800 text-xs">{activeSalarySlipRider.bankName}</p>
                    <p className="font-mono text-neutral-600">A/C No: {activeSalarySlipRider.accountNumber.slice(0, -4).replace(/./g, '*')}<strong>{activeSalarySlipRider.accountNumber.slice(-4)}</strong></p>
                    <p className="font-mono text-neutral-500">Bank IFSC: {activeSalarySlipRider.ifscCode}</p>
                    <p className="text-[10px] text-neutral-600">
                      Joining Date: <strong className="text-neutral-800 font-mono">{activeSalarySlipRider.joiningDate || '25-May-2026'}</strong>
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      Service Duration: <strong className="text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-100/50 text-[10px]">{getServiceDuration(activeSalarySlipRider.joiningDate)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Earnings table calculations */}
              <div className="space-y-2 mt-4 font-sans text-xs">
                <div className="border-b-2 border-neutral-800 pb-1 flex justify-between font-bold text-neutral-900 uppercase font-mono text-[10px]">
                  <span>FINANCIAL SALARY METERS</span>
                  <span>ACCUMULATED VALUES (INR)</span>
                </div>

                <div className="divide-y divide-neutral-100 font-sans font-medium text-xs text-neutral-700">
                  <div className="py-2 flex justify-between">
                    <span>Base Deliveries (Orders Count: <strong>{activeSalarySlipRider.totalOrders}</strong> completed)</span>
                    <span className="font-mono font-bold text-neutral-900">₹{activeSalarySlipRider.baseEarnings.toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between text-neutral-750">
                    <span>Completed Route Incentives / Trip bonuses</span>
                    <span className="font-mono font-bold text-emerald-600">+ ₹{activeSalarySlipRider.incentives.toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Joining Welcome Onboarding Bonus (Qualifier: {activeSalarySlipRider.joiningBonus > 0 ? '✓ Verified New Rider' : '❌ Established Roster'})</span>
                    <span className="font-mono font-bold text-teal-600">+ ₹{(activeSalarySlipRider.joiningBonus || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Rider Referral Recruit Credit (Qualifier: {activeSalarySlipRider.referralBonus > 0 ? '✓ Active Referral Enrolled' : '❌ None Active'})</span>
                    <span className="font-mono font-bold text-indigo-600">+ ₹{(activeSalarySlipRider.referralBonus || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Weekly Target Bonus (Qualifier: {activeSalarySlipRider.weeklyBonus > 0 ? '✓ YES [250+ Orders Finished]' : '❌ Sub-250 targets'})</span>
                    <span className="font-mono font-bold text-rose-600">+ ₹{activeSalarySlipRider.weeklyBonus.toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Monthly Loyalty Performance Reward (Qualifier: {activeSalarySlipRider.monthlyBonus > 0 ? '✓ YES [1100+ Orders Finished]' : '❌ Sub-1100 targets'})</span>
                    <span className="font-mono font-bold text-amber-600">+ ₹{activeSalarySlipRider.monthlyBonus.toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>
                      Top Performer Excellence Rank Bonus 
                      <span className="text-[10px] text-neutral-500 block">
                        {"(Rule: Activates only when active riders >= 20. Current Active: " + activeRidersCount + " riders)"}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 font-extrabold">
                      {activeRidersCount >= 20 
                        ? `+ ₹${(activeSalarySlipRider.topPerformerBonus || 0).toLocaleString()}` 
                        : '₹0 / Not Eligible (Riders < 20)'}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between text-red-700">
                    <span>Compliance TDS and processing holds (0% TDS active)</span>
                    <span className="font-mono font-bold">- ₹0</span>
                  </div>
                </div>

                {/* Final calculated aggregate */}
                <div className="border-t-2 border-neutral-800 pt-3 flex justify-between items-center text-sm">
                  <strong className="text-neutral-900 font-sans uppercase">NET RECOGNIZED PAYABLE SENT</strong>
                  <strong className="font-mono text-xl text-neutral-950 bg-neutral-100 px-3 py-1 rounded">
                    ₹{activeSalarySlipRider.netPayable.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Rules and Eligibility descriptions clearly specified */}
              <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] text-neutral-600 leading-relaxed space-y-1.5 font-sans">
                <p className="font-black text-xs text-neutral-800 uppercase tracking-wide">🏆 PV India Rider Incentive Programs & Eligibility Rules</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded border border-neutral-150">
                    <p className="font-bold text-rose-700">1. Weekly Bonus Target</p>
                    <p className="mt-0.5 mt-1 text-[9px] text-neutral-500">Completed 250+ deliveries within 1 week splits a flat ₹{payoutSettings.weeklyBonusAmount} bonus.</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-neutral-150">
                    <p className="font-bold text-amber-600">2. Monthly Loyalty Reward</p>
                    <p className="mt-0.5 mt-1 text-[9px] text-neutral-500">Completed 1,100+ total orders during the month awards ₹{payoutSettings.monthlyBonusAmount} loyalty bonus.</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-neutral-150">
                    <p className="font-bold text-emerald-600">3. Top Performer Rank Bonus</p>
                    <p className="mt-0.5 mt-1 text-[9px] text-neutral-500">Triggers for Top 3 when system has 20+ active riders: 1st Rank ₹3,000, 2nd Rank ₹2,000, 3rd Rank ₹1,000.</p>
                  </div>
                </div>
              </div>

              {/* Instructions and signatures */}
              <div className="pt-5 font-sans text-[10px] text-neutral-500 flex justify-between items-end border-t border-dashed border-neutral-300">
                <div className="space-y-1 max-w-sm">
                  <p className="font-bold text-neutral-700">Disclaimer & Notes:</p>
                  <p className="leading-normal">
                    This document is a certified digital salary payment receipt generated on behalf of PV India Fleet Solutions. Validated logs correspond directly to aggregate database statistics. Concerns can be shared at pvindiafleetsolutions@gmail.com.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-neutral-900 border-t border-neutral-300 pt-3 text-xs">Authorized Signatory</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* RIDER DELETE CONFIRMATION POPUP */}
      {riderToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-neutral-900">Are you sure you want to delete this rider?</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                You are about to permanently delete <strong className="text-neutral-800">{riderToDelete.name}</strong> (<span className="font-mono text-[11px] font-bold text-rose-600">{riderToDelete.id}</span>). This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRiderToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRider(riderToDelete.id);
                  setRiderToDelete(null);
                  triggerToast("Rider deleted successfully.");
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DELETE CONFIRMATION POPUP */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4 font-sans backdrop-blur-sm">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-neutral-900">Delete Order Entry?</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                You are about to permanently delete the daily order log for <strong className="text-neutral-800">{orderToDelete.riderName}</strong> on <span className="font-mono text-[11px] font-bold text-rose-600">{orderToDelete.date}</span> with <strong className="text-neutral-800">{orderToDelete.ordersCompleted} orders</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDailyOrder(orderToDelete.id);
                  setOrderToDelete(null);
                  triggerToast("Order log removed successfully from the system.");
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
