import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { TestCasesTable } from '@/db/schema'

export async function GET(req: NextRequest) {
  const searchparams = new URL(req.url).searchParams
  const repoId = searchparams.get('repoId')

  if (!repoId) {
    return NextResponse.json({ error: 'Missing repoId' }, { status: 400 })
  }

  const result = await db.select().from(TestCasesTable).where(eq(TestCasesTable.repoId, repoId))

  return NextResponse.json(result)
}



