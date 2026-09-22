import { redis } from 'erxes-api-shared/utils';
import { getConfig } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { IModels } from '~/connectionResolvers';

const DEFAULT_LIMIT_PER_HOUR = 30;
const WINDOW_SECONDS = 3600;

const rateLimitKey = (subdomain: string, pageId: string) =>
  `facebook:post:rate:${subdomain}:${pageId}`;

export interface IPostAuditEntry {
  erxesApiId: string;
  pageId: string;
  message: string;
  status: 'published' | 'blocked' | 'failed';
  userId?: string;
  postId?: string;
  permalinkUrl?: string | null;
  error?: string;
}

export const assertPostRateLimit = async (
  models: IModels,
  subdomain: string,
  pageId: string,
): Promise<void> => {
  const configured = await getConfig(
    models,
    'FACEBOOK_POST_RATE_LIMIT',
    `${DEFAULT_LIMIT_PER_HOUR}`,
  );

  const limit = Number.parseInt(`${configured}`, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    return;
  }

  let count: number;
  let ttl: number;

  try {
    const key = rateLimitKey(subdomain, pageId);

    count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    ttl = await redis.ttl(key);

    if (ttl === -1) {
      await redis.expire(key, WINDOW_SECONDS);
      ttl = WINDOW_SECONDS;
    }
  } catch (e) {
    debugError(`Facebook post rate limit check unavailable: ${e.message}`);
    return;
  }

  if (count > limit) {
    const minutes = Math.max(
      1,
      Math.ceil((ttl > 0 ? ttl : WINDOW_SECONDS) / 60),
    );

    throw new Error(
      `Posting limit reached for this page (${limit} posts per hour). ` +
        `Try again in ${minutes} minute(s).`,
    );
  }
};

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
        message: (entry.message || '').slice(0, 500),
        error: entry.error,
      },
      specialValue: entry.pageId,
    });
  } catch (e) {
    debugError(`Failed to write facebook post audit log: ${e.message}`);
  }
};
