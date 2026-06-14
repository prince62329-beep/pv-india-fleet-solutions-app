import React from 'react';
import { Phone, CheckCircle2, ShieldCheck, HelpCircle, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { CompanyConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  config: CompanyConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export default function Header({ config, activeTab, setActiveTab, isAdminLoggedIn, onLogoutAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'apply', label: 'Apply Now' },
    { id: 'status', label: 'Verify Documents' },
    { id: 'admin', label: isAdminLoggedIn ? 'Admin Panel' : 'Staff Access' },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/80 backdrop-blur-md relative">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand Name */}
        <div 
          className="flex cursor-pointer items-center space-x-3" 
          onClick={() => handleNav('home')}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden shadow-lg shadow-orange-500/20 border border-white/10 bg-slate-900 shrink-0">
            <img 
              src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
              alt="PV India LOGO" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-sans text-[17px] font-bold tracking-tight text-white sm:text-lg">
                PV INDIA
              </span>
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-orange-400 border border-orange-500/20">
                FLEET
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-450 text-slate-400">
              Fleet Solutions
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-all rounded-lg duration-200 ${
                  isActive 
                    ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' 
                    : 'text-slate-350 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeHeaderTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-orange-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Hotlines / Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          <a
            href={`tel:${config.phonePrince}`}
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>Prince: {config.phonePrince}</span>
          </a>
          <a
            href={`tel:${config.phoneVanshul}`}
            className="flex items-center space-x-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 font-mono text-xs text-orange-400 transition hover:bg-orange-500/20"
          >
            <Phone className="h-3.5 w-3.5 text-orange-400" />
            <span>Vanshul: {config.phoneVanshul}</span>
          </a>

          {isAdminLoggedIn && (
            <button
               onClick={onLogoutAdmin}
               className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-orange-500/20 uppercase tracking-wider transition-all"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center space-x-2 md:hidden">
          {isAdminLoggedIn && (
            <span className="rounded-full bg-orange-500/10 p-1 border border-orange-500/20 text-orange-400" title="Admin Logged In">
              <ShieldCheck className="h-4 w-4" />
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-450 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#020617] border-t border-white/10 md:hidden"
          >
            <div className="space-y-1.5 px-4 py-4">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold ${
                      isActive 
                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500 pl-3' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-white/10 flex flex-col space-y-2 font-mono text-sm text-slate-350">
                <p className="text-xs uppercase text-slate-500 font-bold px-4">Instant Contacts</p>
                <a
                  href={`tel:${config.phonePrince}`}
                  className="flex items-center space-x-2 p-2 px-4 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Call Prince: +91 {config.phonePrince}</span>
                </a>
                <a
                  href={`tel:${config.phoneVanshul}`}
                  className="flex items-center space-x-2 p-2 px-4 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <Phone className="h-4 w-4 text-orange-400" />
                  <span>Call Vanshul: +91 {config.phoneVanshul}</span>
                </a>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      onLogoutAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 w-full text-center rounded-lg bg-red-600 py-2.5 text-white font-medium hover:bg-red-700 transition"
                  >
                    Sign Out Admin
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
