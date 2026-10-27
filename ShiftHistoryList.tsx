import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  Hospital,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Trash2,
  Filter,
  FileText,
  UserCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ShiftRecord, DiscrepancyStatus, Industry } from '../types/shift';
import { LanguageCode, getTranslation } from '../utils/translations';

interface ShiftHistoryListProps {
  shifts: ShiftRecord[];
  currentLanguage: LanguageCode;
  onOpenDiscrepancyModal: (shift: ShiftRecord) => void;
  onDeleteShift: (shiftId: string) => void;
}

export const ShiftHistoryList: React.FC<ShiftHistoryListProps> = ({
  shifts,
  currentLanguage,
  onOpenDiscrepancyModal,
  onDeleteShift,
}) => {
  const t = getTranslation(currentLanguage);

  const [industryFilter, setIndustryFilter] = useState<'all' | Industry>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);

  // Filtered shifts
  const filteredShifts = shifts.filter((s) => {
    if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
    if (statusFilter === 'discrepant') {
      return s.calculation.differenceType === 'shortfall';
    }
    if (statusFilter === 'flagged') {
      return Boolean(s.discrepancyCase && s.discrepancyCase.status !== 'none');
    }
    if (statusFilter === 'pending') {
      return s.discrepancyCase?.status === 'pending_review';
    }
    if (statusFilter === 'under_review') {
      return s.discrepancyCase?.status === 'under_review';
    }
    if (statusFilter === 'resolved') {
      return s.discrepancyCase?.status === 'resolved';
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedShiftId((prev) => (prev === id ? null : id));
  };

  const getSourceBadge = (source: ShiftRecord['recordSource']) => {
    switch (source) {
      case 'ai_extracted_worker_confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3 text-teal-600" />
            AI Verified Draft
          </span>
        );
      case 'supervisor_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Supervisor Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
            Self-Logged Record
          </span>
        );
    }
  };

  const getStatusBadge = (status?: DiscrepancyStatus) => {
    if (!status || status === 'none') return null;

    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="h-3.5 w-3.5" />
            {t.statusPendingReview}
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <UserCheck className="h-3.5 w-3.5" />
            {t.statusUnderReview}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t.statusResolved}
          </span>
        );
      case 'needs_info':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <HelpCircle className="h-3.5 w-3.5" />
            {t.statusNeedsInfo}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="shift-history-section"
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
      aria-label="Shift History"
    >
      {/* Header and Filters */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            {t.historyTitle}
            <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
              {filteredShifts.length} {filteredShifts.length === 1 ? 'Record' : 'Records'}
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">{t.historySubtitle}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Industry filter */}
          <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value as any)}
              className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Industries</option>
              <option value="construction">Construction Site</option>
              <option value="hospital_sanitation">Hospital Sanitation</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">{t.filterAll}</option>
              <option value="discrepant">{t.filterDiscrepancies}</option>
              <option value="pending">Pending Supervisor Review</option>
              <option value="resolved">{t.filterResolved}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      {filteredShifts.length === 0 ? (
        <div className="p-12 text-center text-stone-500 space-y-2">
          <Calendar className="h-10 w-10 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-700">{t.noShiftsRecorded}</h4>
          <p className="text-xs text-stone-400">
            Use the Record My Shift form above to log your hours.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filteredShifts.map((shift) => {
            const { calculation, discrepancyCase } = shift;
            const isExpanded = expandedShiftId === shift.id;
            const isShortfall = calculation.differenceType === 'shortfall';
            const shortfallDiff = calculation.paymentDifference ?? 0;

            return (
              <div
                key={shift.id}
                className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors"
              >
                {/* Main Card Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Date, Industry, Hours */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-teal-700" />
                        {shift.date}
                      </span>

                      {shift.industry === 'construction' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Building2 className="h-3 w-3 text-amber-700" />
                          Construction
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <Hospital className="h-3 w-3 text-teal-700" />
                          Hospital Sanitation
                        </span>
                      )}

                      {getSourceBadge(shift.recordSource)}
                      {getStatusBadge(discrepancyCase?.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        {shift.startTime} – {shift.endTime} {shift.isOvernight && '(Night Shift)'}
                      </span>
                      <span>
                        Net: <strong className="text-slate-900">{calculation.netWorkedHours}h</strong> (Break: {shift.breakMinutes}m)
                      </span>
                      {calculation.overtimeHours > 0 && (
                        <span className="text-teal-700 font-bold">
                          + {calculation.overtimeHours}h OT
                        </span>
                      )}
                      <span>
                        Rate: ₹{shift.agreedRate} ({shift.wageType === 'daily' ? 'Day' : 'Hour'})
                      </span>
                    </div>

                    {shift.notes && (
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        Note: "{shift.notes}"
                      </p>
                    )}
                  </div>

                  {/* Middle: Financials & Difference */}
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Expected</span>
                      <span className="text-sm font-black text-slate-900">₹{calculation.expectedPay}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Received</span>
                      <span className="text-sm font-bold text-stone-700">
                        {calculation.paymentReceived !== null ? `₹${calculation.paymentReceived}` : 'Pending'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Difference</span>
                      {calculation.differenceType === 'unknown' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-600">
                          {t.statusWaitingPayment}
                        </span>
                      ) : calculation.differenceType === 'match' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {t.statusPaymentMatched}
                        </span>
                      ) : isShortfall ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="h-3 w-3 text-amber-700" />
                          -₹{shortfallDiff}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                          +₹{Math.abs(shortfallDiff)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Discrepancy & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenDiscrepancyModal(shift)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isShortfall || (discrepancyCase && discrepancyCase.status !== 'none')
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>{t.flagDiscrepancy}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(shift.id)}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 border border-stone-200 flex items-center justify-center cursor-pointer"
                      title={isExpanded ? 'Hide details' : 'View details'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteShift(shift.id)}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer"
                      title={t.deleteShift}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-stone-50/50 p-4 rounded-xl">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 block">Pay Calculation Assumptions:</span>
                      {calculation.assumptions.map((assump, idx) => (
                        <p key={idx} className="text-stone-600 text-[11px] flex items-center gap-1">
                          • {assump}
                        </p>
                      ))}
                    </div>

                    {discrepancyCase && discrepancyCase.status !== 'none' && (
                      <div className="space-y-1.5 border-l-2 border-amber-400 pl-3">
                        <span className="font-bold text-amber-900 block flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          Discrepancy Case ({discrepancyCase.status.replace('_', ' ')}):
                        </span>
                        <p className="text-stone-700 text-[11px]">
                          <strong>Worker Note:</strong> "{discrepancyCase.workerExplanation}"
                        </p>
                        {discrepancyCase.aiExplanation && (
                          <p className="text-stone-600 text-[11px] bg-white p-2 rounded border border-stone-200">
                            <strong>Calculation Summary:</strong> {discrepancyCase.aiExplanation}
                          </p>
                        )}
                        {discrepancyCase.supervisorNotes && (
                          <p className="text-teal-900 text-[11px] bg-teal-50 p-2 rounded border border-teal-200">
                            <strong>Supervisor Feedback:</strong> {discrepancyCase.supervisorNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
