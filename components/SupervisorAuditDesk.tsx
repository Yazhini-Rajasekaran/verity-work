import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Building2,
  Hospital,
  Scale,
  Send,
  MessageSquare,
  ShieldCheck,
  Info,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { ShiftRecord, DiscrepancyStatus, Industry } from '../types/shift';
import { LanguageCode, getTranslation } from '../utils/translations';

interface SupervisorAuditDeskProps {
  shifts: ShiftRecord[];
  currentLanguage: LanguageCode;
  onUpdateCaseStatus: (
    shiftId: string,
    newStatus: DiscrepancyStatus,
    supervisorNotes: string,
    reviewedBy: string,
    resolutionSummary?: string
  ) => Promise<void>;
}

export const SupervisorAuditDesk: React.FC<SupervisorAuditDeskProps> = ({
  shifts,
  currentLanguage,
  onUpdateCaseStatus,
}) => {
  const t = getTranslation(currentLanguage);

  const [selectedCaseShiftId, setSelectedCaseShiftId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | DiscrepancyStatus>('all');
  const [industryFilter, setIndustryFilter] = useState<'all' | Industry>('all');

  // Review form state
  const [reviewStatus, setReviewStatus] = useState<DiscrepancyStatus>('under_review');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [reviewerName, setReviewerName] = useState('Rajesh Sharma (Site Supervisor)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // All shifts with flagged discrepancy cases
  const discrepancyShifts = shifts.filter(
    (s) => s.discrepancyCase && s.discrepancyCase.status !== 'none'
  );

  const filteredCases = discrepancyShifts.filter((s) => {
    if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
    if (statusFilter !== 'all' && s.discrepancyCase?.status !== statusFilter) return false;
    return true;
  });

  const activeShift = shifts.find((s) => s.id === selectedCaseShiftId) || filteredCases[0] || null;

  // Sync review form state when active shift changes
  const handleSelectCase = (shift: ShiftRecord) => {
    setSelectedCaseShiftId(shift.id);
    if (shift.discrepancyCase) {
      setReviewStatus(
        shift.discrepancyCase.status === 'pending_review'
          ? 'under_review'
          : shift.discrepancyCase.status
      );
      setSupervisorNote(shift.discrepancyCase.supervisorNotes || '');
      setResolutionSummary(shift.discrepancyCase.resolutionSummary || '');
      if (shift.discrepancyCase.reviewedBy) {
        setReviewerName(shift.discrepancyCase.reviewedBy);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    setIsSubmitting(true);
    try {
      await onUpdateCaseStatus(
        activeShift.id,
        reviewStatus,
        supervisorNote,
        reviewerName,
        resolutionSummary
      );
      setFeedbackMsg('Case updated! New status is now reflected in the Worker Interface.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update case:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI calculations
  const pendingCount = discrepancyShifts.filter((s) => s.discrepancyCase?.status === 'pending_review').length;
  const underReviewCount = discrepancyShifts.filter((s) => s.discrepancyCase?.status === 'under_review').length;
  const resolvedCount = discrepancyShifts.filter((s) => s.discrepancyCase?.status === 'resolved').length;
  const totalShortfallSum = discrepancyShifts.reduce(
    (sum, s) => sum + (s.calculation.differenceType === 'shortfall' ? s.calculation.paymentDifference || 0 : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-teal-900">
        <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold text-teal-950">VERITY WORK Supervisor & Audit Desk:</strong>{' '}
          Inspect worker discrepancy claims, review step-by-step arithmetic, and provide official resolution notes. Updates are immediately reflected in the worker's personal record.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</div>
          <span className="text-[11px] text-stone-400">Awaiting supervisor</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Under Review</span>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{underReviewCount}</div>
          <span className="text-[11px] text-stone-400">Active investigation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Resolved Cases</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{resolvedCount}</div>
          <span className="text-[11px] text-stone-400">Settled or clarified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Total Flagged Diff</span>
            <Scale className="h-4 w-4 text-stone-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">₹{totalShortfallSum}</div>
          <span className="text-[11px] text-stone-400">Sum of claimed differences</span>
        </div>
      </div>

      {/* Main Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Discrepancy Cases Queue (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Discrepancy Cases Queue
              </h3>
              <p className="text-[11px] text-stone-500">Select a case to inspect calculation audit</p>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-stone-300 rounded-lg text-xs px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
              >
                <option value="all">All ({discrepancyShifts.length})</option>
                <option value="pending_review">Pending ({pendingCount})</option>
                <option value="under_review">Under Review ({underReviewCount})</option>
                <option value="resolved">Resolved ({resolvedCount})</option>
                <option value="needs_info">Needs Info</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100 overflow-y-auto max-h-[560px]">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No discrepancy cases found in this category.
              </div>
            ) : (
              filteredCases.map((shift) => {
                const isSelected = activeShift?.id === shift.id;
                const dCase = shift.discrepancyCase;
                const diff = shift.calculation.paymentDifference ?? 0;

                return (
                  <div
                    key={shift.id}
                    onClick={() => handleSelectCase(shift)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-l-4 border-teal-700'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900">
                        {shift.workerName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">{shift.date}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] text-stone-600 font-medium">
                        {shift.industry === 'construction' ? '🏗️ Construction' : '🏥 Hospital Sanitation'}
                      </span>
                      <span className="text-[10px] text-stone-400">• {shift.calculation.netWorkedHours}h worked</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Shortfall: ₹{diff}
                      </span>

                      {dCase?.status === 'pending_review' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Pending Review
                        </span>
                      )}
                      {dCase?.status === 'under_review' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          Under Review
                        </span>
                      )}
                      {dCase?.status === 'resolved' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Resolved
                        </span>
                      )}
                      {dCase?.status === 'needs_info' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          Needs Info
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Inspection, Audit Details & Supervisor Action Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {!activeShift ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              Select a discrepancy case on the left to inspect details.
            </div>
          ) : (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Case Audit: {activeShift.workerName}
                    <span className="text-xs font-medium text-stone-500">
                      (Shift on {activeShift.date})
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span>Source: <strong>{activeShift.recordSource}</strong></span>
                    <span>• Industry: <strong>{activeShift.industry}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Difference</span>
                  <span className="text-base font-black text-amber-800">
                    ₹{activeShift.calculation.paymentDifference}
                  </span>
                </div>
              </div>

              {/* Wage Calculation Truth Table */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Deterministic Calculation Truth Table:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Net Worked</span>
                    <strong className="text-slate-900">{activeShift.calculation.netWorkedHours}h</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Regular Pay</span>
                    <strong className="text-slate-900">₹{activeShift.calculation.regularPay}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Overtime Pay</span>
                    <strong className="text-teal-700">₹{activeShift.calculation.overtimePay}</strong>
                  </div>
                  <div className="bg-teal-700 text-white p-2 rounded-lg">
                    <span className="text-[10px] text-teal-100 block">Expected Pay</span>
                    <strong className="text-white">₹{activeShift.calculation.expectedPay}</strong>
                  </div>
                </div>
              </div>

              {/* Worker Statement */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-amber-700" />
                  Worker Explanation:
                </span>
                <p className="text-xs text-slate-800 italic">
                  "{activeShift.discrepancyCase?.workerExplanation || 'No statement provided.'}"
                </p>
                {activeShift.discrepancyCase?.aiExplanation && (
                  <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 mt-2">
                    <strong>Auto-Generated Neutral Summary:</strong>{' '}
                    {activeShift.discrepancyCase.aiExplanation}
                  </p>
                )}
              </div>

              {/* Supervisor Resolution Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-stone-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    {t.updateStatus}
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as DiscrepancyStatus)}
                    className="bg-white border border-stone-300 rounded-lg text-xs px-3 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="under_review">Under Review (Investigating)</option>
                    <option value="needs_info">Needs Info (Request Worker Clarification)</option>
                    <option value="resolved">Resolved & Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.supervisorNotes}
                  </label>
                  <textarea
                    rows={2}
                    value={supervisorNote}
                    onChange={(e) => setSupervisorNote(e.target.value)}
                    placeholder="Internal supervisor notes or investigation remarks..."
                    className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.supervisorResolutionSummary}
                  </label>
                  <input
                    type="text"
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="e.g. Verified 1.5h OT on attendance log; ₹120 difference will be credited in Friday payment cycle."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-stone-500">
                    Reviewer: <strong>{reviewerName}</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Submit Resolution'}</span>
                  </button>
                </div>

                {feedbackMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
