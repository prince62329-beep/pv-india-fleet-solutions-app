import React, { useState } from 'react';
import { CompanyConfig, Complaint } from '../types';
import { Phone, Mail, MapPin, Send, HelpCircle, FileText, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactHubProps {
  config: CompanyConfig;
  onAddComplaint: (comp: Omit<Complaint, 'id' | 'date' | 'status'>) => string;
}

export default function ContactHub({ config, onAddComplaint }: ContactHubProps) {
  // Contact Form States
  const [cName, setCName] = useState('');
  const [cMobile, setCMobile] = useState('');
  const [cSubject, setCSubject] = useState('');
  const [cMessage, setCMessage] = useState('');
  const [cModel, setCModel] = useState<'Inquiry' | 'Complaint'>('Inquiry');
  
  // Feedback States
  const [isSending, setIsSending] = useState(false);
  const [lodgeId, setLodgeId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!cName || !cMobile || !cSubject || !cMessage) {
      setErrorText('Please enter all required fields.');
      return;
    }

    if (cMobile.length < 10) {
      setErrorText('Please specify a valid 10-digit mobile number.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const generatedId = onAddComplaint({
        name: cName,
        mobile: cMobile,
        subject: `${cModel === 'Complaint' ? '[URGENT COMPLAINT] ' : ''}${cSubject}`,
        message: cMessage
      });

      setIsSending(false);
      setLodgeId(generatedId);
      
      // Clear inputs
      setCName('');
      setCMobile('');
      setCSubject('');
      setCMessage('');
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-6 pb-20 space-y-12 font-sans">
      
      {/* Page Heading */}
      <div className="text-center space-y-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          Support Desk
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900">
          Contact Hub & Support Desk
        </h1>
        <p className="font-sans text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          Need operational guidance or wish to report a transaction issue? Submit a ticket below or dial our direct management line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-sans text-base font-extrabold text-neutral-900 border-b border-neutral-100 pb-3">
              Operational Hotlines
            </h3>

            <div className="space-y-4">
              
              <div className="flex items-start space-x-3.5">
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-2.5 text-[#cb202d]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider">Prince (Director / Fleet Operations)</h4>
                  <a href={`tel:${config.phonePrince}`} className="font-mono text-lg font-black text-neutral-900 hover:text-rose-600 transition block">
                    +91 {config.phonePrince}
                  </a>
                  <p className="font-sans text-[11px] text-neutral-500 leading-normal mt-0.5">
                    Connect on physical approvals, payout allocations, or emergency support requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5 text-orange-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider">Vanshul (Director / Onboarding Help)</h4>
                  <a href={`tel:${config.phoneVanshul}`} className="font-mono text-lg font-black text-neutral-900 hover:text-rose-600 transition block">
                    +91 {config.phoneVanshul}
                  </a>
                  <p className="font-sans text-[11px] text-neutral-500 leading-normal mt-0.5">
                     Connect on app verification issues, document upload holds, or general queries.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="rounded-xl bg-neutral-55 bg-neutral-100 border border-neutral-200 p-2.5 text-neutral-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider">Corporate Correspondence Email</h4>
                  <a href={`mailto:${config.email}`} className="font-mono text-sm font-semibold text-neutral-900 hover:text-rose-600 transition block">
                    {config.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="rounded-xl bg-neutral-55 bg-neutral-100 border border-neutral-200 p-2.5 text-neutral-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider">Fleet Operational Office</h4>
                  <p className="font-sans text-xs text-neutral-800 leading-normal font-medium">
                    {config.address}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Guidelines info */}
          <div className="rounded-2xl bg-gradient-to-tr from-[#cb202d] to-amber-500 text-white p-6 shadow-md border border-[#cb202d]/20 space-y-4">
            <h4 className="font-sans text-base font-extrabold flex items-center space-x-1.5">
              <ShieldCheck className="h-5 w-5" />
              <span>Grievance Response System</span>
            </h4>
            <p className="font-sans text-xs text-neutral-105 leading-relaxed text-white/90">
               All online custom queries, payout holds investigations, and complaints logged via our systems are synchronized with administrative command panels in the Cockpit. A response is usually dispatched within 2-4 business hours.
            </p>
          </div>

        </div>

        {/* Right Side: Interactive Support ticket lodging */}
        <div className="lg:col-span-7 bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 sm:p-10 flex flex-col justify-between">
          
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
              <h3 className="font-sans text-base font-extrabold text-neutral-900">
                Log Inquiry or Lodge Complaint
              </h3>
              
              <div className="flex gap-1 border border-neutral-200 rounded-lg p-0.5 bg-neutral-50 font-sans text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCModel('Inquiry')}
                  className={`px-2.5 py-1 rounded-md transition ${cModel === 'Inquiry' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
                >
                  General Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setCModel('Complaint')}
                  className={`px-2.5 py-1 rounded-md transition ${cModel === 'Complaint' ? 'bg-[#cb202d] text-white' : 'text-neutral-500'}`}
                >
                  Lodge Complaint
                </button>
              </div>
            </div>

            {lodgeId && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-4 text-emerald-800 text-xs font-medium space-y-1 font-sans">
                <p className="font-bold flex items-center space-x-1 text-emerald-900">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span>Ticket Registered Successfully</span>
                </p>
                <p>Your lookup reservation token is: <strong>{lodgeId}</strong>. It was dispatched to Prince and Vanshul for immediate inspection.</p>
                <button type="button" onClick={() => setLodgeId(null)} className="text-[10px] uppercase font-bold underline text-emerald-650 pt-2 block">Create new ticket</button>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 text-xs font-semibold flex items-center space-x-1.5 font-sans">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {!lodgeId && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-600">Your Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Yadav"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-600">Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit smartphone number"
                      maxLength={10}
                      value={cMobile}
                      onChange={(e) => setCMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-600">Subject Topic <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={cModel === 'Complaint' ? 'e.g. Delay in Referral bonus credentials' : 'e.g. Electric bike eligibility details'}
                    value={cSubject}
                    onChange={(e) => setCSubject(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-600">Exhaustive Message Summary <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Elaborate details so our operations support desk can isolate the issue immediately."
                    value={cMessage}
                    onChange={(e) => setCMessage(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-rose-500 font-sans leading-relaxed text-xs"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs transition inline-flex items-center space-x-2"
                  >
                    {isSending ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span>SENDING TICKET STATUS...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 text-rose-400" />
                        <span>DISPATCH TICKETS REGISTER</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          <div className="border-t border-neutral-100 pt-5 text-[10px] text-neutral-400 flex items-center justify-between font-sans">
            <span>🛡️ Safe SSL encrypted dispatch checks</span>
            <span>ID: Auto allocated</span>
          </div>

        </div>

      </div>

    </div>
  );
}
