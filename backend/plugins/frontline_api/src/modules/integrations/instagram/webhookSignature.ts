import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_ALGORITHMS = {
  'x-hub-signature-256': { prefix: 'sha256=', algorithm: 'sha256' },
  'x-hub-signature': { prefix: 'sha1=', algorithm: 'sha1' },
} as const;

export type SignatureHeaders = Record<string, string | undefined>;

const escapeNonAscii = (json: string): string =>
  json.replace(
    /[\u0080-￿]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );

const escapeSlashes = (json: string): string => json.replace(/\//g, '\\/');

const metaKeyOrder = (body: Record<string, unknown>): Record<string, unknown> => {
  if (!('object' in body) || !('entry' in body)) return body;
  const { object, entry, ...rest } = body;
  return { object, entry, ...rest };
};

const encodings = (body: Record<string, unknown>): string[] => {
  const compact = JSON.stringify(body);
  const unicodeEscaped = escapeNonAscii(compact);
  return [
    compact,
    unicodeEscaped,
    escapeSlashes(compact),
    escapeSlashes(unicodeEscaped),
  ];
};

export const signedBodyCandidates = (
  rawBody: Buffer | string | undefined,
  body: unknown,
): (Buffer | string)[] => {
  const candidates: (Buffer | string)[] = [];
  if (rawBody && rawBody.length) {
    candidates.push(rawBody);
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const received = body as Record<string, unknown>;
    candidates.push(...encodings(received), ...encodings(metaKeyOrder(received)));
  }
  return [...new Set(candidates.map((c) => c.toString()))];
};

const matches = (
  payload: Buffer | string,
  signature: string,
  prefix: string,
  algorithm: string,
  appSecret: string,
): boolean => {
  const expected = `${prefix}${createHmac(algorithm, appSecret)
    .update(payload)
    .digest('hex')}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

export const hasValidWebhookSignature = (
  rawBody: Buffer | string | undefined,
  body: unknown,
  headers: SignatureHeaders,
  appSecret: string | undefined,
): boolean => {
  if (!appSecret) return false;
  const candidates = signedBodyCandidates(rawBody, body);
  if (!candidates.length) return false;
  return Object.entries(SIGNATURE_ALGORITHMS).some(
    ([header, { prefix, algorithm }]) => {
      const signature = headers[header];
      if (!signature) return false;
      return candidates.some((payload) =>
        matches(payload, signature, prefix, algorithm, appSecret),
      );
    },
  );
};
