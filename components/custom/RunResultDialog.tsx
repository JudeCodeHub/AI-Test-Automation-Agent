import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react'
import { TestCase } from './UserRepoList'

type Props = {
  testCase: TestCase
  screenshot?: string
  children: React.ReactNode
}

function formatDuration(ms: number | null) {
  if (!ms) return null
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

export default function RunResultDialog({ testCase, screenshot, children }: Props) {
  const sessionReplayUrl = testCase.lastRunSessionId
    ? `https://browserbase.com/sessions/${testCase.lastRunSessionId}`
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {testCase.status === 'passed' && <CheckCircle2 className='h-5 w-5 text-green-600' />}
            {testCase.status === 'failed' && <XCircle className='h-5 w-5 text-red-600' />}
            {testCase.title}
          </DialogTitle>
          <DialogDescription>
            {testCase.lastRunAt
              ? `Last run ${new Date(testCase.lastRunAt).toLocaleString()}${formatDuration(testCase.lastRunDurationMs) ? ` · ${formatDuration(testCase.lastRunDurationMs)}` : ''}`
              : 'This test case has not run yet.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {testCase.lastRunAssertions && testCase.lastRunAssertions.length > 0 && (
            <div>
              <h3 className='text-xs font-medium text-gray-500 mb-2'>ASSERTIONS</h3>
              <div className='space-y-1.5'>
                {testCase.lastRunAssertions.map((assertion, index) => (
                  <div key={index} className='flex items-start gap-2 text-sm border rounded-md p-2'>
                    {assertion.passed
                      ? <CheckCircle2 className='h-4 w-4 text-green-600 shrink-0 mt-0.5' />
                      : <XCircle className='h-4 w-4 text-red-600 shrink-0 mt-0.5' />}
                    <div className='min-w-0'>
                      <p className='truncate'>
                        <Badge variant={'outline'} className='mr-2'>{assertion.type}</Badge>
                        {assertion.selector ?? assertion.expected}
                      </p>
                      {assertion.error && (
                        <p className='text-xs text-red-600 mt-0.5'>{assertion.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screenshot && (
            <div>
              <h3 className='text-xs font-medium text-gray-500 mb-2'>SCREENSHOT</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt={`${testCase.title} screenshot`}
                className='w-full rounded-md border'
              />
            </div>
          )}
          {!screenshot && testCase.lastRunSessionId && (
            <p className='text-xs text-gray-500'>
              Screenshot only available right after a run - view the full session replay instead.
            </p>
          )}

          {sessionReplayUrl && (
            <a
              href={sessionReplayUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline'
            >
              View Session Replay <ExternalLink className='h-3.5 w-3.5' />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
