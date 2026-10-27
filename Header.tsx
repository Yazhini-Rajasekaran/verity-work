import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  HardHat,
  UserCheck,
  Languages,
  BadgeCheck,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { AuthenticatedUser } from '../types/shift';

interface AccountOption {
  id: string;
  name: string;
  role: 'worker' | 'supervisor';
  industry: string;
  label: string;
}

export const DEMO_ACCOUNTS: AccountOption[] = [
  {
    id: 'worker-ramesh',
    name: 'Ramesh Kumar',
    role: 'worker',
    industry: 'construction',
    label: 'Ramesh Kumar (Worker — Construction Site)',
  },
  {
    id: 'worker-sunita',
    name: 'Sunita Devi',
    role: 'worker',
    industry: 'hospital_sanitation',
    label: 'Sunita Devi (Worker — Hospital Sanitation)',
  },
  {
    id: 'supervisor-rajesh',
    name: 'Rajesh Sharma',
    role: 'supervisor',
    industry: 'construction',
    label: 'Rajesh Sharma (Site Supervisor — Delhi Metro)',
  },
];

interface HeaderProps {
  currentUser: AuthenticatedUser | null;
  onSwitchAccount: (userId: string) => Promise<void>;
  currentRole: 'worker' | 'supervisor';
  onRoleChange: (role: 'worker' | 'supervisor') => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenTestSuite: () => void;
  onOpenSDGModal: () => void;
  isAuthenticating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchAccount,
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  onOpenTestSuite,
  onOpenSDGModal,
  isAuthenticating,
}) => {
  const t = getTranslation(currentLanguage);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20 shrink-0">
              <BadgeCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  VERITY <span className="text-teal-700">WORK</span>
                </h1>
                <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                  Worker Proof
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-600">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector, SDG, Test Suite, Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Language Dropdown with Native Script */}
            <div className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg px-2.5 py-1.5 transition-colors">
              <Languages className="h-4 w-4 text-teal-700 shrink-0" />
              <label htmlFor="language-select" className="sr-only">Choose Language</label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label="Select language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                    {lang.nativeName} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>

            {/* SDG Badges */}
            <button
              onClick={onOpenSDGModal}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Click to learn about SDG 8.5 & 8.8 alignment"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{t.sdgGoals}</span>
            </button>

            {/* Test Suite Button */}
            <button
              onClick={onOpenTestSuite}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
              <span>{t.verifySuite}</span>
            </button>

            {/* View & Role Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-300">
              <button
                type="button"
                onClick={() => onRoleChange('worker')}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'worker'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <HardHat className="h-4 w-4" />
                <span>{t.workerView}</span>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange('supervisor')}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'supervisor'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>{t.supervisorDesk}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Server-Verified Identity, Account Switcher & Storage Notice */}
        <div className="py-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-800 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-teal-700" />
              <span>Server-Verified Session:</span>
            </span>

            <select
              value={currentUser?.id || 'worker-ramesh'}
              onChange={(e) => onSwitchAccount(e.target.value)}
              disabled={isAuthenticating}
              className="bg-white border border-stone-300 rounded-md px-2.5 py-1 text-xs text-slate-900 font-bold shadow-2xs focus:ring-2 focus:ring-teal-600 focus:outline-none cursor-pointer"
              aria-label="Switch verified principal"
            >
              {DEMO_ACCOUNTS.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label}
                </option>
              ))}
            </select>

            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Role: {currentUser.role === 'supervisor' ? 'Site Supervisor' : 'Worker'} (Isolated)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            <HelpCircle className="h-3.5 w-3.5 shrink-0 text-teal-700" />
            <span>Prototype In-Memory Store — Cryptographically Signed Server Sessions</span>
          </div>
        </div>
      </div>
    </header>
  );
};
