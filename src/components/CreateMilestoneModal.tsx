'use client';

import React, { useState } from 'react';
import { useFairWork, DEMO_USERS } from '@/lib/fairwork-store';
import { X, PlusCircle, AlertCircle, Calendar, User, Award } from 'lucide-react';

interface CreateMilestoneModalProps {
  onClose: () => void;
}

export default function CreateMilestoneModal({ onClose }: CreateMilestoneModalProps) {
  const { createMilestone, members, currentUser } = useFairWork();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tenggat, setTenggat] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [bobot, setBobot] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!judul.trim()) {
      setError('Milestone title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMilestone({
        judul,
        deskripsi,
        tenggat: new Date(tenggat).toISOString(),
        assignee_id: assigneeId,
        bobot: Number(bobot),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create milestone');
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
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Add New Milestone</h3>
              <p className="text-xs text-slate-500">FR-3: Assign task, deadline, and weight</p>
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
              Milestone Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="e.g. User Interface Implementation"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scope & Deliverables Description
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Detail what files and proof of work are expected..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assignee Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee (Penanggung Jawab) <span className="text-rose-500">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                {members.map((m) => {
                  const profile =
                    m.profile || DEMO_USERS.find((u) => u.id === m.user_id) || { nama: m.user_id };
                  return (
                    <option key={m.user_id} value={m.user_id}>
                      {profile.nama}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tenggat}
                onChange={(e) => setTenggat(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          {/* Bobot (Weight) FR-10 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Milestone Weight (Bobot Kontribusi)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setBobot(w)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    bobot === w
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-400/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs block">{w} Point{w > 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-slate-400">
                    {w === 1 ? 'Standard Task' : w === 2 ? 'Medium Feature' : 'Major Epic'}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Weights are used in the FR-6 contribution percentage calculation.
            </span>
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
              <PlusCircle className="w-3.5 h-3.5" />
              {isSubmitting ? 'Adding...' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
