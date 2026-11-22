'use client';

import React, { useState } from 'react';
import { Milestone, Submission, ReviewDecision } from '@/types/database';
import { useFairWork } from '@/lib/fairwork-store';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ReviewModalProps {
  milestone: Milestone;
  submission: Submission;
  onClose: () => void;
}

export default function ReviewModal({ milestone, submission, onClose }: ReviewModalProps) {
  const { currentUser, submitReview, reviews } = useFairWork();
  const [decision, setDecision] = useState<ReviewDecision>('verify');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssignee = currentUser.id === submission.member_id;
  const submissionReviews = reviews.filter((r) => r.submission_id === submission.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAssignee) {
      setError('Anti-Free-Riding Rule: You cannot peer-review your own submission!');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide feedback or justification in the comment field.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReview(submission.id, decision, comment);
      if (!res.success) {
        setError(res.error || 'Failed to submit review');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error processing review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Peer Review
              </span>
              <span className="text-xs font-semibold text-slate-500">v{submission.versi}</span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Review Submission</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md">
              {milestone.judul}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Anti-Self-Review Warning if Assignee opens this */}
          {isAssignee && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800">Self-Review Blocked (FR-5)</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  To prevent fraudulent contribution inflated numbers, team members cannot review their own work. Please switch to another team member to review this submission.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={
                    submission.member?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.member_id}`
                  }
                  alt="Member"
                  className="w-6 h-6 rounded-full bg-slate-200"
                />
                <div>
                  <span className="font-semibold text-slate-800">
                    {submission.member?.nama || 'Assignee'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Uploaded on {new Date(submission.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Milestone Weight: {milestone.bobot || 1}
              </span>
            </div>

            {/* Description */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Description of Work:
              </span>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                {submission.deskripsi}
              </p>
            </div>

            {/* Attached Proof Files */}
            {submission.file_paths && submission.file_paths.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Attached Proof of Work Files:
                </span>
                <div className="space-y-1.5">
                  {submission.file_paths.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs hover:border-indigo-300 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded">
                        View Proof
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FR-8: Unedited / Suspected Bulk Text Flag Notice */}
          {submission.flag_unreviewed_text && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Reviewer Note (FR-8 Flag)</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {submission.flag_reason ||
                    'This submission text appears extensive without prior incremental drafts. Reviewers are advised to inspect the attached deliverables closely before verifying.'}
                </p>
              </div>
            </div>
          )}

          {/* Review Decision Radios */}
          {!isAssignee && (
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-semibold text-slate-700">
                Your Review Decision <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('verify')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                    decision === 'verify'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-400/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      decision === 'verify' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Verify</span>
                    <span className="text-[10px] text-slate-500">
                      Work meets standards; counts toward contribution.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('revision')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                    decision === 'revision'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      decision === 'revision' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Request Revision</span>
                    <span className="text-[10px] text-slate-500">
                      Needs improvement or additional deliverables.
                    </span>
                  </div>
                </button>
              </div>

              {/* Mandatory Review Feedback Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peer Review Comment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    decision === 'verify'
                      ? 'Confirm what you checked (e.g. verified database schema and unit test reports)...'
                      : 'Specify what parts require changes or fixes before it can be verified...'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Comments are permanently recorded in the audit trail.
                </span>
              </div>
            </div>
          )}

          {/* Past Review Comments on this submission */}
          {submissionReviews.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Previous Peer Reviews ({submissionReviews.length})
              </span>
              <div className="space-y-2">
                {submissionReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">
                        {r.reviewer?.nama || 'Teammate'}
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                          r.keputusan === 'verify'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.keputusan}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{r.komentar}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Close
            </button>
            {!isAssignee && (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 ${
                  decision === 'verify'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Recording...' : `Confirm ${decision === 'verify' ? 'Verification' : 'Revision Request'}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
