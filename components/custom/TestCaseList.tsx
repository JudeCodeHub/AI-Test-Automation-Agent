import React, { useState } from 'react'
import { TestCase } from './UserRepoList';
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Loader2, Play, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import TestCaseSettingDialog from './TestCaseSettingDialog';
import RunResultDialog from './RunResultDialog';
import axios from 'axios';

type Props = {
  testCases: TestCase[]
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>
  targetDomain?: string
  onReload: any
}

export default function TestCaseList({ testCases, setTestCases, targetDomain, onReload }: Props) {

  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([])
  const [running, setRunning] = useState(false)
  // Screenshots only live for the duration of this session - they aren't persisted server-side.
  const [screenshots, setScreenshots] = useState<Record<number, string>>({})

  const handleSelectedTestCase = (checked: boolean | "indeterminate" | string, testCase: TestCase) => {
    if (checked) {
      setSelectedTestCases((prev) => [...prev, testCase])
    } else {
      setSelectedTestCases((prev) => prev.filter((item) => item.id !== testCase.id))
    }
  }

  const patchTestCase = (id: number, patch: Partial<TestCase>) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, ...patch } : tc)))
  }

  const runTestCase = async (testCase: TestCase) => {
    patchTestCase(testCase.id, { status: 'running' })
    try {
      const result = await axios.post('/api/test-cases/run', {
        testCaseId: testCase.id,
        targetDomain,
      })
      const { status, lastRunAssertions, screenshot, durationMs, sessionReplayUrl } = {
        status: result.data.status,
        lastRunAssertions: result.data.assertionResults,
        screenshot: result.data.screenshot,
        durationMs: result.data.durationMs,
        sessionReplayUrl: result.data.sessionReplayUrl,
      }
      patchTestCase(testCase.id, {
        status,
        lastRunAssertions,
        lastRunDurationMs: durationMs,
        lastRunAt: new Date().toISOString(),
        lastRunSessionId: sessionReplayUrl?.split('/').pop() ?? testCase.lastRunSessionId,
      })
      if (screenshot) {
        setScreenshots((prev) => ({ ...prev, [testCase.id]: screenshot }))
      }
    } catch (error) {
      console.error('Run test case error:', error)
      patchTestCase(testCase.id, { status: 'failed' })
    }
  }

  const handleRunSelected = async () => {
    setRunning(true)
    try {
      for (const testCase of selectedTestCases) {
        await runTestCase(testCase)
      }
    } finally {
      setRunning(false)
    }
  }

  const StatusBadge = ({ testCase }: { testCase: TestCase }) => {
    const status = testCase.status ?? 'generated'
    const content = (() => {
      if (status === 'running') {
        return <Badge variant={'secondary'} className='w-24 justify-center gap-1'><Loader2 className='h-3 w-3 animate-spin' />Running</Badge>
      }
      if (status === 'passed') {
        return <Badge className='w-24 justify-center gap-1 bg-green-600 hover:bg-green-600/80'><CheckCircle2 className='h-3 w-3' />Passed</Badge>
      }
      if (status === 'failed') {
        return <Badge variant={'destructive'} className='w-24 justify-center gap-1'><XCircle className='h-3 w-3' />Failed</Badge>
      }
      return <Badge variant={'secondary'} className='w-24 justify-center gap-1'><Clock className='h-3 w-3' />Pending</Badge>
    })()

    if (status === 'passed' || status === 'failed') {
      return (
        <RunResultDialog testCase={testCase} screenshot={screenshots[testCase.id]}>
          <button type='button' className='cursor-pointer'>{content}</button>
        </RunResultDialog>
      )
    }
    return content
  }

  return (
    <div >
      <div className='flex items-center justify-between'>
        <h2 className='font-medium mt-2 text-primary'>Generated Test Cases</h2>
        <Button size={'sm'} onClick={() => onReload(testCases[0]?.repoId)}><RefreshCw className='h-3 w-3 mr-1' />Refresh</Button>
      </div>
      <div className=' border rounded-md mt-2 '>
        {testCases.map((testCase, index) => (
          <div key={index} className='p-4 border-b flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Checkbox
                disabled={testCase.status === 'running'}
                checked={selectedTestCases.some((item) => item.id === testCase?.id)}
                onCheckedChange={(checked) => handleSelectedTestCase(checked, testCase)} />
              <div>
                <h2>{testCase?.title}</h2>
                <p className='text-xs text-gray-900'>{testCase?.description}</p>
              </div>
            </div>

            <div className='gap-4 flex items-center'>
              <Badge variant={'secondary'}>{testCase?.type}</Badge>
              <StatusBadge testCase={testCase} />
              <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
            </div>
          </div>
        ))}
        <div className='p-4 flex items-center justify-between bg-gray-100'>
          <h2 className='font-medium text-gray-950'>Run Selected Test Cases</h2>
          <Button
            disabled={selectedTestCases.length === 0 || running || !targetDomain}
            onClick={handleRunSelected}
          >
            {running ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <Play className='h-4 w-4 mr-2' />}
            Run
          </Button>
        </div>
      </div>
    </div>
  )
}
