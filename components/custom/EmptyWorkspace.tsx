import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Github } from 'lucide-react'
import RepoDialog from './RepoDialog'

type Props = {
    hasToken: boolean
    onConnectGithub: () => void
    setRefreshPage: () => void
}

function EmptyWorkspace({ hasToken, onConnectGithub, setRefreshPage }: Props) {
    return (
        <div className='flex flex-col py-16 px-6 items-center justify-center text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-accent'>
                <Image src={'/folder.png'} alt="" width={32} height={32} aria-hidden="true" />
            </div>
            <h2 className='font-semibold text-xl mt-5 text-foreground'>No repository connected</h2>
            <p className='text-muted-foreground mt-2 max-w-sm'>Connect a repository to start generating and running AI test cases.</p>

            <div className='mt-6'>
                {hasToken
                    ? <RepoDialog setRefreshPage={setRefreshPage} />
                    : <Button onClick={onConnectGithub} className='gap-2'><Github className='h-4 w-4' />Connect Repo</Button>}
            </div>
        </div>
    )
}

export default EmptyWorkspace
