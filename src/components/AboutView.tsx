import React from 'react';
import { CompanyConfig } from '../types';
import { ShieldCheck, Truck, Clock, Sparkles, Building2, HelpCircle, PhoneCall, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutViewProps {
  config: CompanyConfig;
  setActiveTab: (tab: string) => void;
}

export default function AboutView({ config, setActiveTab }: AboutViewProps) {
  const faqs = [
    {
      q: 'How much are the delivery onboarding charges under PV India Fleet Solutions?',
      a: 'Absolutely ZERO. Joining PV India Fleet Solutions is entirely free. In fact, you receive an onboarding cash bonus of ₹500 upon completing your first week of orders successfully.'
    },
    {
      q: 'How does the ₹1,000 weekly performance bonus work?',
      a: 'If a delivery partner completes 250 orders in a single week (starting Monday to Sunday), the system dynamically computes and credit ₹1,000 extra on top of the flat ₹40 flat payout per order.'
    },
    {
      q: 'What is the referral scheme rule?',
      a: 'For every active rider you onboarding under your custom referral code or name who successfully completes 100 orders, you as the referrer receive ₹500 directly in your weekly payment summary.'
    },
    {
      q: 'When and how are payouts released?',
      a: 'All payouts are calculated every single Monday and officially released every Thursday. Payments can be seamlessly routed directly via Bank Account Wire Transfer or your declared UPI Address.'
    },
    {
      q: 'Can I switch from my personal bicycle to an EV scooter later?',
      a: 'Yes, physical vehicle category swaps can be handled instantly by visiting our West Delhi Operations Office or contacting Prince / Vanshul to update your fleet profile details.'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pb-20 space-y-16">
      
      {/* Upper About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-rose-50 px-3 py-1 border border-rose-100">
            <Building2 className="h-4 w-4 text-rose-600" />
            <span className="font-mono text-xs font-bold text-rose-700 uppercase tracking-widest">
              Who We Are
            </span>
          </div>

          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            PV India Fleet Solutions
          </h1>

          <p className="font-sans text-sm text-neutral-600 leading-relaxed">
            {config.about}
          </p>

          {/* Mission & Vision Bento Style cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 space-y-2">
              <span className="font-sans text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Our Mission</span>
              <p className="font-sans text-xs font-semibold text-neutral-800 leading-relaxed">
                {config.mission}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 space-y-2">
              <span className="font-sans text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Our Vision</span>
              <p className="font-sans text-xs font-semibold text-neutral-800 leading-relaxed">
                {config.vision}
              </p>
            </div>
          </div>
        </div>

        {/* Right side Brand Value list */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-neutral-900 to-neutral-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-neutral-800 shadow-xl">
          <h3 className="font-sans text-lg font-bold">Unparalleled Fleet Guidelines</h3>
          
          <div className="space-y-4">
            
            <div className="flex items-start space-x-3.5">
              <div className="mt-1 rounded-full bg-rose-500/10 p-1.5 text-rose-400 border border-rose-500/20">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-neutral-100">Absolute Payout Accuracy</h4>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  We leverage automated salary math to eliminate system manual accounting errors, ensuring you get paid for every single drop.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="mt-1 rounded-full bg-rose-500/10 p-1.5 text-rose-400 border border-rose-500/20">
                <Truck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-neutral-100">Immediate Rider Allocations</h4>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  Get your exclusive Rider ID verified and assigned automatically, letting you hit the road within 2 hours of online approval.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="mt-1 rounded-full bg-rose-500/10 p-1.5 text-rose-400 border border-rose-500/20">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-neutral-100">Continuous Support Helpline</h4>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  Our operational office handles customer escalations, payment holds, and vehicle breakdowns immediately to secure peace of mind.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-neutral-800">
            <button
              onClick={() => setActiveTab('apply')}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition"
            >
              Apply Online Today
            </button>
          </div>
        </div>

      </div>

      {/* FAQs Section */}
      <section className="space-y-6">
        <div className="max-w-xl space-y-1.5 text-left">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-605 text-rose-600">Got Questions?</span>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            Rider Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm text-neutral-500 leading-relaxed">
            Find answers to common operational questions regarding onboarding milestones, referral bonuses, and weekly settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm shadow-neutral-50/50 space-y-2">
              <h3 className="font-sans text-sm font-bold text-neutral-900 flex items-start space-x-2">
                <HelpCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Management / Core contacts CTAs */}
      <section className="rounded-2xl border border-rose-100 bg-rose-50/20 p-6 sm:p-10 text-center space-y-6">
        <h3 className="font-sans text-lg font-extrabold text-neutral-900 mb-2">Need Immediate Personal Assistance?</h3>
        <p className="font-sans text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
          Whether you are experiencing app registration issues, have a question regarding an outstanding payment, or require urgent location support, our directors are available to help.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${config.phonePrince}`}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Prince (Manager): {config.phonePrince}</span>
          </a>
          <a
            href={`tel:${config.phoneVanshul}`}
            className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Vanshul (Manager): {config.phoneVanshul}</span>
          </a>
        </div>
      </section>

    </div>
  );
}
