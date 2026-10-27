import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
} from 'lucide-react';
import { runAllVerificationTests, TestSuiteReport } from './utils/testSuite';

interface VerificationTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationTestSuiteModal: React.FC<VerificationTestSuiteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<TestSuiteReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const rep = runAllVerificationTests();
      setReport(rep);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedTestId((prev) => (prev === id ? null : id));
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verity-work-verification-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Core Verification & Test Suite
              </h3>
              <p className="text-xs text-slate-500">
                Automated regression and rule verification tests for deterministic wage calculations & workflows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary Banner */}
          {report && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    report.failedTests === 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {report.failedTests === 0 ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <XCircle className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {report.passedTests} / {report.totalTests} Tests Passed
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Executed in {report.durationMs}ms
                    </span>
                    <span>• {new Date(report.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={executeTests}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>Rerun Suite</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                  title="Download test results as JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Cases Accordion List */}
          <div className="space-y-2.5">
            {report?.results.map((t) => {
              const isExpanded = expandedTestId === t.id;

              return (
                <div
                  key={t.id}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    t.passed ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(t.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {t.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {t.name}
                          <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{t.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.passed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {t.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/70 text-xs space-y-2">
                      <div className="text-slate-700">
                        <strong>Result Details:</strong> {t.details}
                      </div>

                      {t.inputData && (
                        <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                          <span className="text-slate-400 block mb-0.5 text-[10px] font-sans">
                            Test Input:
                          </span>
                          {JSON.stringify(t.inputData, null, 2)}
                        </div>
                      )}

                      {t.outputData && (
                        <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                          <span className="text-slate-400 block mb-0.5 text-[10px] font-sans">
                            Produced Output:
                          </span>
                          {JSON.stringify(t.outputData, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Suite
          </button>
        </div>
      </div>
    </div>
  );
};
