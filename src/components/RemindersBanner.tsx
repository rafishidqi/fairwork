'use client';

import React from 'react';
import { useFairWork } from '@/lib/fairwork-store';
import { AlertTriangle, Clock, Bell } from 'lucide-react';

export default function RemindersBanner() {
  const { milestones, currentUser, currentProject } = useFairWork();

  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Filter milestones assigned to current user that are not verified
  const userPendingMilestones = milestones.filter(
    (m) =>
      m.project_id === currentProject.id &&
      m.assignee_id === currentUser.id &&
      m.status !== 'verified'
  );

  const overdueMilestones = userPendingMilestones.filter((m) => new Date(m.tenggat) < now);

  const upcomingMilestones = userPendingMilestones.filter((m) => {
    const deadline = new Date(m.tenggat);
    return deadline >= now && deadline <= twoDaysLater;
  });

  if (overdueMilestones.length === 0 && upcomingMilestones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {overdueMilestones.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px] mr-1.5 px-1.5 py-0.5 bg-rose-200/60 rounded">
                Overdue Reminder
              </span>
              <span className="font-semibold">{m.judul}</span> was due on{' '}
              {new Date(m.tenggat).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              . Please upload your proof of work!
            </div>
          </div>
        </div>
      ))}

      {upcomingMilestones.map((m) => {
        const deadline = new Date(m.tenggat);
        const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
        const isToday = hoursLeft <= 24;

        return (
          <div
            key={m.id}
            className={`flex items-center justify-between p-3.5 rounded-xl text-xs border shadow-sm ${
              isToday
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  isToday ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`font-bold uppercase tracking-wider text-[10px] mr-1.5 px-1.5 py-0.5 rounded ${
                    isToday ? 'bg-amber-200/80 text-amber-800' : 'bg-indigo-200/80 text-indigo-800'
                  }`}
                >
                  {isToday ? 'Due Today (H-0)' : 'Due Soon (H-2)'}
                </span>
                <span className="font-semibold">{m.judul}</span> is due in{' '}
                {hoursLeft <= 24 ? `${hoursLeft} hours` : `${Math.round(hoursLeft / 24)} days`}.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
