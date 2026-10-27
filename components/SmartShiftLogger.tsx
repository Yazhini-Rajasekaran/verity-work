import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  Building2,
  Hospital,
  Info,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import {
  Industry,
  WageType,
  DailyWagePolicy,
  RecordSource,
  ShiftRecord,
} from '../types/shift';
import { calculateShiftWage } from '../utils/wageCalculator';
import { LanguageCode, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';

interface SmartShiftLoggerProps {
  currentWorkerName: string;
  currentLanguage: LanguageCode;
  onShiftSaved: (shift: Partial<ShiftRecord>) => Promise<void> | void;
}

export const SmartShiftLogger: React.FC<SmartShiftLoggerProps> = ({
  currentWorkerName,
  currentLanguage,
  onShiftSaved,
}) => {
  const t = getTranslation(currentLanguage);

  // Mode: 5-step guided wizard or classic fast form
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Natural language & speech state
  const [naturalText, setNaturalText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Structured form state
  const [industry, setIndustry] = useState<Industry>('construction');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isOvernight, setIsOvernight] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState<number>(30);
  const [wageType, setWageType] = useState<WageType>('daily');
  const [agreedRate, setAgreedRate] = useState<number>(750);
  const [overtimeThreshold, setOvertimeThreshold] = useState<number>(8);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [dailyPolicy, setDailyPolicy] = useState<DailyWagePolicy>('standard_8h_ot_pro_rata');

  // Payment state
  const [isPaymentUnknown, setIsPaymentUnknown] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState<string>('');
  const [notes, setNotes] = useState('');

  // UI state
  const [showCalculationDrawer, setShowCalculationDrawer] = useState(false);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);
  const [recordSource, setRecordSource] = useState<RecordSource>('manual_worker_entry');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Get active speech locale based on current language
  const activeLocale = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechLocale || 'en-IN';
  }, [currentLanguage]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = activeLocale;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setNaturalText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(t.speechMicBlocked);
        } else {
          setSpeechError(`Voice capture note: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }
  }, [activeLocale, t.speechMicBlocked]);

  const toggleVoiceRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      setSpeechError(t.speechNotSupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = activeLocale;
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Voice start err:', err);
      }
    }
  };

  // AI Extraction handler with fallback
  const handleExtractFromText = async () => {
    if (!naturalText.trim()) return;

    setIsExtracting(true);
    setExtractionWarnings([]);
    setExtractionNotice(null);

    try {
      const res = await fetch('/api/extract-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: naturalText,
          industryHint: industry,
          language: currentLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error('Extraction request failed');
      }

      const data = await res.json();
      const extracted = data.extracted;

      if (extracted) {
        if (extracted.industry) setIndustry(extracted.industry);
        if (extracted.date) setDate(extracted.date);
        if (extracted.startTime) setStartTime(extracted.startTime);
        if (extracted.endTime) setEndTime(extracted.endTime);
        if (typeof extracted.isOvernight === 'boolean') setIsOvernight(extracted.isOvernight);
        if (typeof extracted.breakMinutes === 'number') setBreakMinutes(extracted.breakMinutes);
        if (extracted.wageType) setWageType(extracted.wageType);
        if (typeof extracted.agreedRate === 'number' && extracted.agreedRate > 0) {
          setAgreedRate(extracted.agreedRate);
        }
        if (extracted.paymentReceived !== undefined && extracted.paymentReceived !== null) {
          setIsPaymentUnknown(false);
          setPaymentReceived(String(extracted.paymentReceived));
        }
        if (extracted.notes) setNotes(extracted.notes);

        if (extracted.missingOrAmbiguousFields && extracted.missingOrAmbiguousFields.length > 0) {
          setExtractionWarnings(extracted.missingOrAmbiguousFields);
        }

        setRecordSource('ai_extracted_worker_confirmed');
        setExtractionNotice(t.aiExtractNote);
      }
    } catch (err) {
      console.warn('Extraction API error, applying local rule heuristics:', err);
      setExtractionWarnings(['Network or parsing limitation. Please review auto-filled values.']);
    } finally {
      setIsExtracting(false);
    }
  };

  // Deterministic live wage calculation
  const liveCalculation = useMemo(() => {
    const paymentVal = isPaymentUnknown
      ? null
      : paymentReceived.trim() === ''
      ? null
      : parseFloat(paymentReceived);

    return calculateShiftWage({
      startTime,
      endTime,
      isOvernight,
      breakMinutes,
      wageType,
      agreedRate: agreedRate > 0 ? agreedRate : 0,
      overtimeThresholdHours: overtimeThreshold,
      overtimeMultiplier,
      dailyWagePolicy: dailyPolicy,
      paymentReceived: Number.isFinite(paymentVal as number) ? (paymentVal as number) : null,
    });
  }, [
    startTime,
    endTime,
    isOvernight,
    breakMinutes,
    wageType,
    agreedRate,
    overtimeThreshold,
    overtimeMultiplier,
    dailyPolicy,
    isPaymentUnknown,
    paymentReceived,
  ]);

  // Form submission
  const handleSaveShift = async () => {
    if (!liveCalculation.isValid) {
      alert(liveCalculation.validationError || 'Please correct errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage(null);

    const shiftPayload: Partial<ShiftRecord> = {
      workerName: currentWorkerName,
      industry,
      date,
      startTime,
      endTime,
      isOvernight,
      breakMinutes,
      wageType,
      agreedRate,
      overtimeThresholdHours: overtimeThreshold,
      overtimeMultiplier,
      dailyWagePolicy: dailyPolicy,
      paymentReceived: liveCalculation.paymentReceived,
      notes: notes.trim(),
      recordSource,
      calculation: liveCalculation,
    };

    try {
      await onShiftSaved(shiftPayload);
      setSaveSuccessMessage('Record successfully saved to your personal shift history.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
      // Reset step to 1 if in guided mode
      if (isGuidedMode) {
        setCurrentStep(1);
      }
    } catch {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id="record-shift-section"
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
      aria-label="Shift Logger"
    >
      {/* Header bar with Mode Switcher */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
            <Calculator className="h-6 w-6 text-teal-100" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{t.guidedTitle}</h2>
            <p className="text-xs text-teal-100 font-medium">{t.guidedSubtitle}</p>
          </div>
        </div>

        {/* Guided vs Classic Toggle */}
        <div className="inline-flex items-center bg-black/20 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGuidedMode(true)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isGuidedMode ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-100 hover:text-white'
            }`}
          >
            {t.switchGuided}
          </button>
          <button
            type="button"
            onClick={() => setIsGuidedMode(false)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isGuidedMode ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-100 hover:text-white'
            }`}
          >
            {t.switchClassic}
          </button>
        </div>
      </div>

      {/* Voice & Natural Language Bar */}
      <div className="p-5 bg-teal-50/50 border-b border-teal-100">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>{t.voiceButtonListening}</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>{t.voiceButtonStart}</span>
                </>
              )}
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder={t.voicePlaceholder}
                className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="button"
              onClick={handleExtractFromText}
              disabled={isExtracting || !naturalText.trim()}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isExtracting ? t.aiExtracting : t.aiExtractButton}</span>
            </button>
          </div>

          {speechError && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              {speechError}
            </p>
          )}

          {extractionNotice && (
            <div className="text-xs text-teal-800 bg-teal-100/70 border border-teal-300 px-3.5 py-2 rounded-lg flex items-center justify-between">
              <span className="font-semibold">{extractionNotice}</span>
              <button
                type="button"
                onClick={() => setExtractionNotice(null)}
                className="text-teal-700 font-bold hover:text-teal-900 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {extractionWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
              <span className="font-bold flex items-center gap-1 mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                Note on ambiguous fields:
              </span>
              <p>{extractionWarnings.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {isGuidedMode ? (
          /* ================= 5-STEP GUIDED WIZARD ================= */
          <div className="space-y-6">
            {/* Step progress pills */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      currentStep === step
                        ? 'bg-teal-700 text-white ring-4 ring-teal-100 scale-105'
                        : currentStep > step
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                    aria-label={`Go to Step ${step}`}
                  >
                    {currentStep > step ? <Check className="h-4 w-4" /> : step}
                  </button>
                ))}
              </div>
              <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {t.stepIndicator} {currentStep} / 5
              </span>
            </div>

            {/* STEP 1: Location & Date */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.step1Title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.step1Desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIndustry('construction')}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      industry === 'construction'
                        ? 'border-teal-700 bg-teal-50/60 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        industry === 'construction'
                          ? 'bg-teal-700 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        {t.industryConstruction}
                      </span>
                      <span className="text-xs text-stone-500 mt-1 block">
                        Masonry, carpentry, labor, painting, daily wages
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndustry('hospital_sanitation')}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      industry === 'hospital_sanitation'
                        ? 'border-teal-700 bg-teal-50/60 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        industry === 'hospital_sanitation'
                          ? 'bg-teal-700 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Hospital className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        {t.industryHospital}
                      </span>
                      <span className="text-xs text-stone-500 mt-1 block">
                        Ward sanitation, waste management, deep cleaning
                      </span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.shiftDate}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.workerName}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentWorkerName}
                      className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Times & Breaks */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.step2Title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.step2Desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-teal-700" />
                      {t.startTime}
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-teal-700" />
                      {t.endTime}
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Night shift toggle */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOvernight}
                    onChange={(e) => setIsOvernight(e.target.checked)}
                    className="h-5 w-5 mt-0.5 text-teal-700 rounded border-stone-300 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      {t.isOvernightLabel}
                    </span>
                    <span className="text-xs text-stone-500 block">{t.isOvernightHint}</span>
                  </div>
                </label>

                {/* Meal break duration pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {t.breakDuration}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { minutes: 0, label: t.breakNone },
                      { minutes: 15, label: t.break15m },
                      { minutes: 30, label: t.break30m },
                      { minutes: 45, label: t.break45m },
                      { minutes: 60, label: t.break60m },
                    ].map((item) => (
                      <button
                        key={item.minutes}
                        type="button"
                        onClick={() => setBreakMinutes(item.minutes)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          breakMinutes === item.minutes
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Agreed Pay Rate */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.step3Title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.step3Desc}</p>
                </div>

                {/* Wage Type toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWageType('daily');
                      if (agreedRate < 100) setAgreedRate(750);
                    }}
                    className={`min-h-[48px] p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      wageType === 'daily'
                        ? 'border-teal-700 bg-teal-50/70 text-teal-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {t.wageDaily}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWageType('hourly');
                      if (agreedRate > 300) setAgreedRate(90);
                    }}
                    className={`min-h-[48px] p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      wageType === 'hourly'
                        ? 'border-teal-700 bg-teal-50/70 text-teal-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {t.wageHourly}
                  </button>
                </div>

                {/* Agreed Rate Input with quick +/- buttons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-teal-700" />
                    {wageType === 'daily' ? t.agreedRateDaily : t.agreedRateHourly}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={agreedRate || ''}
                      onChange={(e) => setAgreedRate(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                    <button
                      type="button"
                      onClick={() => setAgreedRate((prev) => Math.max(1, prev - (wageType === 'daily' ? 50 : 10)))}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold border border-stone-300 cursor-pointer"
                    >
                      -{wageType === 'daily' ? 50 : 10}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgreedRate((prev) => prev + (wageType === 'daily' ? 50 : 10))}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold border border-stone-300 cursor-pointer"
                    >
                      +{wageType === 'daily' ? 50 : 10}
                    </button>
                  </div>
                </div>

                {/* Shift / Overtime Policy */}
                {wageType === 'daily' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.overtimeRules}
                    </label>
                    <select
                      value={dailyPolicy}
                      onChange={(e) => setDailyPolicy(e.target.value as DailyWagePolicy)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="standard_8h_ot_pro_rata">{t.policyStandard}</option>
                      <option value="fixed_daily_wage">{t.policyFixed}</option>
                      <option value="half_full_day_tier">{t.policyTier}</option>
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Overtime Threshold
                      </label>
                      <select
                        value={overtimeThreshold}
                        onChange={(e) => setOvertimeThreshold(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        <option value={8}>8 Hours / Shift (Standard)</option>
                        <option value={9}>9 Hours / Shift</option>
                        <option value={10}>10 Hours / Shift</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Overtime Multiplier
                      </label>
                      <select
                        value={overtimeMultiplier}
                        onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        <option value={1.5}>1.5x (Time & Half)</option>
                        <option value={2.0}>2.0x (Double Time)</option>
                        <option value={1.0}>1.0x (Regular Hourly Rate)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Payment Received */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.step4Title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.step4Desc}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-teal-700" />
                    {t.paymentReceivedLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isPaymentUnknown}
                    value={isPaymentUnknown ? '' : paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.value)}
                    placeholder="e.g. 700 or 750"
                    className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-xl font-black text-slate-900 focus:ring-2 focus:ring-teal-600 disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaymentUnknown}
                    onChange={(e) => setIsPaymentUnknown(e.target.checked)}
                    className="h-5 w-5 mt-0.5 text-teal-700 rounded border-stone-300 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      {t.paymentPendingCheckbox}
                    </span>
                    <span className="text-xs text-stone-500 mt-0.5 block">
                      {t.paymentPendingNotice}
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Shift Notes or Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Building C 4th floor, overtime requested by contractor"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Review & Save */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.step5Title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.step5Desc}</p>
                </div>

                {/* Calculation Summary Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block">
                        {t.netHoursLogged}
                      </span>
                      <span className="text-lg font-black text-slate-900 mt-0.5 block">
                        {liveCalculation.netWorkedHours}h
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Break: {liveCalculation.unpaidBreakHours}h
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block">
                        {t.regularPay}
                      </span>
                      <span className="text-lg font-black text-slate-900 mt-0.5 block">
                        ₹{liveCalculation.regularPay}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {liveCalculation.regularHours}h regular
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block">
                        {t.overtimePay}
                      </span>
                      <span className="text-lg font-black text-teal-700 mt-0.5 block">
                        ₹{liveCalculation.overtimePay}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {liveCalculation.overtimeHours}h OT
                      </span>
                    </div>

                    <div className="bg-teal-700 text-white p-3 rounded-xl shadow-xs">
                      <span className="text-[11px] font-bold text-teal-100 block">
                        {t.totalCalculatedPay}
                      </span>
                      <span className="text-xl font-black text-white mt-0.5 block">
                        ₹{liveCalculation.expectedPay}
                      </span>
                      <span className="text-[10px] text-teal-200">Expected Total</span>
                    </div>
                  </div>

                  {/* Payment Comparison Indicator */}
                  <div className="pt-2 border-t border-stone-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <span className="font-bold text-stone-700">{t.paymentDifference}:</span>
                      {liveCalculation.differenceType === 'unknown' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700">
                          <Clock className="h-3.5 w-3.5" />
                          {t.statusWaitingPayment}
                        </span>
                      ) : liveCalculation.differenceType === 'match' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {t.statusPaymentMatched} (₹{liveCalculation.paymentReceived})
                        </span>
                      ) : liveCalculation.differenceType === 'shortfall' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                          Possible shortfall: ₹{liveCalculation.paymentDifference} difference
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                          {t.statusPossibleExcess} (+₹{Math.abs(liveCalculation.paymentDifference || 0)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Expandable "How was this calculated?" Drawer */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCalculationDrawer((prev) => !prev)}
                      className="w-full text-left text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center justify-between py-2 border-t border-stone-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        {showCalculationDrawer ? t.howCalculatedClose : t.howCalculated}
                      </span>
                      {showCalculationDrawer ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {showCalculationDrawer && (
                      <div className="mt-2 p-3.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
                        <p className="font-extrabold text-slate-900 text-xs">
                          Step-by-Step Calculation Breakdown:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-stone-600 text-[11px]">
                          <li>
                            <strong>Total Elapsed Time:</strong> {startTime} to {endTime}{' '}
                            {isOvernight ? '(Night shift)' : ''} = {liveCalculation.elapsedDurationHours} hours
                          </li>
                          <li>
                            <strong>Unpaid Break:</strong> {breakMinutes} minutes ({liveCalculation.unpaidBreakHours} hours)
                          </li>
                          <li>
                            <strong>Net Worked Hours:</strong> {liveCalculation.elapsedDurationHours} − {liveCalculation.unpaidBreakHours} = {liveCalculation.netWorkedHours} hours
                          </li>
                          <li>
                            <strong>Regular Hours & Pay:</strong> {liveCalculation.regularHours} hours = ₹{liveCalculation.regularPay}
                          </li>
                          {liveCalculation.overtimeHours > 0 && (
                            <li>
                              <strong>Overtime Hours & Pay:</strong> {liveCalculation.overtimeHours} hours at configured multiplier = ₹{liveCalculation.overtimePay}
                            </li>
                          )}
                          <li>
                            <strong>Total Expected Pay:</strong> ₹{liveCalculation.regularPay} + ₹{liveCalculation.overtimePay} = ₹{liveCalculation.expectedPay}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm & Save Button */}
                <button
                  type="button"
                  onClick={handleSaveShift}
                  disabled={isSaving || !liveCalculation.isValid}
                  className="w-full min-h-[50px] py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="h-5 w-5" />
                  <span>{isSaving ? t.savingShift : t.saveToRecords}</span>
                </button>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t.prevStep}</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-auto"
                >
                  <span>{t.nextStep}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ================= CLASSIC FAST FORM ================= */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.selectIndustry}</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as Industry)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="construction">{t.industryConstruction}</option>
                  <option value="hospital_sanitation">{t.industryHospital}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.shiftDate}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.workerName}</label>
                <input
                  type="text"
                  disabled
                  value={currentWorkerName}
                  className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.startTime}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.endTime}</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unpaid Break (mins)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isOvernight}
                    onChange={(e) => setIsOvernight(e.target.checked)}
                    className="h-4 w-4 text-teal-700 rounded border-stone-300"
                  />
                  <span>Night Shift</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.wageType}</label>
                <select
                  value={wageType}
                  onChange={(e) => setWageType(e.target.value as WageType)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold"
                >
                  <option value="daily">{t.wageDaily}</option>
                  <option value="hourly">{t.wageHourly}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Rate (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={agreedRate || ''}
                  onChange={(e) => setAgreedRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Received (₹)</label>
                <input
                  type="number"
                  disabled={isPaymentUnknown}
                  value={isPaymentUnknown ? '' : paymentReceived}
                  onChange={(e) => setPaymentReceived(e.target.value)}
                  placeholder="Leave empty if unknown"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold disabled:bg-stone-100"
                />
                <label className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaymentUnknown}
                    onChange={(e) => setIsPaymentUnknown(e.target.checked)}
                    className="h-3.5 w-3.5 text-teal-700 rounded"
                  />
                  <span>Payment not received yet</span>
                </label>
              </div>
            </div>

            {/* Calculated quick card */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs">
                <span>Net: <strong>{liveCalculation.netWorkedHours}h</strong></span>
                <span>Regular: <strong>₹{liveCalculation.regularPay}</strong></span>
                <span>OT: <strong>₹{liveCalculation.overtimePay}</strong></span>
                <span className="text-sm font-black text-teal-800">
                  Total Expected: ₹{liveCalculation.expectedPay}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveShift}
                disabled={isSaving || !liveCalculation.isValid}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {isSaving ? t.savingShift : t.saveToRecords}
              </button>
            </div>
          </div>
        )}

        {/* Global Save Success Notification */}
        {saveSuccessMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
};
