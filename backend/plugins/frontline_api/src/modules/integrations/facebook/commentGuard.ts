import { getConfig } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

const DEFAULT_PUBLIC_REPLIES_PER_POST = 100;
/** Posts go cold; the counter only has to outlive the comment burst. */
const WINDOW_SECONDS = 7 * 24 * 3600;

const postBudgetKey = (subdomain: string, postId: string) =>
  `facebook:comment:post:${subdomain}:${postId}`;

const DEFAULT_REPLIES_PER_MINUTE = 10;
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

export type TPostPublicReplyBudget = {
  allowed: boolean;
  limit: number;
  used: number;
};

/**
 * Caps how many public replies one post receives. The private reply is not
 * touched: Meta sanctions one per comment and it is the path that converts,
 * while a public reply repeated thousands of times under a single post is what
 * the Spam policy calls repetitive content.
 */
export const consumePostPublicReplyBudget = async (
  models: IModels,
  subdomain: string,
  postId?: string,
): Promise<TPostPublicReplyBudget> => {
  const configured = await getConfig(
    models,
    'FACEBOOK_COMMENT_PUBLIC_REPLY_PER_POST',
    `${DEFAULT_PUBLIC_REPLIES_PER_POST}`,
  );

  const limit = Number.parseInt(`${configured}`, 10);

  if (!postId || !Number.isFinite(limit) || limit <= 0) {
    return { allowed: true, limit: 0, used: 0 };
  }

  try {
    const key = postBudgetKey(subdomain, postId);
    // Counted before the send, so concurrent replies cannot overshoot. A failed
    // send therefore spends its slot, which errs towards fewer public replies.
    const used = await redis.incr(key);

    if (used === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    return { allowed: used <= limit, limit, used };
  } catch (e) {
    // Availability over strictness, matching the post rate limit.
    debugError(`Facebook comment budget check unavailable: ${e.message}`);
    return { allowed: true, limit, used: 0 };
  }
};
