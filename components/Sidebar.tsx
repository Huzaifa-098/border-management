import React from 'react';
import { LayoutDashboard, Droplet, Truck, Warehouse, AlertTriangle, FileText, Settings, Zap } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Production', icon: Droplet },
    { id: 'fleet', label: 'Fleet & Transport', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'safety', label: 'Safety & Compliance', icon: AlertTriangle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg">
           <Zap className="text-slate-900 w-6 h-6 fill-current" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight">PetroFlow</h1>
            <p className="text-xs text-slate-500">Systems & Ops</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 font-medium border-l-4 border-amber-500'
                      : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span>System Settings</span>
        </button>
      </div>
    </div>
  );
};
