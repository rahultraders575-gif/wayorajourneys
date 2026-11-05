import React, { useState } from 'react';
import { CaptainProfile, VehicleInspectionAudit, SafetyEquipmentCheck } from '../../types';
import {
  FileCheck, ShieldCheck, BadgeCheck, Eye, Upload, 
  Trash2, AlertCircle, CheckCircle2, Calendar, FileText, 
  Sparkles, Check, Car, Camera, Info, X, Shield, 
  Award, QrCode, CreditCard, Building, MapPin, Gauge,
  AlertTriangle, Compass, CheckSquare, ChevronRight, Lock
} from 'lucide-react';

interface ComplianceInspectionPipelineProps {
  captain: CaptainProfile;
  onUpdateInspection: (audit: VehicleInspectionAudit) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type PillarTab = 'all' | 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4';

const DEFAULT_DOC_IMAGES = {
  dl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=800&q=80',
  aadhaar: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  pan: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  pcc: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  rc: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  insurance: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  fc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  permit: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  puc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  rear: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  left: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  right: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
  cluster: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  boot: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  cheque: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
};

export const ComplianceInspectionPipeline: React.FC<ComplianceInspectionPipelineProps> = ({
  captain,
  onUpdateInspection,
  showToast,
}) => {
  const [activePillarTab, setActivePillarTab] = useState<PillarTab>('all');
  const [previewDoc, setPreviewDoc] = useState<{ title: string; imageUrl: string; description?: string } | null>(null);

  // Pillar 3: Roadside 5-Point Self-Audit Checklist State
  const initialAudit: VehicleInspectionAudit = captain.inspectionAudit || {
    tireTreadCondition: true,
    acCoolingCheck: true,
    spareTireAvailable: true,
    interiorSanitized: true,
    waterBottlesStocked: true,
    lastAuditedAt: 'Today, 06:30 AM',
  };

  const [audit, setAudit] = useState<VehicleInspectionAudit>(initialAudit);
  const [auditSigned, setAuditSigned] = useState(true);

  // Pillar 3: Safety Equipment Checklist
  const [safetyKit, setSafetyKit] = useState<SafetyEquipmentCheck>(
    captain.safetyEquipmentCheck || {
      stepneyTire: true,
      hydraulicJackKit: true,
      fireExtinguisher: true,
      firstAidKit: true,
      hazardTriangle: true,
    }
  );

  const handleToggleAudit = (key: keyof Omit<VehicleInspectionAudit, 'lastAuditedAt'>) => {
    const updated = {
      ...audit,
      [key]: !audit[key],
    };
    setAudit(updated);
    setAuditSigned(false);
  };

  const handleToggleSafetyKit = (key: keyof SafetyEquipmentCheck) => {
    const updated = {
      ...safetyKit,
      [key]: !safetyKit[key],
    };
    setSafetyKit(updated);
    showToast(`Safety kit verified: ${key}`, 'info');
  };

  const handleSignAuditSubmit = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', Today';
    const certifiedAudit: VehicleInspectionAudit = {
      ...audit,
      lastAuditedAt: nowStr,
    };
    setAudit(certifiedAudit);
    setAuditSigned(true);
    onUpdateInspection(certifiedAudit);
    showToast('Pre-Duty Vehicle Inspection certified & dispatched to central audit console.', 'success');
  };

