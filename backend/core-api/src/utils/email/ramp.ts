import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Read from the environment, never org settings: these protect the shared
 * provider account, so an organization must not be able to widen them.
 */
const num = (name: string, fallback: number) =>
  Number(getEnv({ name })) || fallback;

const DEFAULT_TIERS = [500, 2000, 8000, 32000, 128000];

export const getTiers = () => {
  const tiers = (getEnv({ name: 'EMAIL_RAMP_TIERS' }) || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => value > 0);

  return tiers.length ? tiers : DEFAULT_TIERS;
};

export const getRampConfig = () => ({
  tiers: getTiers(),
  advanceRate: num('EMAIL_RAMP_ADVANCE_RATE', 2),
  dropRate: num('EMAIL_RAMP_DROP_RATE', 5),
  haltRate: num('EMAIL_HALT_RATE', 10),
  windowDays: num('EMAIL_RATE_WINDOW_DAYS', 7),
  checkMinutes: num('EMAIL_RATE_CHECK_MINUTES', 15),
});

const dailyBudget = (tier: number) => {
  const tiers = getTiers();

  return tiers[Math.min(Math.max(tier, 0), tiers.length - 1)];
};

/**
 * A release says the cause was dealt with, so mail that predates it stops
 * counting — otherwise the rate that halted sending would halt it again.
 */
const windowStart = (since?: Date) => {
  const { windowDays } = getRampConfig();
  const start = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  return since && since > start ? since : start;
};

/**
 * Moves the tier and trips the breaker. Cheap to call on every send: it only
 * re-measures once the last reading has gone stale.
 */
export const evaluate = async (models: IModels, force = false) => {
  const { advanceRate, dropRate, haltRate, checkMinutes, windowDays } =
    getRampConfig();

  const ramp = await models.EmailRamp.current();

  if (!ramp) {
    return;
  }

  const staleAt = Date.now() - checkMinutes * 60 * 1000;

  if (
    !force &&
    ramp.lastEvaluatedAt &&
    ramp.lastEvaluatedAt.getTime() > staleAt
  ) {
    return ramp;
  }

  const since = windowStart(ramp.releasedAt);
  const overall = await models.EmailDeliveries.measureFailureRate(since);
  const unknown = await models.EmailDeliveries.measureFailureRate(
    since,
    'unknown',
  );

  const patch: Record<string, unknown> = {
    lastEvaluatedAt: new Date(),
    lastRate: overall.rate,
  };

  // Tier movement watches unproven mail only: proven traffic barely ever fails,
  // so mixing it in would dilute the signal.
  if (unknown.sent > 0) {
    if (unknown.rate >= dropRate && ramp.tier > 0) {
      patch.tier = ramp.tier - 1;
    } else if (
      unknown.rate < advanceRate &&
      ramp.tier < getTiers().length - 1 &&
      unknown.sent >= dailyBudget(ramp.tier)
    ) {
      patch.tier = ramp.tier + 1;
    }
  }

  await models.EmailRamp.recordEvaluation(patch);

  // Halting watches everything, because that is what the provider sees.
  if (!ramp.haltedAt && overall.sent > 0 && overall.rate >= haltRate) {
    await models.EmailRamp.halt(
      `Bounce and complaint rate reached ${overall.rate.toFixed(
        2,
      )}% over the last ${windowDays} days`,
    );
  }

  return await models.EmailRamp.current();
};

/**
 * While halted, only addresses that recently accepted mail may still be written
 * to: they cannot make the rate worse, and stopping them would break password
 * resets without helping recovery.
 */
export const listHalted = async (models: IModels, emails: string[]) => {
  if (!emails.length) {
    return new Set<string>();
  }

  const ramp = await evaluate(models);

  if (!ramp?.haltedAt) {
    return new Set<string>();
  }

  const proven = await models.EmailAddresses.listProven(emails);

  return new Set(emails.filter((email) => !proven.has(email)));
};

/**
 * Takes up to `want` addresses out of today's allowance and reports how many
 * were granted. A caller granted less than it asked for must hold the rest back.
 */
export const claim = async (models: IModels, want: number) => {
  if (want <= 0) {
    return 0;
  }

  const ramp = await evaluate(models);

  if (!ramp || ramp.haltedAt) {
    return 0;
  }

  const take = Math.min(
    want,
    Math.max(0, dailyBudget(ramp.tier) - ramp.usedToday),
  );

  if (take > 0) {
    await models.EmailRamp.consume(take);
  }

  return take;
};

export const getStatus = async (models: IModels) => {
  const ramp = await evaluate(models);
  const { tiers, advanceRate, dropRate, haltRate, windowDays } =
    getRampConfig();

  return {
    tier: ramp?.tier || 0,
    tiers,
    dailyBudget: dailyBudget(ramp?.tier || 0),
    usedToday: ramp?.usedToday || 0,
    haltedAt: ramp?.haltedAt,
    haltReason: ramp?.haltReason,
    lastRate: ramp?.lastRate,
    lastEvaluatedAt: ramp?.lastEvaluatedAt,
    advanceRate,
    dropRate,
    haltRate,
    windowDays,
  };
};

export const release = async (
  models: IModels,
  userId?: string,
  note?: string,
) => {
  await models.EmailRamp.release(userId, note);

  return await getStatus(models);
};
