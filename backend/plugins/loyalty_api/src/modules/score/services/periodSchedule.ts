import {
  getEnv,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const PERIODS_QUEUE = 'periods';

// Nearly every organization is in Mongolia, so one night for all of them.
// A run that comes late still resets correctly (see accountReset).
const DEFAULT_TIME_ZONE = 'Asia/Ulaanbaatar';

const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const fallbackTimeZone = () => {
  const configured = getEnv({ name: 'LOYALTY_TIME_ZONE', defaultValue: '' });

  return configured && isTimeZone(configured) ? configured : DEFAULT_TIME_ZONE;
};

// The organization's own zone decides when its periods begin.
export const loyaltyTimeZone = async (subdomain: string) => {
  const configured = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: { code: 'TIMEZONE' },
    defaultValue: '',
  });

  return typeof configured === 'string' && isTimeZone(configured.trim())
    ? configured.trim()
    : fallbackTimeZone();
};

/**
 * Whether anything in this organization moves with time: a wallet that
 * expires, holds purchases back or resets, or lots still waiting on a date
 * after such a setting was turned off.
 */
export const needsPeriodRuns = async (models: IModels) =>
  !!(
    (await models.LoyaltyAccountTypes.exists({
      status: 'active',
      $or: [
        { 'expiry.mode': { $in: ['calendar', 'rolling'] } },
        { pendingDays: { $gt: 0 } },
        { 'reset.period': { $in: ['monthly', 'yearly'] } },
      ],
    })) ||
    (await models.LoyaltyLots.exists({ status: 'pending' })) ||
    (await models.LoyaltyLots.exists({
      status: 'available',
      expiresAt: { $exists: true },
    }))
  );

const schedulerId = (subdomain: string) => `loyalty-periods-${subdomain}`;

/**
 * One nightly run per organization that needs it, none for the rest; kept in
 * step whenever a wallet's time settings change.
 */
export const syncPeriodSchedule = async (
  models: IModels,
  subdomain: string,
) => {
  const queue = sendWorkerQueue('loyalty', PERIODS_QUEUE);

  if (await needsPeriodRuns(models)) {
    await queue.upsertJobScheduler(
      schedulerId(subdomain),
      { pattern: '5 0 * * *', tz: fallbackTimeZone() },
      { name: PERIODS_QUEUE, data: { subdomain } },
    );
    return;
  }

  await queue.removeJobScheduler(schedulerId(subdomain));
};

// A run that stopped at its batch limit carries on right away.
export const continuePeriodRun = (subdomain: string) =>
  sendWorkerQueue('loyalty', PERIODS_QUEUE).add(PERIODS_QUEUE, { subdomain });
