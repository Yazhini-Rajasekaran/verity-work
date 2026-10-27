import React from 'react';
import { X, ShieldCheck, Scale, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface SDGInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SDGInfoModal: React.FC<SDGInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Sustainable Development Goal (SDG) Alignment
              </h3>
              <p className="text-xs text-emerald-900 font-semibold">
                VERITY WORK — UN SDG Goal 8: Decent Work & Economic Growth
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-stone-600">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Scale className="h-4 w-4 text-emerald-700" />
              SDG 8.5: Equal Pay & Decent Work
            </div>
            <p className="leading-relaxed">
              By 2030, achieve full and productive employment and decent work for all women and men, including for young people and persons with disabilities, and equal pay for work of equal value.
            </p>
            <div className="text-[11px] text-emerald-900 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
              VERITY WORK provides workers with transparent, deterministic shift calculations so overtime and agreed daily/hourly wage expectations are clear to both worker and supervisor.
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <HeartHandshake className="h-4 w-4 text-emerald-700" />
              SDG 8.8: Protect Labour Rights
            </div>
            <p className="leading-relaxed">
              Protect labour rights and promote safe and secure working environments for all workers, including migrant workers, in particular women migrants, and those in precarious employment.
            </p>
            <div className="text-[11px] text-emerald-900 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
              Daily-wage construction laborers and hospital contract sanitation workers often receive lump-sum cash without paper pay slips. VERITY WORK equips them with an immutable personal work record and a dignified, non-adversarial resolution workflow.
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="font-extrabold text-slate-900">Core Design Ethics in VERITY WORK:</h4>
            <ul className="space-y-1.5 text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero AI Arithmetic:</strong> Calculations are strictly deterministic code, never hallucinated by generative models.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Neutral, Respectful Phrasing:</strong> Discrepancies are labelled "possible shortfall" or "difference found", avoiding false accusations of theft while ensuring fair review.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Accessible & Multilingual:</strong> Deep teal high-contrast UI, full regional language support (Tamil, Telugu, Kannada, Malayalam, Hindi, English), and low-literacy 5-step guided input.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors cursor-pointer shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
