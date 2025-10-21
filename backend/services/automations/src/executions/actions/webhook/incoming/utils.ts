import express from 'express';

import * as crypto from 'crypto';
import { redis } from 'erxes-api-shared/utils';
// IP whitelist validation
export const validateIPWhitelist = (
  req: express.Request,
  allowedIPs: string[],
): boolean => {
  if (!allowedIPs || allowedIPs.length === 0) return true;

  const clientIP =
    req.ip ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress;

  if (!clientIP) {
    throw new Error('Client not found');
  }

  return allowedIPs.some((ip) => {
    if (ip.includes('/')) {
      // CIDR notation
      return isIPInCIDR(clientIP, ip);
    }
    return clientIP === ip;
  });
};

// CIDR check helper function
export const isIPInCIDR = (ip: string, cidr: string): boolean => {
  // Implementation for CIDR check (you might want to use a library like 'ip-cidr')
  // Simplified version for demonstration
  const [range, prefix] = cidr.split('/');
  return ip === range; // In production, use proper CIDR validation
};

//   // Constant-time comparison for security tokens
export const constantTimeCompare = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  // Convert Buffer to Uint8Array for compatibility
  const aArray = new Uint8Array(aBuffer);
  const bArray = new Uint8Array(bBuffer);

  return crypto.timingSafeEqual(aArray, bArray);
};

// Request timestamp validation (prevent replay attacks)
export const validateTimestamp = (
  req: express.Request,
  maxAgeMs: number = 300000,
): boolean => {
  const timestamp = req.headers['x-timestamp'] as string;
  if (!timestamp) return false;

  const requestTime = parseInt(timestamp, 10);
  const currentTime = Date.now();

  return Math.abs(currentTime - requestTime) < maxAgeMs; // 5 minutes tolerance
};

// Enhanced security validation middleware
export const validateSecurity = async (req: express.Request, config: any) => {
  const { security = {}, headers = [], queryParams = [] } = config;

  // 1. HMAC Signature Verification
  if (security.secret) {
    if (!verifyHMACSignature(req, security.secret)) {
      throw new Error('Invalid signature');
    }
  }

  // 2. IP Whitelist Validation
  if (security.allowedIPs && security.allowedIPs.length > 0) {
    if (!validateIPWhitelist(req, security.allowedIPs)) {
      throw new Error('IP address not allowed');
    }
  }

  // 3. Timestamp Validation (prevent replay attacks)
  if (security.preventReplay) {
    if (!validateTimestamp(req, security.maxAgeMs)) {
      throw new Error('Request timestamp invalid or expired');
    }
  }

  // 4. Header Validation (constant-time)
  for (const h of headers) {
    const headerValue = req.headers[h.key.toLowerCase()];
    if (!headerValue || !constantTimeCompare(String(headerValue), h.value)) {
      throw new Error(`Invalid header: ${h.key}`);
    }
  }

  // 5. Query Parameter Validation (constant-time)
  for (const qp of queryParams) {
    const queryValue = req.query[qp.name];
    if (!queryValue || !constantTimeCompare(String(queryValue), qp.value)) {
      throw new Error(`Invalid query parameter: ${qp.name}`);
    }
  }

  return true;
};

export function isTimestampValid(headerTs?: string, skewSeconds = 300) {
  if (!headerTs) return false;
  const tsNum = Number(headerTs) || Date.parse(headerTs);
  if (Number.isNaN(tsNum)) return false;
  const now = Date.now();
  const diff = Math.abs(now - tsNum);
  return diff <= skewSeconds * 1000;
}
export async function trySetIdempotency(key: string, ttlSeconds = 60 * 60) {
  // Correct order: SET key value EX ttl NX
  const r = await redis.set(key, '1', 'EX', ttlSeconds, 'NX');
  return r === 'OK';
}

export function verifyHmac(
  rawBody: Buffer,
  secret: string,
  headerSig?: string,
): boolean {
  if (!headerSig) return false;

  // support formats like 'sha256=...'
  const sig = Array.isArray(headerSig) ? headerSig[0] : headerSig;
  const hmac = crypto.createHmac('sha256', secret);

  // Option 1: Convert Buffer to string with explicit encoding
  const expected = `sha256=${hmac
    .update(rawBody.toString('binary')) // or 'utf8' depending on your data
    .digest('hex')}`;

  try {
    // Convert both to Buffer with explicit encoding
    const sigBuffer = new TextEncoder().encode(sig);
    const expectedBuffer = new TextEncoder().encode(expected);

    // Ensure they're the same length (timingSafeEqual requires this)
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function streamToBuffer(req: express.Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks as any))); // Type assertion
    req.on('error', (e) => reject(e));
  });
}

export const verifyHMACSignature = (
  req: express.Request,
  secret: string,
): boolean => {
  const signature =
    req.headers['x-hub-signature-256'] ||
    req.headers['x-signature'] ||
    req.headers['signature'];

  if (!signature) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update((req as any).rawBody || '')
    .digest('hex')}`;

  const encoder = new TextEncoder();
  const signatureBuffer = encoder.encode(
    Array.isArray(signature) ? signature[0] : signature,
  );
  const expectedBuffer = encoder.encode(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};
