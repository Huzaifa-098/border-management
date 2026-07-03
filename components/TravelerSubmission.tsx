import React, { useState } from 'react';
import { useStore } from '../services/mockStore';
import { Camera, MapPin, User, Truck, CheckCircle2 } from 'lucide-react';

export const UserSubmission: React.FC = () => {
  const { addEntry } = useStore();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    photoUrl: 'https://picsum.photos/200/200',
    vehicleType: 'Car',
    registrationNumber: '',
    driverName: '',
    originCity: '',
    destinationCity: '',
    purpose: '',
    accompanyingPersons: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      entryType: 'PASSENGER',
      fullName: formData.fullName,
      contactNumber: formData.contactNumber,
      photoUrl: formData.photoUrl,
      vehicle: {
        type: formData.vehicleType,
        registrationNumber: formData.registrationNumber,
        driverName: formData.driverName || undefined
      },
      originCity: formData.originCity,
      destinationCity: formData.destinationCity,
      purpose: formData.purpose,
      accompanyingPersons: formData.accompanyingPersons || 'None'
    });
    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setFormData({ ...formData, fullName: '', registrationNumber: '', originCity: '', destinationCity: '', purpose: '' });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Submission Received</h2>
        <p className="text-slate-500 max-w-md">Your entry details have been forwarded to the City Admin for verification. You will be notified once the status changes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">New User Submission</h2>
          <p className="text-sm text-slate-500 mt-1">Please fill in accurate details for border control processing.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
                <User size={16} /> User Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Abdi Farah" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="+252..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Accompanying Persons</label>
              <textarea name="accompanyingPersons" value={formData.accompanyingPersons} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Names separated by comma..." rows={2} />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo ID / Face Capture</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                <Camera size={24} className="mb-2" />
                <span className="text-xs">Click to upload or capture</span>
              </div>
            </div>
          </div>

          {/* Travel & Vehicle Info */}
          <div className="space-y-6">
             <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
                <Truck size={16} /> Journey & Vehicle
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origin City</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input required name="originCity" value={formData.originCity} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="From..." />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination City</label>
                     <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input required name="destinationCity" value={formData.destinationCity} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="To..." />
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Travel</label>
              <select required name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Purpose...</option>
                <option value="Business">Business / Trade</option>
                <option value="Family">Family Visit</option>
                <option value="Tourism">Tourism</option>
                <option value="Transit">Transit</option>
                <option value="Medical">Medical</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                    <input required name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Truck" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
                    <input required name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PL ..." />
                </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name (if different)</label>
                <input name="driverName" value={formData.driverName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional" />
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95">
                    Submit Entry
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
