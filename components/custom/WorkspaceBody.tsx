"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import { useContext, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Coins, Github } from 'lucide-react'
import EmptyWorkspace from './EmptyWorkspace'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import RepoDialog, { Repo } from './RepoDialog';
import { boolean } from 'drizzle-orm/gel-core'
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
}
function WorkspaceBody() {
    const { userDetail } = useContext(UserDetailContext)
    const router = useRouter()
    const [token, setToken] = useState('')
    const [userRepoList, setUserRepoList] = useState<UserRepo[] | null>(null)

    useEffect(() => {
        GetGithubUserToken();

    }, [])

    useEffect(() => {
        userDetail && GetUserAddedRepoList();
    }, [userDetail]);


    const GetGithubUserToken = async () => {
        const result = await axios.get('/api/github/token')
        setToken(result.data.token)
    }

    const OnAddrepo = async () => {
        router.push('/api/github')
    }

    const GetUserAddedRepoList = async () => {
        const result = await axios.get('/api/user-repo?userId=' + userDetail?.id)
        setUserRepoList(result.data)
    }

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='text-4xl font-semibold tracking-tight text-foreground'>Workspace</h2>
                <span className='inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-accent px-3 py-1.5 rounded-full'>
                    <Coins className='h-4 w-4' />
                    {userDetail?.credits ?? '—'} credits
                </span>
            </div>

            <div className='flex mt-6 justify-between items-center p-5 border rounded-2xl bg-card'>
                <div className='flex items-center gap-4'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-accent'>
                        <Github className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                        <h2 className='font-medium text-foreground'>Connect GitHub &amp; add a repository</h2>
                        <p className='text-sm text-muted-foreground mt-0.5'>Pick a repo to generate and run AI test cases against.</p>
                    </div>
                </div>
                <div>
                    {!token ? <Button onClick={OnAddrepo} className='gap-2'><Github className='h-4 w-4' />Connect GitHub</Button>
                        : <RepoDialog setRefreshPage={() => GetUserAddedRepoList()} />}
                </div>

            </div>
            {userRepoList !== null && userRepoList.length === 0 ?
                <div className='mt-10 border rounded-2xl bg-card'>
                    <EmptyWorkspace hasToken={!!token} onConnectGithub={OnAddrepo} setRefreshPage={() => GetUserAddedRepoList()} />
                </div>
                : userRepoList && <UserRepoList repoList={userRepoList} setReload={() => GetUserAddedRepoList()} />}
        </div>
    )
}

export default WorkspaceBody
