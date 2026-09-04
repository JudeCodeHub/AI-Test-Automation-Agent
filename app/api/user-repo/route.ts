import { db } from "@/db"
import { repositories, TestCasesTable } from "@/db/schema"
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

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
    }).onConflictDoUpdate({
        target: [repositories.userId, repositories.repoId],
        set: {
            name,
            fullName: full_name,
            private: private_ ? 1 : 0,
            htmlUrl: html_url,
            description,
            language,
            owner,
            defaultBranch: default_branch,
        },
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

export async function DELETE(request: NextRequest) {
    const { repoId, userId } = await request.json();

    if (!repoId || !userId) {
        return NextResponse.json({ error: 'repoId and userId are required' }, { status: 400 });
    }

    const [repo] = await db.select().from(repositories).where(
        and(eq(repositories.id, repoId), eq(repositories.userId, userId))
    );

    if (!repo) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    await db.delete(TestCasesTable).where(eq(TestCasesTable.repoId, repo.repoId.toString()));
    await db.delete(repositories).where(eq(repositories.id, repoId));

    return NextResponse.json({ success: true });
}