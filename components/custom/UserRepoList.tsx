import React from 'react'
import { UserRepo } from './WorkspaceBody'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { ListChecks, CheckCircle2, XCircle, TrendingUp, Sparkles, Loader2, Loader2Icon, Link2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContext } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'
import axios from 'axios'
import { useMemo, useState } from 'react'
import TestCaseList from './TestCaseList'
import RepoSettings from './RepoSettings'
import DeleteRepoDialog from './DeleteRepoDialog'

type props = {
  repoList: UserRepo[]
  setReload: () => void
}

export type TestCase = {
  id: number;
  title: string;
  description: string;
  type: string;
  repoId: number;
  targetFiles: string[];
  expectedResult: string;
  repoName: string;
  repoOwner: string;
  targetDomain: string;
  status: 'generated' | 'running' | 'passed' | 'failed' | string;
  lastRunAt: string | null;
  lastRunSessionId: string | null;
  lastRunDurationMs: number | null;
  lastRunAssertions: Array<{
    type: string;
    selector?: string;
    expected?: string;
    passed: boolean;
    error?: string;
  }> | null;
}
type StatusData = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
}

function UserRepoList({ repoList, setReload }: props) {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [testCaseLoading, setTestCaseLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const handleGenerateTestCases = async (repo: UserRepo) => {
    if (!userDetail?.id) {
      console.error('Missing userId while generating test cases');
      return;
    }

    setLoading(true);
    setGenerateError('');
    try {
      const result = await axios.post('/api/generate-test-cases', {
        userId: userDetail.id,
        repoId: repo.repoId,
        owner: repo.owner,
        repo: repo.fullName.split('/').pop() ?? repo.fullName,
        branch: repo.defaultBranch,
      });
      if (typeof result.data.credits === 'number') {
        setUserDetail((prev: any) => ({ ...prev, credits: result.data.credits }))
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? error.message
        : 'Failed to generate test cases';
      console.error('Generate test cases error:', message);
      setGenerateError(message);
    } finally {
      setLoading(false);
    }
  };


  const GetTestCases = async (repoID: number) => {
    setTestCaseLoading(true);
    setTestCases([]);
    const result = await axios.get(`/api/test-cases?repoId=${repoID}`);

    setTestCases(result.data);
    setTestCaseLoading(false);
  }

  const statusData: StatusData = useMemo(() => {
    const totalTests = testCases.length;
    const passedTests = testCases.filter((tc) => tc.status === 'passed').length;
    const failedTests = testCases.filter((tc) => tc.status === 'failed').length;
    const ranTests = passedTests + failedTests;

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: ranTests === 0 ? 0 : Math.round((passedTests / ranTests) * 100),
    };
  }, [testCases]);

  return (
    <div className='mt-10 '>
      <h2 className='my-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>Repositories</h2>
      <Accordion type="single" collapsible onValueChange={(value) => GetTestCases(Number(value))}>
        {repoList.map((repo, index) => (

          <AccordionItem
            key={repo.id}
            value={repo.repoId.toString()}
            className='border rounded-xl overflow-hidden px-5 mb-4'
          >
            <AccordionTrigger>
              <div className='flex items-center gap-5'>
                <Image src={'/github.png'} alt='github' width={30} height={30} />
                <div className='flex flex-col items-start gap-1'>
                  <h2>{repo.fullName}</h2>
                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                    <span>{repo.defaultBranch}</span>
                    <span aria-hidden='true'>&bull;</span>
                    <span>{repo.language}</span>
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className='pt-4 space-y-5'>

                <div className='bg-secondary p-3 border rounded-xl flex justify-between items-center'>
                  <div className='flex items-center gap-3'>
                    <Link2Icon className='h-5 w-5 text-primary' />
                    <h2>Target Domain:</h2>
                    <h2 className='bg-card p-1 px-2 border rounded-md text-primary font-medium'>{repo?.targetDomain}</h2>
                  </div>
                  <div className='flex items-center gap-2'>
                    <RepoSettings repo={repo} setReload={setReload} />
                    {userDetail?.id && (
                      <DeleteRepoDialog repo={repo} userId={userDetail.id} setReload={setReload} />
                    )}
                  </div>

                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>

                  <StatusCard
                    title="Total Tests"
                    value={statusData?.totalTests}
                    icon={<ListChecks className='h-5 w-5 text-primary' />}
                    bgColor="bg-accent"
                  />

                  <StatusCard
                    title="Passed"
                    value={statusData?.passedTests}
                    icon={<CheckCircle2 className='h-5 w-5 text-green-600' />}
                    bgColor="bg-green-50"
                  />

                  <StatusCard
                    title="Failed"
                    value={statusData?.failedTests}
                    icon={<XCircle className='h-5 w-5 text-red-600' />}
                    bgColor="bg-red-50"
                  />

                  <StatusCard
                    title="Pass Rate"
                    value={`${statusData?.passRate}%`}
                    icon={<TrendingUp className='h-5 w-5 text-foreground' />}
                    bgColor="bg-secondary"
                  />

                </div>
                {!testCaseLoading && testCases.length > 0
                  && <TestCaseList
                    testCases={testCases}
                    setTestCases={setTestCases}
                    targetDomain={repo?.targetDomain}
                    onReload={(repoId: number) => GetTestCases(repoId)} />}

                {testCaseLoading ?
                  <h2 className='flex gap-2 items-center text-muted-foreground'><Loader2Icon className='animate-spin' /> Loading test cases...</h2>
                  :

                  testCases.length == 0 && <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 bg-secondary'>
                    <div>
                      <h3 className='font-medium text-foreground'>
                        {loading ? 'Generating Test Cases...' :
                          'Generate AI Test Cases'}</h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Analyze this repository and generate automated test cases using AI.
                      </p>
                      {generateError && (
                        <p className='text-sm text-red-600 mt-1'>{generateError}</p>
                      )}
                    </div>
                    <Button className='gap-2' disabled={loading} onClick={() => handleGenerateTestCases(repo)}>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Sparkles className='h-4 w-4' />}
                      Generate Test Cases
                    </Button>
                  </div>}
              </div>
            </AccordionContent>
          </AccordionItem>

        ))}
      </Accordion>
    </div>
  )
}

export default UserRepoList

function StatusCard({
  title,
  value,
  icon,
  bgColor
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className='border rounded-xl p-4 flex items-center justify-between bg-card'>
      <div>
        <p className='text-sm text-muted-foreground'>{title}</p>
        <h3 className='text-2xl font-semibold mt-1 text-foreground'>{value}</h3>
      </div>

      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
    </div>
  )
}
