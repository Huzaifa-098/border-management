import React from 'react';
import { FuelTransaction, FuelStock, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, AlertCircle, TrendingUp, Check, X, Shield } from 'lucide-react';

interface AdminDashboardProps {
  transactions: FuelTransaction[];
  stocks: FuelStock[];
  users: User[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ transactions, stocks, users, onApprove, onReject }) => {
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
  
  // Chart Data Preparation
  const consumptionData = stocks.map(stock => {
    const total = transactions
      .filter(t => t.fuelType === stock.type && t.status === 'APPROVED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: stock.type, amount: total };
  });

  const stockLevelData = stocks.map(s => ({ name: s.type, value: s.currentLevel }));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-slate-800">${transactions.reduce((acc, t) => t.status === 'APPROVED' ? acc + t.cost : acc, 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Operators</p>
              <h3 className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === UserRole.OPERATOR).length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-slate-800">{pendingTransactions.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-slate-800">{stocks.filter(s => s.status === 'LOW' || s.status === 'CRITICAL').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Charts Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Fuel Consumption (Approved)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
           <h3 className="text-lg font-semibold text-slate-800 mb-6">Current Stock Levels</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockLevelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {stockLevelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Approvals List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Pending Transactions</h3>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">{pendingTransactions.length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Operator</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Fuel</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No pending transactions.</td></tr>
                ) : (
                    pendingTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{t.operatorName}</td>
                        <td className="px-6 py-4">{t.vehicleId}</td>
                        <td className="px-6 py-4">{t.fuelType}</td>
                        <td className="px-6 py-4 font-bold">{t.amount}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}</td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => onApprove(t.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                                <Check size={18} />
                            </button>
                            <button onClick={() => onReject(t.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                                <X size={18} />
                            </button>
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