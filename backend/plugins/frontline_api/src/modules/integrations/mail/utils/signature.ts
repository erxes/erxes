import { createHmac, timingSafeEqual } from 'node:crypto';
import { getEnv } from 'erxes-api-shared/utils';
import { resolveMailTenant } from '@/integrations/mail/utils/address';

const MAX_SKEW_SECONDS = 300;

export interface ISignatureCheck {
  ok: boolean;
  error?: string;
}

const readMasterSecret = (subdomain: string) => {
  const secret = getEnv({
    name: 'MAIL_WEBHOOK_SECRET',
    defaultValue: '',
    subdomain,
  }).trim();

  if (!secret) {
    throw new Error('MAIL_WEBHOOK_SECRET is not configured');
  }

  return secret;
};

export const deriveTenantSecret = (master: string, tenant: string) =>
  createHmac('sha256', master).update(tenant, 'utf8').digest('hex');

export const platformTenantKey = (subdomain: string) =>
  deriveTenantSecret(readMasterSecret(subdomain), resolveMailTenant(subdomain));

const timestampSkew = (timestamp: string) => {
  const seconds = Number.parseInt(timestamp, 10);

  if (!Number.isFinite(seconds)) {
    return undefined;
  }

  return Math.round(Math.abs(Date.now() / 1000 - seconds));
};

const equals = (expected: string, received: string) => {
  const expectedBytes = new TextEncoder().encode(expected);
  const receivedBytes = new TextEncoder().encode(received);

  if (expectedBytes.length !== receivedBytes.length) {
    return false;
  }

  return timingSafeEqual(expectedBytes, receivedBytes);
};

export const signWithKey = (key: string, body: string) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  return {
    timestamp,
    signature: createHmac('sha256', key)
      .update(`${timestamp}.${body}`, 'utf8')
      .digest('hex'),
  };
};

export const verifySignature = (
  keys: string[],
  rawBody: Buffer,
  received?: string,
  timestamp?: string,
): ISignatureCheck => {
  if (!keys.length) {
    return {
      ok: false,
      error: 'no inbound signing key is configured for this workspace',
    };
  }

  if (!received || !timestamp) {
    return { ok: false, error: 'signature or timestamp header is missing' };
  }

  const skew = timestampSkew(timestamp);

  if (skew === undefined) {
    return {
      ok: false,
      error: `timestamp "${timestamp}" is not a unix second`,
    };
  }

  if (skew > MAX_SKEW_SECONDS) {
    return {
      ok: false,
      error: `timestamp is ${skew}s out of sync, over the ${MAX_SKEW_SECONDS}s window — check this server's clock`,
    };
  }

  const prefix = new TextEncoder().encode(`${timestamp}.`);
  const signed = new Uint8Array(prefix.length + rawBody.length);

  signed.set(prefix, 0);
  signed.set(rawBody, prefix.length);

  const matched = keys.some((key) =>
    equals(createHmac('sha256', key).update(signed).digest('hex'), received),
  );

  if (!matched) {
    return {
      ok: false,
      error: 'signature does not match a signing key on this deployment',
    };
  }

  return { ok: true };
};
