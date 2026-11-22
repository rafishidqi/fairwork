'use client';

import React, { useState } from 'react';
import { useFairWork } from '@/lib/fairwork-store';
import {
  FileBarChart,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Users,
  Award,
  Layers,
  Printer,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';

export default function ContributionSummaryView() {
  const { currentProject, getContributionSummary, activities, milestones } = useFairWork();
  const [isExporting, setIsExporting] = useState(false);

  const summary = getContributionSummary();
  const totalVerifiedWeight = summary.length > 0 ? summary[0].total_project_verified_weight : 0;
  const projectMilestones = milestones.filter((m) => m.project_id === currentProject.id);
  const totalMilestones = projectMilestones.length;
  const verifiedMilestonesCount = projectMilestones.filter((m) => m.status === 'verified').length;
  const teamCompletionRate =
    totalMilestones > 0 ? Math.round((verifiedMilestonesCount / totalMilestones) * 100) : 0;

  // FR-9: Export PDF Generator
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FairWork - Individual Contribution Report', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('STACK 2026: Smarter Campus and Learning • Tim Manuk Hiber', 14, 19);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, 140, 19);

      // Project Meta
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Information', 14, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Project Title: ${currentProject.judul}`, 14, 45);
      doc.text(`Course: ${currentProject.mata_kuliah}`, 14, 51);
      doc.text(`Project Deadline: ${new Date(currentProject.tenggat).toLocaleDateString()}`, 14, 57);
      doc.text(`Total Project Milestones: ${totalMilestones} (${verifiedMilestonesCount} verified)`, 120, 45);
      doc.text(`Total Verified Weight: ${totalVerifiedWeight} pts`, 120, 51);

      // Horizontal Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 63, 196, 63);

      // Table Header
      let y = 72;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Individual Contribution Breakdown', 14, y);

      y += 6;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('MEMBER NAME', 18, y + 5.5);
      doc.text('ROLE', 80, y + 5.5);
      doc.text('ASSIGNED', 105, y + 5.5);
      doc.text('VERIFIED', 125, y + 5.5);
      doc.text('REVIEWS', 145, y + 5.5);
      doc.text('CONTRIBUTION (%)', 165, y + 5.5);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      summary.forEach((item) => {
        y += 8;
        doc.rect(14, y, 182, 8);
        doc.text(item.nama, 18, y + 5.5);
        doc.text(item.role.toUpperCase(), 80, y + 5.5);
        doc.text(`${item.assigned_count}`, 110, y + 5.5);
        doc.text(`${item.verified_count}`, 130, y + 5.5);
        doc.text(`${item.reviews_given_count}`, 150, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`${item.contribution_pct}%`, 175, y + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
      });

      // Milestone Verification Audit Log
      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Milestone Verification Audit Log', 14, y);

      y += 6;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('MILESTONE TITLE', 18, y + 5.5);
      doc.text('WEIGHT', 105, y + 5.5);
      doc.text('STATUS', 130, y + 5.5);
      doc.text('DEADLINE', 160, y + 5.5);

      projectMilestones.forEach((m) => {
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.rect(14, y, 182, 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(m.judul.length > 40 ? m.judul.substring(0, 38) + '...' : m.judul, 18, y + 5.5);
        doc.text(`${m.bobot || 1}`, 110, y + 5.5);
        doc.text(m.status.toUpperCase(), 130, y + 5.5);
        doc.text(new Date(m.tenggat).toLocaleDateString(), 160, y + 5.5);
      });

      // Mandatory Disclaimer Box (FR-6)
      y += 16;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.rect(14, y, 182, 14, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text('OFFICIAL FAIRWORK DISCLAIMER NOTICE:', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'This summary records verified team activity and peer review trail, not academic grades. Final grading remains at the discretion of the course instructor.',
        18,
        y + 9.5
      );

      // Save PDF
      doc.save(`FairWork_${currentProject.judul.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Contribution Summary</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              FR-6 Formula
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated individual performance based on peer-verified milestone deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleBrowserPrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Export PDF Report (FR-9)'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box (Required by FR-6 Acceptance Criteria) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">Academic Integrity Notice:</span>
          <p className="text-slate-600">
            &quot;Ringkasan ini mencatat aktivitas, bukan nilai. / This summary records activity, not grades.&quot;
            Grading decisions remain exclusively with the course instructor. FairWork provides an immutable evidence trail of who did what and who verified it.
          </p>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Milestones</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalMilestones}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {verifiedMilestonesCount} completed & verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Verified Weight</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{totalVerifiedWeight} pts</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Basis for % allocation</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Team Completion</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-600">{teamCompletionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Overall task progress</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active Members</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Student contributors</div>
        </div>
      </div>

      {/* Visual Stacked Contribution Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">Visual Team Contribution Share</span>
          <span className="text-slate-500 text-[11px]">
            Formula: (Member Verified Weight / Total Verified Weight) * 100%
          </span>
        </div>

        {totalVerifiedWeight > 0 ? (
          <div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5">
              {summary.map((item, idx) => {
                const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
                return (
                  <div
                    key={item.user_id}
                    style={{ width: `${item.contribution_pct}%` }}
                    className={`${colors[idx % colors.length]} h-full rounded-sm transition-all duration-500`}
                    title={`${item.nama}: ${item.contribution_pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-start gap-4 mt-2.5 text-[11px]">
              {summary.map((item, idx) => {
                const dotColors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
                return (
                  <div key={item.user_id} className="flex items-center gap-1.5 text-slate-600">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className="font-medium text-slate-800">{item.nama.split(' ')[0]}</span>
                    <span className="font-bold text-slate-900">({item.contribution_pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No milestones have been verified yet. Contribution percentages will calculate once the first peer verification is approved.
          </div>
        )}
      </div>

      {/* Main Contribution Table (FR-6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Individual Contribution Matrix</h3>
          <span className="text-xs text-slate-400">Target team size: 3-5 students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Assigned</th>
                <th className="px-4 py-3 text-center">Verified</th>
                <th className="px-4 py-3 text-center">Reviews Given</th>
                <th className="px-4 py-3 text-right">Verified Weight</th>
                <th className="px-6 py-3 text-right">Contribution (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.map((item) => (
                <tr key={item.user_id} className="hover:bg-slate-50/80 transition">
                  {/* Member Name & Avatar */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`
                        }
                        alt="Avatar"
                        className="w-8 h-8 rounded-full bg-slate-100"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.nama}</div>
                        <div className="text-[11px] text-slate-400">{item.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'leader'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* Assigned Count */}
                  <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                    {item.assigned_count}
                  </td>

                  {/* Verified Count */}
                  <td className="px-4 py-3.5 text-center font-semibold text-emerald-600">
                    {item.verified_count}
                  </td>

                  {/* Reviews Given */}
                  <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                    {item.reviews_given_count}
                  </td>

                  {/* Verified Weight */}
                  <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                    {item.verified_weight} pts
                  </td>

                  {/* Contribution (%) */}
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(item.contribution_pct, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm text-indigo-600">
                        {item.contribution_pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Project Activity & Audit Timeline
          </h3>
          <span className="text-xs text-slate-400">Chronological activity stream</span>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  act.tipe === 'review'
                    ? 'bg-emerald-100 text-emerald-700'
                    : act.tipe === 'upload'
                    ? 'bg-indigo-100 text-indigo-700'
                    : act.tipe === 'revision_requested'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {act.tipe === 'review' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : act.tipe === 'upload' ? (
                  <Layers className="w-4 h-4" />
                ) : act.tipe === 'revision_requested' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-slate-800 leading-snug">{act.detail}</p>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
