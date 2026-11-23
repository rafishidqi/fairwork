'use client';

import React from 'react';
import { Milestone, Submission, Review } from '@/types/database';
import { useFairWork } from '@/lib/fairwork-store';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  CheckSquare,
  Eye,
  ShieldAlert,
  Paperclip,
} from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  onOpenUpload: (m: Milestone) => void;
  onOpenReview: (m: Milestone, sub: Submission) => void;
  onOpenAudit: (m: Milestone) => void;
}

export default function MilestoneCard({
  milestone,
  onOpenUpload,
  onOpenReview,
  onOpenAudit,
}: MilestoneCardProps) {
  const { currentUser, submissions, reviews } = useFairWork();

  const isAssignee = currentUser.id === milestone.assignee_id;
  const milestoneSubmissions = submissions.filter((s) => s.milestone_id === milestone.id);
  const latestSubmission = milestoneSubmissions[0]; // submissions ordered newest first

  const now = new Date();
  const deadline = new Date(milestone.tenggat);
  const isOverdue = deadline < now && milestone.status !== 'verified';

  // Find latest review
  const latestReview = latestSubmission
    ? reviews.find((r) => r.submission_id === latestSubmission.id)
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow transition p-4 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Weight: {milestone.bobot || 1}
            </span>

            {milestone.status === 'revision_requested' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Revision requested
              </span>
            )}

            {isOverdue && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Overdue
              </span>
            )}

            {/* FR-8: Unedited Text Flag */}
            {latestSubmission?.flag_unreviewed_text && milestone.status === 'submitted' && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                title={latestSubmission.flag_reason || 'Needs careful review'}
              >
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Needs careful review
              </span>
            )}
          </div>

          <button
            onClick={() => onOpenAudit(milestone)}
            className="text-slate-400 hover:text-indigo-600 transition p-1"
            title="View milestone audit log"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition leading-snug mb-1.5">
          {milestone.judul}
        </h4>

        {milestone.deskripsi && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{milestone.deskripsi}</p>
        )}

        {/* Submission Brief if submitted */}
        {latestSubmission && (
          <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Proof of Work (v{latestSubmission.versi})</span>
              <span>
                {new Date(latestSubmission.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-slate-600 line-clamp-2 italic text-[11px] mb-1.5">
              &quot;{latestSubmission.deskripsi}&quot;
            </p>
            {latestSubmission.file_paths && latestSubmission.file_paths.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                <Paperclip className="w-3 h-3" />
                <span>{latestSubmission.file_paths.length} file(s) attached</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 mt-2 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          {/* Assignee Avatar & Name */}
          <div className="flex items-center gap-2">
            <img
              src={
                milestone.assignee?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${milestone.assignee_id}`
              }
              alt="Assignee"
              className="w-5 h-5 rounded-full bg-slate-100"
            />
            <span className="font-medium text-slate-700 truncate max-w-[110px]">
              {milestone.assignee?.nama || 'Unassigned'}
            </span>
          </div>

          {/* Deadline */}
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(milestone.tenggat).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Dynamic Contextual Action Buttons */}
        <div>
          {/* Case 1: Milestone is To Do or Revision Requested */}
          {(milestone.status === 'todo' || milestone.status === 'revision_requested') && (
            <div>
              {isAssignee ? (
                <button
                  onClick={() => onOpenUpload(milestone)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {milestone.status === 'revision_requested' ? 'Upload Revision' : 'Upload Proof of Work'}
                </button>
              ) : (
                <div className="py-1 px-2 rounded bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
                  Waiting for {milestone.assignee?.nama.split(' ')[0] || 'assignee'} to upload
                </div>
              )}
            </div>
          )}

          {/* Case 2: Milestone is Submitted (Pending Peer Review) */}
          {milestone.status === 'submitted' && (
            <div>
              {isAssignee ? (
                <div
                  className="py-1.5 px-2 rounded-lg bg-amber-50 border border-amber-200 text-center text-[11px] text-amber-800 font-medium"
                  title="Anti-free-riding rule: You cannot verify your own submission. Waiting for a teammate."
                >
                  Submitted • Awaiting Teammate Review
                </div>
              ) : (
                <button
                  onClick={() => latestSubmission && onOpenReview(milestone, latestSubmission)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Peer Review Submission
                </button>
              )}
            </div>
          )}

          {/* Case 3: Milestone is Verified */}
          {milestone.status === 'verified' && (
            <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified & Counted
              </span>
              {latestReview?.reviewer && (
                <span className="text-[10px] text-emerald-700">
                  by {latestReview.reviewer.nama.split(' ')[0]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
