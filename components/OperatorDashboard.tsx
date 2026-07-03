import React, { useState } from 'react';
import { FuelTransaction, FuelStock, User } from '../types';
import { Droplet, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface OperatorDashboardProps {
  currentUser: User;
  transactions: FuelTransaction[];
  stocks: FuelStock[];
  onDispense: (transaction: Omit<FuelTransaction, 'id' | 'status' | 'date'>) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ currentUser, transactions, stocks, onDispense }) => {
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [selectedFuel, setSelectedFuel] = useState<FuelStock['type']>('Diesel');

  const myTransactions = transactions.filter(t => t.operatorId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !customerName || !vehicleId) return;

    onDispense({
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      customerName,
      vehicleId,
      fuelType: selectedFuel,
      amount: parseFloat(amount),
      cost: parseFloat(amount) * (selectedFuel === 'Diesel' ? 1.5 : selectedFuel === 'Petrol' ? 1.6 : 0.4), // Mock pricing
    });

    setAmount('');
    setCustomerName('');
    setVehicleId('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <div key={stock.type} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stock.type} Stock</h3>
                <p className="text-2xl font-bold mt-1 text-slate-800">{stock.currentLevel.toLocaleString()} <span className="text-sm font-normal text-slate-500">{stock.unit}</span></p>
              </div>
              <div className={`p-2 rounded-lg ${stock.status === 'OK' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <Droplet size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${stock.status === 'OK' ? 'bg-blue-500' : 'bg-red-500'}`} 
                style={{ width: `${(stock.currentLevel / stock.capacity) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">Capacity: {stock.capacity.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dispense Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Droplet className="text-blue-600" size={20} />
            Dispense Fuel
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
              <select 
                value={selectedFuel} 
                onChange={(e) => setSelectedFuel(e.target.value as FuelStock['type'])}
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {stocks.map(s => <option key={s.type} value={s.type}>{s.type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ({stocks.find(s=>s.type === selectedFuel)?.unit})</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle ID</label>
              <input 
                type="text" 
                value={vehicleId} 
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Plate Number or ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Dispense Now
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              Recent Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTransactions.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No transactions found.</td>
                    </tr>
                ) : (
                    myTransactions.slice().reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{t.vehicleId}</td>
                        <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {t.fuelType}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{t.amount} {stocks.find(s=>s.type===t.fuelType)?.unit}</td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                            {t.status === 'APPROVED' && <CheckCircle size={16} className="text-green-500" />}
                            {t.status === 'PENDING' && <AlertTriangle size={16} className="text-amber-500" />}
                            {t.status === 'REJECTED' && <XCircle size={16} className="text-red-500" />}
                            <span className={`${
                            t.status === 'APPROVED' ? 'text-green-600' : 
                            t.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
                            } font-medium text-xs`}>
                            {t.status}
                            </span>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};