  // Pillar 1 Documents
  const pillar1Docs = [
    {
      title: 'Commercial Driving License (DL)',
      badge: 'Badge Verified',
      identifier: captain.drivingLicenseNumber || 'TS-09-2015-0045892',
      badgeNumber: captain.badgeNumber || 'BDG-HYD-COMM-7741',
      validity: captain.licenseExpiry || 'Valid till Nov 2029',
      image: captain.licensePhoto || DEFAULT_DOC_IMAGES.dl,
      status: 'Verified',
      description: 'Commercial Transport badge license with authorized Light Motor Vehicle (LMV-TR) endorsement.',
    },
    {
      title: 'Identity Proof (Aadhaar e-KYC)',
      badge: 'DigiLocker Verified',
      identifier: captain.aadhaarNumber || 'XXXX-XXXX-8921',
      badgeNumber: 'UIDAI OTP Certified',
      validity: 'Permanent Biometric Record',
      image: captain.aadhaarDocPhoto || DEFAULT_DOC_IMAGES.aadhaar,
      status: 'Verified',
      description: 'Front & Back Aadhaar card linked with registered mobile number and e-KYC authentication.',
    },
    {
      title: 'PAN Card (Income Tax Dept)',
      badge: 'TDS & Payout Linked',
      identifier: captain.panCardNumber || 'ABCDE1234F',
      badgeNumber: 'NSDL Validated',
      validity: 'Active Tax Record',
      image: captain.panCardDocPhoto || DEFAULT_DOC_IMAGES.pan,
      status: 'Verified',
      description: 'Permanent Account Number mandatory for Section 194C TDS tax withholding and bank settlements.',
    },
    {
      title: 'Police Clearance Certificate (PCC)',
      badge: 'Background Cleared',
      identifier: captain.policeClearanceDate || 'Issued within last 6 months',
      badgeNumber: 'Zero Criminal Antecedents',
      validity: 'Valid (Issued Aug 2026)',
      image: captain.policeClearanceDocPhoto || DEFAULT_DOC_IMAGES.pcc,
      status: captain.policeClearanceStatus || 'Verified',
      description: 'Formal verification certificate issued by local Police Commissionerate / Special Branch.',
    },
    {
      title: 'Chauffeur Uniform Portrait',
      badge: 'Wayora Luxury Standard',
      identifier: `Captain ${captain.name}`,
      badgeNumber: 'Formal White Attire',
      validity: 'Complies with Fleet Dress Code',
      image: captain.uniformPortraitPhoto || captain.photoUrl || DEFAULT_DOC_IMAGES.portrait,
      status: 'Verified',
      description: 'High-resolution professional photo in formal uniform worn during all client journeys.',
    },
  ];

  // Pillar 2 Documents
  const pillar2Docs = [
    {
      title: 'Vehicle Registration (RC Book)',
      badge: 'Commercial Yellow Board',
      identifier: captain.vehicleNumber || 'TS 09 UB 4421',
      ownerName: captain.rcOwnerName || `${captain.name} (Commercial Partner)`,
      validity: captain.rcExpiry || 'Valid till Mar 2031',
      image: captain.rcDocumentPhoto || DEFAULT_DOC_IMAGES.rc,
      status: 'Verified',
      description: 'Commercial yellow-board registration endorsed for tourist taxi passenger carriage.',
    },
    {
      title: 'Commercial Vehicle Insurance',
      badge: 'Passenger & 3rd Party Cover',
      identifier: captain.insurancePolicyNumber || 'POL-ICICI-COMM-44129',
      ownerName: 'ICICI Lombard Commercial',
      validity: captain.insuranceExpiry || 'Valid till Oct 2027',
      image: captain.insuranceDocPhoto || DEFAULT_DOC_IMAGES.insurance,
      status: 'Verified',
      description: 'Comprehensive policy with unlimited third-party liability and ₹15 Lakhs passenger coverage.',
    },
    {
      title: 'RTA Fitness Certificate (FC)',
      badge: 'Roadworthiness Certified',
      identifier: captain.fcNumber || 'FC-TS09-88219-RTA',
      ownerName: 'Regional Transport Authority',
      validity: captain.fcExpiry || 'Valid till Dec 2027',
      image: captain.fcCertificatePhoto || DEFAULT_DOC_IMAGES.fc,
      status: 'Verified',
      description: 'Brake test, headlight beam calibration, speed governor, and suspension certified by RTO.',
    },
    {
      title: 'All-India Tourist Permit (AITP)',
      badge: 'Interstate Highway Pass',
      identifier: captain.permitNumber || 'AITP-IND-55910-TS',
      ownerName: captain.permitType || 'All-India Tourist Permit (AITP)',
      validity: captain.permitExpiry || 'Valid till Aug 2028',
      image: captain.permitDocPhoto || DEFAULT_DOC_IMAGES.permit,
      status: 'Verified',
      description: 'Multi-state tourist authorization allowing seamless interstate border crossings without halting.',
    },
    {
      title: 'Pollution Under Control (PUC)',
      badge: 'BS-VI Emission Pass',
      identifier: captain.pucNumber || 'PUC-TS09-2026-991',
      ownerName: 'Certified Testing Center',
      validity: captain.pucExpiry || 'Valid till Jan 2027',
      image: captain.pucDocPhoto || DEFAULT_DOC_IMAGES.puc,
      status: 'Verified',
      description: 'Verified low smoke density and carbon monoxide emissions compliant with green standards.',
    },
    {
      title: 'FASTag Commercial Highway Tag',
      badge: 'Automatic Toll Clearance',
      identifier: captain.fastagBarcodeId || 'NETC-3416-8921-1002',
      ownerName: `Linked Balance: ₹${captain.fastagBalance}`,
      validity: 'Active on National Highways',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      status: 'Verified',
      description: 'Class 4 Commercial FASTag attached on front windshield for cashless toll gate transactions.',
    },
  ];

