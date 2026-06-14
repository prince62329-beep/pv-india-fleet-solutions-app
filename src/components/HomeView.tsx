import React from 'react';
import { CompanyConfig, PayoutSettings } from '../types';
import { ArrowRight, CheckCircle2, Award, Phone, Compass, ShieldAlert, Sparkles, Truck, Target, Wallet, Gift, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  config: CompanyConfig;
  payoutSettings: PayoutSettings;
  setActiveTab: (tab: string) => void;
}

export default function HomeView({ config, payoutSettings, setActiveTab }: HomeViewProps) {
  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-2xl backdrop-blur-md">
        
        {/* Abstract background graphics to mimic modern UI */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black/40 to-blue-500/5 opacity-90" />
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 rounded-full bg-orange-500/10 px-3.5 py-1.5 border border-orange-500/20">
              <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider text-orange-400 uppercase">
                Zomato Fleet Partner Program 2026
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-xl shadow-orange-500/20 bg-[#0f172a] shrink-0">
                <img 
                  src="/src/assets/images/pv_india_logo_new_1781437119730.jpg" 
                  alt="PV India LOGO" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-5.5xl leading-tight">
                PV INDIA FLEET<br />
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent font-black">
                  SOLUTIONS
                </span>
              </h1>
            </div>

            <p className="font-sans text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Delivering Growth, Driving Success. Onboard under our professional management to secure maximum weekly payouts, exclusive bonuses, and immediate 24/7 on-road rider support across Delhi NCR.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col md:flex-row gap-4 pt-4 font-sans items-stretch">
              <button
                onClick={() => setActiveTab('apply')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-3.5 px-7 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all duration-150 uppercase tracking-wider h-auto min-h-[58px]"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
              </button>

              {/* CALL NOW panel block styled to match UI */}
              <div className="flex flex-col bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm shadow-md text-slate-200 min-w-[210px] justify-between">
                <div className="flex items-center justify-center space-x-2 text-slate-300 font-bold uppercase tracking-wider text-[11px] pb-1.5 border-b border-white/5 mb-2 font-sans">
                  <Phone className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>CALL NOW</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-xs">
                  <a 
                    href={`tel:${config.phonePrince || "8826996189"}`} 
                    id="call-now-line-1"
                    className="flex items-center justify-between px-3 py-2 bg-white/[0.04] hover:bg-orange-500/20 text-white rounded-lg transition border border-white/5 hover:border-orange-500/20 active:scale-95"
                  >
                    <span className="text-[9px] text-slate-400 font-sans font-medium">Line 1:</span>
                    <span className="font-extrabold tracking-wide text-sm">{config.phonePrince || "8826996189"}</span>
                  </a>
                  <a 
                    href={`tel:${config.phoneVanshul || "8595828299"}`} 
                    id="call-now-line-2"
                    className="flex items-center justify-between px-3 py-2 bg-white/[0.04] hover:bg-orange-500/20 text-white rounded-lg transition border border-white/5 hover:border-orange-500/20 active:scale-95"
                  >
                    <span className="text-[9px] text-slate-400 font-sans font-medium">Line 2:</span>
                    <span className="font-extrabold tracking-wide text-sm">{config.phoneVanshul || "8595828299"}</span>
                  </a>
                </div>
              </div>

              {/* WHATSAPP SUPPORT panel block styled to match UI */}
              <div className="flex flex-col bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 backdrop-blur-sm shadow-md text-emerald-100 min-w-[210px] justify-between">
                <div className="flex items-center justify-center space-x-2 text-emerald-300 font-bold uppercase tracking-wider text-[11px] pb-1.5 border-b border-emerald-500/10 mb-2 font-sans">
                  <svg className="h-3.5 w-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.208-3.411c1.649.978 3.511 1.493 5.385 1.495 5.864 0 10.635-4.773 10.638-10.643.001-2.844-1.104-5.518-3.111-7.527C17.17 1.905 14.5 1.8 11.66 1.8c-5.869 0-10.64 4.774-10.644 10.647-.002 1.912.499 3.778 1.448 5.418L1.398 22.3l4.867-1.277z"/>
                  </svg>
                  <span>WHATSAPP SUPPORT</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-xs">
                  <a 
                    href={(config.whatsapp || "8826996189").startsWith("http") ? (config.whatsapp || "8826996189") : `https://wa.me/${(config.whatsapp || "8826996189").replace(/\D/g, "").length === 10 ? "91" + (config.whatsapp || "8826996189").replace(/\D/g, "") : (config.whatsapp || "8826996189").replace(/\D/g, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    id="whatsapp-line-1"
                    className="flex items-center justify-between px-3 py-2 bg-white/[0.03] hover:bg-emerald-500/15 text-white rounded-lg transition border border-white/5 hover:border-emerald-500/20 active:scale-95"
                  >
                    <span className="text-[9px] text-emerald-400 font-sans font-medium">Line 1:</span>
                    <span className="font-extrabold tracking-wide text-sm">{config.whatsapp && config.whatsapp.replace(/\D/g, "").length >= 7 ? config.whatsapp : "8826996189"}</span>
                  </a>
                  <a 
                    href={(config.whatsapp2 || "8595828299").startsWith("http") ? (config.whatsapp2 || "8595828299") : `https://wa.me/${(config.whatsapp2 || "8595828299").replace(/\D/g, "").length === 10 ? "91" + (config.whatsapp2 || "8595828299").replace(/\D/g, "") : (config.whatsapp2 || "8595828299").replace(/\D/g, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    id="whatsapp-line-2"
                    className="flex items-center justify-between px-3 py-2 bg-white/[0.03] hover:bg-emerald-500/15 text-white rounded-lg transition border border-white/5 hover:border-emerald-500/20 active:scale-95"
                  >
                    <span className="text-[9px] text-emerald-400 font-sans font-medium">Line 2:</span>
                    <span className="font-extrabold tracking-wide text-sm">{config.whatsapp2 && config.whatsapp2.replace(/\D/g, "").length >= 7 ? config.whatsapp2 : "8595828299"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Micro details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 font-mono text-xs text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Operations: Delhi NCR</span>
              <span>⚡ Payout Status: Weekly Released</span>
              <span>🔒 Registration: Auto-ID Assigned</span>
            </div>

          </div>

          {/* Hero Right Widget - Benefits Highlights Grid */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-sans text-sm font-semibold tracking-wider text-rose-400 uppercase">Payout Metrics</span>
                <span className="bg-rose-500 text-white rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-extrabold animate-pulse">Hot Offer</span>
              </div>

              <div className="space-y-4">
                
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-sm leading-none text-neutral-400">Order Rate</p>
                    <p className="font-sans text-lg font-extrabold text-white">₹{payoutSettings.perOrderRate} <span className="text-xs font-normal text-neutral-400">Per Order Finished</span></p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-sm leading-none text-neutral-400">Payout Period</p>
                    <p className="font-sans text-lg font-extrabold text-white">Every Thursday <span className="text-xs font-normal text-amber-400">(Weekly)</span></p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-sm leading-none text-neutral-400">Bonuses Included</p>
                    <p className="font-sans text-lg font-extrabold text-white">₹500 Joining + ₹500 Referral</p>
                  </div>
                </div>

              </div>

              {/* Weekly/Monthly Rewards Highlight */}
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/5 p-4 border border-rose-500/20 space-y-2">
                <p className="font-sans text-xs font-bold text-amber-300 uppercase flex items-center space-x-1">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span>Target Milestones</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 font-sans">
                  <div>
                    <p className="text-neutral-400 text-[10px]">250 Weekly Orders</p>
                    <p className="font-extrabold text-white">+ ₹1,000 Bonus</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-[10px]">1100 Monthly Orders</p>
                    <p className="font-extrabold text-white">+ ₹2,000 Bonus</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. Core Operational Benefits Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-400">Exclusive Benefits</span>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Why Drive with PV India Fleet?
          </h2>
          <p className="font-sans text-sm text-slate-400 leading-relaxed">
            We provide delivery partners across Delhi NCR with premium structural backup, weekly payout validation, and unmatched bonuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 hover:border-orange-500/30 hover:bg-white/[0.08] transition duration-300 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-white">₹{payoutSettings.perOrderRate} Per Order</h3>
            <p className="font-sans text-xs mt-1.5 text-slate-400 leading-relaxed">
              Unmatched flat payment on every single successful order delivery. Standard matching with absolutely no hidden deductions.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 hover:border-orange-500/30 hover:bg-white/[0.08] transition duration-300 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-white">Weekly Payouts</h3>
            <p className="font-sans text-xs mt-1.5 text-slate-400 leading-relaxed">
              Earnings directly wired to your bank account or UPI address every Thursday without delays. Complete daily monitoring available.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 hover:border-orange-500/30 hover:bg-white/[0.08] transition duration-300 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <Gift className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-white">🎁 ₹{payoutSettings.joiningBonus} Onboarding</h3>
            <p className="font-sans text-xs mt-1.5 text-slate-400 leading-relaxed">
              Get an instant onboarding joining bonus of ₹{payoutSettings.joiningBonus}, plus an additional ₹{payoutSettings.referralBonus} referral bonus for every friend you onboarding to our fleet.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 hover:border-orange-500/30 hover:bg-white/[0.08] transition duration-300 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-white">Target Cashbacks</h3>
            <p className="font-sans text-xs mt-1.5 text-slate-400 leading-relaxed">
              Complete {payoutSettings.weeklyBonusTarget} orders in a week to earn ₹{payoutSettings.weeklyBonusAmount} extra, and hit {payoutSettings.monthlyBonusTarget} orders in a month to unlock an extra ₹{payoutSettings.monthlyBonusAmount} loyalty bonus.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Operational Support Overview (Fleet services) */}
      <section className="bg-transparent py-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-400">Operations Ecosystem</span>
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Professional Fleet Operations in Delhi NCR
            </h2>
            <p className="font-sans text-sm text-slate-400 leading-relaxed">
              PV India Fleet Solutions serves as an official partner, facilitating optimal delivery operations, compliance verification, and payment automation for professional gig workers.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Fleet Operations Management', desc: 'Direct coordination with Zomato delivery hubs.' },
                { title: 'Payment & Daily Order Audit', desc: 'Auto payout math, incentive audits, and complete visibility.' },
                { title: 'Compliance and Document Verification', desc: 'Quick onboarding validation of PAN, DL, and Aadhaar cards.' },
                { title: 'Dedicated Support Staff Helpline', desc: 'Instantly connect with Prince & Vanshul on road blockages or app bugs.' }
              ].map((serv, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-slate-200">{serv.title}</h4>
                    <p className="font-sans text-xs text-slate-450 text-slate-400">{serv.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('about')}
                className="font-sans text-sm font-bold text-orange-400 hover:text-orange-350 inline-flex items-center space-x-1"
              >
                <span>Read more about our operational model</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
            <h3 className="font-sans text-lg font-extrabold text-white">Onboarding Checklist</h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Have the following credentials ready to instantly join our West Delhi fleet and unlock ₹{payoutSettings.joiningBonus} joining credit:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Aadhaar Card', label: 'Identity Proof' },
                { name: 'PAN Card', label: 'Tax Proof' },
                { name: 'Driving Licence', label: 'Vehicle Proof' },
                { name: 'Bank Passbook / UPI', label: 'Payout Address' },
                { name: 'Passport Size Photo', label: 'App Avatar' },
                { name: 'Working Smart Mobile', label: 'App Connection' }
              ].map((v, i) => (
                <div key={i} className="flex items-center space-x-2.5 border border-white/5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition duration-200">
                  <div className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <p className="font-sans text-xs font-bold text-slate-200 leading-tight">{v.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{v.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-xs font-bold text-orange-300">Age & Vehicle Eligibility</p>
                <p className="font-sans text-[11px] text-slate-300 leading-relaxed mt-0.5">
                   Riders must be 18+ years of age. Own a valid driving license and have access to a Bike, Scooty, EV Scooter, or electric bicycle to operate. <strong className="text-orange-400 font-semibold block mt-1">(⚡ Note: If you own a Low-Speed EV Scooter without a number plate, NO driving license and NO plate registration is required!)</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('apply')}
              className="w-full font-sans text-center bg-orange-500 hover:bg-orange-600 rounded-xl py-3 font-bold text-white text-xs tracking-wider uppercase transition shadow-lg shadow-orange-500/20 duration-150"
            >
              Start Registration Portal
            </button>
          </div>

        </div>
      </section>

      {/* 4. Contact Coordinates and Directions Panel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          <div className="lg:col-span-15 lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-400">Operations Desk</span>
              <h3 className="font-sans text-2xl font-extrabold text-white">Meet Your Fleet Coordinators</h3>
              <p className="font-sans text-sm text-slate-400 leading-relaxed">
                Our managers are based out of Keshopur Village, West Delhi. Meet Prince & Vanshul for on-spot document approvals, live onboarding, or cash advancements.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-sans text-xs font-bold text-slate-200">PRINCE KUMAR</p>
                  <p className="font-mono text-[10px] text-slate-400">Fleet Operations Manager</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href="tel:8826996189"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-sans text-xs font-bold text-slate-200">VANSHUL</p>
                  <p className="font-mono text-[10px] text-slate-400">Joint Onboarding Manager</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href="tel:8595828299"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Map Link */}
            <div className="text-xs text-slate-400 font-sans">
              📍 <strong className="text-slate-200">Address:</strong> {config.address}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl overflow-hidden min-h-[350px] bg-slate-900 relative border border-white/10 shadow-xl">
            {/* Real Interactive Google Map Embed */}
            <iframe 
              className="absolute inset-0 w-full h-full border-0 opacity-80" 
              src="https://maps.google.com/maps?q=WZ-11C,Keshopur%20Village,Vikas%20Puri,New%20Delhi%20110018&t=&z=14&ie=UTF8&iwloc=&output=embed" 
              allowFullScreen 
              loading="lazy" 
              title="Delhi NCR Operations Hub"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Premium Delhi NCR Coverage details overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs bg-slate-950/95 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs space-y-2.5 text-slate-300 shadow-2xl">
              <div>
                <p className="font-sans text-xs font-black text-rose-500 uppercase tracking-widest">Operations Coverage Map</p>
                <p className="font-sans text-sm font-bold text-white mt-1">Delhi NCR Region</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  West Delhi, Vikas Puri, Janakpuri, Uttam Nagar, Dwarka, Rohini, Noida, Ghaziabad & neighboring sectors.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href="https://maps.google.com/?q=WZ-11C,+Keshopur+Village,+Vikas+Puri,+New+Delhi+%E2%80%93+110018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center rounded-lg bg-rose-600 py-2 font-sans font-bold text-[11px] text-white hover:bg-rose-700 transition"
                >
                  Get Directions Button
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
