import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserCheck,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { ShiftRecord, DiscrepancyStatus } from '../types/shift';
import { LanguageCode, getTranslation } from '../utils/translations';

interface DiscrepancyModalProps {
  shift: ShiftRecord;
  isOpen: boolean;
  currentLanguage: LanguageCode;
  onClose: () => void;
  onSubmitDiscrepancy: (shiftId: string, explanation: string, aiExplanation?: string) => Promise<void>;
}

export const DiscrepancyModal: React.FC<DiscrepancyModalProps> = ({
  shift,
  isOpen,
  currentLanguage,
  onClose,
  onSubmitDiscrepancy,
}) => {
  const t = getTranslation(currentLanguage);
  const existingCase = shift.discrepancyCase;

  const [workerExplanation, setWorkerExplanation] = useState(
    existingCase?.workerExplanation || ''
  );
  const [aiExplanation, setAiExplanation] = useState<string | undefined>(
    existingCase?.aiExplanation
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { calculation } = shift;
  const isShortfall = calculation.differenceType === 'shortfall';
  const shortfallAmount = calculation.paymentDifference ?? 0;

  const handleGenerateNeutralAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/explain-discrepancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift,
          calculation,
          language: currentLanguage,
          workerExplanation: workerExplanation || 'Worker noted possible wage mismatch.',
        }),
      });

      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Failed to generate neutral explanation:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyExplanation = () => {
    const textToCopy = aiExplanation || workerExplanation;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerExplanation.trim() && !aiExplanation) return;

    setIsSubmitting(true);
    try {
      await onSubmitDiscrepancy(
        shift.id,
        workerExplanation.trim() || (aiExplanation ?? 'Possible difference flagged.'),
        aiExplanation
      );
      onClose();
    } catch (err) {
      console.error('Failed to submit discrepancy:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: DiscrepancyStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="h-3.5 w-3.5" />
            {t.statusPendingReview}
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <UserCheck className="h-3.5 w-3.5" />
            {t.statusUnderReview}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t.statusResolved}
          </span>
        );
      case 'needs_info':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <MessageSquare className="h-3.5 w-3.5" />
            {t.statusNeedsInfo}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            New Flag
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {t.modalDiscrepancyTitle}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {shift.date} • {shift.industry === 'construction' ? 'Construction Site' : 'Hospital Sanitation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-700">Case Resolution Status:</span>
            {getStatusBadge(existingCase?.status)}
          </div>

          {/* Shift Comparison Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-center">
            <div className="bg-white p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] text-stone-500 font-bold block">Expected Wage</span>
              <span className="text-base font-black text-slate-900">₹{calculation.expectedPay}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {calculation.netWorkedHours}h worked
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] text-stone-500 font-bold block">Received</span>
              <span className="text-base font-black text-slate-900">
                {calculation.paymentReceived !== null ? `₹${calculation.paymentReceived}` : 'Pending'}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Payment</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] text-stone-500 font-bold block">Difference</span>
              <span className={`text-base font-black ${isShortfall ? 'text-amber-800' : 'text-slate-800'}`}>
                {isShortfall ? `₹${shortfallAmount}` : '₹0'}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5 font-bold">Possible difference</span>
            </div>
          </div>

          {/* Existing Supervisor Notes if available */}
          {existingCase?.supervisorNotes && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900">
              <div className="flex items-center gap-1.5 font-extrabold mb-1 text-teal-950">
                <UserCheck className="h-4 w-4" />
                Supervisor Notes ({existingCase.reviewedBy || 'Site Supervisor'}):
              </div>
              <p className="text-teal-900 font-medium">{existingCase.supervisorNotes}</p>
            </div>
          )}

          {/* Worker Explanation Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              {t.workerExplanationLabel}
            </label>
            <textarea
              rows={3}
              value={workerExplanation}
              onChange={(e) => setWorkerExplanation(e.target.value)}
              placeholder={t.workerExplanationPlaceholder}
              className="w-full text-xs bg-white border border-stone-300 rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* AI Neutral Explanation Generator */}
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-950">
                <Sparkles className="h-4 w-4 text-teal-700" />
                Transparent Neutral Statement
              </div>
              <button
                type="button"
                onClick={handleGenerateNeutralAI}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGeneratingAI ? t.generatingAiExplanation : t.requestAiExplanation}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-500 font-medium">
              Creates a clear, respectful summary of the shift arithmetic to share with your supervisor or employer.
            </p>

            {aiExplanation && (
              <div className="bg-white p-3.5 rounded-xl border border-teal-200 text-xs text-slate-800 relative shadow-2xs">
                <p className="pr-8 italic text-slate-700 font-medium">"{aiExplanation}"</p>
                <button
                  type="button"
                  onClick={handleCopyExplanation}
                  className="absolute right-2 top-2 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Copy explanation text"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!workerExplanation.trim() && !aiExplanation)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting...' : t.submitToSupervisor}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
