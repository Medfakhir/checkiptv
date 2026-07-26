/**
 * Parses an Xtream Codes IPTV URL and extracts the server, username, and password.
 * Supports multiple URL formats:
 *   - http://domain:port/get.php?username=xxx&password=xxx
 *   - http://domain:port/player_api.php?username=xxx&password=xxx
 *   - http://username:password@domain:port
 *   - http://domain:port/live/username/password/...
 *   - http://domain:port/username/password (with GET params notation)
 */

export interface XtreamCredentials {
  server: string;
  port: string;
  username: string;
  password: string;
  protocol: string;
}

export function parseXtreamUrl(input: string): XtreamCredentials | { error: string } {
  if (!input || typeof input !== 'string') {
    return { error: 'Please enter a valid IPTV URL' };
  }

  let url: URL;
  try {
    // Add protocol if missing
    const urlStr = input.includes('://') ? input : `http://${input}`;
    url = new URL(urlStr);
  } catch {
    return { error: 'Invalid URL format. Please enter a valid IPTV URL.' };
  }

  const protocol = url.protocol.replace(':', '') || 'http';
  const server = url.hostname;
  const port = url.port || '80';
  let username = '';
  let password = '';

  // Format 1: http://domain:port/get.php?username=xxx&password=xxx
  if (url.searchParams.has('username') || url.searchParams.has('user') || url.searchParams.has('login')) {
    username = url.searchParams.get('username') || url.searchParams.get('user') || url.searchParams.get('login') || '';
    password = url.searchParams.get('password') || url.searchParams.get('pass') || url.searchParams.get('pw') || '';
  }
  // Format 2: Extract from path like /live/username/password/...
  else {
    const pathParts = url.pathname.split('/').filter(Boolean);
    const liveIndex = pathParts.findIndex(p => p === 'live');
    if (liveIndex !== -1 && pathParts.length > liveIndex + 2) {
      username = pathParts[liveIndex + 1];
      password = pathParts[liveIndex + 2];
    }
    // Format 3: username:password in path
    else if (pathParts.length >= 2 && !pathParts[0].includes('.')) {
      username = pathParts[0];
      password = pathParts[1];
    }
  }

  // Format 4: Extract from userinfo (http://user:pass@domain)
  if (!username && url.username) {
    username = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password || '');
  }

  if (!username || !password) {
    return { error: 'Could not extract username and password from the URL. Make sure the URL includes authentication credentials.' };
  }

  return {
    server,
    port,
    username,
    password,
    protocol,
  };
}

/**
 * Sanitizes a server input from the manual Xtream Code form.
 * Handles cases where users type:
 *   - "http://server.com:8080" (full URL)
 *   - "server.com:8080" (with port)
 *   - "https://server.com" (with protocol)
 *   - "server.com" (just hostname)
 */
export function sanitizeServerInput(input: string, defaultPort: string = '80'): { server: string; port: string; protocol: string } {
  let server = input.trim().toLowerCase();
  let protocol = 'http';
  let port = defaultPort;

  // Strip protocol if present
  if (server.includes('://')) {
    protocol = server.split('://')[0];
    server = server.split('://')[1];
  }

  // Strip path if user pasted a full URL
  if (server.includes('/')) {
    server = server.split('/')[0];
  }

  // Strip user:pass@ if present (e.g., from copy-pasted full URL with auth)
  if (server.includes('@')) {
    server = server.split('@').pop() || server;
  }

  // Extract port if present
  if (server.includes(':')) {
    const parts = server.split(':');
    // Use the last colon-separated part as port (handles IPv6 gracefully)
    server = parts.slice(0, -1).join(':');
    port = parts[parts.length - 1] || defaultPort;
  }

  // Detect https
  if (protocol === 'https' || port === '443') {
    protocol = 'https';
  }

  return { server, port, protocol };
}

export function buildApiUrl(creds: XtreamCredentials): string {
  return `${creds.protocol}://${creds.server}:${creds.port}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
}

export interface IptvAccountInfo {
  username: string;
  password: string;
  status: string;
  expDate: string;
  expTimestamp: number | null;
  isTrial: boolean;
  lineType: string;
  activeConnections: string;
  maxConnections: string;
  createdAt: string;
  allowedOutput: string;
  serverTime: string;
  poweredBy: string;
  message: string;
  isExpired: boolean;
  daysRemaining: number | null;
  serverUrl: string;
  serverPort: string;
}

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback = 'N/A'): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function formatUnixDate(value: unknown): { timestamp: number | null; date: string } {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return { timestamp: null, date: 'N/A' };
  const timestamp = seconds * 1000;
  return {
    timestamp,
    date: new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  };
}

export function parseAccountResponse(data: unknown, creds: XtreamCredentials): IptvAccountInfo | { error: string } {
  if (!isRecord(data)) {
    return { error: 'No response received from server. The server may be offline.' };
  }

  // Check if we have user_info
  const userInfo = data.user_info;
  if (!isRecord(userInfo)) {
    // Some servers return error directly
    if (data.error) {
      return { error: toText(data.error, 'The IPTV provider returned an error.') };
    }
    // If auth is 0
    if (data.auth === 0 || data.auth === '0') {
      return { error: 'Invalid credentials. Please check your username and password.' };
    }
    return { error: 'Unexpected response format from server.' };
  }

  // Check if auth failed
  if (userInfo.auth === 0 || userInfo.auth === '0') {
    return { error: 'Authentication failed. Invalid username or password.' };
  }

  const expiry = formatUnixDate(userInfo.exp_date);
  const created = formatUnixDate(userInfo.created_at);
  const serverInfo = isRecord(data.server_info) ? data.server_info : {};
  const isTrial = userInfo.is_trial === '1' || userInfo.is_trial === 1;
  const allowedFormats = userInfo.allowed_output_formats;
  const allowedOutput = Array.isArray(allowedFormats)
    ? allowedFormats.filter((format): format is string => typeof format === 'string').join(', ') || 'N/A'
    : toText(allowedFormats);
  const serverTime = toText(serverInfo.time, toText(data.server_time));
  const poweredBy = toText(serverInfo.powered_by, toText(data.powered_by, 'Unknown Provider.'));
  const expTimestamp = expiry.timestamp;
  const now = Date.now();
  const isExpired = expTimestamp ? expTimestamp <= now : true;
  const daysRemaining = expTimestamp ? Math.floor((expTimestamp - now) / (1000 * 60 * 60 * 24)) : null;

  return {
    username: toText(userInfo.username, creds.username),
    password: creds.password,
    status: toText(userInfo.status, 'Unknown'),
    expDate: expiry.date,
    expTimestamp,
    isTrial,
    lineType: toText(userInfo.line_type, isTrial ? 'Trial' : 'Official'),
    activeConnections: toText(userInfo.active_cons, '0'),
    maxConnections: toText(userInfo.max_connections, '0'),
    createdAt: created.date,
    allowedOutput,
    serverTime,
    poweredBy,
    message: toText(userInfo.message, ''),
    isExpired,
    daysRemaining,
    serverUrl: creds.server,
    serverPort: creds.port,
  };
}
