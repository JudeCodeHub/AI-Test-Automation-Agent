import { db } from "@/db"
import { repositories } from "@/db/schema"
import { NextRequest, NextResponse } from "next/server";

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
    }).returning();

    return NextResponse.json(result[0])

}