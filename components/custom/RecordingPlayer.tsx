import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';

type Props = {
  sessionId: string;
};

/** Embeds a session's recording directly in the app - fetched server-side via
 * Browserbase's Recording Downloads API, so viewers only ever need to be
 * signed into this app (Clerk), never a Browserbase account. */
function RecordingPlayer({ sessionId }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await axios.get(`/api/recordings?sessionId=${sessionId}`);
        if (cancelled) return;

        const page = result.data?.downloads?.[0];
        if (page?.status === 'COMPLETED' && page.downloadUrl) {
          setUrl(page.downloadUrl);
          setStatus('ready');
        } else if (page?.status === 'FAILED') {
          setStatus('error');
        } else {
          pollTimer = setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    const start = async () => {
      try {
        await axios.post('/api/recordings', { sessionId });
        if (!cancelled) poll();
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    start();
    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [sessionId]);

  if (status === 'error') {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" /> Couldn&apos;t load the recording.
      </p>
    );
  }

  if (status === 'loading') {
    return (
      <div className="bg-secondary text-muted-foreground flex items-center gap-2 rounded-lg border p-4 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing recording...
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={url!} controls className="w-full rounded-lg border bg-black" />
  );
}

export default RecordingPlayer;
