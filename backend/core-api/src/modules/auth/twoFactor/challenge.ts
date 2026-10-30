import { createHash, randomBytes } from 'crypto';
import { redis } from 'erxes-api-shared/utils';
import { SessionMethod } from '@/auth/session';

const CHALLENGE_SECS = 5 * 60;
const MAX_ATTEMPTS = 5;

/** Proof that the first factor passed; never a session on its own. */
export interface ITwoFactorChallenge {
  userId: string;
  method: SessionMethod;
  setup: boolean;
  attempts: number;
}

const challengeKey = (subdomain: string, token: string) =>
  `two_factor_challenge:${subdomain}:${createHash('sha256')
    .update(token)
    .digest('hex')}`;

export const createTwoFactorChallenge = async (
  subdomain: string,
  challenge: Omit<ITwoFactorChallenge, 'attempts'>,
) => {
  const token = randomBytes(32).toString('base64url');

  await redis.set(
    challengeKey(subdomain, token),
    JSON.stringify({ ...challenge, attempts: 0 }),
    'EX',
    CHALLENGE_SECS,
  );

  return token;
};

export const readTwoFactorChallenge = async (
  subdomain: string,
  token: string,
): Promise<ITwoFactorChallenge | null> => {
  const raw = token ? await redis.get(challengeKey(subdomain, token)) : null;

  return raw ? (JSON.parse(raw) as ITwoFactorChallenge) : null;
};

/** Counts a wrong code; the fifth one ends the challenge. */
export const failTwoFactorChallenge = async (
  subdomain: string,
  token: string,
  challenge: ITwoFactorChallenge,
) => {
  const key = challengeKey(subdomain, token);
  const attempts = challenge.attempts + 1;

  if (attempts >= MAX_ATTEMPTS) {
    await redis.del(key);
    return;
  }

  const ttl = await redis.ttl(key);

  if (ttl > 0) {
    await redis.set(key, JSON.stringify({ ...challenge, attempts }), 'EX', ttl);
  }
};

export const endTwoFactorChallenge = (subdomain: string, token: string) =>
  redis.del(challengeKey(subdomain, token));
