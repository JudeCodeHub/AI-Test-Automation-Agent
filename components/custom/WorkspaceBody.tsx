"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import EmptyWorkspace from './EmptyWorkspace'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import RepoDialog from './RepoDialog';
import { boolean } from 'drizzle-orm/gel-core'


function WorkspaceBody() {
    const { userDetail } = useContext(UserDetailContext)
    const router = useRouter()
    const [token, setToken] = useState('')

    useEffect(() => {
        GetGithubUserToken();
    }, [])


    const GetGithubUserToken = async () => {
        const result = await axios.get('/api/github/token')
        console.log(result.data.token)
        setToken(result.data.token)
    }

    const OnAddrepo = async () => {
        router.push('/api/github')
    }

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='text-4xl font-medium'>Workspace</h2>
                <h2 className='text-blue-800 bg-blue-100 px-2 rounded-lg'>Remaining Credits: {userDetail?.credits}</h2>
            </div>

            <Card className={'flex mt-5 justify-between items-center p-4 border rounded-lg'}>
                <div className='flex  items-center gap-5'>
                    <Image src={'/github.png'} alt="gitHub" width={40} height={40}></Image>
                    <h2 className='text-lg'>Connect Github & Add Repository</h2>
                </div>
                <div>
                    <></>
                    {!token ? <Button onClick={OnAddrepo}>Setup</Button>
                        : <RepoDialog setRefreshPage={(refresh:boolean) => console.log('refresh')} />}
                </div>
            </Card>

            <Card className='mt-10 '>
                <CardContent>
                    <EmptyWorkspace />
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkspaceBody
