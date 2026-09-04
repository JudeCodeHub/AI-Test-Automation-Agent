import React from 'react';
import { UserRepo } from './WorkspaceBody';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Loader2,
  Loader2Icon,
  Link2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import axios from 'axios';
import { useMemo, useState } from 'react';
import TestCaseList from './TestCaseList';
import RepoSettings from './RepoSettings';
import DeleteRepoDialog from './DeleteRepoDialog';

type props = {
  repoList: UserRepo[];
  setReload: () => void;
};

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
};
type StatusData = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
};

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
        setUserDetail((prev: any) => ({ ...prev, credits: result.data.credits }));
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
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
  };

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
    <div className="mt-10">
      <h2 className="text-muted-foreground my-3 text-xs font-semibold tracking-wide uppercase">
        Repositories
      </h2>
      <Accordion type="single" collapsible onValueChange={(value) => GetTestCases(Number(value))}>
        {repoList.map((repo, index) => (
          <AccordionItem
            key={repo.id}
            value={repo.repoId.toString()}
            className="mb-4 overflow-hidden rounded-xl border px-5"
          >
            <AccordionTrigger>
              <div className="flex items-center gap-5">
                <Image src={'/github.png'} alt="github" width={30} height={30} />
                <div className="flex flex-col items-start gap-1">
                  <h2>{repo.fullName}</h2>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <span>{repo.defaultBranch}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{repo.language}</span>
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-5 pt-4">
                <div className="bg-secondary flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <Link2Icon className="text-primary h-5 w-5" />
                    <h2>Target Domain:</h2>
                    <h2 className="bg-card text-primary rounded-md border p-1 px-2 font-medium">
                      {repo?.targetDomain}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <RepoSettings repo={repo} setReload={setReload} />
                    {userDetail?.id && (
                      <DeleteRepoDialog repo={repo} userId={userDetail.id} setReload={setReload} />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatusCard
                    title="Total Tests"
                    value={statusData?.totalTests}
                    icon={<ListChecks className="text-primary h-5 w-5" />}
                    bgColor="bg-accent"
                  />

                  <StatusCard
                    title="Passed"
                    value={statusData?.passedTests}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    bgColor="bg-green-50"
                  />

                  <StatusCard
                    title="Failed"
                    value={statusData?.failedTests}
                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                    bgColor="bg-red-50"
                  />

                  <StatusCard
                    title="Pass Rate"
                    value={`${statusData?.passRate}%`}
                    icon={<TrendingUp className="text-foreground h-5 w-5" />}
                    bgColor="bg-secondary"
                  />
                </div>
                {!testCaseLoading && testCases.length > 0 && (
                  <TestCaseList
                    testCases={testCases}
                    setTestCases={setTestCases}
                    targetDomain={repo?.targetDomain}
                    onReload={(repoId: number) => GetTestCases(repoId)}
                  />
                )}

                {testCaseLoading ? (
                  <h2 className="text-muted-foreground flex items-center gap-2">
                    <Loader2Icon className="animate-spin" /> Loading test cases...
                  </h2>
                ) : (
                  testCases.length == 0 && (
                    <div className="bg-secondary flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-foreground font-medium">
                          {loading ? 'Generating Test Cases...' : 'Generate AI Test Cases'}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Analyze this repository and generate automated test cases using AI.
                        </p>
                        {generateError && (
                          <p className="mt-1 text-sm text-red-600">{generateError}</p>
                        )}
                      </div>
                      <Button
                        className="gap-2"
                        disabled={loading}
                        onClick={() => handleGenerateTestCases(repo)}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Generate Test Cases
                      </Button>
                    </div>
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default UserRepoList;

function StatusCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-card flex items-center justify-between rounded-xl border p-4">
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <h3 className="text-foreground mt-1 text-2xl font-semibold">{value}</h3>
      </div>

      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColor}`}>
        {icon}
      </div>
    </div>
  );
}
