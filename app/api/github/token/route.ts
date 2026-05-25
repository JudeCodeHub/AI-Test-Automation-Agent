import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req:NextRequest){
     const cookieStore = await cookies()
     const token = cookieStore.get('github_token')?.value

     return NextResponse.json({ token:token })
} 