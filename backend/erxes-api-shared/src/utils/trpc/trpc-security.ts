import * as crypto from 'crypto';
import { Request } from 'express';
import fetch from 'node-fetch';
import { sendLogMessage } from '../logs';
import { redis } from '../redis';
import { getSubdomain } from '../utils';

export interface SignatureHeaders {
  'x-service-id': string;
  'x-timestamp': string;
  'x-nonce': string;
  'x-signature': string;
}

export interface SignatureOptions {
  path: string;
  body: string;
  timestamp?: number;
  nonce?: string;
}

export function generateNonce(): string {
  return crypto.randomBytes(12).toString('hex');
}
export function createSignature(
  options: SignatureOptions & {
    pluginInfo: { subdomain: string; pluginName: string };
  },
): SignatureHeaders {
  const {
    path,
    body,
    timestamp = Math.floor(Date.now() / 1000),
    nonce = generateNonce(),
    pluginInfo,
  } = options;
  const { subdomain, pluginName } = pluginInfo;

  const hmacKey = process.env.HMAC_KEY;
  if (!hmacKey) {
    throw new Error('HMAC_KEY environment variable is required');
  }

  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const canonical = `POST\n${path}\n${timestamp}\n${subdomain}\n${pluginName}\n${nonce}\n${bodyHash}`;
  const signature = crypto
    .createHmac('sha256', hmacKey)
    .update(canonical)
    .digest('hex');

  return {
    'x-service-id': pluginName,
    'x-timestamp': String(timestamp),
    'x-nonce': nonce,
    'x-signature': signature,
  };
}

export async function verifySignature(
  req: Request,
  maxAgeSeconds: number = 60,
): Promise<boolean> {
  try {
    const serviceId = req.header('x-service-id');
    const timestamp = Number(req.header('x-timestamp'));
    const nonce = req.header('x-nonce');
    const signature = req.header('x-signature');

    // Get raw body - try multiple sources
    let rawBody = '';
    if ((req as Request & { rawBody?: string }).rawBody) {
      rawBody = (req as Request & { rawBody?: string }).rawBody || '';
    } else if (req.body) {
      rawBody =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // For TRPC batch requests, if body is empty object, treat as empty string
    if (rawBody === '{}' || rawBody === 'null') {
      rawBody = '';
    }

    if (!serviceId || !timestamp || !nonce || !signature) {
      return false;
    }

    const hmacKey = process.env.HMAC_KEY;
    if (!hmacKey) {
      console.error('HMAC_KEY environment variable is required');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > maxAgeSeconds) {
      console.error('Request timestamp too old:', {
        now,
        timestamp,
        diff: Math.abs(now - timestamp),
      });
      return false;
    }

    const nonceKey = `nonce:${serviceId}:${nonce}`;
    const nonceExists = await redis.set(
      nonceKey,
      '1',
      'EX',
      maxAgeSeconds * 2,
      'NX',
    );
    if (!nonceExists) {
      console.error('Nonce already used or invalid:', nonce);
      return false;
    }

    // For TRPC requests, include query parameters in the path
    const requestPath = req.originalUrl || req.url;
    const pathForSignature = requestPath.includes('?') ? requestPath : req.path;

    // Ensure we're using the exact same path format as the client
    // Remove any leading slash inconsistencies
    const normalizedPath = pathForSignature.startsWith('/')
      ? pathForSignature
      : `/${pathForSignature}`;

    const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');

    // Extract subdomain from request or use default
    const requestSubdomain = getSubdomain(req);

    // Create canonical string matching the client format
    const canonical = `POST\n${normalizedPath}\n${timestamp}\n${requestSubdomain}\n${serviceId}\n${nonce}\n${bodyHash}`;
    const expectedSignature = crypto
      .createHmac('sha256', hmacKey)
      .update(canonical)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      new Uint8Array(Buffer.from(expectedSignature, 'hex')),
      new Uint8Array(Buffer.from(signature, 'hex')),
    );

    if (!isValid) {
      console.error('Signature mismatch:', {
        expected: expectedSignature,
        received: signature,
        canonical,
        path: normalizedPath,
        bodyHash,
        rawBody: rawBody.substring(0, 100) + '...',
      });
    }

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function getHmacKey(): string | null {
  return process.env.HMAC_KEY || null;
}

export function createSignedFetch(
  baseUrl: string,
  pluginInfo: { subdomain: string; pluginName: string },
) {
  return async (input: RequestInfo | URL, options: any = {}) => {
    const url = typeof input === 'string' ? input : input.toString();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Parse URL to get path and query
    const urlObj = new URL(fullUrl);
    const path = urlObj.pathname;
    const query = urlObj.search;

    // Handle body serialization for TRPC requests
    let body = '';
    if (options.body) {
      if (typeof options.body === 'string') {
        body = options.body;
      } else if (typeof options.body === 'object') {
        body = JSON.stringify(options.body);
      }
    }

    const signaturePath = query ? `${path}${query}` : path;

    const bodyForSignature = body || '';

    const signatureHeaders = createSignature({
      path: signaturePath,
      body: bodyForSignature,
      pluginInfo,
    });

    const signedOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...signatureHeaders,
      },
    };

    return fetch(fullUrl, signedOptions);
  };
}

export function createSignatureVerificationMiddleware(
  maxAgeSeconds: number = 60,
) {
  return async (req: Request, res: any, next: any) => {
    const isValid = await verifySignature(req, maxAgeSeconds);

    if (!isValid) {
      sendLogMessage({
        subdomain: getSubdomain(req),
        source: 'webhook',
        action: 'unauthorized',
        payload: {
          source: 'trpc',
          path: req.path,
          headers: req.headers,
          body: req.body,
          query: req?.query,
          error: 'Unauthorized',
          message: 'Invalid signature or replay attack detected',
        },
        status: 'failed',
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature or replay attack detected',
      });
    }

    next();
  };
}
