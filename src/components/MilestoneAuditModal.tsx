'use client';

import React from 'react';
import { Milestone } from '@/types/database';
import { useFairWork } from '@/lib/fairwork-store';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Paperclip,
  User,
} from 'lucide-react';

interface MilestoneAuditModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export default function MilestoneAuditModal({ milestone, onClose }: MilestoneAuditModalProps) {
  const { submissions, reviews } = useFairWork();

  const milestoneSubmissions = submissions
    .filter((s) => s.milestone_id === milestone.id)
    .sort((a, b) => b.versi - a.versi);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                <History className="w-3 h-3" />
                Audit Trail
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{milestone.judul}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Status: <span className="font-semibold uppercase">{milestone.status}</span> • Weight: {milestone.bobot || 1}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Milestone Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5" />
                Assignee: <strong className="text-slate-900">{milestone.assignee?.nama}</strong>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Deadline: {new Date(milestone.tenggat).toLocaleDateString()}
              </span>
            </div>
            {milestone.deskripsi && (
              <p className="text-slate-600 pt-1 border-t border-slate-200/60">
                {milestone.deskripsi}
              </p>
            )}
          </div>

          {/* Submissions & Reviews Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Version History & Peer Review Records ({milestoneSubmissions.length})
            </h4>

            {milestoneSubmissions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No proof of work has been submitted for this milestone yet.
              </div>
            ) : (
              <div className="space-y-4">
                {milestoneSubmissions.map((sub) => {
                  const subReviews = reviews.filter((r) => r.submission_id === sub.id);

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                    >
                      {/* Submission Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          Version {sub.versi}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(sub.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {sub.deskripsi}
                      </p>

                      {/* Attached Files */}
                      {sub.file_paths && sub.file_paths.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Files:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.file_paths.map((f, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-[11px] text-slate-700"
                              >
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                <span className="font-medium truncate max-w-[150px]">{f.name}</span>
                                <span className="text-[9px] text-slate-400">
                                  ({(f.size / 1024).toFixed(0)} KB)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Associated Peer Reviews */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Peer Review Decisions:
                        </span>
                        {subReviews.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Awaiting teammate review...
                          </span>
                        ) : (
                          <div className="space-y-2">
                            {subReviews.map((rev) => (
                              <div
                                key={rev.id}
                                className={`p-2.5 rounded-lg border text-xs ${
                                  rev.keputusan === 'verify'
                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="font-bold flex items-center gap-1">
                                    {rev.keputusan === 'verify' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    )}
                                    {rev.reviewer?.nama || 'Reviewer'}
                                  </span>
                                  <span className="text-[10px] opacity-75">
                                    {new Date(rev.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[11px] italic leading-normal">
                                  &quot;{rev.komentar}&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
