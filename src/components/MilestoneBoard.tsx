'use client';

import React from 'react';
import { Milestone, Submission } from '@/types/database';
import { useFairWork } from '@/lib/fairwork-store';
import MilestoneCard from './MilestoneCard';
import RemindersBanner from './RemindersBanner';
import {
  ListTodo,
  Send,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface MilestoneBoardProps {
  onOpenUpload: (m: Milestone) => void;
  onOpenReview: (m: Milestone, sub: Submission) => void;
  onOpenAudit: (m: Milestone) => void;
  onOpenCreateMilestone: () => void;
}

export default function MilestoneBoard({
  onOpenUpload,
  onOpenReview,
  onOpenAudit,
  onOpenCreateMilestone,
}: MilestoneBoardProps) {
  const { currentProject, milestones, currentUser } = useFairWork();

  const projectMilestones = milestones.filter((m) => m.project_id === currentProject.id);

  // Group milestones into columns
  const todoMilestones = projectMilestones.filter(
    (m) => m.status === 'todo' || m.status === 'revision_requested'
  );
  const submittedMilestones = projectMilestones.filter((m) => m.status === 'submitted');
  const verifiedMilestones = projectMilestones.filter((m) => m.status === 'verified');

  return (
    <div className="space-y-6">
      {/* Reminders Banner (FR-7) */}
      <RemindersBanner />

      {/* Board Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{currentProject.judul}</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentProject.mata_kuliah}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {currentProject.deskripsi ||
              'Move milestones through the peer verification loop: Upload proof of work -> Peer review by teammate -> Verified.'}
          </p>
        </div>

        <button
          onClick={onOpenCreateMilestone}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* 3-Column Milestone Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Do & Revision Requested */}
        <div className="flex flex-col bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-slate-200 text-slate-700">
                <ListTodo className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">To Do</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[11px] font-bold border border-slate-200 shadow-xs">
              {todoMilestones.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todoMilestones.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white/40">
                No active to-do tasks.
              </div>
            ) : (
              todoMilestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onOpenUpload={onOpenUpload}
                  onOpenReview={onOpenReview}
                  onOpenAudit={onOpenAudit}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Submitted (Awaiting Peer Review) */}
        <div className="flex flex-col bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-200 text-amber-800">
                <Send className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                Submitted
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-amber-800 text-[11px] font-bold border border-amber-200 shadow-xs">
              {submittedMilestones.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {submittedMilestones.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-amber-200/80 rounded-xl bg-white/40">
                No submissions waiting for review.
              </div>
            ) : (
              submittedMilestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onOpenUpload={onOpenUpload}
                  onOpenReview={onOpenReview}
                  onOpenAudit={onOpenAudit}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Verified */}
        <div className="flex flex-col bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                Verified
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
              {verifiedMilestones.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {verifiedMilestones.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-emerald-200/80 rounded-xl bg-white/40">
                No verified milestones yet.
              </div>
            ) : (
              verifiedMilestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onOpenUpload={onOpenUpload}
                  onOpenReview={onOpenReview}
                  onOpenAudit={onOpenAudit}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
