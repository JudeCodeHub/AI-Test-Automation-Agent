import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';
import RepoDialog from './RepoDialog';

type Props = {
  hasToken: boolean;
  onConnectGithub: () => void;
  setRefreshPage: () => void;
};

function EmptyWorkspace({ hasToken, onConnectGithub, setRefreshPage }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="bg-accent flex h-16 w-16 items-center justify-center rounded-2xl">
        <Image src={'/folder.png'} alt="" width={32} height={32} aria-hidden="true" />
      </div>
      <h2 className="text-foreground mt-5 text-xl font-semibold">No repository connected</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Connect a repository to start generating and running AI test cases.
      </p>

      <div className="mt-6">
        {hasToken ? (
          <RepoDialog setRefreshPage={setRefreshPage} />
        ) : (
          <Button onClick={onConnectGithub} className="gap-2">
            <Github className="h-4 w-4" />
            Connect Repo
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyWorkspace;
