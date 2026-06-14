import { CompanyConfig, PayoutSettings, Rider, TeamLeader, DailyOrder, Application, Complaint } from '../types';

export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  name: "PV India Fleet Solutions",
  tagline: "Delivering Growth, Driving Success",
  about: "PV India Fleet Solutions is a professional fleet operations company providing delivery partner management, rider onboarding, and operational support services across Delhi NCR. We act as a bridge between top-tier logistics engines like Zomato and dedicated delivery partners, optimizing last-mile deliveries, weekly/monthly payouts, and performance management.",
  mission: "To streamline last-mile delivery operations, provide highly lucrative livelihood opportunities for dynamic riders across Delhi NCR, and elevate delivery service levels with structural operational support.",
  vision: "To become Delhi NCR's most trusted, highly efficient fleet management and delivery partner aggregator, leading riders towards sustainable, reliable, and high-yielding entrepreneurial growth.",
  address: "WZ-11C, Keshopur Village, Vikas Puri, New Delhi – 110018",
  email: "pvindiafleetsolutions@gmail.com",
  phonePrince: "8826996189",
  phoneVanshul: "8595828299",
  instagram: "https://instagram.com/pvindiafleetsolutions",
  facebook: "https://facebook.com/Pvindia Fleetsolutions",
  whatsapp: "8826996189",
  whatsapp2: "8595828299",
};

export const DEFAULT_PAYOUT_SETTINGS: PayoutSettings = {
  perOrderRate: 40,
  joiningBonus: 500,
  referralBonus: 500,
  weeklyBonusTarget: 250,
  weeklyBonusAmount: 1000,
  monthlyBonusTarget: 1100,
  monthlyBonusAmount: 2000,
  teamLeaderCommissionRate: 5,
};

export const DEFAULT_RIDERS: Rider[] = [
  {
    id: "PV-ZOM-101",
    name: "Rahul Kumar",
    mobile: "9876543210",
    aadhaar: "1234-5678-9012",
    pan: "ABCDE1234F",
    dl: "DL-1420210001234",
    vehicleType: "Bike",
    vehicleNumber: "DL-3S-CH-4321",
    bankName: "State Bank of India",
    accountNumber: "30123456789",
    ifscCode: "SBIN0001234",
    upiId: "rahul@okaxis",
    status: "Active",
    joiningDate: "2026-01-10",
    teamLeaderId: "PV-TL-001",
  },
  {
    id: "PV-ZOM-102",
    name: "Aman Sharma",
    mobile: "8765432109",
    aadhaar: "9876-5432-1098",
    pan: "FGHIJ5678K",
    dl: "DL-1420220004321",
    vehicleType: "EV Scooter",
    vehicleNumber: "DL-1C-ED-9876",
    bankName: "HDFC Bank",
    accountNumber: "50100123456789",
    ifscCode: "HDFC0000123",
    upiId: "aman@okhdfc",
    status: "Active",
    joiningDate: "2026-02-15",
    teamLeaderId: "PV-TL-001",
  },
  {
    id: "PV-ZOM-103",
    name: "Sachin Yadav",
    mobile: "7654321098",
    aadhaar: "4567-8901-2345",
    pan: "KLMNO9012P",
    dl: "DL-1420230005678",
    vehicleType: "Scooty",
    vehicleNumber: "DL-9S-AU-2109",
    bankName: "Punjab National Bank",
    accountNumber: "101234567890",
    ifscCode: "PUNB0123400",
    upiId: "sachin@okpnb",
    status: "Active",
    joiningDate: "2026-03-01",
    teamLeaderId: "PV-TL-002",
  },
  {
    id: "PV-ZOM-104",
    name: "Neeraj Gupta",
    mobile: "9001234567",
    aadhaar: "8901-2345-6789",
    pan: "QRSTU3456V",
    dl: "DL-1320240008765",
    vehicleType: "Bike",
    vehicleNumber: "DL-4S-BZ-8822",
    bankName: "ICICI Bank",
    accountNumber: "000201234567",
    ifscCode: "ICIC0000002",
    upiId: "neeraj@okicici",
    status: "Suspended",
    joiningDate: "2026-01-20",
  }
];

export const DEFAULT_TEAM_LEADERS: TeamLeader[] = [
  {
    id: "PV-TL-001",
    name: "Rajesh Kumar",
    mobile: "9911223344",
    email: "rajesh.tl@pvindia.com",
    assignedRiders: ["PV-ZOM-101", "PV-ZOM-102"],
    joiningDate: "2026-01-01",
    status: "Active",
  },
  {
    id: "PV-TL-002",
    name: "Vikas Nagar",
    mobile: "8822334455",
    email: "vikas.tl@pvindia.com",
    assignedRiders: ["PV-ZOM-103"],
    joiningDate: "2026-02-01",
    status: "Active",
  }
];

