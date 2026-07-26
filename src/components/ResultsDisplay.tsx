'use client';

import type { IptvAccountInfo } from '@/lib/iptv-parser';

interface ResultsDisplayProps { result: IptvAccountInfo; onReset: () => void; }

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const isActive = result.status.toLowerCase() === 'active';
  const expiryText = result.daysRemaining === null ? 'Expiry unavailable' : result.daysRemaining > 0 ? `${result.daysRemaining} days remaining` : result.daysRemaining === 0 ? 'Expires today' : `Expired ${Math.abs(result.daysRemaining)} days ago`;
  const items = [
    ['Server host', result.serverUrl],
    ['Streaming port', result.serverPort],
    ['Username', result.username],
    ['Password', result.password],
    ['Status', result.status],
    ['Line type', result.lineType],
    ['Start date', result.createdAt],
    ['Expiry date', result.expDate],
    ['Allowed connections', result.maxConnections],
    ['Active connections', result.activeConnections],
    ['Allowed output', result.allowedOutput],
    ['Server time', result.serverTime],
    ['Powered by', result.poweredBy],
  ];

  return <section className="result-card" aria-live="polite">
    <div className="result-status"><span className={isActive ? 'status-dot active' : 'status-dot'} /><span>{isActive ? 'Account is active' : 'Account is inactive'}</span><span className="result-server">{result.serverUrl}:{result.serverPort}</span></div>
    <h2>{isActive ? 'You’re good to go.' : 'This account needs attention.'}</h2>
    <div className={`expiry-banner ${result.daysRemaining !== null && result.daysRemaining <= 3 ? 'expiry-soon' : ''}`}><span>◷</span><div><small>SUBSCRIPTION</small><strong>{expiryText}</strong></div></div>
    <dl className="account-grid">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {result.message && <p className="provider-message"><b>Provider note</b>{result.message}</p>}
    <button onClick={onReset} className="reset-button">Check another URL <span>↗</span></button>
  </section>;
}
