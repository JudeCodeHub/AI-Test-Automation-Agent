import { NextRequest,NextResponse } from 'next/server'
import { db } from '@/db'
import { TestCasesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const { title, description, targetRoute, expectedResult, testCaseId } = await request.json()

  const result = await db.update(TestCasesTable).set({
    title,
    description,
    targetRoute,
    expectedResult
  }).where(eq(TestCasesTable.id, testCaseId)).returning();

  return NextResponse.json(result[0])
} 