// Let's seed orders to perfectly align with user request reports
// User request reports:
// Weekly Tracker:
// - Rahul: 260 orders. Earnings ₹10,400. Bonus: ₹1000.
// Monthly Tracker:
// - Rahul: 1105 orders. Earnings ₹44,200. Bonus: ₹2000.
// Daily Tracker Report:
// - Rahul: 25 orders. Earnings ₹1,000.
// - Aman: 35 orders. Earnings ₹1,400.
export const DEFAULT_DAILY_ORDERS: DailyOrder[] = [
  // Today's orders (represent the daily report)
  {
    id: "ORD-001",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-14",
    ordersCompleted: 25,
    incentive: 0,
    remarks: "Excellent delivery timing",
  },
  {
    id: "ORD-002",
    riderId: "PV-ZOM-102",
    riderName: "Aman Sharma",
    date: "2026-06-14",
    ordersCompleted: 35,
    incentive: 0,
    remarks: "Top performer of the day",
  },
  // Previous orders in the current week to sum up to 260 for Rahul
  {
    id: "ORD-003",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-13",
    ordersCompleted: 40,
    incentive: 50,
  },
  {
    id: "ORD-004",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-12",
    ordersCompleted: 38,
    incentive: 50,
  },
  {
    id: "ORD-005",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-11",
    ordersCompleted: 42,
    incentive: 100,
  },
  {
    id: "ORD-006",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-10",
    ordersCompleted: 40,
    incentive: 0,
  },
  {
    id: "ORD-007",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-09",
    ordersCompleted: 45,
    incentive: 100,
  },
  {
    id: "ORD-008",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-08",
    ordersCompleted: 30,
    incentive: 0,
  }, // Rahul weekly sum = 25+40+38+42+40+45+30 = 260 orders!

  // Let's seed past historical weeks' orders so Rahul has a monthly sum of 1105
  // We need 1105 - 260 = 845 orders across the past 3 weeks of the month.
  {
    id: "ORD-HIST-01",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-06-01",
    ordersCompleted: 280, // Week 1
    incentive: 200,
    remarks: "Historical Week 1 Summary Record",
  },
  {
    id: "ORD-HIST-02",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-05-25",
    ordersCompleted: 290, // Week 2
    incentive: 150,
    remarks: "Historical Week 2 Summary Record",
  },
  {
    id: "ORD-HIST-03",
    riderId: "PV-ZOM-101",
    riderName: "Rahul Kumar",
    date: "2026-05-18",
    ordersCompleted: 275, // Week 3
    incentive: 250,
    remarks: "Historical Week 3 Summary Record",
  }, // Total historical weeks orders = 280+290+275 = 845. Total monthly orders = 845 + 260 = 1105! Matches requirement perfectly!

  // Aman's other orders
  {
    id: "ORD-A01",
    riderId: "PV-ZOM-102",
    riderName: "Aman Sharma",
    date: "2026-06-13",
    ordersCompleted: 32,
    incentive: 50,
  },
  {
    id: "ORD-A02",
    riderId: "PV-ZOM-102",
    riderName: "Aman Sharma",
    date: "2026-06-12",
    ordersCompleted: 30,
    incentive: 0,
  }
];

export const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: "APP-001",
    fullName: "Vikram Singh",
    mobile: "9518290381",
    alternateMobile: "8823120938",
    dob: "1998-05-11",
    address: "WZ-24A, Shiv Mandir Lane, Uttam Nagar, New Delhi - 110059",
    vehicleType: "Bike",
    vehicleNumber: "DL-4C-AF-5509",
    aadhaarNumber: "4321-8765-0912",
    panNumber: "XYZPD9981S",
    dlNumber: "DL-1320250009988",
    bankName: "Axis Bank",
    accountNumber: "915010098732145",
    ifscCode: "UTIB0000123",
    upiId: "vikram@okaxis",
    appliedDate: "2026-06-12",
    status: "Pending",
    documents: {
      aadhaarCard: "placeholder_aadhaar.jpg",
      panCard: "placeholder_pan.jpg",
      drivingLicence: "placeholder_dl.jpg",
      bankPassbook: "placeholder_bank.jpg",
      passportPhoto: "placeholder_photo.jpg"
    }
  },
  {
    id: "APP-002",
    fullName: "Preeti Kumari",
    mobile: "9212001122",
    dob: "2000-08-20",
    address: "Block-C, Sector 15, Rohini, New Delhi",
    vehicleType: "Scooty",
    vehicleNumber: "DL-3S-BU-9081",
    aadhaarNumber: "7654-3210-9876",
    panNumber: "PSTUR4432G",
    dlNumber: "DL-1220250007823",
    bankName: "Yes Bank",
    accountNumber: "9000100234567",
    ifscCode: "YESB0000009",
    upiId: "preeti@okyes",
    appliedDate: "2026-06-10",
    status: "Approved",
    documents: {
      aadhaarCard: "placeholder_aadhaar.jpg",
      panCard: "placeholder_pan.jpg",
      drivingLicence: "placeholder_dl.jpg",
      bankPassbook: "placeholder_bank.jpg",
      passportPhoto: "placeholder_photo.jpg"
    }
  }
];

export const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-001",
    name: "Sachin Yadav",
    riderId: "PV-ZOM-103",
    mobile: "7654321098",
    subject: "Delay in Referral Bonus Reflection",
    message: "I referred my friend Vikram Singh, who submitted his application on June 12th. I haven't received my referral bonus of ₹500 yet. Kindly verify.",
    date: "2026-06-13",
    status: "Open"
  }
];
