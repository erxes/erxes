import { createPublicKey, verify } from 'crypto';
import { DISCORD_SIGNATURE_TOLERANCE_SECONDS } from '@/discordIntegration/constants';

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

const firstHeader = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const buildPublicKey = (publicKeyHex: string) => {
  const raw = Buffer.from(publicKeyHex, 'hex');

  if (raw.length !== 32) {
    throw new Error('Invalid Discord public key');
  }

  return createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
    format: 'der',
    type: 'spki',
  });
};

const isTimestampFresh = (timestamp: string) => {
  const seconds = Number(timestamp);

  return (
    Number.isFinite(seconds) &&
    Math.abs(Date.now() / 1000 - seconds) <= DISCORD_SIGNATURE_TOLERANCE_SECONDS
  );
};

export const verifyDiscordRequest = ({
  publicKey,
  signature,
  timestamp,
  rawBody,
}: {
  publicKey?: string;
  signature?: string | string[];
  timestamp?: string | string[];
  rawBody: Buffer;
}) => {
  const signatureHex = firstHeader(signature);
  const timestampValue = firstHeader(timestamp);

  if (!publicKey || !signatureHex || !timestampValue) {
    return false;
  }

  if (!isTimestampFresh(timestampValue)) {
    return false;
  }

  try {
    return verify(
      null,
      Buffer.concat([Buffer.from(timestampValue), rawBody]),
      buildPublicKey(publicKey),
      Buffer.from(signatureHex, 'hex'),
    );
  } catch {
    return false;
  }
};
