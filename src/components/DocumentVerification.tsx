import React, { useState } from 'react';
import { Application, CompanyConfig } from '../types';
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, Phone, FileCheck, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentVerificationProps {
  config: CompanyConfig;
  applications: Application[];
  riders: any[];
}

export default function DocumentVerification({ config, applications, riders }: DocumentVerificationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Application | null>(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);
    setSearched(false);

    if (!searchQuery.trim()) {
      setSearchError('Please fill in Application ID or Mobile Number');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const query = searchQuery.trim().toUpperCase();

      // Find application matching ID or Mobile
      const matchedApp = applications.find(
        (app) => app.id.toUpperCase() === query || app.mobile.replace(/\s+/g, '') === query.replace(/\s+/g, '')
      );

      if (matchedApp) {
        setSearchResult(matchedApp);
      } else {
        // Also look up in active riders!
        const matchedRider = riders.find(
          (r) => r.id.toUpperCase() === query || r.mobile.replace(/\s+/g, '') === query.replace(/\s+/g, '')
        );

        if (matchedRider) {
          // If already fully in the rider database, mock up a completed approved placeholder Application
          setSearchResult({
            id: `APP-APPROVED-${matchedRider.id.split('-').pop()}`,
            fullName: matchedRider.name,
            mobile: matchedRider.mobile,
            dob: 'CONFIDENTIAL',
            address: matchedRider.address || 'Seeded in Rider Database',
            vehicleType: matchedRider.vehicleType,
            vehicleNumber: matchedRider.vehicleNumber,
            aadhaarNumber: matchedRider.aadhaar,
            panNumber: matchedRider.pan,
            dlNumber: matchedRider.dl,
            bankName: matchedRider.bankName,
            accountNumber: matchedRider.accountNumber,
            ifscCode: matchedRider.ifscCode,
            status: 'Approved',
            appliedDate: matchedRider.joiningDate || '2026-06-01',
            documents: {
              aadhaarCard: 'approved_scan.pdf',
              panCard: 'approved_scan.pdf',
              drivingLicence: 'approved_scan.pdf',
              bankPassbook: 'approved_scan.pdf',
              passportPhoto: 'approved_profile.png'
            },
            remarks: 'Onboarding completed. Dynamic Rider ID generated: ' + matchedRider.id
          });
        } else {
          setSearchError('No matching application records found. Double check your input query.');
        }
      }
      setSearched(true);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-6 pb-20 space-y-10">
      
      {/* Tracker Heading */}
      <div className="text-center space-y-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#cb202d] bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          Onboarding Check Center
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900">
          Document Verification Status
        </h1>
        <p className="font-sans text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          Verify your credentials status online. Instantly check if your Aadhaar, DL, and bank accounts were successfully audited.
        </p>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSearch} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 sm:p-6">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-neutral-600 font-sans">
            SEARCH BY APPLICATION ID (e.g. APP-001) OR REGISTERED DEVISE MOBILE NUMBER
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Enter Application ID / Mobile Number (e.g. APP-001 or 9518290381)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full font-mono text-xs pl-10 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-neutral-900 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="font-sans flex items-center justify-center space-x-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-xl transition cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>SEARCHING...</span>
                </>
              ) : (
                <span>CHECK STATUS</span>
              )}
            </button>
          </div>

          {searchError && (
            <p className="font-sans text-xs font-bold text-rose-600 flex items-center space-x-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{searchError}</span>
            </p>
          )}
        </div>
      </form>

      {/* Search results rendering area with beautiful staggered transition */}
      <AnimatePresence mode="wait">
        {searched && searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white border border-neutral-100 shadow-lg rounded-2xl overflow-hidden"
          >
            {/* Header of results panel */}
            <div className="border-b border-rose-50 bg-rose-50/15 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="font-sans space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-bold">Rider Application</span>
                <h3 className="text-xl font-extrabold text-neutral-900 leading-tight">{searchResult.fullName}</h3>
                <p className="font-mono text-xs text-neutral-500">Contact Number: +91 {searchResult.mobile}</p>
              </div>

              {/* Status Pill */}
              <div className="shrink-0 font-sans">
                {searchResult.status === 'Approved' && (
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-4 py-1.5 border border-emerald-200 text-emerald-800 text-xs font-bold font-sans">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approved & Active</span>
                  </span>
                )}
                {searchResult.status === 'Pending' && (
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-50 px-4 py-1.5 border border-amber-200 text-amber-800 text-xs font-bold font-sans">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-605 text-amber-600" />
                    <span>Scrutiny Pending</span>
                  </span>
                )}
                {searchResult.status === 'Rejected' && (
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-50 px-4 py-1.5 border border-red-200 text-red-800 text-xs font-bold font-sans">
                    <XCircle className="h-4 w-4" />
                    <span>Application Rejected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Application Detail grid */}
            <div className="p-6 space-y-6 font-sans">
              
              {/* Detailed Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <p className="text-neutral-400 font-bold uppercase tracking-wide text-[10px]">Applied Date</p>
                  <p className="font-mono font-medium text-neutral-850 mt-0.5">{searchResult.appliedDate}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase tracking-wide text-[10px]">Registration Token</p>
                  <p className="font-mono font-black text-rose-600 mt-0.5">{searchResult.id}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase tracking-wide text-[10px]">Vehicle Configuration</p>
                  <p className="font-semibold text-neutral-850 mt-0.5">
                    {searchResult.vehicleType} <span className="font-mono text-neutral-500 font-normal">({searchResult.vehicleNumber})</span>
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 font-bold uppercase tracking-wide text-[10px]">Bank Payout Address</p>
                  <p className="font-medium text-neutral-850 mt-0.5">
                    {searchResult.bankName} <span className="font-mono text-neutral-500 font-normal">({searchResult.accountNumber})</span>
                  </p>
                </div>
              </div>

              {/* Verification logs checklist */}
              <div className="border-t border-neutral-100 pt-6 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-405 text-neutral-500">
                  Regulatory Verification Roadmap
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'Aadhaar Identification Scan', file: searchResult.documents.aadhaarCard },
                    { name: 'Permanent Account Number Card', file: searchResult.documents.panCard },
                    { name: 'Valid Driving Licence scan', file: searchResult.documents.drivingLicence },
                    { name: 'Passbook / UPI Destination audit', file: searchResult.documents.bankPassbook },
                    { name: 'Passport photo facial scan', file: searchResult.documents.passportPhoto }
                  ].map((item, idx) => {
                    const statusColor = searchResult.status === 'Approved' 
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                      : searchResult.status === 'Rejected'
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-amber-653 text-amber-600 bg-amber-50 border-amber-200';
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-neutral-800 truncate leading-tight">{item.name}</p>
                          <p className="font-mono text-[9px] text-neutral-405 text-neutral-500 truncate mt-0.5">{item.file}</p>
                        </div>
                        <span className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full border text-[9px] ${statusColor}`}>
                          ✓
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Administrative logs remarks */}
              <div className="rounded-xl border border-neutral-150 bg-neutral-50 p-4 space-y-1.5">
                <p className="text-[10px] uppercase font-mono font-bold text-neutral-400">ADMINISTRATIVE SCRUTINY REMARKS</p>
                <p className="text-xs font-semibold text-neutral-800 bg-white border border-neutral-100 rounded-lg p-3 leading-relaxed">
                  {searchResult.remarks || (searchResult.status === 'Pending' 
                    ? 'Our audit desk is currently verifying your DL and PAN credentials with Indian corporate registers. Please yield 2 hours for full onboarding completion.' 
                    : 'Onboarding criteria fully synchronized. Zomato uniform and gear allocated for collection.')}
                </p>
              </div>

              {/* Live contact nudge widget */}
              <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-900 leading-tight">Need immediate document sanctioning?</p>
                  <p className="text-[11px] text-neutral-500">Contact coordinators to fast-track verification status onto active route slots.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`tel:${config.phonePrince}`}
                    className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-2 font-sans font-bold text-xs shadow-sm shadow-emerald-100 transition duration-150"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Nudge Prince: {config.phonePrince}</span>
                  </a>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {searched && !searchResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-neutral-150 bg-white p-10 text-center space-y-4"
          >
            <AlertCircle className="mx-auto h-12 w-12 text-[#cb202d] animate-bounce" />
            <h3 className="font-sans text-lg font-extrabold text-neutral-900 leading-tight">Query Finding Error</h3>
            <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              We couldn't detect any active onboarding application matching <strong>"{searchQuery}"</strong> in PV India databases. Please verify values or register a new rider profile.
            </p>
            <div className="pt-2 border-t border-neutral-50 max-w-xs mx-auto">
              <span className="font-sans text-[11px] text-neutral-400">Need live assistance? Print or dialPrince: +91-8826996189</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
