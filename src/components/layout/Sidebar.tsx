import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  AlertOctagon, 
  FlaskConical, 
  Search, 
  BarChart3, 
  Compass, 
  Split, 
  PlayCircle, 
  Cpu, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { SimulationState } from '../../engine/simulationStore';

interface SidebarProps {
  state: SimulationState;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onOpenSettings }) => {
  const activeIncidents = state.incidents.filter(i => !i.resolved);

  const primaryNav = [
    { name: 'Command Centre', path: '/', icon: LayoutDashboard },
    { name: '3D Facility', path: '/facility', icon: Boxes },
    { 
      name: 'Incident Management', 
      path: '/incidents', 
      icon: AlertOctagon, 
      badge: activeIncidents.length > 0 ? activeIncidents.length : null,
      badgeColor: 'bg-red-500'
    },
    { name: 'Simulation Studio', path: '/simulation', icon: FlaskConical },
    { name: 'Investigation Centre', path: '/investigation', icon: Search },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  ];

  const secondaryNav = [
    { name: 'Evacuation & Resources', path: '/resources', icon: Compass },
    { name: 'What-If Analysis', path: '/what-if', icon: Split },
    { name: 'Guided Demonstration', path: '/guided-demo', icon: PlayCircle },
    { name: 'Project Information', path: '/project-info', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-industrial-950 border-r border-industrial-800/80 flex flex-col justify-between shrink-0 select-none z-10">
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Primary Navigation Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Primary Monitoring
          </div>
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md font-sans text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-industrial-900 border-l-2 border-cyan-400 text-cyan-neon shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-900/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${item.badgeColor} animate-pulse`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Analysis & Resources
          </div>
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md font-sans text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-industrial-900 border-l-2 border-cyan-400 text-cyan-neon'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-industrial-900/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Settings Link */}
      <div className="p-3 border-t border-industrial-800/80 bg-industrial-950/60">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-sans text-slate-400 hover:text-slate-100 hover:bg-industrial-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Simulation Settings</span>
        </button>
      </div>
    </aside>
  );
};
