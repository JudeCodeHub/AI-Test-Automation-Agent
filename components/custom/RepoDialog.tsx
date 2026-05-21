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
type Repo = {
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
    useEffect(() => {
        GetRepoList()
    }, [])

    const GetRepoList = async () => {
        const result = await axios.get('/api/github/repos');
        //console.log(result.data)
        setRepoList(result.data)
    }

    const filteredRepolist = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return repoList;
        return repoList.filter(repo => repo.full_name.toLowerCase().includes(query));
    }, [searchTerm, repoList])

    const SaveRepoToDB = async () => {
        if (!selectedRepo) return;

        const result = await axios.post('/api/user-repo', {
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
        console.log(result.data)
        setIsOpen(false);
        setRefreshPage(true)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button>+Add Repo</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Repository</DialogTitle>
                    <DialogDescription>
                        Search and select one of your github repositories
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <Input placeholder='Search repos by name' onChange={(event) => setSearchTerm(event.target.value)} />
                    {/*Repo List */}
                    <ul className='max-h-60 overflow-y-auto border rounded-xl mt-4'>
                        {filteredRepolist.map((repo) => (
                            <li key={repo.id} className={`p-4 border-b hover:bg-gray-100 cursor-pointer ${selectedRepo?.id == repo.id ? 'bg-gray-100' : null}`} onClick={() => setSelectedRepo(repo)} >{repo.full_name}</li>
                        ))}
                    </ul>
                </div>

                <DialogFooter className='flex gap-5 '>
                    <DialogClose>Cancel</DialogClose>
                    <Button onClick={() => SaveRepoToDB()}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RepoDialog
