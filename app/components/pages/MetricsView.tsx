// app/components/pages/MetricsView.tsx

"use client";

import { BarChart3, TrendingUp, Zap, Calendar, Award, Target } from "lucide-react";

export function MetricsView() {
  const weeklyData = [
    { day: "Mon", energy: 245, optimizations: 3 },
    { day: "Tue", energy: 189, optimizations: 5 },
    { day: "Wed", energy: 312, optimizations: 2 },
    { day: "Thu", energy: 278, optimizations: 4 },
    { day: "Fri", energy: 201, optimizations: 6 },
    { day: "Sat", energy: 167, optimizations: 8 },
    { day: "Sun", energy: 134, optimizations: 4 },
  ];

  const languageStats = [
    { language: "JavaScript", files: 45, energy: 1234, percentage: 35 },
    { language: "Python", files: 32, energy: 987, percentage: 28 },
    { language: "Java", files: 28, energy: 756, percentage: 22 },
    { language: "C++", files: 15, energy: 523, percentage: 15 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-500" />
          Metrics Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Track your energy optimization progress and statistics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={Zap}
          label="Total Energy Saved"
          value="3.5"
          unit="kJ"
          trend="+12%"
          color="emerald"
        />
        <KPICard
          icon={Target}
          label="Files Analyzed"
          value="120"
          trend="+8"
          color="blue"
        />
        <KPICard
          icon={TrendingUp}
          label="Avg Efficiency"
          value="87"
          unit="%"
          trend="+5%"
          color="violet"
        />
        <KPICard
          icon={Award}
          label="Optimizations"
          value="32"
          trend="+14"
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Weekly Activity
          </h2>
          
          <div className="space-y-4">
            {weeklyData.map((day, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{day.day}</span>
                  <span className="text-slate-400">{day.energy} mJ</span>
                </div>
                <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-violet-500 to-emerald-400"
                    style={{ width: `${(day.energy / 350) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Language Distribution
          </h2>
          
          <div className="space-y-5">
            {languageStats.map((lang, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{lang.language}</span>
                  <span className="text-slate-400">{lang.files} files • {lang.energy} mJ</span>
                </div>
                <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-violet-500 via-blue-500 to-emerald-400 flex items-center px-2"
                    style={{ width: `${lang.percentage}%` }}
                  >
                    <span className="text-xs font-medium text-white">{lang.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          {[
            { time: "2 hours ago", action: "Optimized nested loops", file: "algorithm.js", saved: "45 mJ" },
            { time: "5 hours ago", action: "Fixed memory allocation", file: "parser.cpp", saved: "78 mJ" },
            { time: "Yesterday", action: "Improved string concatenation", file: "utils.java", saved: "23 mJ" },
            { time: "2 days ago", action: "Replaced nested forEach", file: "processor.js", saved: "56 mJ" },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.file} • {activity.time}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-emerald-400">+{activity.saved}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  color: 'emerald' | 'blue' | 'violet' | 'amber';
}
function KPICard({ icon: Icon, label, value, unit, trend, color }: KPICardProps) {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  };

  return (
    <div className={`p-5 rounded-xl border bg-linear-to-br ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium px-2 py-1 bg-slate-900/30 rounded">
          {trend}
        </span>
      </div>
      <p className="text-sm opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-bold">
        {value}
        {unit && <span className="text-lg ml-1 opacity-75">{unit}</span>}
      </p>
    </div>
  );
}