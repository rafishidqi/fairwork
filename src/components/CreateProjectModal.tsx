'use client';

import React, { useState } from 'react';
import { useFairWork } from '@/lib/fairwork-store';
import { X, FolderPlus, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const { createProject } = useFairWork();
  const [judul, setJudul] = useState('');
  const [mataKuliah, setMataKuliah] = useState('');
  const [tenggat, setTenggat] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deskripsi, setDeskripsi] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([
    'alicia@demo.fairwork.edu',
    'brian@demo.fairwork.edu',
    'cindy@demo.fairwork.edu',
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEmail = () => {
    if (!newEmail.trim()) return;
    if (memberEmails.includes(newEmail.trim())) {
      setError('Member is already added to the list.');
      return;
    }
    if (memberEmails.length >= 4) {
      setError('Maximum 5 members per project team (including leader).');
      return;
    }
    setMemberEmails([...memberEmails, newEmail.trim()]);
    setNewEmail('');
    setError('');
  };

  const removeEmail = (idx: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!judul.trim() || !mataKuliah.trim()) {
      setError('Please provide project title and course name.');
      return;
    }

    if (memberEmails.length < 2) {
      setError('A group project requires at least 3 members (Leader + at least 2 members).');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({
        judul,
        mata_kuliah: mataKuliah,
        tenggat: new Date(tenggat).toISOString(),
        deskripsi,
        member_emails: memberEmails,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Create New Project</h3>
              <p className="text-xs text-slate-500">FR-2: Initialize team space & milestones</p>
            </div>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="e.g. Software Engineering Final Report"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={mataKuliah}
                onChange={(e) => setMataKuliah(e.target.value)}
                placeholder="e.g. CS302 - Software Engineering"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Final Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tenggat}
                onChange={(e) => setTenggat(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Brief (Optional)
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Outline project goals and expected outputs..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Members Invitation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team Members (3 to 5 students total)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Add member email (e.g. student@univ.ac.id)..."
                className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={addEmail}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-xs">
                <span className="font-semibold text-indigo-900">You (Project Leader)</span>
                <span className="text-[10px] text-indigo-600 uppercase font-bold">Leader</span>
              </div>
              {memberEmails.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-slate-700 truncate">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(idx)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              <FolderPlus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
