
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../services/mockStore';
import { useAppNavigation } from '../context/AppNavigationContext';
import { EntryStatus, UserEntry, Passenger, GuarantorInfo, RegisteredUser, AdminUser, Role, Incident } from '../types';
import { Camera, MapPin, User, Truck, CheckCircle2, FileText, Clock, XCircle, Plus, Printer, ArrowLeft, ArrowRight, Download, Users, Trash2, QrCode, Calendar, Home, Phone, Baby, Settings, Bell, Lock, Globe, Moon, Mail, Shield, UserCircle, Save, LogOut, Briefcase, Car, CreditCard, Box, Eye, Edit, AlertTriangle, Search, ChevronLeft, ChevronRight, Filter, RotateCcw, X, AlertOctagon, Send, Zap, ChevronDown, Check, CreditCard as IdCard, BadgeCheck, Stethoscope, Gavel } from 'lucide-react';

declare var html2pdf: any;

// --- INVOICE / PERMIT COMPONENT ---
const Invoice: React.FC<{ entry: UserEntry; onClose: () => void }> = ({ entry, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAndPrint = () => {
    setIsDownloading(true);
    const element = document.getElementById('invoice-content');
    
    if (typeof html2pdf !== 'undefined' && element) {
      const opt = {
        margin:       [0.2, 0.2, 0.2, 0.2],
        filename:     `Permit-${entry.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
        setTimeout(() => { window.print(); }, 1000);
      }).catch((err: any) => {
        console.error('PDF generation failed:', err);
        setIsDownloading(false);
        window.print(); 
      });
    } else {
      window.print();
      setIsDownloading(false);
    }
  };

  const PersonCard = ({ name, role, photo, contact, age, status, birth, guarantor }: any) => (
    <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg bg-white break-inside-avoid mb-2 shadow-sm">
      <img src={photo} className="w-16 h-16 rounded-md object-cover bg-slate-100 border border-slate-200" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-slate-900">{name}</p>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{role}</p>
            </div>
            {age && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium border border-slate-200">Age: {age}</span>}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            {contact && <div className="flex items-center gap-1"><Phone size={10} /> {contact}</div>}
            {status && <div>Status: <span className="text-slate-700 font-medium">{status}</span></div>}
            {birth && <div>Born: <span className="text-slate-700 font-medium">{birth}</span></div>}
        </div>
        {guarantor && (
            <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Guarantor (Damiin)</p>
                <p className="text-xs font-medium text-slate-800">{guarantor.fullName} - {guarantor.phoneNumber}</p>
                <p className="text-[10px] text-slate-500">{guarantor.address}</p>
            </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Toolbar */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden flex-shrink-0 sticky top-0 z-20">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 font-medium">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handleDownloadAndPrint} disabled={isDownloading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/50 transition-all active:scale-95 disabled:opacity-70">
              {isDownloading ? <><Clock size={18} className="animate-spin"/> Generating...</> : <><Printer size={18} /> Print Permit</>}
          </button>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-10 md:p-14 print:p-8 print:overflow-visible bg-white relative" id="invoice-content">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-green-500 to-white"></div>
          
          <div className="border-b border-slate-200 pb-8 mb-8 flex justify-between items-start">
            <div className="flex items-center gap-6">
                <div className="h-24 w-36 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2 print:border-slate-300">
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg" 
                        alt="Logo" 
                        className="w-full h-full object-contain" 
                     />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight leading-none">Entry Permit</h1>
                    <p className="text-slate-500 font-semibold mt-1.5 tracking-wide">Puntland Border Management System</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-medium">Ministry of Interior</p>
                </div>
            </div>
            <div className="text-right">
               <div className="flex flex-col items-end">
                 <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                    <QrCode size={80} className="text-slate-900" />
                 </div>
                 <span className="font-mono text-xs text-slate-500 font-bold block mt-2 bg-slate-100 px-2 py-0.5 rounded">ID: {entry.id.substring(0,8).toUpperCase()}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-slate-300">
             <div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 print:border-0 print:p-0">
                    APPROVED
                 </span>
             </div>
             <div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Issue Date</span>
                 <span className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
             </div>
             <div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Type</span>
                 <span className="text-sm font-bold text-slate-900">{entry.entryType.replace('_', ' ')}</span>
             </div>
             <div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Valid Until</span>
                 <span className="text-sm font-bold text-slate-900">{new Date(Date.now() + 86400000 * 30).toLocaleDateString()}</span>
             </div>
          </div>

          <div className="mb-10 break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-5 flex items-center gap-2">
                <Truck size={18} className="text-slate-400" /> Transport & Route
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Origin</span><div className="font-bold text-lg text-slate-900">{entry.originCity}</div></div>
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Destination</span><div className="font-bold text-lg text-slate-900">{entry.destinationCity}</div></div>
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Purpose</span><div className="font-medium text-slate-700">{entry.purpose}</div></div>
                  
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Vehicle</span><div className="font-medium text-slate-700">{entry.vehicle.type}</div></div>
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Plate Number</span><div className="font-mono font-bold text-slate-900 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">{entry.vehicle.registrationNumber}</div></div>
                  <div><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Driver</span><div className="font-medium text-slate-700">{entry.vehicle.driverName || entry.fullName}</div></div>
                  
                  {entry.cargoType && <div className="col-span-3 bg-slate-50 p-3 rounded border border-slate-100"><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Cargo Manifest</span><div className="font-medium text-slate-800">{entry.cargoType}</div></div>}
              </div>
          </div>

          <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-5 flex items-center gap-2">
                <Users size={18} className="text-slate-400" /> Manifest Details
              </h3>
              <div className="space-y-4">
                  <PersonCard 
                    name={entry.fullName} 
                    role={entry.entryType === 'DRIVER' ? 'Driver' : 'Primary Traveler'} 
                    photo={entry.photoUrl} 
                    contact={entry.contactNumber}
                    age={entry.age}
                    status={entry.maritalStatus}
                    birth={entry.placeOfBirth}
                    guarantor={entry.guarantor}
                  />
                  {entry.passengers?.map((p, idx) => (
                    <PersonCard 
                        key={idx} 
                        name={p.fullName} 
                        role="Passenger" 
                        photo={p.photoUrl} 
                        contact={p.contactNumber}
                        age={p.age}
                        status={p.maritalStatus}
                        birth={p.placeOfBirth}
                        guarantor={p.guarantor}
                    />
                  ))}
              </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end text-xs text-slate-400 font-medium">
             <div>
                <p className="mb-1">© {new Date().getFullYear()} Puntland Border Management System.</p>
                <p>This is an official government document. Verify authenticity via QR code.</p>
             </div>
             <div className="flex gap-8 mt-4 md:mt-0">
                 <div className="text-center">
                    <div className="h-10 w-24 border-b border-slate-300 mb-1"></div>
                    <span>City Admin Signature</span>
                 </div>
                 <div className="text-center">
                    <div className="h-10 w-24 border-b border-slate-300 mb-1"></div>
                    <span>Border Control Stamp</span>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DRIVER / OFFICIAL ID CARD COMPONENT ---
const DriverIDCard: React.FC<{ entry: UserEntry; onClose: () => void; logoUrl: string }> = ({ entry, onClose, logoUrl }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const isOfficial = entry.entryType === 'OFFICIAL_ID';

    const handleDownload = () => {
        setIsDownloading(true);
        const element = document.getElementById('driver-id-card');
        if (typeof html2pdf !== 'undefined' && element) {
            const opt = {
                margin: 0,
                filename: `${isOfficial ? 'OfficialID' : 'DriverID'}-${entry.id}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 3, useCORS: true, logging: false },
                jsPDF: { unit: 'in', format: [3.375, 2.125], orientation: 'landscape' } // Standard ID card size
            };
            html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false)).catch(() => setIsDownloading(false));
        } else {
            window.print();
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-6">
                <div id="driver-id-card" className="w-[500px] h-[315px] bg-white rounded-xl overflow-hidden relative shadow-2xl border border-slate-300 print:w-[3.375in] print:h-[2.125in] print:shadow-none print:border-0 print:rounded-none">
                    {/* Front Design */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${isOfficial ? 'from-blue-50 via-white to-blue-50' : 'from-green-50 via-white to-white'} z-0`}></div>
                    
                    {/* Header Strip */}
                    <div className={`absolute top-0 left-0 w-full h-16 bg-gradient-to-r ${isOfficial ? 'from-blue-800 to-blue-600' : 'from-green-700 to-green-600'} flex items-center px-5 z-10 shadow-sm`}>
                        {/* SUPER ADMIN PHOTO AS LOGO */}
                        <img src={logoUrl} className="h-10 w-10 object-cover shadow-sm border-2 border-white/50 rounded-full bg-white" alt="Official Seal" />
                        <div className="ml-4 text-white">
                            <h1 className="text-lg font-bold uppercase leading-none tracking-tight">Puntland State</h1>
                            <p className="text-[10px] uppercase font-medium tracking-widest opacity-90 mt-0.5">
                                {isOfficial ? 'Official Authority ID' : 'Commercial Driver ID'}
                            </p>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg" className="h-8 w-auto absolute right-4 opacity-20 mix-blend-overlay" />
                    </div>

                    {/* Content */}
                    <div className="absolute top-20 left-5 right-5 bottom-5 z-10 flex gap-5">
                        <div className="flex flex-col gap-2 shrink-0">
                            <div className={`w-28 h-32 bg-slate-200 rounded-lg overflow-hidden border-2 ${isOfficial ? 'border-blue-800' : 'border-green-700'} shadow-sm`}>
                                <img src={entry.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] uppercase font-bold text-slate-400">ID No.</span>
                                <span className="font-mono text-sm font-bold text-slate-800 tracking-wide">{entry.id.substring(0,8).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-2 align-content-start pt-1">
                            <div className="col-span-2">
                                <span className={`block text-[9px] uppercase font-bold ${isOfficial ? 'text-blue-700' : 'text-green-700'} mb-0.5`}>Full Name</span>
                                <span className="block text-sm font-bold text-slate-900 uppercase truncate">{entry.fullName}</span>
                            </div>
                            
                            {isOfficial ? (
                                <>
                                    <div className="col-span-2">
                                        <span className="block text-[8px] uppercase font-bold text-blue-700 mb-0.5">Title / Rank</span>
                                        <span className="block text-xs font-semibold text-slate-800">{entry.officialRole || 'Official'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-[8px] uppercase font-bold text-blue-700 mb-0.5">Department</span>
                                        <span className="block text-xs font-semibold text-slate-800">{entry.department || 'Government'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase font-bold text-blue-700 mb-0.5">Badge No.</span>
                                        <span className="block text-xs font-semibold text-slate-800 font-mono">{entry.badgeNumber || 'N/A'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="block text-[8px] uppercase font-bold text-green-700 mb-0.5">License No</span>
                                        <span className="block text-xs font-semibold text-slate-800">{entry.driverLicenseNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase font-bold text-green-700 mb-0.5">Phone</span>
                                        <span className="block text-xs font-semibold text-slate-800">{entry.contactNumber}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase font-bold text-green-700 mb-0.5">Vehicle Type</span>
                                        <span className="block text-xs font-semibold text-slate-800">{entry.vehicle.type}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] uppercase font-bold text-green-700 mb-0.5">Plate No</span>
                                        <span className="block text-xs font-bold font-mono bg-slate-100 px-1 rounded text-slate-900 border border-slate-200 inline-block">{entry.vehicle.registrationNumber}</span>
                                    </div>
                                </>
                            )}

                            <div>
                                <span className={`block text-[8px] uppercase font-bold ${isOfficial ? 'text-blue-700' : 'text-green-700'} mb-0.5`}>Issue Date</span>
                                <span className="block text-xs font-semibold text-slate-800">{entry.issueDate || new Date().toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className={`block text-[8px] uppercase font-bold ${isOfficial ? 'text-blue-700' : 'text-green-700'} mb-0.5`}>Expiry Date</span>
                                {isOfficial ? (
                                    <span className="block text-xs font-bold text-slate-800">VALID INDEFINITELY</span>
                                ) : (
                                    <span className="block text-xs font-bold text-red-600">{entry.expiryDate || 'N/A'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className={`absolute bottom-0 left-0 w-full h-6 ${isOfficial ? 'bg-blue-50 border-t border-blue-100' : 'bg-green-50 border-t border-green-100'} flex items-center justify-between px-5 z-10`}>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${isOfficial ? 'text-blue-800' : 'text-green-800'}`}>
                            {isOfficial ? 'AUTHORIZED PERSONNEL' : (entry.vehicleOwnership === 'OWNER' ? 'OWNER OPERATOR' : 'HIRED DRIVER')}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400">MINISTRY OF INTERIOR</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-bold">Close</button>
                    <button onClick={handleDownload} className={`px-6 py-2 text-white rounded-lg transition-colors font-bold shadow-lg flex items-center gap-2 ${isOfficial ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
                        {isDownloading ? <Clock size={18} className="animate-spin"/> : <Download size={18} />} Download ID Card
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UserSubmission: React.FC<{
  navSection?: 'dashboard' | 'selection' | 'profile' | 'settings' | 'incident';
}> = ({ navSection }) => {
  const { entries, addEntry, editEntry, currentUser, logoutUser, updateCurrentUserProfile, addIncident, incidents, triggerEmergency, admins, systemLogo } = useStore();
  const { setUserSection } = useAppNavigation();
  const [view, setView] = useState<'dashboard' | 'selection' | 'driver_id_selection' | 'form' | 'driver_form' | 'driver_id_form' | 'official_id_form' | 'invoice' | 'id_card' | 'profile' | 'settings' | 'view_entry' | 'incident'>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<UserEntry | null>(null);
  const [selectedEntryForView, setSelectedEntryForView] = useState<UserEntry | null>(null);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Dashboard State
  const [dashboardFilter, setDashboardFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'RETURNED' | 'REJECTED'>('ALL');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Incident Success State
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const driverFileInputRef = useRef<HTMLInputElement>(null);
  const driverIDFileInputRef = useRef<HTMLInputElement>(null);
  const officialIDFileInputRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const incidentImageRef = useRef<HTMLInputElement>(null);
  const passengerImageRef = useRef<HTMLInputElement>(null);

  // Retrieve Super Admin photo for ID Card
  const superAdmin = admins.find(a => a.role === Role.SUPER_ADMIN);
  const superAdminPhoto = superAdmin?.photoUrl || systemLogo;

  const [biometricFingerprint, setBiometricFingerprint] = useState<string | undefined>();
  const [biometricFace, setBiometricFace] = useState<string | undefined>();

  const captureBiometric = (type: 'fingerprint' | 'face') => {
    const stub = `data:image/png;base64,${type}-capture-${Date.now()}`;
    if (type === 'fingerprint') setBiometricFingerprint(stub);
    else setBiometricFace(stub);
  };

  const myEntries = entries.filter(e => e.userId === (currentUser as RegisteredUser)?.id);
  const myIncidents = incidents.filter(i => i.userId === (currentUser as RegisteredUser)?.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const [userProfile, setUserProfile] = useState({
      name: '',
      phone: '',
      gender: 'Male',
      dob: '1990-01-01',
      placeOfBirth: '',
      vehiclePlate: '',
      photoUrl: 'https://picsum.photos/200/200',
      email: '',
      responsibility: ''
  });

  const [incidentForm, setIncidentForm] = useState<{
    type: Incident['type'];
    description: string;
    location: string;
    photoUrl: string;
  }>({
      type: 'Vehicle Breakdown',
      description: '',
      location: '',
      photoUrl: ''
  });

  // State for new Driver ID form
  const [driverIdForm, setDriverIdForm] = useState({
      fullName: '',
      age: '',
      contactNumber: '',
      photoUrl: 'https://picsum.photos/200/200',
      registrationNumber: '',
      vehicleType: 'Car',
      vehicleModel: '',
      vehicleOwnership: 'OWNER' as 'OWNER' | 'HIRED' | 'COMPANY',
      issueDate: '',
      expiryDate: '',
      licenseNumber: ''
  });

  // State for new Official ID form
  const [officialIdForm, setOfficialIdForm] = useState({
      fullName: '',
      officialRole: '',
      department: '',
      badgeNumber: '',
      contactNumber: '',
      photoUrl: 'https://picsum.photos/200/200',
      issueDate: new Date().toISOString().split('T')[0]
  });

  const [primaryUser, setPrimaryUser] = useState<{
      fullName: string;
      contactNumber: string;
      photoUrl: string;
      maritalStatus: string;
      age: string;
      placeOfBirth: string;
      guarantor: GuarantorInfo;
  }>({
    fullName: '',
    contactNumber: '',
    photoUrl: 'https://picsum.photos/200/200',
    maritalStatus: 'Single',
    age: '',
    placeOfBirth: '',
    guarantor: { fullName: '', phoneNumber: '', address: '' }
  });

  const [driverForm, setDriverForm] = useState({
      fullName: '',
      contactNumber: '',
      licenseNumber: '',
      photoUrl: 'https://picsum.photos/200/200',
      registrationNumber: '',
      vehicleType: 'Truck',
      vehicleModel: '',
      vehicleOwner: '',
      cargoType: '',
      originCity: '',
      destinationCity: '',
      purpose: 'Logistics/Transport',
      journeyDate: ''
  });

  useEffect(() => {
      if(currentUser) {
          // Safe Access with Type Check
          const isRegistered = 'fullName' in currentUser;
          const name = isRegistered ? (currentUser as RegisteredUser).fullName : (currentUser as AdminUser).name;
          const city = isRegistered ? (currentUser as RegisteredUser).city : (currentUser as AdminUser).assignedCity || '';
          const phone = currentUser.phone || '';
          const email = currentUser.email || '';
          const responsibility = currentUser.responsibility || '';
          const photoUrl = currentUser.photoUrl || 'https://picsum.photos/200/200';

          setUserProfile(prev => ({
              ...prev,
              name: name,
              email: email,
              phone: phone,
              placeOfBirth: city,
              responsibility: responsibility,
              photoUrl: photoUrl
          }));
          
          setPrimaryUser(prev => ({
              ...prev,
              fullName: name,
              contactNumber: phone,
              placeOfBirth: city,
              photoUrl: photoUrl
          }));
          
          setDriverForm(prev => ({
              ...prev,
              fullName: name,
              contactNumber: phone,
              photoUrl: photoUrl
          }));

          setDriverIdForm(prev => ({
              ...prev,
              fullName: name,
              contactNumber: phone,
              photoUrl: photoUrl
          }));

          setOfficialIdForm(prev => ({
              ...prev,
              fullName: name,
              contactNumber: phone,
              photoUrl: photoUrl
          }));

          setIncidentForm(prev => ({
              ...prev,
              location: city
          }));
      }
  }, [currentUser]);

  useEffect(() => {
    if (navSection) {
      setView(navSection);
    }
  }, [navSection]);

  useEffect(() => {
    if (['dashboard', 'selection', 'profile', 'settings', 'incident'].includes(view)) {
      setUserSection(view as 'dashboard' | 'selection' | 'profile' | 'settings' | 'incident');
    }
  }, [view, setUserSection]);

  const [userSettings, setUserSettings] = useState({
      notifications: true,
      theme: 'Light',
      language: 'English',
      password: ''
  });

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  
  const [vehicleData, setVehicleData] = useState({
    vehicleType: 'Car',
    registrationNumber: userProfile.vehiclePlate,
    driverName: '',
    vehicleDate: '',
    originCity: '',
    destinationCity: '',
    purpose: ''
  });

  const [tempPassenger, setTempPassenger] = useState<{
    fullName: string;
    contactNumber: string;
    photoUrl: string;
    maritalStatus: string;
    age: string;
    placeOfBirth: string;
    guarantor: GuarantorInfo;
  }>({
    fullName: '',
    contactNumber: '',
    photoUrl: 'https://picsum.photos/200/200',
    maritalStatus: 'Single',
    age: '',
    placeOfBirth: '',
    guarantor: { fullName: '', phoneNumber: '', address: '' }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'primary' | 'driver' | 'profile' | 'incident' | 'passenger' | 'driver_id' | 'official_id') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'profile') {
            setUserProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'primary') {
            setPrimaryUser(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'driver') {
            setDriverForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'incident') {
            setIncidentForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'passenger') {
            setTempPassenger(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'driver_id') {
            setDriverIdForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        } else if (target === 'official_id') {
            setOfficialIdForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPassenger = () => {
    setPassengers([...passengers, {
        ...tempPassenger,
        age: tempPassenger.age ? parseInt(tempPassenger.age) : undefined
    }]);
    setTempPassenger({
        fullName: '',
        contactNumber: '',
        photoUrl: 'https://picsum.photos/200/200',
        maritalStatus: 'Single',
        age: '',
        placeOfBirth: '',
        guarantor: { fullName: '', phoneNumber: '', address: '' }
    });
    setShowPassengerModal(false);
  };

  const handleEditEntry = (entry: UserEntry) => {
      setEditingEntryId(entry.id);
      setSelectedEntryForView(null);

      if (entry.entryType === 'DRIVER') {
          setDriverForm({
              fullName: entry.fullName,
              contactNumber: entry.contactNumber,
              licenseNumber: entry.driverLicenseNumber || '',
              photoUrl: entry.photoUrl,
              registrationNumber: entry.vehicle.registrationNumber,
              vehicleType: entry.vehicle.type,
              vehicleModel: entry.vehicleModel || '',
              vehicleOwner: entry.vehicleOwner || '',
              cargoType: entry.cargoType || '',
              originCity: entry.originCity,
              destinationCity: entry.destinationCity,
              purpose: entry.purpose,
              journeyDate: entry.journeyDate || ''
          });
          setView('driver_form');
      } else if (entry.entryType === 'DRIVER_ID') {
          setDriverIdForm({
              fullName: entry.fullName,
              age: entry.age?.toString() || '',
              contactNumber: entry.contactNumber,
              photoUrl: entry.photoUrl,
              registrationNumber: entry.vehicle.registrationNumber,
              vehicleType: entry.vehicle.type,
              vehicleModel: entry.vehicleModel || '',
              vehicleOwnership: entry.vehicleOwnership || 'OWNER',
              issueDate: entry.issueDate || '',
              expiryDate: entry.expiryDate || '',
              licenseNumber: entry.driverLicenseNumber || ''
          });
          setView('driver_id_form');
      } else if (entry.entryType === 'OFFICIAL_ID') {
          setOfficialIdForm({
              fullName: entry.fullName,
              officialRole: entry.officialRole || '',
              department: entry.department || '',
              badgeNumber: entry.badgeNumber || '',
              contactNumber: entry.contactNumber,
              photoUrl: entry.photoUrl,
              issueDate: entry.issueDate || ''
          });
          setView('official_id_form');
      } else {
          setPrimaryUser({
              fullName: entry.fullName,
              contactNumber: entry.contactNumber,
              photoUrl: entry.photoUrl,
              maritalStatus: entry.maritalStatus || 'Single',
              age: entry.age?.toString() || '',
              placeOfBirth: entry.placeOfBirth || '',
              guarantor: entry.guarantor || { fullName: '', phoneNumber: '', address: '' }
          });
          setVehicleData({
              vehicleType: entry.vehicle.type,
              registrationNumber: entry.vehicle.registrationNumber,
              driverName: entry.vehicle.driverName || '',
              vehicleDate: entry.journeyDate || '',
              originCity: entry.originCity,
              destinationCity: entry.destinationCity,
              purpose: entry.purpose
          });
          setPassengers(entry.passengers || []);
          setView('form');
      }
  };

  const handleSubmitPassengerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const entryData = {
      entryType: 'PASSENGER' as const,
      fullName: primaryUser.fullName,
      contactNumber: primaryUser.contactNumber,
      photoUrl: primaryUser.photoUrl,
      maritalStatus: primaryUser.maritalStatus,
      age: primaryUser.age ? parseInt(primaryUser.age) : undefined,
      placeOfBirth: primaryUser.placeOfBirth,
      guarantor: (primaryUser.age && parseInt(primaryUser.age) < 20) ? primaryUser.guarantor : undefined,
      biometricFingerprint,
      biometricFace,
      vehicle: {
        type: vehicleData.vehicleType,
        registrationNumber: vehicleData.registrationNumber,
        driverName: vehicleData.driverName || undefined
      },
      originCity: vehicleData.originCity,
      destinationCity: vehicleData.destinationCity,
      purpose: vehicleData.purpose,
      journeyDate: vehicleData.vehicleDate,
      accompanyingPersons: passengers.map(p => p.fullName).join(', '),
      passengers: passengers.map(p => ({
          ...p,
          guarantor: (p.age && p.age < 20) ? p.guarantor : undefined
      }))
    };

    if (editingEntryId) {
        await editEntry(editingEntryId, entryData);
        setEditingEntryId(null);
    } else {
        await addEntry(entryData);
    }
    setBiometricFingerprint(undefined);
    setBiometricFace(undefined);
    setView('dashboard');
  };

  const handleSubmitDriverForm = async (e: React.FormEvent) => {
      e.preventDefault();
      const entryData = {
          entryType: 'DRIVER' as const,
          fullName: driverForm.fullName,
          contactNumber: driverForm.contactNumber,
          photoUrl: driverForm.photoUrl,
          driverLicenseNumber: driverForm.licenseNumber,
          vehicle: {
              type: driverForm.vehicleType,
              registrationNumber: driverForm.registrationNumber,
              driverName: driverForm.fullName
          },
          vehicleModel: driverForm.vehicleModel,
          vehicleOwner: driverForm.vehicleOwner,
          cargoType: driverForm.cargoType,
          originCity: driverForm.originCity,
          destinationCity: driverForm.destinationCity,
          purpose: driverForm.purpose,
          journeyDate: driverForm.journeyDate,
          accompanyingPersons: 'None',
          passengers: []
      };

      if (editingEntryId) {
          await editEntry(editingEntryId, entryData);
          setEditingEntryId(null);
      } else {
          await addEntry(entryData);
      }
      setView('dashboard');
  }

  const handleSubmitDriverIDForm = async (e: React.FormEvent) => {
      e.preventDefault();
      const entryData = {
          entryType: 'DRIVER_ID' as const,
          fullName: driverIdForm.fullName,
          age: parseInt(driverIdForm.age) || undefined,
          contactNumber: driverIdForm.contactNumber,
          photoUrl: driverIdForm.photoUrl,
          driverLicenseNumber: driverIdForm.licenseNumber,
          vehicle: {
              type: driverIdForm.vehicleType,
              registrationNumber: driverIdForm.registrationNumber,
              driverName: driverIdForm.fullName
          },
          vehicleModel: driverIdForm.vehicleModel,
          vehicleOwnership: driverIdForm.vehicleOwnership,
          issueDate: driverIdForm.issueDate,
          expiryDate: driverIdForm.expiryDate,
          
          // Defaults for required fields not used in ID card flow
          originCity: 'N/A',
          destinationCity: 'N/A',
          purpose: 'ID Generation',
          accompanyingPersons: 'None',
          passengers: []
      };

      if (editingEntryId) {
          await editEntry(editingEntryId, entryData);
          setEditingEntryId(null);
      } else {
          await addEntry(entryData);
      }
      setView('dashboard');
  };

  const handleSubmitOfficialIDForm = async (e: React.FormEvent) => {
      e.preventDefault();
      const entryData = {
          entryType: 'OFFICIAL_ID' as const,
          fullName: officialIdForm.fullName,
          contactNumber: officialIdForm.contactNumber,
          photoUrl: officialIdForm.photoUrl,
          officialRole: officialIdForm.officialRole,
          department: officialIdForm.department,
          badgeNumber: officialIdForm.badgeNumber,
          issueDate: officialIdForm.issueDate,
          expiryDate: 'INDEFINITE', // Official IDs don't expire automatically
          
          // Defaults
          vehicle: { type: 'N/A', registrationNumber: 'OFFICIAL' },
          originCity: 'N/A',
          destinationCity: 'N/A',
          purpose: 'Official Authority ID',
          accompanyingPersons: 'None',
          passengers: []
      };

      if (editingEntryId) {
          await editEntry(editingEntryId, entryData);
          setEditingEntryId(null);
      } else {
          await addEntry(entryData);
      }
      setView('dashboard');
  };

  const handleIncidentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!incidentForm.description || !incidentForm.location) {
          alert("Please fill in description and location.");
          return;
      }

      await addIncident({
          userId: currentUser?.id || 'unknown',
          reportedBy: userProfile.name,
          type: incidentForm.type,
          description: incidentForm.description,
          location: incidentForm.location,
          photoUrl: incidentForm.photoUrl || undefined
      });

      // Clear form and show success, but stay on page
      setIncidentSubmitted(true);
      setTimeout(() => setIncidentSubmitted(false), 3000);
      
      setIncidentForm({
          type: 'Vehicle Breakdown',
          description: '',
          location: userProfile.placeOfBirth,
          photoUrl: ''
      });
  };

  const handleViewEntry = (entry: UserEntry) => {
      if (entry.status === EntryStatus.APPROVED) {
        if (entry.entryType === 'DRIVER_ID' || entry.entryType === 'OFFICIAL_ID') {
            setSelectedInvoice(entry);
            setView('id_card'); // Switch to ID Card view
        } else {
            setSelectedInvoice(entry);
            setView('invoice');
        }
      } else {
        setSelectedEntryForView(entry);
        setView('view_entry');
      }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      
      updateCurrentUserProfile({
        fullName: userProfile.name, // Mapping local state 'name' to store 'fullName' for RegisteredUser
        phone: userProfile.phone,
        city: userProfile.placeOfBirth, // Mapping 'placeOfBirth' to 'city'
        responsibility: userProfile.responsibility,
        photoUrl: userProfile.photoUrl
      });
      
      alert('Profile updated successfully!');
      setView('dashboard');
  };

  const handleSaveSettings = () => {
      alert('Settings saved successfully!');
  };

  const handleEmergencyPress = () => {
      if (confirm("Are you sure you want to trigger an EMERGENCY ALERT? This will notify authorities immediately.")) {
          triggerEmergency();
          alert("Emergency Alert Sent! Stay safe.");
      }
  };

  const GuarantorInputs = ({ data, setData }: { data: any, setData: any }) => (
    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mt-3 animate-in slide-in-from-top-2">
        <h4 className="text-xs font-bold text-orange-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <ShieldIcon size={14} /> Guarantor Details
        </h4>
        <div className="space-y-3">
             <input required placeholder="Guarantor Full Name" value={data.guarantor.fullName} onChange={e => setData({...data, guarantor: {...data.guarantor, fullName: e.target.value}})} className="w-full px-4 py-2 text-sm border border-orange-200 bg-white rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
             <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Phone" value={data.guarantor.phoneNumber} onChange={e => setData({...data, guarantor: {...data.guarantor, phoneNumber: e.target.value}})} className="w-full px-4 py-2 text-sm border border-orange-200 bg-white rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
                <input required placeholder="Address" value={data.guarantor.address} onChange={e => setData({...data, guarantor: {...data.guarantor, address: e.target.value}})} className="w-full px-4 py-2 text-sm border border-orange-200 bg-white rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" />
             </div>
        </div>
    </div>
  );

  const ShieldIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );

  if (view === 'invoice' && selectedInvoice) {
    return createPortal(<Invoice entry={selectedInvoice} onClose={() => setView('dashboard')} />, document.body);
  }

  // --- RENDER ID CARD ---
  if (view === 'id_card' && selectedInvoice) {
      return createPortal(<DriverIDCard entry={selectedInvoice} onClose={() => setView('dashboard')} logoUrl={superAdminPhoto} />, document.body);
  }

  // ... (Profile, Settings, Incident views remain the same) ...
  // --- Profile View ---
  if (view === 'profile') {
      return (
        <div className="max-w-3xl mx-auto py-6 animate-in fade-in slide-in-from-right duration-300">
             <button onClick={() => setView('dashboard')} className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Dashboard
              </button>

              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  {/* ... Profile content ... */}
                  <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        <div className="absolute -bottom-12 left-10">
                            <div className="h-32 w-32 bg-white rounded-2xl p-1.5 shadow-xl relative group">
                                <div 
                                    className="h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden cursor-pointer"
                                    onClick={() => profileImageRef.current?.click()}
                                >
                                    {userProfile.photoUrl ? (
                                        <img src={userProfile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <div 
                                    className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                    onClick={() => profileImageRef.current?.click()}
                                >
                                    <Camera size={24} className="text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    ref={profileImageRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleImageUpload(e, 'profile')} 
                                />
                            </div>
                        </div>
                  </div>
                  
                  <div className="pt-16 pb-10 px-10">
                      <div className="flex justify-between items-start mb-8">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
                             <p className="text-slate-500">{userProfile.responsibility || 'Registered User'}</p>
                         </div>
                         <button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                             <Save size={18} /> Save Changes
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Personal Information</h3>
                              
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                                  <div className="relative">
                                     <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                     <input 
                                        value={userProfile.name} 
                                        onChange={e => setUserProfile({...userProfile, name: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                     />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                                  <div className="relative">
                                     <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                     <input 
                                        disabled
                                        value={userProfile.email} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-sm outline-none cursor-not-allowed"
                                     />
                                  </div>
                              </div>
                              
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                                  <div className="relative">
                                     <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                     <input 
                                        value={userProfile.phone} 
                                        onChange={e => setUserProfile({...userProfile, phone: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                     />
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Location & Role</h3>
                              
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Base City / Location</label>
                                  <div className="relative">
                                     <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                     <input 
                                        value={userProfile.placeOfBirth} 
                                        onChange={e => setUserProfile({...userProfile, placeOfBirth: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                     />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Responsibility / Role</label>
                                  <div className="relative">
                                     <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                                     <input 
                                        value={userProfile.responsibility} 
                                        onChange={e => setUserProfile({...userProfile, responsibility: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                     />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
        </div>
      );
  }

  // --- Settings View ---
  if (view === 'settings') {
      return (
         <div className="max-w-2xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-300">
             <button onClick={() => setView('dashboard')} className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Dashboard
              </button>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings size={20}/> Settings</h2>
                
                <div className="space-y-6">
                    {/* ... settings content ... */}
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-bold text-slate-700 text-sm">Email Notifications</p>
                            <p className="text-xs text-slate-500">Receive updates about your application status</p>
                         </div>
                         <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${userSettings.notifications ? 'bg-blue-600' : 'bg-slate-200'}`} onClick={() => setUserSettings(prev => ({...prev, notifications: !prev.notifications}))}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${userSettings.notifications ? 'right-1' : 'left-1'}`}></div>
                         </div>
                    </div>
                    
                    <hr className="border-slate-100"/>

                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-bold text-slate-700 text-sm">Language</p>
                            <p className="text-xs text-slate-500">System display language</p>
                         </div>
                         <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1.5 outline-none">
                             <option>English</option>
                             <option>Somali</option>
                             <option>Arabic</option>
                         </select>
                    </div>

                    <div className="pt-6">
                        <button onClick={() => { handleSaveSettings(); setView('dashboard'); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                            Save Preferences
                        </button>
                    </div>
                </div>
             </div>
         </div>
      );
  }

  // --- Incident View ---
  if (view === 'incident') {
      return (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Dashboard
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Reporting Form */}
                  <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden h-fit">
                      <div className="px-8 py-6 border-b border-orange-100 bg-orange-50 flex items-center gap-4">
                          <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                              <AlertTriangle size={28} />
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-slate-900">Report Incident</h2>
                              <p className="text-sm text-slate-500 mt-0.5">Log issues for immediate assistance.</p>
                          </div>
                      </div>

                      {incidentSubmitted && (
                          <div className="bg-green-50 p-4 mx-8 mt-6 rounded-xl border border-green-100 flex items-center gap-3 text-green-700 animate-in fade-in">
                              <CheckCircle2 size={20} />
                              <span className="font-bold text-sm">Report submitted successfully. Check status below.</span>
                          </div>
                      )}

                      <form onSubmit={handleIncidentSubmit} className="p-8 space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Incident Type</label>
                              <select 
                                value={incidentForm.type} 
                                onChange={e => setIncidentForm({...incidentForm, type: e.target.value as any})}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none bg-white"
                              >
                                  <option>Suspicious Person</option>
                                  <option>Suspicious Vehicle</option>
                                  <option>Illegal Border Crossing</option>
                                  <option>Document Forgery</option>
                                  <option>Smuggling Activities</option>
                                  <option>Security Threat</option>
                                  <option>Vehicle Breakdown</option>
                                  <option>Route Delay</option>
                                  <option>Medical Emergency</option>
                                  <option>Other</option>
                              </select>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Current Location</label>
                              <div className="relative">
                                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      required
                                      value={incidentForm.location}
                                      onChange={e => setIncidentForm({...incidentForm, location: e.target.value})}
                                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none"
                                      placeholder="e.g. 20km from Garowe Checkpoint"
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description / Development</label>
                              <textarea 
                                  required
                                  rows={4}
                                  value={incidentForm.description}
                                  onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none resize-none"
                                  placeholder="Describe what happened..."
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Evidence Photo (Optional)</label>
                              <div 
                                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors relative overflow-hidden h-32"
                                  onClick={() => incidentImageRef.current?.click()}
                              >
                                  {incidentForm.photoUrl ? (
                                      <img src={incidentForm.photoUrl} alt="Evidence" className="h-full w-full object-contain rounded-lg" />
                                  ) : (
                                      <>
                                          <Camera size={24} className="mb-2" />
                                          <span className="text-xs font-medium">Click to upload photo</span>
                                      </>
                                  )}
                                  <input type="file" ref={incidentImageRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'incident')} />
                              </div>
                          </div>

                          <button 
                              type="submit"
                              className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                              <AlertOctagon size={20} /> Submit Report
                          </button>
                      </form>
                  </div>

                  {/* History Section */}
                  <div className="space-y-4">
                      {/* ... history list ... */}
                      <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-slate-800">My Incident History</h3>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold">{myIncidents.length} Total</span>
                      </div>
                      
                      <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {myIncidents.length === 0 ? (
                              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                  <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                                  <p className="text-slate-500 text-sm font-medium">No previous incidents reported.</p>
                              </div>
                          ) : (
                              myIncidents.map(incident => (
                                  <div key={incident.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                      {/* ... incident item ... */}
                                      <div className="flex justify-between items-start mb-3">
                                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                                              incident.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                              incident.status === 'ESCALATED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                              'bg-amber-50 text-amber-700 border-amber-100'
                                          }`}>
                                              {incident.status === 'REPORTED' ? 'Sent to City Admin' : 
                                               incident.status === 'ESCALATED' ? 'Forwarded to HQ' : 
                                               incident.status}
                                          </span>
                                          <span className="text-[10px] text-slate-400">{new Date(incident.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      
                                      <h4 className="font-bold text-slate-800 text-sm mb-1">{incident.type}</h4>
                                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{incident.description}</p>
                                      
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                                          <MapPin size={12} />
                                          <span className="truncate">{incident.location}</span>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- Main Dashboard View ---
  const StatusCard = ({ label, count, status, icon: Icon, colorClass }: any) => {
      const isActive = dashboardFilter === status;
      return (
        <div 
            onClick={() => { setDashboardFilter(isActive ? 'ALL' : status); setCurrentPage(1); }}
            className={`cursor-pointer rounded-2xl p-5 transition-all relative overflow-hidden group ${isActive ? `bg-white ring-2 ring-offset-2 ${colorClass.ring} shadow-lg scale-[1.02]` : 'bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md'}`}
        >
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass.text}`}>
                <Icon size={80} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${isActive ? colorClass.bg : 'bg-slate-100'} ${isActive ? 'text-white' : 'text-slate-500'}`}>
                            <Icon size={16} />
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? colorClass.text : 'text-slate-400'}`}>{label}</p>
                    </div>
                </div>
                <h3 className={`text-3xl font-extrabold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{count}</h3>
            </div>
        </div>
      );
  }

  if (view === 'selection') {
      return (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
              <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={20} /> Back to Dashboard
              </button>
              
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Border Entry</h2>
                  <p className="text-slate-500 mt-2 text-lg">Select the category that best describes your travel purpose.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
                  <div 
                    onClick={() => setView('form')}
                    className="group relative bg-white rounded-3xl p-8 cursor-pointer shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                      
                      <div className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Users size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Passenger Entry</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8">
                          Ideal for individuals, families, and tourist groups. Register multiple passengers.
                      </p>
                      <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                          Start Passenger <ArrowRight size={18} />
                      </button>
                  </div>

                  <div 
                    onClick={() => setView('driver_form')}
                    className="group relative bg-white rounded-3xl p-8 cursor-pointer shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
                      
                      <div className="mb-6 bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Truck size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Driver & Logistics</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8">
                          Designed for commercial transport, cargo, and logistics entries.
                      </p>
                       <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                          Start Logistics <ArrowRight size={18} />
                      </button>
                  </div>

                  {/* New Driver ID Button now goes to Selection */}
                  <div 
                    onClick={() => setView('driver_id_selection')}
                    className="group relative bg-white rounded-3xl p-8 cursor-pointer shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-green-600"></div>
                      
                      <div className="mb-6 bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                          <IdCard size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">ID Application</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8">
                          Apply for official identification cards for drivers or authority personnel.
                      </p>
                       <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                          Apply for ID <ArrowRight size={18} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- DRIVER ID SELECTION VIEW ---
  if (view === 'driver_id_selection') {
      return (
          <div className="max-w-4xl mx-auto py-10 animate-in slide-in-from-right duration-300">
              <button onClick={() => setView('selection')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Categories
              </button>

              <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900">Select ID Type</h2>
                  <p className="text-slate-500">Choose the type of identification card you are applying for.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Commercial Driver Option */}
                  <div 
                      onClick={() => setView('driver_id_form')}
                      className="bg-white p-8 rounded-2xl border border-green-100 shadow-lg shadow-green-900/5 hover:shadow-xl hover:shadow-green-900/10 cursor-pointer transition-all hover:-translate-y-1 group"
                  >
                      <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Truck size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Commercial Driver ID</h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                          For truck drivers, logistics operators, and commercial vehicle personnel requiring official permits.
                      </p>
                      <div className="flex items-center text-green-600 font-bold text-sm">
                          Start Application <ArrowRight size={16} className="ml-2" />
                      </div>
                  </div>

                  {/* Official/Authority Option */}
                  <div 
                      onClick={() => setView('official_id_form')}
                      className="bg-white p-8 rounded-2xl border border-blue-100 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 cursor-pointer transition-all hover:-translate-y-1 group"
                  >
                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <BadgeCheck size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Official / Authority ID</h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                          For government officials, doctors, police officers, and other authorized personnel.
                      </p>
                      <div className="flex items-center text-blue-600 font-bold text-sm">
                          Start Application <ArrowRight size={16} className="ml-2" />
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- OFFICIAL ID FORM VIEW ---
  if (view === 'official_id_form') {
      return (
        <div className="max-w-4xl mx-auto py-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('driver_id_selection')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to ID Selection
            </button>

            <form onSubmit={handleSubmitOfficialIDForm} className="space-y-8">
                <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-blue-800"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-700">
                            <BadgeCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Official Authority ID Application</h2>
                            <p className="text-slate-500 text-sm">Generate an official ID for authorized personnel. Valid Indefinitely.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={16} className="text-blue-600" /> Personnel Details
                            </h3>
                            
                            <div className="flex items-center gap-6 mb-6">
                                <div 
                                    className="relative w-28 h-32 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 cursor-pointer hover:border-blue-400 overflow-hidden flex-shrink-0"
                                    onClick={() => officialIDFileInputRef.current?.click()}
                                >
                                    <img src={officialIdForm.photoUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                                        <Camera className="text-white opacity-80" size={24} />
                                    </div>
                                    <input type="file" ref={officialIDFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'official_id')} />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                        <input required value={officialIdForm.fullName} onChange={e => setOfficialIdForm({...officialIdForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                                        <input required value={officialIdForm.contactNumber} onChange={e => setOfficialIdForm({...officialIdForm, contactNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Calendar size={16} className="text-blue-600" /> Issuance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Date</label>
                                    <input type="date" required value={officialIdForm.issueDate} onChange={e => setOfficialIdForm({...officialIdForm, issueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Status</label>
                                    <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-800 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> INDEFINITE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Briefcase size={16} className="text-blue-600" /> Official Role Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title / Rank</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            required 
                                            value={officialIdForm.officialRole} 
                                            onChange={e => setOfficialIdForm({...officialIdForm, officialRole: e.target.value})} 
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="e.g. Doctor, Captain, Director" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department / Organization</label>
                                    <div className="relative">
                                        <Gavel className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            required 
                                            value={officialIdForm.department} 
                                            onChange={e => setOfficialIdForm({...officialIdForm, department: e.target.value})} 
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="e.g. Ministry of Health, Puntland Police" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Badge / ID Number</label>
                                    <div className="relative">
                                        <BadgeCheck className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            required 
                                            value={officialIdForm.badgeNumber} 
                                            onChange={e => setOfficialIdForm({...officialIdForm, badgeNumber: e.target.value})} 
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                            placeholder="e.g. OFF-2024-9988" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg">
                        <CheckCircle2 size={24} /> Submit for Official ID
                    </button>
                </div>
            </form>
        </div>
      );
  }

  // --- PASSENGER FORM VIEW ---
  if (view === 'form') {
      return (
        <div className="max-w-4xl mx-auto py-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('selection')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Selection
            </button>

            <form onSubmit={handleSubmitPassengerForm} className="space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Passenger Entry Declaration</h2>
                            <p className="text-slate-500 text-sm">Submit details for individual or group travel.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary User Section */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={16} className="text-blue-500" /> Primary Traveler
                            </h3>
                            
                            <div className="flex justify-center mb-6">
                                <div 
                                    className="relative w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg cursor-pointer hover:border-blue-100 transition-all group overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <img src={primaryUser.photoUrl} alt="Upload" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'primary')} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input required value={primaryUser.fullName} onChange={e => setPrimaryUser({...primaryUser, fullName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                                    <input required value={primaryUser.contactNumber} onChange={e => setPrimaryUser({...primaryUser, contactNumber: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                                        <input type="number" required value={primaryUser.age} onChange={e => setPrimaryUser({...primaryUser, age: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marital Status</label>
                                        <select value={primaryUser.maritalStatus} onChange={e => setPrimaryUser({...primaryUser, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                            <option>Single</option>
                                            <option>Married</option>
                                            <option>Divorced</option>
                                            <option>Widowed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Place of Birth</label>
                                    <input required value={primaryUser.placeOfBirth} onChange={e => setPrimaryUser({...primaryUser, placeOfBirth: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                {primaryUser.age && parseInt(primaryUser.age) < 20 && (
                                    <GuarantorInputs data={primaryUser} setData={setPrimaryUser} />
                                )}

                                <div className="pt-2 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Biometric Verification</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => captureBiometric('fingerprint')} className={`px-3 py-2 rounded-lg text-xs font-bold border ${biometricFingerprint ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                                            {biometricFingerprint ? '✓ Fingerprint Captured' : 'Capture Fingerprint'}
                                        </button>
                                        <button type="button" onClick={() => captureBiometric('face')} className={`px-3 py-2 rounded-lg text-xs font-bold border ${biometricFace ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                                            {biometricFace ? '✓ Face Captured' : 'Capture Face'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Journey & Passengers */}
                    <div className="space-y-6">
                        {/* Journey Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <MapPin size={16} className="text-blue-500" /> Journey Details
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Origin City</label>
                                        <input required value={vehicleData.originCity} onChange={e => setVehicleData({...vehicleData, originCity: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destination</label>
                                        <input required value={vehicleData.destinationCity} onChange={e => setVehicleData({...vehicleData, destinationCity: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purpose of Travel</label>
                                    <select required value={vehicleData.purpose} onChange={e => setVehicleData({...vehicleData, purpose: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                        <option value="">Select Purpose...</option>
                                        <option value="Business">Business / Trade</option>
                                        <option value="Family Visit">Family Visit</option>
                                        <option value="Tourism">Tourism</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Transit">Transit</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Type</label>
                                        <input required value={vehicleData.vehicleType} onChange={e => setVehicleData({...vehicleData, vehicleType: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bus, Car" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plate Number</label>
                                        <input required value={vehicleData.registrationNumber} onChange={e => setVehicleData({...vehicleData, registrationNumber: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passengers Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={16} className="text-blue-500" /> Accompanying Passengers
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{passengers.length}</span>
                            </div>

                            <div className="space-y-3 mb-4">
                                {passengers.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <img src={p.photoUrl} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">{p.fullName}</p>
                                            <p className="text-xs text-slate-500">{p.age} yrs • {p.maritalStatus}</p>
                                        </div>
                                        <button type="button" onClick={() => setPassengers(passengers.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                                {passengers.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No passengers added.</p>}
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setShowPassengerModal(true)}
                                className="w-full py-2.5 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Add Passenger
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-lg">
                        <CheckCircle2 size={24} /> Submit Application
                    </button>
                </div>
            </form>

            {/* Add Passenger Modal */}
            {showPassengerModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Add Passenger</h3>
                            <button onClick={() => setShowPassengerModal(false)}><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-center mb-4">
                                <div className="relative w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-blue-300" onClick={() => passengerImageRef.current?.click()}>
                                    <img src={tempPassenger.photoUrl} className="w-full h-full object-cover" />
                                    <input type="file" ref={passengerImageRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'passenger')} />
                                </div>
                            </div>
                            
                            <input placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" value={tempPassenger.fullName} onChange={e => setTempPassenger({...tempPassenger, fullName: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Age" type="number" className="w-full px-4 py-2 border rounded-lg" value={tempPassenger.age} onChange={e => setTempPassenger({...tempPassenger, age: e.target.value})} />
                                <select className="w-full px-4 py-2 border rounded-lg bg-white" value={tempPassenger.maritalStatus} onChange={e => setTempPassenger({...tempPassenger, maritalStatus: e.target.value})}>
                                    <option>Single</option>
                                    <option>Married</option>
                                    <option>Child</option>
                                </select>
                            </div>
                            <input placeholder="Place of Birth" className="w-full px-4 py-2 border rounded-lg" value={tempPassenger.placeOfBirth} onChange={e => setTempPassenger({...tempPassenger, placeOfBirth: e.target.value})} />
                            <input placeholder="Contact (Optional)" className="w-full px-4 py-2 border rounded-lg" value={tempPassenger.contactNumber} onChange={e => setTempPassenger({...tempPassenger, contactNumber: e.target.value})} />

                            {tempPassenger.age && parseInt(tempPassenger.age) < 20 && (
                                <GuarantorInputs data={tempPassenger} setData={setTempPassenger} />
                            )}

                            <button onClick={handleAddPassenger} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700">Add to List</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // --- DRIVER FORM VIEW ---
  if (view === 'driver_form') {
      return (
        <div className="max-w-4xl mx-auto py-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('selection')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Selection
            </button>

            <form onSubmit={handleSubmitDriverForm} className="space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Commercial Driver & Cargo</h2>
                            <p className="text-slate-500 text-sm">Declaration for logistics and transport vehicles.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Driver Profile */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={16} className="text-indigo-500" /> Driver Information
                            </h3>
                            
                            <div className="flex items-start gap-6 mb-6">
                                <div 
                                    className="relative w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 overflow-hidden flex-shrink-0"
                                    onClick={() => driverFileInputRef.current?.click()}
                                >
                                    <img src={driverForm.photoUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                                        <Camera className="text-white opacity-80" size={20} />
                                    </div>
                                    <input type="file" ref={driverFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'driver')} />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                        <input required value={driverForm.fullName} onChange={e => setDriverForm({...driverForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License No.</label>
                                        <input required value={driverForm.licenseNumber} onChange={e => setDriverForm({...driverForm, licenseNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                                <input required value={driverForm.contactNumber} onChange={e => setDriverForm({...driverForm, contactNumber: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Truck size={16} className="text-indigo-500" /> Vehicle Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration</label>
                                    <input required value={driverForm.registrationNumber} onChange={e => setDriverForm({...driverForm, registrationNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                    <input required value={driverForm.vehicleType} onChange={e => setDriverForm({...driverForm, vehicleType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model / Make</label>
                                    <input required value={driverForm.vehicleModel} onChange={e => setDriverForm({...driverForm, vehicleModel: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Owner</label>
                                    <input required value={driverForm.vehicleOwner} onChange={e => setDriverForm({...driverForm, vehicleOwner: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cargo & Route */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Box size={16} className="text-indigo-500" /> Cargo Manifest
                            </h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description of Goods</label>
                                <textarea 
                                    required 
                                    rows={5}
                                    value={driverForm.cargoType} 
                                    onChange={e => setDriverForm({...driverForm, cargoType: e.target.value})} 
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed" 
                                    placeholder="List main cargo items (e.g. Construction Materials, Foodstuff)..."
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <MapPin size={16} className="text-indigo-500" /> Route Plan
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From</label>
                                        <input required value={driverForm.originCity} onChange={e => setDriverForm({...driverForm, originCity: e.target.value})} className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none text-sm font-medium" />
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To</label>
                                        <input required value={driverForm.destinationCity} onChange={e => setDriverForm({...driverForm, destinationCity: e.target.value})} className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none text-sm font-medium" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Travel</label>
                                    <input type="date" required value={driverForm.journeyDate} onChange={e => setDriverForm({...driverForm, journeyDate: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-lg">
                        <CheckCircle2 size={24} /> Submit Logistics Entry
                    </button>
                </div>
            </form>
        </div>
      );
  }

  // --- DRIVER ID FORM VIEW ---
  if (view === 'driver_id_form') {
      return (
        <div className="max-w-4xl mx-auto py-6 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('selection')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Selection
            </button>

            <form onSubmit={handleSubmitDriverIDForm} className="space-y-8">
                <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 to-green-600"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                            <IdCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Commercial Driver ID Application</h2>
                            <p className="text-slate-500 text-sm">Generate an official Driver ID Card. Requires strict verification.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={16} className="text-green-500" /> Personal Details
                            </h3>
                            
                            <div className="flex items-center gap-6 mb-6">
                                <div 
                                    className="relative w-28 h-32 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 cursor-pointer hover:border-green-400 overflow-hidden flex-shrink-0"
                                    onClick={() => driverIDFileInputRef.current?.click()}
                                >
                                    <img src={driverIdForm.photoUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                                        <Camera className="text-white opacity-80" size={24} />
                                    </div>
                                    <input type="file" ref={driverIDFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'driver_id')} />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                        <input required value={driverIdForm.fullName} onChange={e => setDriverIdForm({...driverIdForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                                            <input required type="number" value={driverIdForm.age} onChange={e => setDriverIdForm({...driverIdForm, age: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                            <input required value={driverIdForm.contactNumber} onChange={e => setDriverIdForm({...driverIdForm, contactNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Calendar size={16} className="text-green-500" /> Validity
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Date</label>
                                    <input type="date" required value={driverIdForm.issueDate} onChange={e => setDriverIdForm({...driverIdForm, issueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                    <input type="date" required value={driverIdForm.expiryDate} onChange={e => setDriverIdForm({...driverIdForm, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Truck size={16} className="text-green-500" /> Vehicle Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Type</label>
                                    <input required value={driverIdForm.vehicleType} onChange={e => setDriverIdForm({...driverIdForm, vehicleType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Truck, Van" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model</label>
                                        <input required value={driverIdForm.vehicleModel} onChange={e => setDriverIdForm({...driverIdForm, vehicleModel: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plate Number</label>
                                        <input required value={driverIdForm.registrationNumber} onChange={e => setDriverIdForm({...driverIdForm, registrationNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Number</label>
                                    <input required value={driverIdForm.licenseNumber} onChange={e => setDriverIdForm({...driverIdForm, licenseNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ownership Status</label>
                                    <div className="flex gap-4">
                                        {['OWNER', 'HIRED', 'COMPANY'].map((status) => (
                                            <label key={status} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="ownership" 
                                                    checked={driverIdForm.vehicleOwnership === status}
                                                    onChange={() => setDriverIdForm({...driverIdForm, vehicleOwnership: status as any})}
                                                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                />
                                                <span className="text-sm font-medium text-slate-700 capitalize">{status.toLowerCase()}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2 text-lg">
                        <CheckCircle2 size={24} /> Submit for ID Approval
                    </button>
                </div>
            </form>
        </div>
      );
  }

  if (view === 'view_entry' && selectedEntryForView) { /* Previous implementation */ return null; }

  // Fallback to Dashboard
  // Filter Logic
  const filteredDashboardEntries = myEntries.filter(e => {
      const matchesSearch = e.fullName.toLowerCase().includes(dashboardSearch.toLowerCase()) || 
                            e.vehicle.registrationNumber.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
                            e.id.includes(dashboardSearch);
      
      const matchesStatus = dashboardFilter === 'ALL' ? true : 
                            dashboardFilter === 'PENDING' ? e.status === EntryStatus.PENDING_CITY :
                            dashboardFilter === 'IN_PROGRESS' ? e.status === EntryStatus.PENDING_SUPER :
                            dashboardFilter === 'APPROVED' ? e.status === EntryStatus.APPROVED :
                            dashboardFilter === 'RETURNED' ? e.status === EntryStatus.RETURNED :
                            dashboardFilter === 'REJECTED' ? e.status === EntryStatus.REJECTED : true;
      
      return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDashboardEntries.length / itemsPerPage);
  const currentEntries = filteredDashboardEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pbms-animate-in">
        <div className="pbms-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Dashboard</h2>
                <p className="text-slate-500 text-sm mt-1">Welcome back, {(currentUser as RegisteredUser)?.fullName || (currentUser as AdminUser)?.name || 'Traveler'}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setView('profile')} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all" title="My Profile">
                    <UserCircle size={20} />
                </button>
                <button onClick={() => setView('settings')} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all" title="Settings">
                    <Settings size={20} />
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                 <button onClick={logoutUser} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Sign Out">
                    <LogOut size={20} />
                </button>
            </div>
            </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatusCard 
                label="In Progress" 
                count={myEntries.filter(e => e.status === EntryStatus.PENDING_SUPER).length} 
                status="IN_PROGRESS"
                icon={Clock}
                colorClass={{ ring: 'ring-blue-500', text: 'text-blue-600', bg: 'bg-blue-600' }}
            />
            <StatusCard 
                label="Approved" 
                count={myEntries.filter(e => e.status === EntryStatus.APPROVED).length} 
                status="APPROVED"
                icon={CheckCircle2}
                colorClass={{ ring: 'ring-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-600' }}
            />
            <StatusCard 
                label="Returned" 
                count={myEntries.filter(e => e.status === EntryStatus.RETURNED).length} 
                status="RETURNED"
                icon={RotateCcw}
                colorClass={{ ring: 'ring-orange-500', text: 'text-orange-600', bg: 'bg-orange-600' }}
            />
             <StatusCard 
                label="Pending" 
                count={myEntries.filter(e => e.status === EntryStatus.PENDING_CITY).length} 
                status="PENDING"
                icon={Box}
                colorClass={{ ring: 'ring-amber-500', text: 'text-amber-600', bg: 'bg-amber-600' }}
            />
            <StatusCard 
                label="Rejected" 
                count={myEntries.filter(e => e.status === EntryStatus.REJECTED).length} 
                status="REJECTED"
                icon={XCircle}
                colorClass={{ ring: 'ring-red-500', text: 'text-red-600', bg: 'bg-red-600' }}
            />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                    placeholder="Search your entries..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={dashboardSearch}
                    onChange={e => setDashboardSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={handleEmergencyPress}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] animate-pulse"
                >
                    <Zap size={20} /> SOS / Emergency
                </button>
                <button 
                    onClick={() => setView('incident')}
                    className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <AlertTriangle size={20} /> Report Incident
                </button>
                <button 
                    onClick={() => setView('selection')}
                    className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Plus size={20} /> New Entry
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-5">Entry ID</th>
                            <th className="px-6 py-5">Type</th>
                            <th className="px-6 py-5">Vehicle / Driver</th>
                            <th className="px-6 py-5">Date</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentEntries.length > 0 ? (
                            currentEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs font-medium bg-slate-50/50 group-hover:bg-transparent">#{entry.id.substring(0,8).toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                            entry.entryType === 'DRIVER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                            entry.entryType === 'DRIVER_ID' ? 'bg-green-50 text-green-700 border-green-100' :
                                            entry.entryType === 'OFFICIAL_ID' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {entry.entryType === 'DRIVER' && <Truck size={12} />}
                                            {entry.entryType === 'DRIVER_ID' && <IdCard size={12} />}
                                            {entry.entryType === 'OFFICIAL_ID' && <BadgeCheck size={12} />}
                                            {entry.entryType === 'PASSENGER' && <User size={12} />}
                                            {entry.entryType.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{entry.vehicle.registrationNumber}</div>
                                        <div className="text-xs text-slate-400 font-medium mt-0.5">{entry.vehicle.type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(entry.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            entry.status === EntryStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            entry.status === EntryStatus.RETURNED ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            entry.status === EntryStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {entry.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-100">
                                            <button 
                                                onClick={() => handleViewEntry(entry)}
                                                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm"
                                            >
                                                {entry.status === EntryStatus.APPROVED && (entry.entryType === 'DRIVER_ID' || entry.entryType === 'OFFICIAL_ID') ? 'Get Card' : 'View'}
                                            </button>
                                            {(entry.status === EntryStatus.RETURNED || entry.status === EntryStatus.PENDING_CITY) && (
                                                 <button 
                                                    onClick={() => handleEditEntry(entry)}
                                                    className="text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm flex items-center gap-1" 
                                                 >
                                                    <Edit size={12} /> Edit
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <Filter size={24} className="opacity-30" />
                                        </div>
                                        <p className="font-medium text-slate-600">No entries found matching criteria.</p>
                                        <button onClick={() => {setDashboardFilter('ALL'); setDashboardSearch('');}} className="mt-2 text-blue-600 text-xs font-bold hover:underline">Clear Filters</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors shadow-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors shadow-sm"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
