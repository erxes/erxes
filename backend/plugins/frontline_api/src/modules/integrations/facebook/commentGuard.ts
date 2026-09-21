import { getConfig } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * The page this was built for sustained 3,003 public replies in a clean hour
 * (~50/min) without a refusal, and its one rate-driven block came at 60-84/min
 * held for twenty minutes. 30 sits inside the observed-safe band rather than at
 * its ceiling.
 */
const DEFAULT_REPLIES_PER_MINUTE = 30;
const PACING_WINDOW_SECONDS = 3600;

const paceKey = (subdomain: string, pageId: string) =>
  `facebook:comment:pace:${subdomain}:${pageId}`;

/**
 * How long this reply waits before going out. Slots are handed out by an atomic
 * counter per page, so concurrent replies queue behind each other instead of
 * arriving together. The key expires after an hour, by which time the queue it
 * was pacing has drained.
 */
export const reserveSendSlot = async (
  models: IModels,
  subdomain: string,
  pageId: string,
): Promise<number> => {
  const configured = await getConfig(
    models,
    'FACEBOOK_COMMENT_REPLIES_PER_MINUTE',
    `${DEFAULT_REPLIES_PER_MINUTE}`,
  );

  const perMinute = Number.parseInt(`${configured}`, 10);

  if (!Number.isFinite(perMinute) || perMinute <= 0) {
    return 0;
  }

  try {
    const key = paceKey(subdomain, pageId);
    const slot = await redis.incr(key);

    if (slot === 1) {
      await redis.expire(key, PACING_WINDOW_SECONDS);
    }

    return Math.floor((slot - 1) / perMinute) * 60_000;
  } catch (e) {
    debugError(`Facebook comment pacing unavailable: ${e.message}`);
    return 0;
  }
};
