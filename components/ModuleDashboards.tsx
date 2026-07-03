
import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Droplet, Truck, DollarSign, Users, Activity, AlertTriangle, 
  TrendingUp, TrendingDown, Package, Clock, CheckCircle, MapPin,
  Calendar, Wrench, FileText, Plus, X
} from 'lucide-react';
import { Well, Vehicle, InventoryBatch, Transaction, Staff, FuelStock, Report, Trip, StorageTank } from '../types';

// --- SHARED COMPONENTS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon size={22} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    {subtext && (
      <div className="mt-4 flex items-center text-sm">
        {trend === 'up' && <TrendingUp size={14} className="text-green-600 mr-1" />}
        {trend === 'down' && <TrendingDown size={14} className="text-red-600 mr-1" />}
        <span className="text-gray-400">{subtext}</span>
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, actionLabel, onAction }: { title: string, actionLabel?: string, onAction?: () => void }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    {actionLabel && (
      <button onClick={onAction} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center gap-1">
        <Plus size={14} /> {actionLabel}
      </button>
    )}
  </div>
);

// --- 1. WELLS MANAGER DASHBOARD ---

export const WellsDashboard = ({ wells }: { wells: Well[] }) => {
  const activeWells = wells.filter(w => w.status === 'Active').length;
  const currentOutput = wells.reduce((acc, w) => acc + w.currentOutput, 0);
  const efficiency = Math.round((currentOutput / wells.reduce((acc, w) => acc + w.dailyCapacity, 0)) * 100) || 0;

  const chartData = wells.map(w => ({
    name: w.name.replace('Ceel-', ''),
    Output: w.currentOutput,
    Capacity: w.dailyCapacity
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Wells" value={`${activeWells}/${wells.length}`} subtext="Operational Sites" icon={Activity} colorClass="bg-amber-500 text-amber-600" />
        <StatCard title="Total Daily Output" value={`${currentOutput.toLocaleString()}`} subtext="Barrels (bbl)" icon={Droplet} colorClass="bg-blue-600 text-blue-600" trend="up" />
        <StatCard title="Production Efficiency" value={`${efficiency}%`} subtext="Output vs Capacity" icon={TrendingUp} colorClass="bg-green-600 text-green-600" />
        <StatCard title="Maintenance Alerts" value={wells.filter(w => w.status === 'Maintenance').length} subtext="Requires Attention" icon={Wrench} colorClass="bg-red-500 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <SectionHeader title="Production Performance" actionLabel="Export Report" />
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" />
              <Bar dataKey="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="Output" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status List */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <SectionHeader title="Well Status" actionLabel="Add Well" />
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {wells.map(well => (
               <div key={well.id} className="group flex flex-col p-3 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-all">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                     <div className={`w-2 h-8 rounded-full ${well.status === 'Active' ? 'bg-green-500' : well.status === 'Maintenance' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                     <div>
                       <p className="font-semibold text-sm text-gray-900">{well.name}</p>
                       <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {well.location}</p>
                     </div>
                   </div>
                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${well.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{well.status}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
                    <div>
                        <span className="text-gray-400 block">Output</span>
                        <span className="font-mono font-bold text-gray-800">{well.currentOutput} <span className="font-normal text-gray-400">bbl</span></span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-400 block">Next Inspection</span>
                        <span className="font-medium text-orange-600">{well.nextInspectionDate}</span>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. FLEET MANAGER DASHBOARD ---

export const FleetDashboard = ({ vehicles, trips }: { vehicles: Vehicle[], trips: Record<string, Trip> }) => {
  const inTransit = vehicles.filter(v => v.status === 'In-Transit').length;
  const available = vehicles.filter(v => v.status === 'Available').length;
  const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;

  const statusData = [
    { name: 'Available', value: available, color: '#10b981' },
    { name: 'In-Transit', value: inTransit, color: '#3b82f6' },
    { name: 'Maintenance', value: maintenance, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fleet" value={vehicles.length} subtext="Vehicles Managed" icon={Truck} colorClass="bg-indigo-600 text-indigo-600" />
        <StatCard title="Active Deliveries" value={inTransit} subtext="Currently on Route" icon={MapPin} colorClass="bg-blue-500 text-blue-600" trend="up" />
        <StatCard title="Available Units" value={available} subtext="Ready for Dispatch" icon={CheckCircle} colorClass="bg-green-500 text-green-600" />
        <StatCard title="Maintenance" value={maintenance} subtext="In Workshop" icon={Wrench} colorClass="bg-red-500 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trips Map/List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Live Route Tracking" actionLabel="New Trip" />
           <div className="space-y-4">
              {Object.values(trips).map(trip => (
                <div key={trip.id} className="relative overflow-hidden border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-4 pl-3">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {trip.vehicleId} 
                        <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{trip.cargoType}</span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Driver: {trip.driverId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{trip.progress}%</p>
                      <p className="text-xs text-gray-400">Completion</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar & Route */}
                  <div className="pl-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                       <span className="flex items-center gap-1"><MapPin size={12} className="text-green-500"/> {trip.routeStart}</span>
                       <span className="flex items-center gap-1"><Clock size={12}/> ETA: {new Date(trip.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       <span className="flex items-center gap-1">{trip.routeEnd} <MapPin size={12} className="text-red-500"/></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${trip.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(trips).length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Truck className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">No active trips at the moment.</p>
                </div>
              )}
           </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <SectionHeader title="Fleet Status" />
          <div className="flex-1 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
             <h4 className="text-sm font-semibold text-gray-700 mb-2">Needs Maintenance</h4>
             {vehicles.filter(v => v.status === 'Maintenance').length > 0 ? (
               vehicles.filter(v => v.status === 'Maintenance').map(v => (
                 <div key={v.id} className="flex justify-between text-sm py-1">
                   <span className="text-gray-600">{v.plate} ({v.brand})</span>
                   <span className="text-red-500 font-medium">Engine Check</span>
                 </div>
               ))
             ) : (
               <p className="text-sm text-gray-400">All vehicles healthy.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. INVENTORY MANAGER DASHBOARD ---

export const InventoryDashboard = ({ batches, tanks }: { batches: InventoryBatch[], tanks: StorageTank[] }) => {
  const totalStock = tanks.reduce((acc, t) => acc + t.currentLevel, 0);
  const totalCapacity = tanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const recentBatches = batches.filter(b => (new Date().getTime() - new Date(b.entryDate).getTime()) / (1000 * 3600 * 24) < 30).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fuel Stock" value={`${(totalStock/1000).toFixed(1)}k L`} subtext="Combined Reserves" icon={Droplet} colorClass="bg-cyan-600 text-cyan-600" />
        <StatCard title="Storage Utilization" value={`${Math.round((totalStock/totalCapacity)*100)}%`} subtext="Capacity Used" icon={Activity} colorClass="bg-blue-600 text-blue-600" />
        <StatCard title="Batches (30d)" value={recentBatches} subtext="Incoming Supply" icon={Package} colorClass="bg-purple-600 text-purple-600" />
        <StatCard title="Alerts" value={tanks.filter(t => t.currentLevel < t.capacityLiters * 0.2).length} subtext="Low Level Tanks" icon={AlertTriangle} colorClass="bg-red-500 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Tank Levels */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Storage Tank Levels" actionLabel="Audit Stock" />
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             {tanks.map(tank => {
               const percentage = (tank.currentLevel / tank.capacityLiters) * 100;
               const isLow = percentage < 25;
               return (
                 <div key={tank.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden flex flex-col items-center">
                    <h4 className="text-gray-900 font-bold mb-1 z-10">{tank.name}</h4>
                    <span className="text-xs text-gray-500 uppercase z-10 mb-4">{tank.fuelType}</span>
                    
                    {/* Tank Visualization */}
                    <div className="w-20 h-32 bg-gray-200 rounded-lg relative overflow-hidden border border-gray-300 mb-3 z-10 shadow-inner">
                       <div 
                         className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`} 
                         style={{ height: `${percentage}%` }}
                       >
                         <div className="w-full h-1 bg-white/30 absolute top-0"></div>
                       </div>
                    </div>
                    
                    <p className="z-10 font-mono font-bold text-gray-800">{tank.currentLevel.toLocaleString()} L</p>
                    <p className="z-10 text-xs text-gray-400">of {tank.capacityLiters.toLocaleString()} L</p>
                 </div>
               )
             })}
           </div>
        </div>

        {/* Recent Batches List */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Recent Batches" actionLabel="Log Receive" />
           <div className="space-y-4">
             {batches.slice(0, 5).map(batch => (
               <div key={batch.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
                 <div>
                   <p className="font-bold text-sm text-gray-800">{batch.fuelType}</p>
                   <p className="text-xs text-gray-500">{batch.batchNumber}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{batch.quantityLiters.toLocaleString()} L</p>
                    <p className="text-[10px] text-gray-400">{batch.entryDate}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. FINANCE MANAGER DASHBOARD ---

export const FinanceDashboard = ({ 
    transactions, 
    onAction 
}: { 
    transactions: Transaction[], 
    onAction?: (id: string, action: 'approve' | 'reject') => void 
}) => {
  const income = transactions.filter(t => t.type === 'Income' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'Expense' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'Pending').length;

  const chartData = [
    { name: 'Income', amount: income, fill: '#10b981' },
    { name: 'Expense', amount: expense, fill: '#ef4444' },
    { name: 'Net', amount: income - expense, fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${income.toLocaleString()}`} subtext="Approved Inflow" icon={TrendingUp} colorClass="bg-emerald-500 text-emerald-600" />
        <StatCard title="Total Expenses" value={`$${expense.toLocaleString()}`} subtext="Operational Costs" icon={TrendingDown} colorClass="bg-rose-500 text-rose-600" />
        <StatCard title="Net Profit" value={`$${(income - expense).toLocaleString()}`} subtext="Current Period" icon={DollarSign} colorClass="bg-blue-600 text-blue-600" />
        <StatCard title="Pending Review" value={pending} subtext="Transactions" icon={Clock} colorClass="bg-amber-500 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Financial Overview" actionLabel="Download Report" />
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={false} />
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
               <RechartsTooltip cursor={{fill: 'transparent'}} />
               <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} label={{ position: 'right', fill: '#64748b', fontSize: 12, formatter: (val: number) => `$${val/1000}k` }}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>

         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <SectionHeader title="Transactions" actionLabel="New Entry" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-3 py-2 rounded-l-lg">Description</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right rounded-r-lg">Amount</th>
                    {onAction && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 8).map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-3 py-3">
                         <div className="font-medium text-gray-800">{t.description}</div>
                         <div className="text-gray-500 text-xs">{t.date}</div>
                      </td>
                      <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              t.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                              {t.status}
                          </span>
                      </td>
                      <td className={`px-3 py-3 text-right font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                      {onAction && (
                          <td className="px-3 py-3 text-right w-24">
                              {t.status === 'Pending' && (
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => onAction(t.id, 'approve')} title="Approve" className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"><CheckCircle size={14}/></button>
                                      <button onClick={() => onAction(t.id, 'reject')} title="Reject" className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><X size={14}/></button>
                                  </div>
                              )}
                          </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- 5. HR MANAGER DASHBOARD ---

export const HRDashboard = ({ staffList }: { staffList: Staff[] }) => {
  const activeStaff = staffList.filter(s => s.status === 'Active').length;
  const payroll = staffList.reduce((acc, s) => acc + s.monthlySalary, 0);
  const departments = Array.from(new Set(staffList.map(s => s.department)));
  
  const deptData = departments.map(d => ({
    name: d,
    value: staffList.filter(s => s.department === d).length
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Employees" value={staffList.length} subtext={`${activeStaff} Active`} icon={Users} colorClass="bg-indigo-600 text-indigo-600" />
        <StatCard title="Monthly Payroll" value={`$${payroll.toLocaleString()}`} subtext="Estimated Total" icon={DollarSign} colorClass="bg-green-600 text-green-600" />
        <StatCard title="Departments" value={departments.length} subtext="Operational Units" icon={Package} colorClass="bg-purple-600 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Staff Distribution" />
           <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <SectionHeader title="Employee Directory" actionLabel="Add Staff" />
           <div className="space-y-3">
             {staffList.slice(0, 5).map(s => (
               <div key={s.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {s.profilePhoto ? <img src={s.profilePhoto} alt="" className="w-full h-full object-cover"/> : <div className="flex items-center justify-center w-full h-full text-gray-500"><Users size={16}/></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-bold text-sm text-gray-900">{s.fullName}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status==='Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">{s.department} • {s.employeeId}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 6. SUPER ADMIN DASHBOARD ---

export const SuperAdminDashboard = ({ 
  wells, vehicles, batches, transactions, staffList 
}: { 
  wells: Well[], vehicles: Vehicle[], batches: InventoryBatch[], transactions: Transaction[], staffList: Staff[] 
}) => {
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-indigo-200 text-sm font-medium">Net Profit</p>
               <h3 className="text-3xl font-bold mt-1">${(totalIncome - totalExpense).toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-white/10 rounded-lg"><DollarSign className="text-white"/></div>
           </div>
           <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
             <div className="bg-green-400 h-full" style={{width: '75%'}}></div>
           </div>
           <p className="text-xs text-indigo-300 mt-3">Target: $1.2M (Quarterly)</p>
        </div>

        <StatCard title="Total Oil Production" value={wells.reduce((acc,w)=>acc+w.currentOutput,0).toLocaleString()} subtext="Barrels / Day" icon={Droplet} colorClass="bg-blue-600 text-blue-600" />
        <StatCard title="Active Logistics" value={vehicles.filter(v=>v.status==='In-Transit').length} subtext={`of ${vehicles.length} Vehicles`} icon={Truck} colorClass="bg-purple-600 text-purple-600" />
        <StatCard title="Headcount" value={staffList.length} subtext="Across 5 Depts" icon={Users} colorClass="bg-orange-500 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Activity size={20} className="text-gray-400"/> Operational Health</h3>
          <WellsDashboard wells={wells} />
        </div>
        <div className="space-y-6">
           <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><DollarSign size={20} className="text-gray-400"/> Financial Performance</h3>
           <FinanceDashboard transactions={transactions} />
        </div>
      </div>
    </div>
  );
};
