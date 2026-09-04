'use client';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useContext, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Coins, Github } from 'lucide-react';
import EmptyWorkspace from './EmptyWorkspace';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RepoDialog, { Repo } from './RepoDialog';
import { boolean } from 'drizzle-orm/gel-core';
import UserRepoList from './UserRepoList';

export type UserRepo = {
  id: number;
  repoId: number;
  name: string;
  fullName: string;
  private_: boolean;
  htmlUrl: string;
  description: string;
  userId: number;
  owner: string;
  updated_at: string;
  language: string;
  defaultBranch: string;
  targetDomain: string;
  gloabalInstructions: string;
};
function WorkspaceBody() {
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userRepoList, setUserRepoList] = useState<UserRepo[] | null>(null);

  useEffect(() => {
    GetGithubUserToken();
  }, []);

  useEffect(() => {
    userDetail && GetUserAddedRepoList();
  }, [userDetail]);

  const GetGithubUserToken = async () => {
    const result = await axios.get('/api/github/token');
    setToken(result.data.token);
  };

  const OnAddrepo = async () => {
    router.push('/api/github');
  };

  const GetUserAddedRepoList = async () => {
    const result = await axios.get('/api/user-repo?userId=' + userDetail?.id);
    setUserRepoList(result.data);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-4xl font-semibold tracking-tight">Workspace</h2>
        <span className="text-primary bg-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium">
          <Coins className="h-4 w-4" />
          {userDetail?.credits ?? '—'} credits
        </span>
      </div>

      <div className="bg-card mt-6 flex items-center justify-between rounded-2xl border p-5">
        <div className="flex items-center gap-4">
          <div className="bg-accent flex h-11 w-11 items-center justify-center rounded-xl">
            <Github className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground font-medium">Connect GitHub &amp; add a repository</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Pick a repo to generate and run AI test cases against.
            </p>
          </div>
        </div>
        <div>
          {!token ? (
            <Button onClick={OnAddrepo} className="gap-2">
              <Github className="h-4 w-4" />
              Connect GitHub
            </Button>
          ) : (
            <RepoDialog setRefreshPage={() => GetUserAddedRepoList()} />
          )}
        </div>
      </div>
      {userRepoList !== null && userRepoList.length === 0 ? (
        <div className="bg-card mt-10 rounded-2xl border">
          <EmptyWorkspace
            hasToken={!!token}
            onConnectGithub={OnAddrepo}
            setRefreshPage={() => GetUserAddedRepoList()}
          />
        </div>
      ) : (
        userRepoList && (
          <UserRepoList repoList={userRepoList} setReload={() => GetUserAddedRepoList()} />
        )
      )}
    </div>
  );
}

export default WorkspaceBody;
