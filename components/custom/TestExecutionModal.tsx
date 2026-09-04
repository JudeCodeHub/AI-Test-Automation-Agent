'use client';

import React, { useState, useEffect, useContext } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TestCase } from './UserRepoList';
import { scriptToPseudocode } from '@/lib/scriptPseudocode';
import RecordingPlayer from './RecordingPlayer';
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  Globe,
  Code,
  Camera,
  Video,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import axios from 'axios';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  targetDomain?: string;
};

type RunResult = {
  testCaseId: number;
  status: 'idle' | 'generating' | 'running' | 'passed' | 'failed';
  logs: string[];
  error?: string;
  sessionId?: string;
  browserbaseScript?: string;
  screenshot?: string;
};

function initialScriptPreview(tc: TestCase): string | undefined {
  if (!tc.lastRunAssertions || !tc.status || (tc.status !== 'passed' && tc.status !== 'failed')) {
    return undefined;
  }
  // We don't have the raw structured script on the client for a case that
  // hasn't been run in this session yet - only its last result. Leave the
  // code panel to populate on the next run instead of guessing at content.
  return undefined;
}

export default function TestExecutionModal({ isOpen, onClose, testCases, targetDomain }: Props) {
  const { setUserDetail } = useContext(UserDetailContext);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  // Advanced Options states
  const [executionMode, setExecutionMode] = useState<'cache' | 'generate'>('cache');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // Initialize states when testCases change or modal opens
  useEffect(() => {
    if (isOpen && testCases.length > 0) {
      const initial: Record<number, RunResult> = {};
      testCases.forEach((tc) => {
        initial[tc.id] = {
          testCaseId: tc.id,
          status: tc.status === 'passed' || tc.status === 'failed' ? tc.status : 'idle',
          logs: ['Waiting to run...'],
          browserbaseScript: initialScriptPreview(tc),
          sessionId: tc.lastRunSessionId ?? undefined,
        };
      });
      setResults(initial);
      setSelectedDetailId(testCases[0].id);
      setCurrentIdx(-1);
      setIsExecuting(false);
      setCustomPrompt('');

      setBaseUrl(targetDomain || 'http://localhost:3000');

      // Auto-detect if any selected testcase doesn't have a cached script.
      const hasMissingScript = testCases.some((tc) => !tc.lastRunAssertions);
      setExecutionMode(hasMissingScript ? 'generate' : 'cache');
    }
  }, [isOpen, testCases, targetDomain]);

  // Handle executing the queue sequentially
  useEffect(() => {
    if (!isExecuting || currentIdx < 0 || currentIdx >= testCases.length) {
      if (currentIdx >= testCases.length) {
        setIsExecuting(false);
      }
      return;
    }

    const runTest = async () => {
      const currentTestCase = testCases[currentIdx];
      const tcId = currentTestCase.id;

      setSelectedDetailId(tcId);

      const isRegenerating = executionMode === 'generate' || !results[tcId]?.browserbaseScript;

      setResults((prev) => ({
        ...prev,
        [tcId]: {
          ...prev[tcId],
          status: isRegenerating ? 'generating' : 'running',
          logs: [
            isRegenerating
              ? '[SYSTEM] Connecting to AI agent to analyze files and generate script...'
              : '[SYSTEM] Found pre-generated script cached in database, preparing execution...',
          ],
        },
      }));

      try {
        const res = await axios.post('/api/test-cases/run', {
          testCaseId: tcId,
          baseUrl: baseUrl.trim(),
          mode: executionMode,
          customPrompt: customPrompt.trim(),
        });

        const data = res.data;

        if (typeof data.credits === 'number') {
          setUserDetail((prev: any) => ({ ...prev, credits: data.credits }));
        }

        setResults((prev) => ({
          ...prev,
          [tcId]: {
            testCaseId: tcId,
            status: data.status,
            logs: data.logs || [],
            browserbaseScript: data.browserbaseScript,
            sessionId: data.sessionId,
            screenshot: data.screenshot,
            error: data.error,
          },
        }));
      } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message || 'Execution failed';
        setResults((prev) => ({
          ...prev,
          [tcId]: {
            ...prev[tcId],
            status: 'failed',
            error: errMsg,
            logs: [...(prev[tcId]?.logs || []), `[SYSTEM ERROR] ${errMsg}`],
          },
        }));
      }

      setCurrentIdx((prev) => prev + 1);
    };

    runTest();
  }, [isExecuting, currentIdx, testCases, baseUrl, executionMode]);

  const startExecution = () => {
    const resetResults: Record<number, RunResult> = {};
    testCases.forEach((tc) => {
      resetResults[tc.id] = {
        testCaseId: tc.id,
        status: 'idle',
        logs: ['Queued...'],
        browserbaseScript: results[tc.id]?.browserbaseScript,
      };
    });
    setResults(resetResults);
    setIsExecuting(true);
    setCurrentIdx(0);
    setSelectedDetailId(testCases[0].id);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setCurrentIdx(-1);
  };

  const currentSelectedResult = selectedDetailId ? results[selectedDetailId] : null;
  const currentSelectedTestCase = testCases.find((tc) => tc.id === selectedDetailId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[90vh] max-w-5xl flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-6 shadow-2xl select-none">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <PlayCircle className="text-primary h-6 w-6" />
              Browserbase Cloud Test Runner
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Run automation scripts completely in the cloud using Browserbase headless
              infrastructure.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Target Configuration Header */}
        <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-gray-200/80 bg-gray-50 p-4">
          <div className="flex flex-col items-end gap-4 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                <Globe className="text-primary h-3.5 w-3.5" /> Target Website URL
              </label>
              <Input
                placeholder="e.g. http://localhost:3000"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                disabled={isExecuting}
                className="h-10 border-gray-300 bg-white font-mono text-sm shadow-xs"
              />
            </div>
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptions(!showOptions)}
                className={`h-10 gap-1.5 border-gray-300 px-4 text-xs font-medium transition-colors ${showOptions ? 'bg-primary/5 text-primary border-primary/30' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Execution Options
                {showOptions ? (
                  <ChevronUp className="ml-0.5 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-0.5 h-3 w-3" />
                )}
              </Button>
              {!isExecuting ? (
                <Button
                  onClick={startExecution}
                  className="bg-primary hover:bg-primary/95 h-10 gap-2 px-6 font-medium text-white shadow-md"
                >
                  <Play className="h-4 w-4 fill-white" /> Start Execution
                </Button>
              ) : (
                <Button
                  onClick={stopExecution}
                  variant="destructive"
                  className="h-10 gap-2 px-6 font-medium"
                >
                  <Loader2 className="h-4 w-4 animate-spin" /> Stop Runner
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Advanced Options Section */}
          {showOptions && (
            <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-5 border-t border-gray-200/60 pt-3 duration-200 md:grid-cols-3">
              {/* Execution Mode Segment */}
              <div className="space-y-1.5 md:col-span-1">
                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Run Mode
                </span>
                <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-200/60 p-1">
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode('cache')}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      executionMode === 'cache'
                        ? 'bg-white text-gray-800 shadow-xs'
                        : 'text-gray-500 hover:text-gray-700'
                    } disabled:opacity-50`}
                  >
                    <Database className="h-3.5 w-3.5" /> Run Cached
                  </button>
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode('generate')}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      executionMode === 'generate'
                        ? 'bg-white text-gray-800 shadow-xs'
                        : 'text-gray-500 hover:text-gray-700'
                    } disabled:opacity-50`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-600" /> AI Regenerate
                  </button>
                </div>
              </div>

              {/* Temporary Prompt/Instruction Override Textarea */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Custom Run Instructions (Merged with Global Settings)
                </span>
                <textarea
                  placeholder="e.g. Make sure to click the profile dropdown before asserting, or wait 1s after clicks..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isExecuting || executionMode === 'cache'}
                  rows={2}
                  className="focus:ring-primary focus:border-primary w-full resize-none rounded-md border border-gray-300 px-3 py-1.5 font-sans text-xs shadow-xs focus:ring-1 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Dashboard Panel */}
        <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden md:grid-cols-3">
          {/* Left: Test Cases Queue List */}
          <div className="flex flex-col gap-2 overflow-y-auto rounded-xl border bg-gray-50/50 p-3 shadow-xs md:col-span-1">
            <h3 className="mb-1 px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Execution Queue
            </h3>
            {testCases.map((tc, index) => {
              const res = results[tc.id];
              const isActive = selectedDetailId === tc.id;
              const isRunning = currentIdx === index && isExecuting;

              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedDetailId(tc.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    isActive
                      ? 'border-primary ring-primary/20 bg-white shadow-sm ring-1'
                      : 'border-gray-200 bg-white shadow-xs hover:border-gray-300'
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold text-gray-800">{tc.title}</h4>
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isActive ? 'text-primary rotate-90' : ''
                      }`}
                    />
                  </div>
                  <p className="mb-2.5 line-clamp-1 text-xs text-gray-400">{tc.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px] capitalize">
                      {tc.type}
                    </Badge>
                    <StatusBadge status={res?.status || 'idle'} isRunning={isRunning} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Code, Live Logs & Details Panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm md:col-span-2">
            {currentSelectedTestCase ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header Info */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b bg-gray-50/50 p-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      {currentSelectedTestCase.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected: {currentSelectedTestCase.expectedResult}
                    </p>
                  </div>
                  {currentSelectedResult?.sessionId && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/30 text-primary hover:bg-primary/5 shrink-0 gap-1 text-xs font-medium shadow-xs"
                        >
                          <Video className="h-3.5 w-3.5" /> Watch Recording
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Video className="text-primary h-4 w-4" />{' '}
                            {currentSelectedTestCase.title}
                          </DialogTitle>
                          <DialogDescription>Recording of this test run.</DialogDescription>
                        </DialogHeader>
                        <RecordingPlayer sessionId={currentSelectedResult.sessionId} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Body split: Code Accordion + Terminal */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                  {/* Playwright Script Code Block */}
                  {currentSelectedResult?.browserbaseScript && (
                    <div className="overflow-hidden rounded-lg border">
                      <div className="flex items-center justify-between border-b bg-gray-100 px-3.5 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                          <Code className="text-primary h-3.5 w-3.5" /> Generated Playwright Code
                        </span>
                      </div>
                      <pre className="max-h-36 overflow-x-auto bg-gray-950 p-3 font-mono text-[11px] leading-relaxed text-emerald-400">
                        {currentSelectedResult.browserbaseScript}
                      </pre>
                    </div>
                  )}

                  {/* Final Screenshot */}
                  {currentSelectedResult?.screenshot && (
                    <div className="overflow-hidden rounded-lg border">
                      <div className="flex items-center justify-between border-b bg-gray-100 px-3.5 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                          <Camera className="text-primary h-3.5 w-3.5" /> Final Screenshot
                        </span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${currentSelectedResult.screenshot}`}
                        alt={`${currentSelectedTestCase.title} final state`}
                        className="max-h-72 w-full bg-gray-50 object-contain object-top"
                      />
                    </div>
                  )}

                  {/* Terminal Execution Console */}
                  <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-lg border">
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-3.5 py-2">
                      <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-gray-300 select-text">
                        <Terminal className="text-primary h-3.5 w-3.5" /> Live Console Logs
                      </span>
                      <Badge
                        variant="secondary"
                        className="border-none bg-gray-800 text-[10px] text-gray-300 uppercase"
                      >
                        {currentSelectedResult?.status || 'idle'}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto bg-gray-950 p-3 font-mono text-[11px] text-gray-300 select-text">
                      {currentSelectedResult?.logs.map((log, lIdx) => (
                        <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">
                          {log.startsWith('[SYSTEM]') ? (
                            <span className="text-blue-400">{log}</span>
                          ) : log.startsWith('[SYSTEM ERROR]') ? (
                            <span className="font-semibold text-rose-400">{log}</span>
                          ) : log.startsWith('[BROWSER]') ? (
                            <span className="text-purple-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                      {currentSelectedResult?.error && (
                        <div className="mt-2 border-t border-gray-800 pt-2 font-bold text-red-400">
                          Error: {currentSelectedResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Terminal className="mb-3 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">No Test Case Selected</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-400">
                  Choose any test case from the queue to inspect its console logs and code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex shrink-0 justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExecuting}
            className="h-10 px-5 font-medium"
          >
            Close & Refresh Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status, isRunning }: { status: RunResult['status']; isRunning: boolean }) {
  if (isRunning) {
    return (
      <Badge className="flex animate-pulse items-center gap-1 border-none bg-amber-100 text-amber-800 hover:bg-amber-100">
        <Loader2 className="h-3 w-3 animate-spin" /> Running
      </Badge>
    );
  }

  switch (status) {
    case 'generating':
      return (
        <Badge className="flex items-center gap-1 border-none bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating...
        </Badge>
      );
    case 'passed':
      return (
        <Badge className="flex items-center gap-1 border-none bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          <CheckCircle2 className="h-3 w-3" /> Passed
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="flex items-center gap-1 border-none bg-rose-100 text-rose-800 hover:bg-rose-100">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    case 'idle':
    default:
      return (
        <Badge variant="secondary" className="text-gray-600">
          Queued
        </Badge>
      );
  }
}
