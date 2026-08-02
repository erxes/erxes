import { redis } from 'erxes-api-shared/utils';
import { getConfig } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { IModels } from '~/connectionResolvers';

/**
 * Publishing guards for Facebook page posts.
 *
 * These exist to protect the Meta app, not the servers. All customers share one
 * app; a runaway loop on a single page can get that app flagged for spam, and
 * enforcement lands on every customer at once. The rate limit bounds the blast
 * radius, and the audit log gives us something to show Meta if a page owner
 * ever complains about a post they did not expect.
 */

const DEFAULT_LIMIT_PER_HOUR = 30;
const WINDOW_SECONDS = 3600;

const rateLimitKey = (pageId: string) => `facebook:post:rate:${pageId}`;

export interface IPostAuditEntry {
  erxesApiId: string;
  pageId: string;
  message: string;
  status: 'published' | 'blocked' | 'failed';
  userId?: string;
  postId?: string;
  permalinkUrl?: string;
  error?: string;
}

/**
 * Per-page fixed window. Throws when the window is exhausted.
 *
 * Deliberately fails OPEN: if Redis is unreachable the post is allowed through.
 * This is a safety net rather than an authorization control, and failing closed
 * would mean a Redis blip stops every customer from publishing.
 *
 * Set FACEBOOK_POST_RATE_LIMIT to 0 to disable.
 */
export const assertPostRateLimit = async (
  models: IModels,
  pageId: string,
): Promise<void> => {
  const configured = await getConfig(
    models,
    'FACEBOOK_POST_RATE_LIMIT',
    `${DEFAULT_LIMIT_PER_HOUR}`,
  );

  const limit = parseInt(`${configured}`, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    return;
  }

  let count: number;
  let ttl: number;

  try {
    const key = rateLimitKey(pageId);

    count = await redis.incr(key);

    // Only the first call in a window sets the expiry, so the window slides
    // forward from the first post rather than the most recent one.
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    ttl = await redis.ttl(key);

    // Self-heal: if a crash between INCR and EXPIRE ever left this key without
    // a TTL (-1), it would otherwise block the page FOREVER and sit in Redis as
    // a TTL-less key — the exact class implicated in the 2026-07-31 outage.
    if (ttl === -1) {
      await redis.expire(key, WINDOW_SECONDS);
      ttl = WINDOW_SECONDS;
    }
  } catch (e) {
    debugError(`Facebook post rate limit check unavailable: ${e.message}`);
    return;
  }

  if (count > limit) {
    const minutes = Math.max(1, Math.ceil((ttl > 0 ? ttl : WINDOW_SECONDS) / 60));

    throw new Error(
      `Posting limit reached for this page (${limit} posts per hour). ` +
        `Try again in ${minutes} minute(s).`,
    );
  }
};

/**
 * Records every publish attempt — successful or not — against the existing
 * facebook log collection. Never throws: an audit failure must not prevent a
 * post the user asked for, nor mask the real error on a failed one.
 */
export const logPostAttempt = async (
  models: IModels,
  entry: IPostAuditEntry,
): Promise<void> => {
  try {
    await models.FacebookLogs.createLog({
      type: entry.status === 'published' ? 'success' : 'error',
      value: {
        action: 'facebook-post-publish',
        erxesApiId: entry.erxesApiId,
        pageId: entry.pageId,
        userId: entry.userId,
        status: entry.status,
        postId: entry.postId,
        permalinkUrl: entry.permalinkUrl,
        // Bounded: enough to identify the post in an appeal without storing
        // unbounded content in the log collection.
        message: (entry.message || '').slice(0, 500),
        error: entry.error,
      },
      specialValue: entry.pageId,
    });
  } catch (e) {
    debugError(`Failed to write facebook post audit log: ${e.message}`);
  }
};
