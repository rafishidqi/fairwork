'use client';

import React, { useState } from 'react';
import { Milestone, StoredFile } from '@/types/database';
import { useFairWork } from '@/lib/fairwork-store';
import {
  X,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Paperclip,
  Trash2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { evaluateTextFlag } from '@/lib/fairwork-heuristic';

interface UploadModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export default function UploadModal({ milestone, onClose }: UploadModalProps) {
  const { uploadSubmission, submissions } = useFairWork();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousSubmissions = submissions.filter((s) => s.milestone_id === milestone.id);
  const nextVersion = previousSubmissions.length + 1;

  // Realtime heuristic check for FR-8
  const { flag, reason } = evaluateTextFlag(description, previousSubmissions);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const allowedMime = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/png',
      'image/jpeg',
    ];

    const newFiles: StoredFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];

      // File size limit: 10 MB = 10 * 1024 * 1024 bytes
      if (f.size > 10 * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the 10 MB limit.`);
        return;
      }

      // MIME check
      if (!allowedMime.includes(f.type) && !f.name.endsWith('.docx') && !f.name.endsWith('.txt')) {
        setError(`File type not allowed for "${f.name}". Supported: PDF, DOCX, TXT, PNG, JPG.`);
        return;
      }

      newFiles.push({
        name: f.name,
        path: `proof-of-work/${Date.now()}_${f.name}`,
        size: f.size,
        type: f.type || 'application/octet-stream',
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a brief description of what you completed.');
      return;
    }

    if (files.length === 0) {
      // Allow default sample file for quick demo convenience if user didn't pick from local disk
      const defaultProof: StoredFile = {
        name: `${milestone.judul.toLowerCase().replace(/[^a-z0-9]/g, '_')}_proof_v${nextVersion}.pdf`,
        path: `proof-of-work/submission_v${nextVersion}.pdf`,
        size: 145000,
        type: 'application/pdf',
      };
      files.push(defaultProof);
    }

    setIsSubmitting(true);
    try {
      await uploadSubmission(milestone.id, description, files);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload proof of work');
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
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Version {nextVersion}
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Upload Proof of Work</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Description "What I did" */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              What did you accomplish? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your progress, technical decisions, and deliverables..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{description.length} characters</span>
              <span>Keep it concise and clear for peer reviewers</span>
            </div>
          </div>

          {/* FR-8 Heuristic Preview */}
          {flag && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Reviewer Note Preview (FR-8)</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{reason}</p>
              </div>
            </div>
          )}

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Proof Files (PDF, DOCX, TXT, PNG, JPG • max 10MB)
            </label>

            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition group">
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition mb-1.5" />
              <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600">
                Click to attach files or drag & drop
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Screenshots, documents, or source code samples
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Attached files:</span>
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100/80 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700 truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Submissions History */}
          {previousSubmissions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" />
                Previous Submissions ({previousSubmissions.length})
              </span>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {previousSubmissions.map((ps) => (
                  <div
                    key={ps.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-600">Version {ps.versi}</span>
                      <span>{new Date(ps.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                      &quot;{ps.deskripsi}&quot;
                    </p>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isSubmitting ? 'Uploading...' : `Submit Proof (v${nextVersion})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
