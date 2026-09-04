import { NextRequest, NextResponse } from 'next/server';
import { browserbase } from '@/lib/browserbase';

/** Kicks off MP4 assembly for a session's recording (idempotent - skips
 * re-requesting if already completed or in progress) and returns current
 * per-page status. */
export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  try {
    const existing = await browserbase.sessions.recording.downloads.list(sessionId);
    const needsCreate =
      existing.downloads.length === 0 ||
      existing.downloads.every((d) => d.status === 'NOT_REQUESTED' || d.status === 'FAILED');

    if (needsCreate) {
      await browserbase.sessions.recording.downloads.create(sessionId);
    }

    const result = await browserbase.sessions.recording.downloads.list(sessionId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare recording' },
      { status: 500 }
    );
  }
}

/** Polls the per-page assembly status/download URL for a session's recording. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  try {
    const result = await browserbase.sessions.recording.downloads.list(sessionId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check recording status' },
      { status: 500 }
    );
  }
}