  // Pillar 3 4-Side Walkaround Photos
  const walkaroundPhotos = [
    { title: 'Front Profile & Number Plate', image: captain.vehicleFrontPhoto || DEFAULT_DOC_IMAGES.front, sub: 'High-res Daytime Front' },
    { title: 'Rear Profile & Boot Lid', image: captain.vehicleRearPhoto || DEFAULT_DOC_IMAGES.rear, sub: 'Clear Plate & Emblems' },
    { title: 'Left Side Profile', image: captain.vehicleLeftPhoto || DEFAULT_DOC_IMAGES.left, sub: 'Flawless Paint & Alloys' },
    { title: 'Right Side Profile', image: captain.vehicleRightPhoto || DEFAULT_DOC_IMAGES.right, sub: 'Doors & Windows Sealed' },
  ];

  const safetyItems = [
    { key: 'stepneyTire' as const, label: 'Spare Tire (Stepney)', desc: 'Inflated to 35 PSI, minimum 4mm tread' },
    { key: 'hydraulicJackKit' as const, label: 'Hydraulic Jack & Wheel Spanner', desc: 'Tested load capacity with operating lever' },
    { key: 'fireExtinguisher' as const, label: 'Onboard Fire Extinguisher', desc: 'ABC dry powder 1kg with active pressure gauge' },
    { key: 'firstAidKit' as const, label: 'Medical First-Aid Kit', desc: 'Sealed antiseptic, sterile gauze & pain relief' },
    { key: 'hazardTriangle' as const, label: 'Reflective Hazard Triangle', desc: 'High-visibility breakdown roadside marker' },
  ];

