// app/components/layout/Sidebar.tsx - Updated with page navigation

"use client";

import { useState } from "react";
import { 
  Zap, 
  LayoutDashboard, 
  Flame, 
  FileCode2, 
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle
} from "lucide-react";

import type { PageView } from "@/app/page";
interface SidebarProps {
  currentPage: PageView;
  onPageChange: (page: PageView) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems: { icon: React.ElementType; label: string; page: PageView }[] = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      page: "dashboard",
    },
    { 
      icon: Flame, 
      label: "Hotspots", 
      page: "hotspots",
    },
    { 
      icon: FileCode2, 
      label: "File Analysis", 
      page: "analysis",
    },
    { 
      icon: BarChart3, 
      label: "Metrics", 
      page: "metrics",
    },
  ];

  // const bottomItems: { icon: React.ElementType; label: string; page: PageView }[] = [
  //   { 
  //     icon: Settings, 
  //     label: "Settings", 
  //     page: "settings",
  //   },
  //   { 
  //     icon: HelpCircle, 
  //     label: "Help", 
  //     page: "help",
  //   },
  // ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isExpanded ? "w-60" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          
          {isExpanded && (
            <div className="overflow-hidden">
              <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase animate-fadeIn">
                Energy
              </div>
              <div className="text-sm font-semibold text-slate-200 animate-fadeIn">
                Profiler
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={currentPage === item.page}
            isExpanded={isExpanded}
            onClick={() => onPageChange(item.page)}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      {/* <div className="px-2 py-4 border-t border-slate-800/50 space-y-1">
        {bottomItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={currentPage === item.page}
            isExpanded={isExpanded}
            onClick={() => onPageChange(item.page)}
          />
        ))}
      </div> */}

      {/* Manual Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all shadow-lg z-10"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, active = false, isExpanded, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
        ${
          active
            ? "bg-linear-to-r from-violet-500/20 to-emerald-400/10 text-violet-400 shadow-lg shadow-violet-500/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }
        ${!isExpanded && "justify-center"}
      `}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" />
      
      {isExpanded && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden animate-fadeIn">
          {label}
        </span>
      )}
      
      {active && !isExpanded && (
        <div className="absolute left-0 w-1 h-8 bg-linear-to-b from-violet-500 to-emerald-400 rounded-r-full" />
      )}
    </button>
  );
}