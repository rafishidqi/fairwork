'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MilestoneBoard from '@/components/MilestoneBoard';
import ContributionSummaryView from '@/components/ContributionSummaryView';
import UploadModal from '@/components/UploadModal';
import ReviewModal from '@/components/ReviewModal';
import MilestoneAuditModal from '@/components/MilestoneAuditModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import CreateMilestoneModal from '@/components/CreateMilestoneModal';
import { Milestone, Submission } from '@/types/database';
import { ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'board' | 'summary'>('board');
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const [uploadMilestone, setUploadMilestone] = useState<Milestone | null>(null);
  const [reviewState, setReviewState] = useState<{
    milestone: Milestone;
    submission: Submission;
  } | null>(null);
  const [auditMilestone, setAuditMilestone] = useState<Milestone | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateMilestone={() => setIsCreateMilestoneOpen(true)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'board' ? (
          <MilestoneBoard
            onOpenUpload={(m) => setUploadMilestone(m)}
            onOpenReview={(m, sub) => setReviewState({ milestone: m, submission: sub })}
            onOpenAudit={(m) => setAuditMilestone(m)}
            onOpenCreateMilestone={() => setIsCreateMilestoneOpen(true)}
          />
        ) : (
          <ContributionSummaryView />
        )}
      </main>

      {/* Modals */}
      {uploadMilestone && (
        <UploadModal
          milestone={uploadMilestone}
          onClose={() => setUploadMilestone(null)}
        />
      )}

      {reviewState && (
        <ReviewModal
          milestone={reviewState.milestone}
          submission={reviewState.submission}
          onClose={() => setReviewState(null)}
        />
      )}

      {auditMilestone && (
        <MilestoneAuditModal
          milestone={auditMilestone}
          onClose={() => setAuditMilestone(null)}
        />
      )}

      {isCreateMilestoneOpen && (
        <CreateMilestoneModal onClose={() => setIsCreateMilestoneOpen(false)} />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal onClose={() => setIsCreateProjectOpen(false)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">FairWork v1.1</span>
            <span>•</span>
            <span>Tim Manuk Hiber | STACK 2026 (Case 1: Smarter Campus and Learning)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="italic text-slate-400">
              &quot;Activity recorded, verified by peers, transparent for lecturers&quot;
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
