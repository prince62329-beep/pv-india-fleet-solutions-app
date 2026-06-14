import React from 'react';
import { CompanyConfig, PayoutSettings } from '../types';
import { Phone, MapPin, Mail, Sparkles, Shield, ChevronUp } from 'lucide-react';

interface FooterProps {
  config: CompanyConfig;
  payoutSettings: PayoutSettings;
  setActiveTab: (tab: string) => void;
}

export default function Footer({ config, payoutSettings, setActiveTab }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#020617]/90 border-t border-white/10 pt-16 pb-8 text-slate-400 z-10">
      
      {/* Upper Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10 pb-12">
        
        {/* Brand & Tagline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden shadow-lg shadow-orange-500/10 border border-white/10 bg-slate-900 shrink-0">
              <img 
                src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
                alt="PV India LOGO" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-sans text-base font-bold tracking-tight text-white uppercase">
              PV India Fleet
            </span>
          </div>
          <p className="font-sans text-sm font-semibold tracking-wide text-orange-400">
            "{config.tagline}"
          </p>
          <p className="text-xs leading-relaxed text-slate-405 text-slate-400 font-sans">
            Dedicated logistics aggregating agency offering premium support, weekly payouts, and high incentives under Zomato Delivery Partner Program in Delhi NCR.
          </p>
          
          {/* Socials */}
          <div className="flex items-center space-x-3.5 pt-2">
            <a 
              href={config.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs border border-white/10 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 transition"
            >
              Facebook
            </a>
            <a 
              href={config.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs border border-white/10 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 transition"
            >
              Instagram
            </a>
            <a 
              href={config.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs border bg-emerald-500/10 border-emerald-550/20 text-emerald-400 rounded hover:bg-emerald-500/20 px-2.5 py-1 transition"
            >
              WhatsApp Support
            </a>
          </div>
        </div>

        {/* Dynamic Partner Payout Specs */}
        <div className="space-y-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
            Rider Core Benefits
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>₹{payoutSettings.perOrderRate} Flat Pay Per Order</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>Weekly Payouts direct to Account / UPI</span>
            </li>
            <li className="flex items-center space-x-2 text-orange-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-450 bg-orange-400" />
              <span>₹{payoutSettings.joiningBonus} Welcome/Joining Gift Bonus</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>₹{payoutSettings.referralBonus} Referral Reward Scheme</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>₹{payoutSettings.weeklyBonusAmount} Weekly Target Bonus (250+ Orders)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>₹{payoutSettings.monthlyBonusAmount} Monthly Performance Bonus (1100+ Orders)</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
            Navigation & Ops
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans text-slate-300">
            <button onClick={() => setActiveTab('home')} className="text-left hover:text-white cursor-pointer transition">Home Page</button>
            <button onClick={() => setActiveTab('about')} className="text-left hover:text-white cursor-pointer transition">About Service</button>
            <button onClick={() => setActiveTab('apply')} className="text-left hover:text-white cursor-pointer transition">Rider Application</button>
            <button onClick={() => setActiveTab('status')} className="text-left hover:text-white cursor-pointer transition">Verification</button>
            <button onClick={() => setActiveTab('admin')} className="text-left hover:text-white cursor-pointer transition">Staff Admin</button>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5 border border-white/5 text-[10px] space-y-1 text-slate-400 font-sans">
            <p className="font-bold text-slate-200">Zomato Delivery Aggregator</p>
            <p>Our fleet partners obtain live order matching, dynamic weekly payouts, and zero delivery logging failures.</p>
          </div>
        </div>

        {/* Physical Office Hub */}
        <div className="space-y-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
            PV Operations Hub
          </p>
          <div className="space-y-3 font-sans text-xs text-slate-350">
            <div className="flex items-start space-x-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-450 text-orange-400" />
              <span className="leading-relaxed text-slate-300">
                {config.address}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-orange-450 text-orange-400" />
              <span className="text-slate-300">{config.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Prince: +91 {config.phonePrince}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-orange-400" />
              <span className="text-slate-300 font-medium">Vanshul: +91 {config.phoneVanshul}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Center Bottom Credits */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 text-slate-500 font-sans border-t border-white/5 pt-6">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-sans font-bold text-slate-350 tracking-wider">
            &copy; {new Date().getFullYear()} <span className="text-white font-extrabold uppercase">PV INDIA FLEET SOLUTIONS</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Powered by <strong className="text-slate-400">PV India Fleet Solutions</strong> • Zomato Authorized Fleet Partner
          </p>
        </div>
        <p className="flex items-center space-x-1 font-mono text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Operational in West Delhi & Delhi NCR</span>
        </p>
        <button 
          onClick={scrollToTop}
          className="flex items-center space-x-1.5 border border-white/10 hover:border-white/20 bg-white/5 rounded px-2.5 py-1 text-[11px] text-slate-300 hover:text-white cursor-pointer transition"
        >
          <span>Scroll Top</span>
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>

    </footer>
  );
}
