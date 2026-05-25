import { db } from "@/db"
import { repositories } from "@/db/schema"
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    const { repoId, userId, name, full_name, private_, html_url, description, language, updated_at, default_branch, owner } = await request.json();

    //@ts-ignore
    const result = await db.insert(repositories).values({
        repoId,
        userId,
        name,
        fullName: full_name,
        private: private_ ? 1 : 0,
        htmlUrl: html_url,
        description,
        language,
        owner,
        defaultBranch: default_branch,
    }).returning();

    return NextResponse.json(result[0])

}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId');

    const result = await db.select().from(repositories).where(
        //@ts-ignore
        eq(repositories.userId, userId)
    );
    return NextResponse.json(result);
} 