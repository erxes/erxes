import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { getEnv } from 'erxes-api-shared/utils';

const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

export const generateWebhookSecret = (): string =>
  randomBytes(32).toString('hex');

export const isSignatureEnforced = (): boolean =>
  getEnv({ name: 'CALL_WEBHOOK_REQUIRE_SIGNATURE', defaultValue: '' }) ===
  'true';

export type WebhookVerifyResult = { ok: true } | { ok: false; reason: string };

export const verifyWebhookSignature = (
  integration: { token?: string } | null | undefined,
  req: any,
): WebhookVerifyResult => {
  const token = integration?.token;
  if (!token) {
    return { ok: false, reason: 'no_secret_provisioned' };
  }

  const signature = req.headers['x-erxes-signature'];
  const timestamp = req.headers['x-erxes-timestamp'];
  if (!signature || !timestamp) {
    return { ok: false, reason: 'missing_signature_headers' };
  }

  const ts = Number(timestamp);
  if (
    !Number.isFinite(ts) ||
    Math.abs(Date.now() - ts) > SIGNATURE_TOLERANCE_MS
  ) {
    return { ok: false, reason: 'stale_or_invalid_timestamp' };
  }

  const rawBody: Buffer | undefined = req.rawBody;
  if (!rawBody || !rawBody.length) {
    return { ok: false, reason: 'raw_body_unavailable' };
  }

  const expected = createHmac('sha256', token)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest('hex');

  const given = Buffer.from(String(signature));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  return { ok: true };
};
