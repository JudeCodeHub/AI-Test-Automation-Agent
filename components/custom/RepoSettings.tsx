import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { Settings2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { UserRepo } from './WorkspaceBody'
import axios from 'axios'


type props = {
  repo: UserRepo
  setReload: () => void
}

function RepoSettings({ repo, setReload }: props) {
  const [isOpen, setIsOpen] = useState(false)
  const [repoSettings, setRepoSettings] = useState({
    targetDomain: repo?.targetDomain || '',
    globalInstructions: repo?.gloabalInstructions || ''
  })

  const handleSaveSettings = async () => {
    console.log('Saving settings...', repoSettings)

    const result = await axios.post('/api/user-repo/settings', {
      repoId: repo.id,
      targetDomain: repoSettings.targetDomain,
      globalInstruction: repoSettings.globalInstructions
    })

    console.log(result?.data);
    setIsOpen(false)
    setReload()

  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}  >
      <DialogTrigger asChild>
        <Button> <Settings2 className='h-4 w-4 mr-1' />Project Config</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex gap-2 items-center'><Settings2 className='text-primary' /> Project/Repo Settings</DialogTitle>
          <DialogDescription>
            Configure project-level defaults used during script generation and execution.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className='mt-1'>
            <label className='text-gray-500'>APP URL/DEFAULT WEBSITE</label>
            <Input
              value={repoSettings?.targetDomain}
              onChange={(e) => setRepoSettings({ ...repoSettings, targetDomain: e?.target?.value })}
              placeholder='App url/Domain'
              className='mt-1' />
            <p className='text-xs text-gray-600 mt-1'>The target address where automated headless browsers will connect and run test cases.</p>
          </div>

          <div className='mt-4'>
            <label className='text-gray-500'>GLOBAL TEST INSTRUCTION</label>
            <Textarea
              value={repoSettings?.globalInstructions}
              onChange={(e) => setRepoSettings({ ...repoSettings, globalInstructions: e?.target?.value })}
              placeholder='Instructions'
              className='mt-2' />
            <p className='text-xs text-gray-600 mt-1'>Include any authentication credentials, cookies,setup or teardown instructions.they are automatically append to gemini prompts.</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}> Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveSettings}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RepoSettings
