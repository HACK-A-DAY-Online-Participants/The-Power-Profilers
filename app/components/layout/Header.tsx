// components/layout/Header.tsx

"use client";

import { Trophy, User } from "lucide-react";
import { StorageManager } from "../editor/StorageManager";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  level?: number;
}

export function Header({ 
  title = "Code Energy Profiler", 
  subtitle = "Optimize • Compete • Save Energy",
  level = 12 
}: HeaderProps) {
  return (
    <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <StorageManager />
          {/* <LevelBadge level={level} />
          <UserAvatar /> */}

        </div>
      </div>
    </header>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <Trophy className="w-4 h-4 text-amber-400" />
      <span className="text-sm text-slate-300">Level</span>
      <span className="text-sm font-bold text-emerald-400">{level}</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <button className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-emerald-400 flex items-center justify-center ring-2 ring-violet-500/20 ring-offset-2 ring-offset-slate-900 transition hover:ring-violet-500/40">
      <User className="w-5 h-5 text-white" />
    </button>
  );
}