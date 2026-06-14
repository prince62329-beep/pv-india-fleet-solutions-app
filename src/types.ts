export interface Rider {
  id: string; // e.g. PV-ZOM-101
  name: string;
  mobile: string;
  aadhaar: string;
  pan: string;
  dl: string;
  vehicleType: 'Bike' | 'Scooty' | 'EV Scooter';
  vehicleNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joiningDate: string;
  teamLeaderId?: string; // Optional assigned team leader
  joiningBonusEligible?: boolean;
  referralBonusEligible?: boolean;
  assignedRate?: number; // Rider assigned rate: ₹40, ₹45, ₹50, ₹55 etc.
}

export interface TeamLeader {
  id: string; // e.g. PV-TL-001
  name: string;
  mobile: string;
  email: string;
  assignedRiders: string[]; // List of Rider IDs
  joiningDate: string;
  status: 'Active' | 'Inactive';
}

export interface DailyOrder {
  id: string;
  riderId: string;
  riderName: string;
  date: string;
  ordersCompleted: number;
  incentive: number;
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  // Map of riderId -> 'Present' | 'Absent' | 'Off'
  statusMap: Record<string, 'Present' | 'Absent' | 'Off'>;
}

export interface Application {
  id: string;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  dob: string;
  address: string;
  vehicleType: 'Bike' | 'Scooty' | 'EV Scooter';
  vehicleNumber: string;
  aadhaarNumber: string;
  panNumber: string;
  dlNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  documents: {
    aadhaarCard: string; // Base64 or mock preview
    panCard: string;
    drivingLicence: string;
    bankPassbook: string;
    passportPhoto: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  remarks?: string;
}

export interface CompanyConfig {
  name: string;
  tagline: string;
  about: string;
  mission: string;
  vision: string;
  address: string;
  email: string;
  phonePrince: string;
  phoneVanshul: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  whatsapp2?: string;
}

export interface PayoutSettings {
  perOrderRate: number; // e.g. 40
  joiningBonus: number; // e.g. 500
  referralBonus: number; // e.g. 500
  weeklyBonusTarget: number; // e.g. 250
  weeklyBonusAmount: number; // e.g. 1000
  monthlyBonusTarget: number; // e.g. 1100
  monthlyBonusAmount: number; // e.g. 2000
  teamLeaderCommissionRate: number; // e.g. 5 per order
}

export interface PayoutRecord {
  id: string;
  riderId: string;
  riderName: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  baseEarnings: number;
  incentives: number;
  weeklyBonus: number;
  monthlyBonus: number;
  deductions: number;
  netPayable: number;
  status: 'Paid' | 'Pending' | 'Hold';
  paymentDate?: string;
}

export interface Complaint {
  id: string;
  name: string;
  riderId?: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}
