import { redis } from 'erxes-api-shared/utils';

/** Long enough for a rate limit to clear, short enough to stay a pause. */
const BASE_COOL_DOWN_MS = 60_000;

/** Past this the provider is not busy, it is broken, and waiting longer helps nobody. */
const MAX_COOL_DOWN_MS = 15 * 60_000;

/** How long a spell of refusals is remembered, so the wait stops growing once they stop. */
const STRIKE_TTL_MS = 30 * 60_000;

const NETWORK_FAULTS = [
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'EPIPE',
];

const coolDownKey = (subdomain: string) =>
  `broadcast:sending:cooldown:${subdomain}`;

const strikeKey = (subdomain: string) =>
  `broadcast:sending:strikes:${subdomain}`;

type TSendFailure = { status?: number; code?: string } | null | undefined;

// A rate limit or an outage says the moment was wrong, not the person. Marking
// those unreachable threw people away for something they had no part in.
export const isBackoff = (error: TSendFailure) => {
  const status = error?.status;

  if (typeof status === 'number' && (status === 429 || status >= 500)) {
    return true;
  }

  return NETWORK_FAULTS.includes(error?.code || '');
};

// In redis, not in the worker that met the refusal: four drains retreating
// separately would keep the provider under the load it just turned down.
export const startCoolDown = async (subdomain: string) => {
  const strikes = await redis.incr(strikeKey(subdomain));

  await redis.pexpire(strikeKey(subdomain), STRIKE_TTL_MS);

  // Each refusal in the same spell doubles the wait. A provider still saying
  // no does not want to be asked again as soon as the last time.
  const wait = Math.min(
    BASE_COOL_DOWN_MS * 2 ** (strikes - 1),
    MAX_COOL_DOWN_MS,
  );

  await redis.set(coolDownKey(subdomain), String(wait), 'PX', wait);

  return wait;
};

/** What is left of the pause, or nothing when sending may go on. */
export const coolDownRemaining = async (subdomain: string) => {
  const remaining = await redis.pttl(coolDownKey(subdomain));

  return remaining > 0 ? remaining : 0;
};

/** A block that went out ends the spell, so the next one starts from a minute again. */
export const clearStrikes = (subdomain: string) =>
  redis.del(strikeKey(subdomain));

export const describeCoolDown = (ms: number) => {
  const minutes = Math.round(ms / 60_000);

  return minutes >= 1
    ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    : `${Math.max(Math.round(ms / 1000), 1)} seconds`;
};
