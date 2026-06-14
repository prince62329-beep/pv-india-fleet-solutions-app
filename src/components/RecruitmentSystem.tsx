import React, { useState } from 'react';
import { Application, CompanyConfig } from '../types';
import { CheckCircle2, UploadCloud, ShieldAlert, BookOpen, AlertCircle, Sparkles, Building, User, Lock, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecruitmentSystemProps {
  config: CompanyConfig;
  onAddApplication: (app: Omit<Application, 'id' | 'appliedDate' | 'status'>) => string;
}

export default function RecruitmentSystem({ config, onAddApplication }: RecruitmentSystemProps) {
  // Application fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Scooty' | 'EV Scooter'>('Bike');
  const [isLowSpeedEV, setIsLowSpeedEV] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Mock document files list
  const [documents, setDocuments] = useState({
    aadhaarCard: '',
    panCard: '',
    drivingLicence: '',
    bankPassbook: '',
    passportPhoto: '',
  });

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Drag and drop helper states
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const handleDrag = (e: React.DragEvent, key: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [key]: active }));
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [key]: false }));
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setDocuments((prev) => ({ ...prev, [key]: files[0].name }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const files = e.target.files;
    if (files && files[0]) {
      setDocuments((prev) => ({ ...prev, [key]: files[0].name }));
    }
  };

  const triggerMockUpload = (key: string) => {
    // Inject a realistic filename for quick UX testing if they click "Quick Upload mock"
    setDocuments((prev) => ({ ...prev, [key]: `${key}_uploaded_proof.png` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Adjust variables if low-speed EV is selected
    const isEvExempt = vehicleType === 'EV Scooter' && isLowSpeedEV;
    const effectiveVehicleNumber = isEvExempt ? (vehicleNumber || 'EV-LOWSPEED-NO-PLATE') : vehicleNumber;
    const effectiveDlNumber = isEvExempt ? (dlNumber || 'NO LICENSE REQUIRED') : dlNumber;
    
    const effectiveDocuments = { ...documents };
    if (isEvExempt && !effectiveDocuments.drivingLicence) {
      effectiveDocuments.drivingLicence = 'ev_scooter_exemption_certificate.png';
    }

    // Basic Validation
    if (
      !fullName || 
      !mobile || 
      !dob || 
      !address || 
      !effectiveVehicleNumber || 
      !aadhaarNumber || 
      !panNumber || 
      !effectiveDlNumber || 
      !bankName || 
      !accountNumber || 
      !ifscCode
    ) {
      setFormError('Please enter all required fields marked with *');
      return;
    }

    // Phone format validation
    if (mobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Document mock check
    const missingDocs = Object.entries(effectiveDocuments).filter(([_, val]) => !val);
    if (missingDocs.length > 0) {
      setFormError('Please upload all required document files before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate real-world asynchronous API call delay
      setTimeout(() => {
        const generatedId = onAddApplication({
          fullName,
          mobile,
          alternateMobile,
          dob,
          address,
          vehicleType,
          vehicleNumber: effectiveVehicleNumber,
          aadhaarNumber,
          panNumber,
          dlNumber: effectiveDlNumber,
          bankName,
          accountNumber,
          ifscCode,
          upiId,
          documents: effectiveDocuments,
        });

        setSubmittedAppId(generatedId);
        setIsSubmitting(false);
        
        // Reset state
        setFullName('');
        setMobile('');
        setAlternateMobile('');
        setDob('');
        setAddress('');
        setVehicleNumber('');
        setAadhaarNumber('');
        setPanNumber('');
        setDlNumber('');
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setUpiId('');
        setDocuments({
          aadhaarCard: '',
          panCard: '',
          drivingLicence: '',
          bankPassbook: '',
          passportPhoto: '',
        });
        window.scrollTo({ top: 30, behavior: 'smooth' });
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError('An unexpected submission failure occurred. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 mt-6 pb-20 text-neutral-900">
      
      <AnimatePresence mode="wait">
        {!submittedAppId ? (
          <motion.div
            key="application-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header Area */}
            <div className="text-center space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Join our Zomato Fleet
              </span>
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900">
                Rider Registration Program
              </h1>
              <p className="font-sans text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
                Provide accurate registration details to establish your official PV-ZOM-ID. Please verify details align with physical Government Documents.
              </p>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-xs font-semibold flex items-start space-x-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 sm:p-10 space-y-10">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white font-mono">1</span>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Personal & Communication Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Full Name (As in Aadhaar) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar Yadav"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Mobile Number <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit Phone Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Alternate Contact (Optional)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Emergency contact"
                      value={alternateMobile}
                      onChange={(e) => setAlternateMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Date of Birth <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Local Residential Address <span className="text-rose-500">*</span></label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Full Address matching Aadhaar records (Delhi NCR)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/55"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: VEHICLE ALLOCATION */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white font-mono">2</span>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Vehicle Specification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Fleet Vehicle Category <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Bike', 'Scooty', 'EV Scooter'] as const).map((vt) => (
                        <button
                          key={vt}
                          type="button"
                          onClick={() => setVehicleType(vt)}
                          className={`py-2.5 text-xs font-bold rounded-lg transition-all border ${
                            vehicleType === vt 
                              ? 'bg-rose-500 text-white border-rose-500' 
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {vt}
                        </button>
                      ))}
                    </div>

                    {vehicleType === 'EV Scooter' && (
                      <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2">
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isLowSpeedEV}
                            onChange={(e) => setIsLowSpeedEV(e.target.checked)}
                            className="mt-0.5 rounded border-orange-500/30 text-orange-500 focus:ring-orange-500 h-4 w-4 bg-slate-900"
                          />
                          <div className="text-xs text-orange-200 font-sans leading-relaxed">
                            <strong className="text-orange-400 font-bold block mb-0.5">🚀 Low-Speed EV (No Plate & No License Required)</strong>
                            Low-speed electric vehicles (&lt;25kms max velocity, &lt;250 Watts motor power) are fully exempted by the RTO. 
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Vehicle Number <span className="text-rose-500">*</span></label>
                    {vehicleType === 'EV Scooter' && isLowSpeedEV ? (
                      <div className="w-full text-xs font-sans border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-lg p-3 font-medium flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>EV-LOWSPEED-NO-PLATE (RTO Exemption Active)</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL-3S-CH-4321"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION 3: COMPLIANCE NUMBERS */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white font-mono">3</span>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Government ID Credentials</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-sans">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Aadhaar Card Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      placeholder="12-digit UIDAI number"
                      value={aadhaarNumber}
                      onChange={(e) => {
                        // Format with dashes for realism
                        const val = e.target.value.replace(/\D/g, '');
                        const parts = val.match(/.{1,4}/g);
                        setAadhaarNumber(parts ? parts.slice(0, 3).join('-') : val);
                      }}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">PAN Card Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="10-digit Alphanumeric"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Driving Licence Number <span className="text-rose-500">*</span></label>
                    {vehicleType === 'EV Scooter' && isLowSpeedEV ? (
                      <div className="w-full text-xs font-sans border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-lg p-3 font-medium flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>NO LICENSE REQUIRED (Low-Speed EV)</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL-142021000"
                        value={dlNumber}
                        onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION 4: BANK PAYOUT ACCOUNTS */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white font-mono">4</span>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Settlement Bank & UPI Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Bank Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. State Bank of India"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-xs border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Account Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Savings or Current account"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">Bank IFSC Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      placeholder="11-digit IFSC code"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600">UPI ID for Quick Payouts (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfc"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-neutral-50/50"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 5: DOCUMENT SCAN UPLOAD */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white font-mono">5</span>
                  <h3 className="font-sans text-base font-extrabold text-neutral-900">Upload Scanned Verification Documents</h3>
                </div>

                <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex items-start space-x-2.5 text-xs text-amber-800 font-sans">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Physical Scrutiny Guidelines</strong>
                    Please upload clean, high-contrast photograph scans. You can click on the upload slot or drop images dynamically. For testing / simulation, you may also click <strong>"Quick Upload"</strong> to auto-mock verification scans instantly.
                  </div>
                </div>

                {/* Grid of Documents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                  {[
                    { key: 'aadhaarCard', name: 'Aadhaar Card Scan (Front & Back)' },
                    { key: 'panCard', name: 'PAN Card Scan' },
                    { key: 'drivingLicence', name: 'Valid Driving Licence Scan' },
                    { key: 'bankPassbook', name: 'Passbook or Cancelled Cheque Scan' },
                    { key: 'passportPhoto', name: 'Passport Size Photo' },
                  ].map((doc) => {
                    const docKey = doc.key as keyof typeof documents;
                    const fileName = documents[docKey];
                    const isDragActive = dragActive[doc.key] || false;

                    const isEvExempt = vehicleType === 'EV Scooter' && isLowSpeedEV;
                    if (doc.key === 'drivingLicence' && isEvExempt) {
                      return (
                        <div
                          key={doc.key}
                          className="relative flex flex-col items-center justify-center border-2 border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 text-center transition-all min-h-[145px]"
                        >
                          <div className="space-y-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            </span>
                            <p className="text-[11px] font-bold text-emerald-400 leading-tight">Driving Licence Exemption</p>
                            <p className="text-[10px] text-emerald-500/80">Delhi NCR Low-Speed EV Policy Active</p>
                            <span className="inline-block text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold tracking-wider">
                              No License Required
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={doc.key}
                        onDragOver={(e) => handleDrag(e, doc.key, true)}
                        onDragLeave={(e) => handleDrag(e, doc.key, false)}
                        onDrop={(e) => handleDrop(e, doc.key)}
                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all min-h-[145px] ${
                          fileName
                            ? 'border-emerald-300 bg-emerald-50/10'
                            : isDragActive
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/20'
                        }`}
                      >
                        {fileName ? (
                          <div className="space-y-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                            <p className="text-[11px] font-bold text-neutral-800 line-clamp-1">{fileName}</p>
                            <button
                              type="button"
                              onClick={() => setDocuments(p => ({ ...p, [doc.key]: '' }))}
                              className="text-[9px] font-mono text-rose-500 uppercase font-semibold underline"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <UploadCloud className="mx-auto h-6 w-6 text-neutral-400" />
                            <p className="text-[10px] font-bold text-neutral-700 leading-tight">{doc.name}</p>
                            <p className="text-[9px] text-neutral-400">PDF, PNG, JPG upto 5MB</p>
                            
                            <div className="flex items-center justify-center space-x-1.5 pt-1.5">
                              <label className="text-[9px] cursor-pointer bg-neutral-900 text-white font-bold tracking-wide rounded px-2 py-1 text-center hover:bg-neutral-800">
                                Browse
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(e, doc.key)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => triggerMockUpload(doc.key)}
                                className="text-[9px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded px-2 py-1"
                              >
                                Quick Mock
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* ACTION: SUBMIT APPLICATION */}
              <div className="pt-6 font-sans">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg transition duration-200 ${
                    isSubmitting ? 'opacity-80 cursor-wait' : 'active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full shrink-0" />
                      <span className="tracking-widest uppercase text-xs">UPLOADING DATA SCANS...</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-widest uppercase text-xs">SUBMIT REGISTRATION APPLICATION</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </motion.div>
        ) : (
          /* SUCCESS SCREEN STATE */
          <motion.div
            key="application-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-rose-100 shadow-xl rounded-3xl p-6 sm:p-10 text-center space-y-8"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-3.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Application Submitted Successfully!
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                Congratulations & Onboarding Initiated!
              </h2>
              <p className="font-sans text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
                Your online registration metrics were successfully written to the PV India database stack. Note down your unique Application reference ID key to verify verification approvals.
              </p>
            </div>

            {/* Application Token Callout */}
            <div className="max-w-md mx-auto rounded-2xl bg-neutral-900 text-white p-6 border border-neutral-800 space-y-3 shadow-inner">
              <p className="font-sans text-xs text-neutral-400 uppercase tracking-widest font-bold">Your Verification Tokens</p>
              <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                {submittedAppId}
              </div>
              <p className="font-mono text-[10px] text-neutral-500">
                Generated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>

            {/* Instruction workflow */}
            <div className="max-w-xl mx-auto rounded-xl border border-neutral-100 bg-neutral-50 p-6 space-y-4 text-left font-sans text-xs">
              <h4 className="font-bold text-neutral-800 text-sm">Next Onboarding Action Points:</h4>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start space-x-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-slate-105 font-mono font-bold text-white text-[10px]">1</span>
                  <span><strong>Instant Processing:</strong> Managers Prince & Vanshul check applications within 2-4 hours. You can search the status here using <strong>"Verify Documents"</strong>.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-slate-105 font-mono font-bold text-white text-[10px]">2</span>
                  <span><strong>Verification Call:</strong> Once verified, you will receive a phone text approval outlining your assigned Zomato Rider ID password.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-slate-105 font-mono font-bold text-white text-[10px]">3</span>
                  <span><strong>Helpline Support:</strong> Call Prince at <strong>+91-8826996189</strong> for spot verification approvals immediately without waiting!</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setSubmittedAppId(null)}
                className="font-sans bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-750 text-rose-700 py-3 px-6 rounded-xl text-xs font-bold transition"
              >
                Submit another application
              </button>
              <a
                href={`tel:${config.phonePrince}`}
                className="font-sans bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call Prince For On-Spot Approval</span>
              </a>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
