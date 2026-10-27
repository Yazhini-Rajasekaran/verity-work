import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
  AlertCircle,
  X,
  FileText,
  BadgeCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ShiftRecord, DiscrepancyStatus, AuthenticatedUser } from './types/shift';
import { Header, DEMO_ACCOUNTS } from './components/Header';
import { SmartShiftLogger } from './components/SmartShiftLogger';
import { ShiftHistoryList } from './components/ShiftHistoryList';
import { SupervisorAuditDesk } from './components/SupervisorAuditDesk';
import { DiscrepancyModal } from './components/DiscrepancyModal';
import { VerificationTestSuiteModal } from './components/VerificationTestSuiteModal';
import { SDGInfoModal } from './components/SDGInfoModal';
import { LanguageCode, getTranslation } from './utils/translations';

export default function App() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Server-Verified Authentication State
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // View state: Worker View vs Supervisor Desk
  const [currentRole, setCurrentRole] = useState<'worker' | 'supervisor'>('worker');

  // Multilingual state (persisted to localStorage)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('verity_work_language');
    if (saved && ['en', 'ta', 'te', 'kn', 'ml', 'hi'].includes(saved)) {
      return saved as LanguageCode;
    }
    return 'en';
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('verity_work_language', lang);
  };

  const t = getTranslation(currentLanguage);

  // Honest state & alert messages
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const storageStatus = 'Cryptographically Verified Server Memory (Fail-Closed, Non-Persistent Prototype)';

  // Modals
  const [selectedShiftForDiscrepancy, setSelectedShiftForDiscrepancy] = useState<ShiftRecord | null>(null);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);
  const [isSDGModalOpen, setIsSDGModalOpen] = useState(false);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorBanner(msg);
      setTimeout(() => setErrorBanner(null), 6000);
    } else {
      setSuccessBanner(msg);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  };

  // Build standard auth headers (No client-supplied role or worker-id headers)
  const getAuthHeaders = useCallback(
    (extraHeaders: Record<string, string> = {}) => {
      const headers: Record<string, string> = { ...extraHeaders };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      return headers;
    },
    [authToken]
  );

  // Purge any legacy unencrypted sensitive worker data from localStorage on startup
  useEffect(() => {
    try {
      localStorage.removeItem('verity_cached_shifts');
      localStorage.removeItem('fairshift_cached_shifts');
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  // Fetch shifts strictly from server (Server isolates records per principal)
  const fetchShifts = useCallback(
    async (tokenOverride?: string) => {
      try {
        const headers: Record<string, string> = {};
        const activeToken = tokenOverride || authToken;
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }

        const res = await fetch('/api/shifts', {
          credentials: 'include',
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.shifts && Array.isArray(data.shifts)) {
            setShifts(data.shifts);
            return;
          }
        } else if (res.status === 401) {
          console.warn('Session expired or unauthenticated.');
        } else {
          throw new Error(`Server returned status ${res.status}`);
        }
      } catch (err) {
        console.warn('API fetch shifts failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [authToken]
  );

  // Authenticate user via POST /api/auth/login
  const handleLogin = useCallback(
    async (userId: string): Promise<boolean> => {
      setIsAuthenticating(true);
      try {
        const passcode = userId.startsWith('worker') ? '1234' : 'super123';
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, passcode }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setCurrentUser(json.user);
          setAuthToken(json.token);
          setCurrentRole(json.user.role);
          await fetchShifts(json.token);
          showFeedback(`Signed in as ${json.user.name} (${json.user.role.toUpperCase()})`);
          return true;
        } else {
          showFeedback(json.error || 'Authentication failed', true);
          return false;
        }
      } catch (e) {
        showFeedback('Authentication network error. Please verify server connectivity.', true);
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [fetchShifts]
  );

  // Initial startup: Verify existing session or log in default demo worker
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setCurrentRole(data.user.role);
            await fetchShifts();
            return;
          }
        }
      } catch {
        // Fall through to initial demo login
      }
      // Auto-authenticate default demo worker for zero-friction evaluation
      await handleLogin('worker-ramesh');
    }
    initAuth();
  }, [handleLogin, fetchShifts]);

  // Handle direct account switcher from header
  const handleSwitchAccount = async (targetUserId: string) => {
    await handleLogin(targetUserId);
  };

  // Handle role toggle button (Worker View vs Supervisor Desk)
  const handleRoleToggle = async (targetRole: 'worker' | 'supervisor') => {
    if (targetRole === 'supervisor' && currentUser?.role !== 'supervisor') {
      await handleLogin('supervisor-rajesh');
    } else if (targetRole === 'worker' && currentUser?.role !== 'worker') {
      await handleLogin('worker-ramesh');
    } else {
      setCurrentRole(targetRole);
    }
  };

  // Save new shift with authoritative server validation
  const handleShiftSaved = async (shiftData: Partial<ShiftRecord>): Promise<void> => {
    if (!currentUser) {
      showFeedback('Authentication required to save shift records.', true);
      return;
    }

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(shiftData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setShifts((prev) => [json.shift, ...prev]);
        showFeedback('Shift record successfully verified and saved to personal history.');
      } else {
        const errMessage = json.error || 'Failed to save shift record.';
        showFeedback(`Server Validation Error: ${errMessage}`, true);
      }
    } catch (err: any) {
      showFeedback('Network error while saving to server. Please check connection.', true);
    }
  };

  // Submit or update discrepancy from worker
  const handleSubmitDiscrepancy = async (
    shiftId: string,
    workerExplanation: string,
    aiExplanation?: string
  ) => {
    const discrepancyCase = {
      id: `case-${Date.now()}`,
      status: 'pending_review' as DiscrepancyStatus,
      workerExplanation,
      aiExplanation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ discrepancyCase }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setShifts((prev) => prev.map((s) => (s.id === shiftId ? json.shift : s)));
        showFeedback('Discrepancy case submitted to Supervisor Queue.');
      } else {
        showFeedback(`Failed to submit case: ${json.error || 'Server rejected request'}`, true);
      }
    } catch (err) {
      showFeedback('Network connection issue. Case not recorded on server.', true);
    }
  };

  // Update discrepancy status from supervisor
  const handleSupervisorUpdateStatus = async (
    shiftId: string,
    newStatus: DiscrepancyStatus,
    supervisorNotes: string,
    reviewedBy: string,
    resolutionSummary?: string
  ) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const updatedCase = {
      ...(shift.discrepancyCase || {
        id: `case-${Date.now()}`,
        workerExplanation: '',
        createdAt: new Date().toISOString(),
      }),
      status: newStatus,
      supervisorNotes,
      reviewedBy,
      resolutionSummary,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ discrepancyCase: updatedCase }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setShifts((prev) => prev.map((s) => (s.id === shiftId ? json.shift : s)));
        showFeedback(`Case status updated to "${newStatus.replace('_', ' ')}". Reflected in Worker View.`);
      } else {
        showFeedback(`Authorization error: ${json.error || 'Action not permitted.'}`, true);
      }
    } catch (err) {
      showFeedback('Network error while updating case status.', true);
    }
  };

  // Delete shift
  const handleDeleteShift = async (shiftId: string) => {
    if (!window.confirm('Are you sure you want to delete this shift record?')) return;

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setShifts((prev) => prev.filter((s) => s.id !== shiftId));
        showFeedback('Shift record deleted.');
      } else {
        showFeedback(`Cannot delete shift: ${json.error || 'Unauthorized.'}`, true);
      }
    } catch (e) {
      showFeedback('Network error while deleting record.', true);
    }
  };

  // Reset demo records (requires supervisor role)
  const handleResetDemoData = async () => {
    if (currentUser?.role !== 'supervisor') {
      showFeedback(
        'Administrative demo reset is restricted to the Supervisor Desk. Please switch to Supervisor Desk to reset demo shifts.',
        true
      );
      return;
    }

    if (!window.confirm('Reset shift database to sample benchmark records?')) return;

    try {
      const res = await fetch('/api/reset-demo', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok && data.shifts) {
        setShifts(data.shifts);
        showFeedback('Shift records reset to benchmark demo state.');
      } else {
        showFeedback(`Reset denied: ${data.error || 'Unauthorized action.'}`, true);
      }
    } catch (e) {
      showFeedback('Network error while resetting demo data.', true);
    }
  };

  // Metrics for active worker
  const activeWorkerShifts = shifts.filter((s) => s.workerId === currentUser?.id);
  const totalShiftsCount = activeWorkerShifts.length;
  const totalNetHours = activeWorkerShifts.reduce((acc, s) => acc + (s.calculation?.netWorkedHours || 0), 0);
  const totalExpectedPay = activeWorkerShifts.reduce((acc, s) => acc + (s.calculation?.expectedPay || 0), 0);
  const totalRecordedPay = activeWorkerShifts.reduce((acc, s) => acc + (s.paymentReceived || 0), 0);
  const activeDiscrepancyCasesCount = activeWorkerShifts.filter(
    (s) => s.discrepancyCase && s.discrepancyCase.status !== 'none'
  ).length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchAccount={handleSwitchAccount}
        currentRole={currentRole}
        onRoleChange={handleRoleToggle}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onOpenSDGModal={() => setIsSDGModalOpen(true)}
        isAuthenticating={isAuthenticating}
      />

      {/* Global Alerts / Feedback Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-3">
        {errorBanner && (
          <div
            role="alert"
            className="flex items-center justify-between p-3.5 bg-rose-50 border-l-4 border-rose-600 text-rose-900 rounded-r-xl shadow-xs text-xs sm:text-sm font-semibold mb-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="p-1 hover:bg-rose-100 rounded text-rose-700 cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successBanner && (
          <div
            role="status"
            className="flex items-center justify-between p-3.5 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 rounded-r-xl shadow-xs text-xs sm:text-sm font-semibold mb-2"
          >
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700 mb-3" />
            <p className="text-sm font-bold">Verifying authentication session...</p>
          </div>
        ) : currentRole === 'worker' ? (
          /* ================= WORKER INTERFACE ================= */
          <div className="space-y-6">
            {/* Identity & Mission Banner */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-teal-400/20">
                    <Lock className="h-3.5 w-3.5 text-teal-300" />
                    <span>Cryptographically Isolated Worker Record</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {t.appName} — {t.tagline}
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
                    Transparent work records, deterministic wage calculations, and respectful resolution for every worker.
                  </p>
                </div>
                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-teal-700/50">
                  <span className="text-xs text-teal-200 font-medium">Logged in worker:</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">
                    {currentUser?.name || 'Ramesh Kumar'}
                  </span>
                  <span className="text-[11px] text-teal-200 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-700">
                    {currentUser?.industry === 'hospital_sanitation' ? 'Hospital Sanitation' : 'Construction Site'}
                  </span>
                </div>
              </div>
            </div>

            {/* Accessible Worker Touchcards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Record Today's Work */}
              <button
                type="button"
                onClick={() => scrollToSection('record-shift-section')}
                className="p-4 sm:p-5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-teal-800/80 rounded-xl">
                    <Sparkles className="h-6 w-6 text-amber-300" />
                  </div>
                  <span className="text-xs font-black bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                    {t.step1Title}
                  </span>
                </div>
                <div className="mt-2 text-left">
                  <h3 className="text-sm sm:text-base font-extrabold text-white block">
                    {t.cardRecordShiftTitle}
                  </h3>
                  <p className="text-[11px] text-teal-100 font-medium">
                    {t.cardRecordShiftSub}
                  </p>
                </div>
              </button>

              {/* Card 2: Check My Pay */}
              <button
                type="button"
                onClick={() => scrollToSection('record-shift-section')}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-stone-50 text-left shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[110px] border border-stone-200"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-teal-50 rounded-xl text-teal-700">
                    <Coins className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-teal-800">
                    ₹{Math.round(totalExpectedPay)}
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 block">
                    {t.cardCheckPayTitle}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {t.cardCheckPaySub}
                  </p>
                </div>
              </button>

              {/* Card 3: My Work History */}
              <button
                type="button"
                onClick={() => scrollToSection('shift-history-section')}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-stone-50 text-left shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[110px] border border-stone-200"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-stone-100 rounded-xl text-stone-700">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-extrabold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                    {totalShiftsCount} shifts
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 block">
                    {t.cardHistoryTitle}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {t.cardHistorySub}
                  </p>
                </div>
              </button>

              {/* Card 4: Track My Complaints */}
              <button
                type="button"
                onClick={() => scrollToSection('shift-history-section')}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-stone-50 text-left shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[110px] border border-stone-200"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      activeDiscrepancyCasesCount > 0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {activeDiscrepancyCasesCount} open
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 block">
                    {t.cardDiscrepanciesTitle}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {t.cardDiscrepanciesSub}
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold text-stone-500 block">{t.metricTotalShifts}</span>
                <span className="text-xl font-black text-slate-900">{totalShiftsCount}</span>
                <span className="text-[10px] text-stone-400 block">{currentUser?.name}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 block">{t.metricNetHours}</span>
                <span className="text-xl font-black text-teal-700">{Math.round(totalNetHours * 10) / 10}h</span>
                <span className="text-[10px] text-stone-400 block">{t.metricAfterBreaks}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 block">{t.metricExpectedPay}</span>
                <span className="text-xl font-black text-slate-900">₹{Math.round(totalExpectedPay)}</span>
                <span className="text-[10px] text-stone-400 block">
                  {t.metricRecordedPay}₹{Math.round(totalRecordedPay)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 block">{t.metricOpenCases}</span>
                <span className="text-xl font-black text-amber-700">{activeDiscrepancyCasesCount}</span>
                <span className="text-[10px] text-stone-400 block">Supervisor status</span>
              </div>
            </div>

            {/* Smart Shift Logger */}
            <SmartShiftLogger
              currentWorkerName={currentUser?.name || 'Ramesh Kumar'}
              currentLanguage={currentLanguage}
              onShiftSaved={handleShiftSaved}
            />

            {/* Shift History & Wage Records */}
            <ShiftHistoryList
              shifts={shifts}
              currentLanguage={currentLanguage}
              onOpenDiscrepancyModal={(shift) => setSelectedShiftForDiscrepancy(shift)}
              onDeleteShift={handleDeleteShift}
            />
          </div>
        ) : (
          /* ================= SUPERVISOR INTERFACE ================= */
          <SupervisorAuditDesk
            shifts={shifts}
            currentLanguage={currentLanguage}
            onUpdateCaseStatus={handleSupervisorUpdateStatus}
          />
        )}
      </main>

      {/* Discrepancy Modal */}
      {selectedShiftForDiscrepancy && (
        <DiscrepancyModal
          shift={selectedShiftForDiscrepancy}
          isOpen={Boolean(selectedShiftForDiscrepancy)}
          currentLanguage={currentLanguage}
          onClose={() => setSelectedShiftForDiscrepancy(null)}
          onSubmitDiscrepancy={handleSubmitDiscrepancy}
        />
      )}

      {/* Verification Test Suite Modal */}
      <VerificationTestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />

      {/* SDG Alignment Modal */}
      <SDGInfoModal
        isOpen={isSDGModalOpen}
        onClose={() => setIsSDGModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-800">VERITY WORK</span>
            <span>•</span>
            <span className="font-medium text-stone-600">{t.tagline}</span>
            <span>•</span>
            <span
              className="flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200"
              title="Verified session: All records isolated by server authentication."
            >
              <Database className="h-3 w-3" />
              {storageStatus}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer min-h-[36px] px-2"
              title="Supervisor privileged action"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </button>
            <span>•</span>
            <span className="text-[11px]">Ready for Google Cloud Run deployment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
