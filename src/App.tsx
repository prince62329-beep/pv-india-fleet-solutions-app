import React, { useState, useEffect } from 'react';
import { 
  CompanyConfig, PayoutSettings, Rider, TeamLeader, DailyOrder, AttendanceRecord, Application, Complaint 
} from './types';
import { 
  DEFAULT_COMPANY_CONFIG, DEFAULT_PAYOUT_SETTINGS, DEFAULT_RIDERS, DEFAULT_TEAM_LEADERS, 
  DEFAULT_DAILY_ORDERS, DEFAULT_APPLICATIONS, DEFAULT_COMPLAINTS 
} from './data/defaultData';

// Sub-views
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import RecruitmentSystem from './components/RecruitmentSystem';
import DocumentVerification from './components/DocumentVerification';
import ContactHub from './components/ContactHub';
import AdminPortal from './components/AdminPortal';

import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, BookOpen, Clock } from 'lucide-react';

export default function App() {
  // Navigation active state: 'home' | 'about' | 'apply' | 'status' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Core synchronized LocalStorage states
  const [config, setConfig] = useState<CompanyConfig>(DEFAULT_COMPANY_CONFIG);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(DEFAULT_PAYOUT_SETTINGS);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [orders, setOrders] = useState<DailyOrder[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // 1. Initial State Hydrator from server backend & Polling Sync
  const pushStateToServer = (updated: {
    config?: CompanyConfig;
    payoutSettings?: PayoutSettings;
    riders?: Rider[];
    teamLeaders?: TeamLeader[];
    orders?: DailyOrder[];
    attendance?: AttendanceRecord[];
    applications?: Application[];
    complaints?: Complaint[];
  }) => {
    const nextConfig = updated.config ?? config;
    const nextPayout = updated.payoutSettings ?? payoutSettings;
    const nextRiders = updated.riders ?? riders;
    const nextTLs = updated.teamLeaders ?? teamLeaders;
    const nextOrders = updated.orders ?? orders;
    const nextAttendance = updated.attendance ?? attendance;
    const nextApps = updated.applications ?? applications;
    const nextComplaints = updated.complaints ?? complaints;

    localStorage.setItem('pv_fleet_config', JSON.stringify(nextConfig));
    localStorage.setItem('pv_fleet_payout', JSON.stringify(nextPayout));
    localStorage.setItem('pv_fleet_riders', JSON.stringify(nextRiders));
    localStorage.setItem('pv_fleet_teamleaders', JSON.stringify(nextTLs));
    localStorage.setItem('pv_fleet_orders', JSON.stringify(nextOrders));
    localStorage.setItem('pv_fleet_attendance', JSON.stringify(nextAttendance));
    localStorage.setItem('pv_fleet_applications', JSON.stringify(nextApps));
    localStorage.setItem('pv_fleet_complaints', JSON.stringify(nextComplaints));

    fetch('/api/fleet-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: nextConfig,
        payoutSettings: nextPayout,
        riders: nextRiders,
        teamLeaders: nextTLs,
        orders: nextOrders,
        attendance: nextAttendance,
        applications: nextApps,
        complaints: nextComplaints,
      }),
    }).catch((err) => console.error("Error syncing to centralized backend server:", err));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/fleet-data');
        const json = await response.json();
        if (json.status === 'success' && json.data) {
          const server = json.data;
          if (server.config) setConfig(server.config);
          if (server.payoutSettings) setPayoutSettings(server.payoutSettings);
          if (server.riders) setRiders(server.riders);
          if (server.teamLeaders) setTeamLeaders(server.teamLeaders);
          if (server.orders) setOrders(server.orders);
          if (server.attendance) setAttendance(server.attendance);
          if (server.applications) setApplications(server.applications);
          if (server.complaints) setComplaints(server.complaints);
        } else {
          // First time bootstrapping - load defaults, or what's in localstorage, and push
          const localC = localStorage.getItem('pv_fleet_config') ? JSON.parse(localStorage.getItem('pv_fleet_config')!) : DEFAULT_COMPANY_CONFIG;
          const localP = localStorage.getItem('pv_fleet_payout') ? JSON.parse(localStorage.getItem('pv_fleet_payout')!) : DEFAULT_PAYOUT_SETTINGS;
          const localR = localStorage.getItem('pv_fleet_riders') ? JSON.parse(localStorage.getItem('pv_fleet_riders')!) : DEFAULT_RIDERS;
          const localT = localStorage.getItem('pv_fleet_teamleaders') ? JSON.parse(localStorage.getItem('pv_fleet_teamleaders')!) : DEFAULT_TEAM_LEADERS;
          const localO = localStorage.getItem('pv_fleet_orders') ? JSON.parse(localStorage.getItem('pv_fleet_orders')!) : DEFAULT_DAILY_ORDERS;
          const localAt = localStorage.getItem('pv_fleet_attendance') ? JSON.parse(localStorage.getItem('pv_fleet_attendance')!) : [];
          const localAp = localStorage.getItem('pv_fleet_applications') ? JSON.parse(localStorage.getItem('pv_fleet_applications')!) : DEFAULT_APPLICATIONS;
          const localCp = localStorage.getItem('pv_fleet_complaints') ? JSON.parse(localStorage.getItem('pv_fleet_complaints')!) : DEFAULT_COMPLAINTS;

          setConfig(localC);
          setPayoutSettings(localP);
          setRiders(localR);
          setTeamLeaders(localT);
          setOrders(localO);
          setAttendance(localAt);
          setApplications(localAp);
          setComplaints(localCp);

          fetch('/api/fleet-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config: localC,
              payoutSettings: localP,
              riders: localR,
              teamLeaders: localT,
              orders: localO,
              attendance: localAt,
              applications: localAp,
              complaints: localCp,
            })
          }).catch(err => console.error("Error seeding backend:", err));
        }
      } catch (e) {
        console.error("Error fetching initial centralized state", e);
      }
    };

    loadInitialData();

    // Active session token recovery
    const storedAdminSession = localStorage.getItem('pv_fleet_admin_session');
    if (storedAdminSession === 'true') {
      setIsAdminLoggedIn(true);
    }

    // Periodic synchronization interval
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/fleet-data');
        const json = await response.json();
        if (json.status === 'success' && json.data) {
          const s = json.data;
          setConfig(prev => JSON.stringify(prev) !== JSON.stringify(s.config) ? (s.config ?? prev) : prev);
          setPayoutSettings(prev => JSON.stringify(prev) !== JSON.stringify(s.payoutSettings) ? (s.payoutSettings ?? prev) : prev);
          setRiders(prev => JSON.stringify(prev) !== JSON.stringify(s.riders) ? (s.riders ?? prev) : prev);
          setTeamLeaders(prev => JSON.stringify(prev) !== JSON.stringify(s.teamLeaders) ? (s.teamLeaders ?? prev) : prev);
          setOrders(prev => JSON.stringify(prev) !== JSON.stringify(s.orders) ? (s.orders ?? prev) : prev);
          setAttendance(prev => JSON.stringify(prev) !== JSON.stringify(s.attendance) ? (s.attendance ?? prev) : prev);
          setApplications(prev => JSON.stringify(prev) !== JSON.stringify(s.applications) ? (s.applications ?? prev) : prev);
          setComplaints(prev => JSON.stringify(prev) !== JSON.stringify(s.complaints) ? (s.complaints ?? prev) : prev);
        }
      } catch (err) {
        // Safe backend connection retry
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, []);

  // 2. Auxiliary trigger functions propagating state changes to dry records
  const handleUpdateConfig = (newConfig: CompanyConfig) => {
    setConfig(newConfig);
    pushStateToServer({ config: newConfig });
  };

  const handleUpdatePayoutSettings = (newSettings: PayoutSettings) => {
    setPayoutSettings(newSettings);
    pushStateToServer({ payoutSettings: newSettings });
  };

  const handleAddApplication = (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>) => {
    const nextAppId = `PV-APP-${1000 + applications.length + 1}`;
    const newApp: Application = {
      ...appData,
      id: nextAppId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    pushStateToServer({ applications: updatedApps });
    return nextAppId;
  };

  const handleApproveApplication = (appId: string, customRiderId: string) => {
    const updatedApps = applications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'Approved' as const, remarks: `Successfully onboarded physically! Assigned Rider ID: ${customRiderId}` };
      }
      return app;
    });
    setApplications(updatedApps);

    // Move to Active Riders
    const approvedApp = applications.find((a) => a.id === appId);
    let updatedRiders = riders;
    if (approvedApp) {
      const newRider: Rider = {
        id: customRiderId,
        name: approvedApp.fullName,
        mobile: approvedApp.mobile,
        aadhaar: approvedApp.aadhaarNumber,
        pan: approvedApp.panNumber,
        dl: approvedApp.dlNumber,
        vehicleType: approvedApp.vehicleType,
        vehicleNumber: approvedApp.vehicleNumber,
        bankName: approvedApp.bankName,
        accountNumber: approvedApp.accountNumber,
        ifscCode: approvedApp.ifscCode,
        upiId: approvedApp.upiId,
        status: 'Active',
        joiningDate: new Date().toISOString().split('T')[0],
        assignedRate: 40, // default rate ₹40
      };

      updatedRiders = [newRider, ...riders];
      setRiders(updatedRiders);
    }
    pushStateToServer({ applications: updatedApps, riders: updatedRiders });
  };

  const handleRejectApplication = (appId: string, remarks: string) => {
    const updatedApps = applications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'Rejected' as const, remarks };
      }
      return app;
    });
    setApplications(updatedApps);
    pushStateToServer({ applications: updatedApps });
  };

  const handleAddRider = (riderData: Omit<Rider, 'id'> & { id?: string }) => {
    const generatedRiderId = riderData.id || `PV-ZOM-${100 + riders.length + 1}`;
    const newRider: Rider = {
      ...riderData,
      id: generatedRiderId,
      joiningDate: riderData.joiningDate || new Date().toISOString().split('T')[0],
      vehicleNumber: riderData.vehicleNumber || '',
      assignedRate: riderData.assignedRate || 40, // default rate ₹40
    };

    const updatedRiders = [newRider, ...riders];
    setRiders(updatedRiders);

    // If team leader is specified, write back to Team Leader roster
    let updatedTLs = teamLeaders;
    if (riderData.teamLeaderId) {
      updatedTLs = teamLeaders.map((tl) => {
        if (tl.id === riderData.teamLeaderId) {
          const currentRiders = tl.assignedRiders || [];
          return {
            ...tl,
            assignedRiders: currentRiders.includes(generatedRiderId) ? currentRiders : [...currentRiders, generatedRiderId],
          };
        }
        return tl;
      });
      setTeamLeaders(updatedTLs);
    }
    pushStateToServer({ riders: updatedRiders, teamLeaders: updatedTLs });
  };

  const handleEditRider = (updatedRider: Rider) => {
    const updatedRiders = riders.map((r) => r.id === updatedRider.id ? updatedRider : r);
    setRiders(updatedRiders);
    pushStateToServer({ riders: updatedRiders });
  };

  const handleDeleteRider = (riderId: string) => {
    // 1. Remove rider from inventory list
    const updatedRiders = riders.filter((r) => r.id !== riderId);
    setRiders(updatedRiders);

    // 2. Remove rider from assigned team leader records
    const updatedTLs = teamLeaders.map((tl) => {
      if (tl.assignedRiders?.includes(riderId)) {
        return {
          ...tl,
          assignedRiders: tl.assignedRiders.filter((id) => id !== riderId),
        };
      }
      return tl;
    });
    setTeamLeaders(updatedTLs);
    pushStateToServer({ riders: updatedRiders, teamLeaders: updatedTLs });
  };

  const handleAddDailyOrder = (orderData: Omit<DailyOrder, 'id'>) => {
    const nextOrderId = `ORD-${1000 + orders.length + 1}`;
    const newOrder: DailyOrder = {
      ...orderData,
      id: nextOrderId,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    pushStateToServer({ orders: updatedOrders });
  };

  const handleDeleteDailyOrder = (orderId: string) => {
    const updatedOrders = orders.filter((o) => o.id !== orderId);
    setOrders(updatedOrders);
    pushStateToServer({ orders: updatedOrders });
  };

  const handleSaveAttendance = (date: string, statusMap: Record<string, 'Present' | 'Absent' | 'Off'>) => {
    const matchIdx = attendance.findIndex((a) => a.date === date);
    const newRecord: AttendanceRecord = {
      id: `ATT-${date}`,
      date,
      statusMap,
    };

    let updatedAttendance = [...attendance];
    if (matchIdx >= 0) {
      updatedAttendance[matchIdx] = newRecord;
    } else {
      updatedAttendance = [newRecord, ...attendance];
    }
    setAttendance(updatedAttendance);
    pushStateToServer({ attendance: updatedAttendance });
  };

  const handleAddTeamLeader = (tlData: Omit<TeamLeader, 'id' | 'joiningDate' | 'assignedRiders'>) => {
    const generatedId = `PV-TL-0${teamLeaders.length + 1}`;
    const newTL: TeamLeader = {
      ...tlData,
      id: generatedId,
      assignedRiders: [],
      joiningDate: new Date().toISOString().split('T')[0],
    };

    const updatedTLs = [...teamLeaders, newTL];
    setTeamLeaders(updatedTLs);
    pushStateToServer({ teamLeaders: updatedTLs });
  };

  const handleUpdateTeamLeaderRoster = (tlId: string, assignedRiders: string[]) => {
    const updatedTLs = teamLeaders.map((tl) => {
      if (tl.id === tlId) {
        return { ...tl, assignedRiders };
      }
      return tl;
    });
    setTeamLeaders(updatedTLs);

    // Assign TL inside matching Rider logs as well, to keep data integrity
    const updatedRiders = riders.map((r) => {
      if (assignedRiders.includes(r.id)) {
        return { ...r, teamLeaderId: tlId };
      } else if (r.teamLeaderId === tlId) {
        // Disassociate
        return { ...r, teamLeaderId: undefined };
      }
      return r;
    });
    setRiders(updatedRiders);
    pushStateToServer({ teamLeaders: updatedTLs, riders: updatedRiders });
  };

  const handleAddComplaint = (compData: Omit<Complaint, 'id' | 'date' | 'status'>) => {
    const generatedId = `TKT-${100 + complaints.length + 1}`;
    const newComplaint: Complaint = {
      ...compData,
      id: generatedId,
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
    };

    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    pushStateToServer({ complaints: updatedComplaints });
    return generatedId;
  };

  const handleResolveComplaint = (id: string, status: 'Resolved' | 'In Progress') => {
    const updatedComplaints = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status };
      }
      return c;
    });
    setComplaints(updatedComplaints);
    pushStateToServer({ complaints: updatedComplaints });
  };

  const handleAdminSessionLogin = (partnerName: string) => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('pv_fleet_admin_session', 'true');
    localStorage.setItem('pv_fleet_active_partner', partnerName);
  };

  const handleAdminSessionLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('pv_fleet_admin_session');
    localStorage.removeItem('pv_fleet_active_partner');
    if (activeTab === 'admin') setActiveTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 antialiased font-sans relative overflow-x-hidden">
      
      {/* Atmospheric Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-500/5 to-transparent"></div>
      </div>
      
      {/* 1. Brand Header */}
      <Header 
        config={config} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminSessionLogout}
      />

      {/* Floating System Time Badge */}
      <div className="bg-black/40 backdrop-blur-md text-slate-300 relative z-10 flex flex-col sm:flex-row gap-2 justify-between px-4 sm:px-6 py-2.5 border-b border-white/10 font-mono text-[9px] uppercase tracking-wider select-none leading-none sm:items-center">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span>Operations: Delhi NCR Region Active</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
          <span>Weekly Target: {payoutSettings.weeklyBonusTarget} Orders Completed = +₹{payoutSettings.weeklyBonusAmount} Bonus</span>
          <span className="opacity-40">|</span>
          <span className="inline">Monthly target: {payoutSettings.monthlyBonusTarget} Orders Completed = +₹{payoutSettings.monthlyBonusAmount} Bonus</span>
        </div>
      </div>

      {/* 2. Main Page Active Router Stage */}
      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'home' && (
              <HomeView 
                config={config} 
                payoutSettings={payoutSettings} 
                setActiveTab={setActiveTab} 
              />
            )}

            {activeTab === 'about' && (
              <AboutView 
                config={config} 
                setActiveTab={setActiveTab} 
              />
            )}

            {activeTab === 'apply' && (
              <RecruitmentSystem 
                config={config} 
                onAddApplication={handleAddApplication} 
              />
            )}

            {activeTab === 'status' && (
              <DocumentVerification 
                config={config} 
                applications={applications} 
                riders={riders}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPortal
                config={config}
                payoutSettings={payoutSettings}
                riders={riders}
                teamLeaders={teamLeaders}
                orders={orders}
                attendance={attendance}
                applications={applications}
                complaints={complaints}
                isAdminLoggedIn={isAdminLoggedIn}
                onLoginAdmin={handleAdminSessionLogin}
                onUpdateConfig={handleUpdateConfig}
                onUpdatePayoutSettings={handleUpdatePayoutSettings}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                onAddRider={handleAddRider}
                onEditRider={handleEditRider}
                onDeleteRider={handleDeleteRider}
                onAddDailyOrder={handleAddDailyOrder}
                onDeleteDailyOrder={handleDeleteDailyOrder}
                onSaveAttendance={handleSaveAttendance}
                onAddTeamLeader={handleAddTeamLeader}
                onUpdateTeamLeaderRoster={handleUpdateTeamLeaderRoster}
                onResolveComplaint={handleResolveComplaint}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Contact Form link floating above Footer */}
      <section className="bg-transparent border-t border-white/10 py-12 relative z-10">
        <ContactHub 
          config={config} 
          onAddComplaint={handleAddComplaint} 
        />
      </section>

      {/* 3. Footer */}
      <Footer 
        config={config} 
        payoutSettings={payoutSettings} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
}

