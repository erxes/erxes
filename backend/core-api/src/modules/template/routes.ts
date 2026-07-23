import crypto from 'crypto';
import {
  extractUserFromHeader,
  getSubdomain,
  redis,
} from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
// `ipKeyGenerator` is the documented v7/v8 helper for producing IPv6-subnet-safe
// rate-limit keys. The library itself warns when a custom keyGenerator uses
// `req.ip` without it, so any change away from this helper would reintroduce
// the IPv6-mapped bypass class fixed by GHSA-46wh-pxpv-q5gq.
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { generateModels } from '~/connectionResolvers';

const router: Router = Router();

const ALGORITHM = 'aes-256-gcm';

// Redis-backed rate limiter for POST /import/template.
// Counter is shared across all core-api replicas via the erxes-api-shared
// ioredis singleton, so the 30-req/15-min cap applies cluster-wide and cannot
// be bypassed by load-balancing across instances. Fail-open if Redis is
// unreachable so an outage does not take template import down — the route
// also requires authentication, so this is defense-in-depth, not the only gate.
//
// Keying strategy: prefer authenticated user + tenant subdomain so that users
// sharing an IP (VPN, corporate NAT) are not throttled as a group. Fall back
// to an IPv6-safe IP key (via `ipKeyGenerator`) for unauthenticated requests,
// which the route's auth gate will reject anyway. This addresses the case
// where IP-only limiting can punish legitimate multi-tenant traffic.
const importTemplateLimiter = rateLimit({
  store: new RedisStore({
    prefix: 'rl:import-template:',
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<any>,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 imports per user/tenant per window — generous for humans, tight for bots
  standardHeaders: true,
  legacyHeaders: false,
  // Fail open if Redis is unreachable so an outage doesn't take import down.
  skip: () => redis.status !== 'ready',
  keyGenerator: (req) => {
    try {
      const user = extractUserFromHeader(req.headers) as { _id?: string } | null;
      if (user && user._id) {
        const subdomain = getSubdomain(req);
        return `u:${subdomain}:${user._id}`;
      }
    } catch {
      // fall through to IP-based key
    }
    // Fall back to an IPv6-safe IP key. If `req.ip` is not available (e.g.,
    // `trust proxy` misconfigured), prefer the raw socket address before
    // collapsing all unknown sources into a single shared bucket.
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `ip:${ipKeyGenerator(ip)}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message:
        'Too many template import requests, please try again later.',
    });
  },
});

/** Reads and validates the TEMPLATE_EXPORT_KEY environment variable. */
const getEncryptionKey = (): string => {
  const key = process.env.TEMPLATE_EXPORT_KEY;
  if (!key) {
    throw new Error(
      'TEMPLATE_EXPORT_KEY environment variable is not configured',
    );
  }
  return key;
};

/** Derives a 32-byte AES-256 key from a passphrase using SHA-256. */
const deriveKey = (key: string): Buffer => {
  return crypto.createHash('sha256').update(key).digest();
};

/** Extracts authenticated user from request headers. Returns null and sends 401 on failure. */
const authenticateRequest = (
  req: Request,
  res: Response,
): { _id: string } | null => {
  let user: unknown;
  try {
    user = extractUserFromHeader(req.headers);
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const typed = user as { _id?: string } | null;

  if (!typed || !typed._id) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  return typed as { _id: string };
};

/** Encrypts template data with AES-256-GCM and returns a versioned JSON envelope. */
const encryptData = (data: Record<string, unknown>, key: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(key), iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    version: 2,
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  });
};

/** Decrypts a versioned JSON envelope. Rejects payloads from older format versions. */
const decryptData = (encryptedData: string, key: string): Record<string, unknown> => {
  const parsed = JSON.parse(encryptedData);

  if (!parsed.version || parsed.version < 2) {
    throw new Error(
      'This file was exported with an older format that is no longer supported. Please re-export the template and try again.',
    );
  }

  const { encrypted, iv, authTag } = parsed;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    deriveKey(key),
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};

router.get(
  '/export/template/:templateId',
  async (req: Request, res: Response) => {
    const user = authenticateRequest(req, res);
    if (!user) return null;

    try {
      const { templateId } = req.params;
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const template = await models.Template.findOne(
        { _id: templateId },
        {
          _id: 0,
          name: 1,
          description: 1,
          contentType: 1,
          content: 1,
          relatedContents: 1,
        },
      ).lean();

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const sanitizedName =
        template.name
          .replace(/[^a-zA-Z0-9\s_-]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50) || 'template';

      const fileName = `${sanitizedName}.json`;

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'none'");

      res.attachment(fileName);
      res.setHeader('Content-Type', 'application/json');

      const encryptionKey = getEncryptionKey();
      const encryptedData = encryptData(template, encryptionKey);

      return res.send(encryptedData);
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to export template' });
    }
  },
);

router.post('/import/template', importTemplateLimiter, async (req: Request, res: Response) => {
  const user = authenticateRequest(req, res);
  if (!user) return null;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted data is required' });
    }

    const encryptionKey = getEncryptionKey();
    const templateData = decryptData(encryptedData, encryptionKey);

    const { name, description, contentType, content, relatedContents } =
      templateData;

    const document = {
      name,
      description,
      contentType,
      content,
      relatedContents,
      createdBy: user._id,
    };

    await models.Template.create(document);

    return res.status(201).json({
      success: true,
      message: 'Template imported successfully',
    });
  } catch (err) {
    const isClientError =
      err instanceof Error && err.message.includes('older format');

    return res
      .status(isClientError ? 400 : 500)
      .json({ error: isClientError ? err.message : 'Failed to import template' });
  }
});

export { router };
