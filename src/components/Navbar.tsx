'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFairWork, DEMO_USERS } from '@/lib/fairwork-store';
import {
  CheckCircle2,
  Users,
  LayoutGrid,
  FileBarChart,
  PlusCircle,
  FolderPlus,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateMilestone: () => void;
  onOpenCreateProject: () => void;
  activeTab: 'board' | 'summary';
  setActiveTab: (tab: 'board' | 'summary') => void;
}

export default function Navbar({
  onOpenCreateMilestone,
  onOpenCreateProject,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const {
    currentUser,
    setCurrentUser,
    projects,
    currentProject,
    setCurrentProject,
    resetToDemo,
    isLiveSupabase,
  } = useFairWork();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Demo Notification / Switcher Bar */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">
            {isLiveSupabase ? 'Supabase Live Connected' : 'STACK 2026 Interactive Demo Mode'}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            Case 1: Smarter Campus and Learning — Tim Manuk Hiber
          </span>
        </div>

        {/* Quick Demo Persona Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 text-[11px] whitespace-nowrap">Switch Persona:</span>
          {DEMO_USERS.map((u) => {
            const isActive = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={`Switch to ${u.nama}`}
              >
                <span>{u.nama.split(' ')[0]}</span>
                <span className="text-[9px] opacity-75">
                  ({u.email.includes('leader') ? 'Leader' : u.nama.includes('A') ? 'A' : u.nama.includes('B') ? 'B' : 'C'})
                </span>
              </button>
            );
          })}
          <button
            onClick={resetToDemo}
            className="ml-1 text-slate-400 hover:text-rose-300 flex items-center gap-0.5 text-[11px] transition"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition">
                  FairWork
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                  v1.1
                </span>
              </div>
            </Link>

            {/* Project Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
              >
                <div className="max-w-[150px] sm:max-w-[200px] truncate text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Project</div>
                  <div className="truncate font-semibold text-slate-900">{currentProject.judul}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {projectDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase">
                    Your Projects
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProject(p);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex flex-col ${
                        p.id === currentProject.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{p.judul}</span>
                      <span className="text-[10px] text-slate-400">{p.mata_kuliah}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onOpenCreateProject();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1.5 font-medium"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      Create New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Tabs: Board vs Contribution Summary */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'board'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Milestone Board
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'summary'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileBarChart className="w-3.5 h-3.5" />
              Contribution Summary
            </button>
          </div>

          {/* Action Buttons & Current User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenCreateMilestone}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Milestone</span>
            </button>

            {/* Active User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition"
              >
                <img
                  src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                  alt={currentUser.nama}
                  className="w-7 h-7 rounded-full bg-slate-100"
                />
                <span className="hidden lg:inline text-xs font-medium text-slate-800 max-w-[120px] truncate">
                  {currentUser.nama.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Role in Project
                    </div>
                    <div className="px-4 py-1 text-xs text-indigo-600 font-medium">
                      {currentUser.id === currentProject.leader_id ? 'Team Leader' : 'Team Member'}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        resetToDemo();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Demo State
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Submenu for Tabs */}
        <div className="flex md:hidden border-t border-slate-100 py-2 justify-around">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-md ${
              activeTab === 'board' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-md ${
              activeTab === 'summary' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'
            }`}
          >
            <FileBarChart className="w-3.5 h-3.5" />
            Summary
          </button>
        </div>
      </div>
    </header>
  );
}