  return (
    <div className="space-y-6">

      {/* TOP HEADER: 4-PILLAR CHECKLIST OVERVIEW BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-rose-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Captain Onboarding & Compliance Verification
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Comprehensive 4-Pillar statutory audit mandated for all commercial outstation & luxury chauffeur dispatches on Wayora Journeys.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Status: {captain.onboardingStatus || 'Approved'}</span>
              </span>
            </div>
          </div>

          {/* 4 Pillars Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            <button
              onClick={() => setActivePillarTab('pillar1')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activePillarTab === 'pillar1'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-red-400">PILLAR 1</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-white mt-1">Personal Identity</div>
              <div className="text-[10px] text-slate-400">DL, Aadhaar, PAN, PCC</div>
            </button>

            <button
              onClick={() => setActivePillarTab('pillar2')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activePillarTab === 'pillar2'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-red-400">PILLAR 2</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-white mt-1">Vehicle & Regulatory</div>
              <div className="text-[10px] text-slate-400">RC, Insurance, FC, AITP</div>
            </button>

            <button
              onClick={() => setActivePillarTab('pillar3')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activePillarTab === 'pillar3'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-red-400">PILLAR 3</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-white mt-1">Vehicle Quality Audit</div>
              <div className="text-[10px] text-slate-400">4-Side, Cluster, Safety Kit</div>
            </button>

            <button
              onClick={() => setActivePillarTab('pillar4')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activePillarTab === 'pillar4'
                  ? 'bg-red-600/30 border-red-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-red-400">PILLAR 4</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-white mt-1">Payout & Operations</div>
              <div className="text-[10px] text-slate-400">Bank NEFT, PIN, Zones</div>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActivePillarTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePillarTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          View All 4 Pillars
        </button>
        <button
          onClick={() => setActivePillarTab('pillar1')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePillarTab === 'pillar1'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Identity & Background
        </button>
        <button
          onClick={() => setActivePillarTab('pillar2')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePillarTab === 'pillar2'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Vehicle & Regulatory
        </button>
        <button
          onClick={() => setActivePillarTab('pillar3')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePillarTab === 'pillar3'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Quality & Safety Audit
        </button>
        <button
          onClick={() => setActivePillarTab('pillar4')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePillarTab === 'pillar4'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          4. Payout & Operations
        </button>
      </div>

      {/* PILLAR 1: PERSONAL IDENTITY & BACKGROUND VERIFICATION */}
      {(activePillarTab === 'all' || activePillarTab === 'pillar1') && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Personal Identity & Background Verification
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Government-issued credentials, DigiLocker Aadhaar e-KYC, commercial transport badge, and police clearance.
              </p>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>5 / 5 Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pillar1Docs.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{doc.title}</h4>
                    <span className="text-[10px] text-emerald-700 font-bold block">{doc.badge}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {doc.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">RECORD NO:</span>
                    <span className="font-mono font-bold text-slate-800">{doc.identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">BADGE / AUTH:</span>
                    <span className="font-semibold text-slate-700">{doc.badgeNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                    {doc.validity}
                  </div>
                </div>

                <div
                  onClick={() => setPreviewDoc({ title: doc.title, imageUrl: doc.image, description: doc.description })}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer"
                >
                  <img
                    src={doc.image}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Inspect Document</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 2: VEHICLE REGISTRATION & REGULATORY COMPLIANCE */}
      {(activePillarTab === 'all' || activePillarTab === 'pillar2') && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Vehicle Registration & Regulatory Compliance
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Yellow-board commercial RC, RTA fitness, comprehensive insurance, All-India Tourist Permit, and FASTag.
              </p>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>6 / 6 Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pillar2Docs.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{doc.title}</h4>
                    <span className="text-[10px] text-emerald-700 font-bold block">{doc.badge}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {doc.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">NUMBER:</span>
                    <span className="font-mono font-bold text-slate-800 truncate max-w-[170px]">{doc.identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">AUTHORITY:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{doc.ownerName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                    {doc.validity}
                  </div>
                </div>

                <div
                  onClick={() => setPreviewDoc({ title: doc.title, imageUrl: doc.image, description: doc.description })}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer"
                >
                  <img
                    src={doc.image}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Inspect Document</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 3: VEHICLE QUALITY & SAFETY AUDIT */}
      {(activePillarTab === 'all' || activePillarTab === 'pillar3') && (
        <div className="space-y-5">
          {/* 3A: 4-Side Walkaround & Cabin/Cluster Photos */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    Vehicle Quality & Safety Audit (Live Photo Inspection)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exterior 4-side walkaround with clear license plate visibility, instrument cluster odometer check, and boot space.
                </p>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Error Lights</span>
              </span>
            </div>

            {/* 4-Side Walkaround Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-600" />
                <span>Exterior Four-Side Walkaround Photos (Commercial Plate Checked)</span>
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {walkaroundPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewDoc({ title: photo.title, imageUrl: photo.image, description: 'Mandatory 4-side live walkaround photo.' })}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer shadow-2xs hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent text-white text-[10px]">
                      <span className="font-bold block truncate">{photo.title}</span>
                      <span className="text-slate-300 text-[9px]">{photo.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrument Cluster & Cabin Space */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setPreviewDoc({
                  title: 'Instrument Cluster & Warning Lights Check',
                  imageUrl: captain.clusterPhoto || DEFAULT_DOC_IMAGES.cluster,
                  description: `Odometer: ${captain.currentOdometerReading || 44210} km. Verified zero engine, ABS, or battery warning lights.`
                })}
                className="group p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-600" />
                    <span>Instrument Cluster</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    No Faults
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden aspect-video relative">
                  <img
                    src={captain.clusterPhoto || DEFAULT_DOC_IMAGES.cluster}
                    alt="Instrument Cluster"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Current Odometer: <strong>{captain.currentOdometerReading || 44210} km</strong>. All dashboard warning lights tested off.
                </p>
              </div>

              <div
                onClick={() => setPreviewDoc({
                  title: 'Cabin & Rear Seat Upholstery',
                  imageUrl: captain.vehicleInteriorPhoto || DEFAULT_DOC_IMAGES.interior,
                  description: 'Dual-zone air conditioning vents and spotless executive leatherette captain seats.'
                })}
                className="group p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Cabin & Climate</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Sanitized
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden aspect-video relative">
                  <img
                    src={captain.vehicleInteriorPhoto || DEFAULT_DOC_IMAGES.interior}
                    alt="Cabin Interior"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Dual-zone AC tested at 19°C. Odorless sanitized cabin with working passenger seat belts.
                </p>
              </div>

              <div
                onClick={() => setPreviewDoc({
                  title: 'Luggage Boot Space Check',
                  imageUrl: captain.bootSpacePhoto || DEFAULT_DOC_IMAGES.boot,
                  description: 'Clean trunk space capable of carrying minimum 4 large strolleys and 2 duffle bags.'
                })}
                className="group p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Luggage Boot Space</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    4+ Bags
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden aspect-video relative">
                  <img
                    src={captain.bootSpacePhoto || DEFAULT_DOC_IMAGES.boot}
                    alt="Luggage Boot Space"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Uncluttered boot space with clean floor matting ready for outstation luggage.
                </p>
              </div>
            </div>

            {/* Safety Equipment Checklist */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Onboard Safety Equipment (Roadside Readiness)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {safetyItems.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={safetyKit[item.key]}
                      onChange={() => handleToggleSafetyKit(item.key)}
                      className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-slate-500 text-[10px] block leading-snug">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 3B: Pre-Duty Roadside Self-Audit Checklist */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-red-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    Pre-Duty Roadside Self-Audit
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory roadside safety protocol before accepting highway passenger dispatches.
                </p>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto ${
                auditSigned
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{auditSigned ? `Certified (${audit.lastAuditedAt})` : 'Signature Pending'}</span>
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={audit.tireTreadCondition}
                  onChange={() => handleToggleAudit('tireTreadCondition')}
                  className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Tire Tread & Pressure Verification</span>
                  <span className="text-slate-500 text-[11px] block">
                    All 4 highway radial tires inspected. Minimum 4mm tread depth verified with zero sidewall cracks or bulges.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={audit.acCoolingCheck}
                  onChange={() => handleToggleAudit('acCoolingCheck')}
                  className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">AC Dual-Zone Climate Cooling</span>
                  <span className="text-slate-500 text-[11px] block">
                    Cabin air cooling tested at lowest setting (19°C); rear roof blower vents blowing chilled and dust-free air.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={audit.spareTireAvailable}
                  onChange={() => handleToggleAudit('spareTireAvailable')}
                  className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Spare Wheel (Stepney) & Hydraulic Jack Kit</span>
                  <span className="text-slate-500 text-[11px] block">
                    Underbody/boot spare tire inflated to recommended 35 PSI. Mechanical jack, wheel spanner, and hazard triangle present.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={audit.interiorSanitized}
                  onChange={() => handleToggleAudit('interiorSanitized')}
                  className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Interior Sanitization & Seat Upholstery</span>
                  <span className="text-slate-500 text-[11px] block">
                    Clean odorless cabin, vacuumed seat covers, clean floor mats, and functioning seat belts across all passenger rows.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={audit.waterBottlesStocked}
                  onChange={() => handleToggleAudit('waterBottlesStocked')}
                  className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Passenger Amenities & Sealed Mineral Water</span>
                  <span className="text-slate-500 text-[11px] block">
                    Minimum 4 sealed Kinley/Bisleri water bottles, tissue box, and USB phone charging cables in door pockets.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500">
                Certified by <strong>Captain {captain.name}</strong> ({captain.vehicleNumber}).
              </p>
              <button
                type="button"
                onClick={handleSignAuditSubmit}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Submit Pre-Duty Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: PAYOUT & OPERATIONAL CONFIGURATION */}
      {(activePillarTab === 'all' || activePillarTab === 'pillar4') && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Payout & Operational Configuration
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bank account linked for daily NEFT/IMPS earnings auto-sweep, shift PIN security, and assigned operating corridors.
              </p>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NEFT Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Account Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Direct Settlement Bank Account (Matching PAN)</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-slate-800">{captain.bankAccountDetails?.bankName || 'HDFC Bank Ltd'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-slate-800">{captain.bankAccountDetails?.accountNumber || '50100492817290'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-mono font-bold text-slate-800">{captain.bankAccountDetails?.ifsc || 'HDFC0000128'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Holder:</span>
                  <span className="font-bold text-slate-800">{captain.bankAccountDetails?.accountHolderName || captain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payout Cycle:</span>
                  <span className="font-bold text-emerald-600">{captain.bankAccountDetails?.payoutCycle || 'Daily Auto-Sweep (T+1)'}</span>
                </div>
              </div>

              {/* Cancelled Cheque Button */}
              <button
                type="button"
                onClick={() => setPreviewDoc({
                  title: 'Cancelled Cheque Copy (Bank Account Verification)',
                  imageUrl: captain.bankAccountDetails?.cancelledChequePhoto || DEFAULT_DOC_IMAGES.cheque,
                  description: 'Bank account verification matching PAN card name for direct settlement credits.'
                })}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>Inspect Cancelled Cheque / Statement</span>
              </button>
            </div>

            {/* Operating Corridors & Shift Security */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Authorized Operating Corridors & Terminal Security</span>
                </h4>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {captain.primaryCity || 'Hyderabad'}
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">ENABLED DISPATCH TIERS</span>
                <div className="flex flex-wrap gap-1.5">
                  {(captain.operatingZones || [
                    'Airport Transfers (RGIA Terminal 1 & 2)',
                    'Outstation Round-Trips (All India)',
                    'Intercity Hourly Rentals (8hr / 80km)'
                  ]).map((zone, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                      <span>{zone}</span>
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cockpit 4-Digit Security PIN:</span>
                  </span>
                  <span className="font-mono font-black text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                    ••••
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Interstate toll FASTags auto-reimburse directly to registered bank account during nightly settlements.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">{previewDoc.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-[60vh] flex items-center justify-center bg-slate-900">
              <img
                src={previewDoc.imageUrl}
                alt={previewDoc.title}
                className="max-h-[55vh] w-auto object-contain"
              />
            </div>

            {previewDoc.description && (
              <p className="text-xs text-slate-600 px-1">
                {previewDoc.description}
              </p>
            )}

            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              Close Inspection View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
