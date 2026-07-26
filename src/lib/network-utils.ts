import { lookup } from 'dns/promises';
import { isIP } from 'net';

const PRIVATE_CIDR_BLOCKS = [
  // IPv4 private ranges
  { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
  { start: [172, 16, 0, 0], end: [172, 31, 255, 255] },
  { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },
  // IPv4 loopback
  { start: [127, 0, 0, 0], end: [127, 255, 255, 255] },
  // Link-local
  { start: [169, 254, 0, 0], end: [169, 254, 255, 255] },
];

function ipv4ToNum(octets: number[]): number {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function isInPrivateRange(ipAddress: string): boolean {
  const parts = ipAddress.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const ipNum = ipv4ToNum(parts);
  return PRIVATE_CIDR_BLOCKS.some((block) => {
    const startNum = ipv4ToNum(block.start);
    const endNum = ipv4ToNum(block.end);
    return ipNum >= startNum && ipNum <= endNum;
  });
}

/**
 * Checks if a hostname or IP address is an internal/private address.
 * Resolves hostnames to IPs via DNS lookup.
 * Returns true if the address is internal/private (should be blocked).
 */
export async function isInternalIp(hostname: string): Promise<boolean> {
  // Strip port if present
  const host = hostname.split(':')[0].toLowerCase();

  // Check if it's localhost
  if (host === 'localhost' || host === 'localhost.localdomain') {
    return true;
  }

  // If it's already an IP, check ranges
  if (isIP(host)) {
    return isInPrivateRange(host);
  }

  // Resolve DNS and check all resolved IPs
  try {
    const addresses = await lookup(host, { all: true });
    return addresses.some((addr) => isInPrivateRange(addr.address));
  } catch {
    // If DNS resolution fails, let the fetch handle it
    return false;
  }
}
