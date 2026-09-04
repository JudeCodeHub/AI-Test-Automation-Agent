import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from '@radix-ui/react-dialog'
import { Input } from '../ui/input'
import { useMemo } from 'react'
import { useContext } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { CheckCircle2, FolderGit2, Loader2, Lock, Plus, Search } from 'lucide-react'
export type Repo = {
    id: number;
    name: string;
    full_name: string;
    private_: boolean;
    html_url: string;
    description: string;
    language: string;
    updated_at: string;
    default_branch: string;
    owner: string;
}

function RepoDialog({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) {

    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { userDetail } = useContext(UserDetailContext);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) GetRepoList()
    }, [isOpen])

    const GetRepoList = async () => {
        setLoadingRepos(true)
        try {
            const result = await axios.get('/api/github/repos');
            setRepoList(result.data)
        } finally {
            setLoadingRepos(false)
        }
    }

    const filteredRepolist = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return repoList;
        return repoList.filter(repo => repo.full_name.toLowerCase().includes(query));
    }, [searchTerm, repoList])

    const SaveRepoToDB = async () => {
        if (!selectedRepo) return;

        setSaving(true)
        try {
            await axios.post('/api/user-repo', {
                repoId: selectedRepo.id,
                name: selectedRepo.name,
                full_name: selectedRepo.full_name,
                private_: selectedRepo.private_,
                html_url: selectedRepo.html_url,
                description: selectedRepo.description,
                userId: userDetail?.id,
                owner: selectedRepo.owner,
                language: selectedRepo.language,
                default_branch: selectedRepo.default_branch,
            });
            setIsOpen(false);
            setSelectedRepo(null);
            setSearchTerm('');
            setRefreshPage(true)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button className='gap-2'><Plus className='h-4 w-4' />Add Repo</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <FolderGit2 className='h-4 w-4 text-primary' /> Add Repository
                    </DialogTitle>
                    <DialogDescription>
                        Search and select one of your GitHub repositories to connect.
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search repos by name'
                            className='pl-9'
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <ul className='no-scrollbar max-h-64 overflow-y-auto border rounded-xl mt-4 divide-y'>
                        {loadingRepos && (
                            <li className='p-6 flex items-center justify-center text-sm text-muted-foreground gap-2'>
                                <Loader2 className='h-4 w-4 animate-spin' /> Loading your repositories...
                            </li>
                        )}

                        {!loadingRepos && filteredRepolist.length === 0 && (
                            <li className='p-6 text-center text-sm text-muted-foreground'>
                                {searchTerm ? `No repositories match "${searchTerm}"` : 'No repositories found.'}
                            </li>
                        )}

                        {!loadingRepos && filteredRepolist.map((repo) => {
                            const isSelected = selectedRepo?.id === repo.id
                            return (
                                <li
                                    key={repo.id}
                                    onClick={() => setSelectedRepo(repo)}
                                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                >
                                    <FolderGit2 className='h-4 w-4 shrink-0 text-muted-foreground' />
                                    <div className='min-w-0 flex-1'>
                                        <p className='text-sm font-medium truncate'>{repo.full_name}</p>
                                        <div className='flex items-center gap-2 mt-0.5'>
                                            {repo.private_ && (
                                                <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                                                    <Lock className='h-3 w-3' /> Private
                                                </span>
                                            )}
                                            {repo.language && (
                                                <span className='text-[11px] text-muted-foreground'>{repo.language}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && <CheckCircle2 className='h-4 w-4 shrink-0 text-primary' />}
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <DialogFooter className='flex gap-3'>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={SaveRepoToDB} disabled={!selectedRepo || saving} className='gap-2'>
                        {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RepoDialog
