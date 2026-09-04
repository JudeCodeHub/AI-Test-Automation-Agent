import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TestCase } from './UserRepoList';
import RecordingPlayer from './RecordingPlayer';

type Props = {
  testCase: TestCase;
  screenshot?: string;
  children: React.ReactNode;
};

function formatDuration(ms: number | null) {
  if (!ms) return null;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export default function RunResultDialog({ testCase, screenshot, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {testCase.status === 'passed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {testCase.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
            {testCase.title}
          </DialogTitle>
          <DialogDescription>
            {testCase.lastRunAt
              ? `Last run ${new Date(testCase.lastRunAt).toLocaleString()}${formatDuration(testCase.lastRunDurationMs) ? ` · ${formatDuration(testCase.lastRunDurationMs)}` : ''}`
              : 'This test case has not run yet.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {testCase.lastRunAssertions && testCase.lastRunAssertions.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500">ASSERTIONS</h3>
              <div className="space-y-1.5">
                {testCase.lastRunAssertions.map((assertion, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                    {assertion.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate">
                        <Badge variant={'outline'} className="mr-2">
                          {assertion.type}
                        </Badge>
                        {assertion.selector ?? assertion.expected}
                      </p>
                      {assertion.error && (
                        <p className="mt-0.5 text-xs text-red-600">{assertion.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screenshot && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500">SCREENSHOT</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt={`${testCase.title} screenshot`}
                className="w-full rounded-md border"
              />
            </div>
          )}
          {!screenshot && testCase.lastRunSessionId && (
            <p className="text-xs text-gray-500">
              Screenshot only available right after a run - watch the recording below instead.
            </p>
          )}

          {testCase.lastRunSessionId && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500">RECORDING</h3>
              <RecordingPlayer sessionId={testCase.lastRunSessionId} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
