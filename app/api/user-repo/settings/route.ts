import { NextRequest,NextResponse } from 'next/server';
import { db } from '@/db';
import { repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {
  const { repoId, userId, targetDomain, globalInstruction } = await req.json();
  
  const result = await db?.update(repositories).set({
    targetDomain: targetDomain,
    globalInstructions: globalInstruction,
  }).where(eq(repositories.id, repoId)).returning();

  return NextResponse.json(result);
}