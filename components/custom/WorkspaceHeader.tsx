import React from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

function WorkspaceHeader() {
    return (
        <header className="w-full px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center gap-6">
                {/* Left: Logo + name */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-linear-to-tr from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                            <Image src={'/logo.svg'} alt="Logo" width={40} height={40} />
                        </div>
                        <div className="leading-tight">
                            <div className="text-lg font-semibold text-gray-900">AI Test Agent</div>
                            
                        </div>
                    </div>
                </div>

                {/* Center: Menu (centered) */}
                <nav className="flex-1 flex justify-center">
                    <ul className='flex gap-8 text-lg'>
                        <li className='hover:text-green-600 cursor-pointer'>Workspace</li>
                        <li className='hover:text-green-600 cursor-pointer'>Pricing</li>
                        <li className='hover:text-green-600 cursor-pointer'>Support</li>
                    </ul>
                </nav>

                {/* Right: User profile */}
                <div className="flex items-center">
                    <UserButton />
                </div>
            </div>
        </header>
    )
}

export default WorkspaceHeader
