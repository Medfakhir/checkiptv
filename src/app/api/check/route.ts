import { NextRequest, NextResponse } from 'next/server';
import { parseXtreamUrl, buildApiUrl, parseAccountResponse, sanitizeServerInput } from '@/lib/iptv-parser';
import { isInternalIp } from '@/lib/network-utils';

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // requests
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url, server, username, password, port } = body;

    let parsed;

    if (url) {
      // Parse from URL string
      parsed = parseXtreamUrl(url);
    } else if (server && username && password) {
      // Parse from separate credentials with sanitization
      const sanitized = sanitizeServerInput(server, port || '80');
      parsed = {
        server: sanitized.server,
        port: sanitized.port,
        username,
        password,
        protocol: sanitized.protocol,
      };
    } else {
      return NextResponse.json(
        { error: 'Please provide an IPTV URL or enter your server credentials (server, username, password).' },
        { status: 400 }
      );
    }

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // SSRF protection: block internal/private IPs
    if (await isInternalIp(parsed.server)) {
      return NextResponse.json(
        { error: 'Invalid server address. Please provide a public IPTV server URL.' },
        { status: 400 }
      );
    }

    // Build the player_api.php URL
    const apiUrl = buildApiUrl(parsed);

    // Make the request to the IPTV server with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: `Server returned status ${response.status}. The IPTV server may be down or unreachable.` },
          { status: 502 }
        );
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json') || contentType.includes('text/json')) {
        data = await response.json();
      } else {
        // Try to parse as JSON anyway
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          return NextResponse.json(
            { error: 'Server returned non-JSON response. This may not be a valid Xtream Codes server.' },
            { status: 502 }
          );
        }
      }

      // Parse and format the response
      const result = parseAccountResponse(data, parsed);
      
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The server took too long to respond (15s limit).' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: `Failed to connect to server: ${fetchError.message || 'Unknown error'}` },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
