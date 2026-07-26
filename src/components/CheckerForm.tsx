'use client';

import { useCallback, useState } from 'react';
import type { IptvAccountInfo } from '@/lib/iptv-parser';
import ResultsDisplay from './ResultsDisplay';

export default function CheckerForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IptvAccountInfo | null>(null);

  const resetForm = useCallback(() => { setUrl(''); setError(null); setResult(null); setLoading(false); }, []);

  const handleCheck = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) { setError('Add your IPTV playlist URL to continue.'); return; }
    setError(null); setResult(null); setLoading(true);
    try {
      const response = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const data: unknown = await response.json();
      const message = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string' ? data.error : 'Unable to check this account.';
      if (!response.ok || (typeof data === 'object' && data !== null && 'error' in data)) { setError(message); return; }
      setResult(data as IptvAccountInfo);
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : 'Could not reach the checking service';
      setError(`Network error: ${message}`);
    } finally { setLoading(false); }
  }, [url]);

  if (result) return <ResultsDisplay result={result} onReset={resetForm} />;

  return (
    <form onSubmit={handleCheck} className="check-form">
      <label htmlFor="iptv-url">Playlist or Xtream Codes URL</label>
      <div className="url-field">
        <span aria-hidden="true">↗</span>
        <input id="iptv-url" type="text" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="http://provider.com:8080/get.php?..." disabled={loading} autoComplete="off" spellCheck={false} aria-describedby="url-help" aria-invalid={Boolean(error)} />
      </div>
      <p id="url-help" className="field-help">M3U, get.php, player_api.php, and live URLs are supported.</p>
      <button type="submit" disabled={loading} className="check-button">
        {loading ? <><span className="spinner" /> Checking account</> : <>Check subscription <span>→</span></>}
      </button>
      <p className="form-privacy"><span>⌁</span> Credentials are never saved.</p>
      <div className="form-message" aria-live="polite">{error && <p role="alert">{error}</p>}</div>
    </form>
  );
}
