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
import { Loader2, Trash2 } from 'lucide-react'
import axios from 'axios'
import { UserRepo } from './WorkspaceBody'

type Props = {
  repo: UserRepo
  userId: number
  setReload: () => void
}

function DeleteRepoDialog({ repo, userId, setReload }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axios.delete('/api/user-repo', { data: { repoId: repo.id, userId } })
      setIsOpen(false)
      setReload()
    } catch (error) {
      console.error('Delete repo error:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size={'icon'}
          variant={'outline'}
          className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Trash2 className='h-4 w-4 text-red-600' /> Delete Repository
          </DialogTitle>
          <DialogDescription>
            This permanently deletes <span className='font-medium text-foreground'>{repo.fullName}</span> and
            every test case generated for it. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'} disabled={deleting}>Cancel</Button>
          </DialogClose>
          <Button variant={'destructive'} onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteRepoDialog
