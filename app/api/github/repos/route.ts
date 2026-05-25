import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Github token not found" }, { status: 401 });
  }

  const allRepos = [];
  let page = 1;

  while (true) {
    const result = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!result.ok) {
      const errorBody = await result.text();
      return NextResponse.json(
        { error: "Failed to fetch GitHub repositories", details: errorBody },
        { status: result.status }
      );
    }

    const repos = await result.json();

    if (!Array.isArray(repos)) {
      return NextResponse.json(
        { error: "Unexpected GitHub response format", details: repos },
        { status: 502 }
      );
    }

    allRepos.push(...repos);

    if (!repos.length) {
      break;
    }

    page++;
  }

  return NextResponse.json(allRepos.map(r => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private_: r.private,
    html_url: r.html_url,
    description: r.description,
    updated_at: r.updated_at,
    language: r.language,
    default_branch: r.default_branch,
    owner: r.owner.login
  })));
}