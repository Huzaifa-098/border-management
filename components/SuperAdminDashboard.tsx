import React from 'react';
import { SystemLog, User } from '../types';
import { ShieldAlert, FileText, Settings, Database, Activity } from 'lucide-react';

interface SuperAdminDashboardProps {
  logs: SystemLog[];
  users: User[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ logs, users }) => {
  return (
    <div className="space-y-8">
      {/* System Health / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm mb-1">System Status</p>
              <h3 className="text-2xl font-bold">Operational</h3>
            </div>
            <div className="p-2 bg-white/10 rounded-lg"><Activity size={24} /></div>
          </div>
          <div className="mt-6 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-1.5"></span>
            <p className="text-sm text-slate-300">All services running normally</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database size={24} /></div>
          </div>
          <div className="mt-6">
            <div className="flex -space-x-2">
                {users.slice(0, 5).map(u => (
                    <div key={u.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                        {u.name.charAt(0)}
                    </div>
                ))}
                 {users.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">
                        +{users.length - 5}
                    </div>
                 )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm mb-1">Audit Logs</p>
              <h3 className="text-2xl font-bold text-slate-800">{logs.length}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={24} /></div>
          </div>
           <p className="mt-6 text-sm text-slate-500">Last event: {new Date(logs[0]?.timestamp || Date.now()).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-slate-400"/> System Audit Logs
                </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-700">{log.user}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                        log.action.includes('ERROR') ? 'bg-red-50 text-red-600 border-red-100' : 
                                        log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.details}>{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Global Settings Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-slate-400"/> System Settings
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">System Maintenance Mode</label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm text-slate-600">Currently Disabled</span>
                        <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Transaction Limit ($)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" defaultValue={5000} />
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Data Retention Policy</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <option>1 Year</option>
                        <option>3 Years</option>
                        <option>5 Years</option>
                        <option>Forever</option>
                    </select>
                </div>
                
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg transition-colors mt-4">
                    Save Configuration
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};