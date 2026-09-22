import { getEnv, redis } from 'erxes-api-shared/utils';
import { debugError } from '@/integrations/mail/debuggers';
import { MailSendError } from '@/integrations/mail/utils/transports/common';

const DEFAULT_LIMIT_PER_MINUTE = 120;
const WINDOW_SECONDS = 60;

const DEFAULT_PLATFORM_SENDS_PER_DAY = 500;
const DAY_SECONDS = 24 * 60 * 60;

interface IInboundRateVerdict {
  allowed: boolean;
  retryAfter: number;
}

const rateLimitKey = (subdomain: string, inboxIntegrationId: string) =>
  `mail:inbound:rate:${subdomain}:${inboxIntegrationId}`;

const readLimit = (subdomain: string) => {
  const configured = getEnv({
    name: 'MAIL_INBOUND_RATE_LIMIT',
    defaultValue: `${DEFAULT_LIMIT_PER_MINUTE}`,
    subdomain,
  });

  return Number.parseInt(`${configured}`, 10);
};

// The deployment account is shared by every workspace, so one workspace
// burning its quota or its reputation would take the rest down with it.
export const checkPlatformSendRate = async (subdomain: string) => {
  const configured = getEnv({
    name: 'MAIL_SENDING_DAILY_LIMIT',
    defaultValue: `${DEFAULT_PLATFORM_SENDS_PER_DAY}`,
    subdomain,
  });

  const limit = Number.parseInt(`${configured}`, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    return;
  }

  try {
    const key = `mail:platform:send:${subdomain}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, DAY_SECONDS);
    }

    if (count > limit) {
      throw new MailSendError(
        `This workspace has sent its ${limit} replies for today through the erxes sending account — add your own sending domain to lift the limit`,
        false,
      );
    }
  } catch (e) {
    if (e instanceof MailSendError) {
      throw e;
    }

    debugError('Platform send rate check unavailable:', e);
  }
};

export const checkInboundRate = async (
  subdomain: string,
  inboxIntegrationId: string,
): Promise<IInboundRateVerdict> => {
  const limit = readLimit(subdomain);

  if (!Number.isFinite(limit) || limit <= 0) {
    return { allowed: true, retryAfter: 0 };
  }

  try {
    const key = rateLimitKey(subdomain, inboxIntegrationId);
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    let ttl = await redis.ttl(key);

    if (ttl === -1) {
      await redis.expire(key, WINDOW_SECONDS);
      ttl = WINDOW_SECONDS;
    }

    if (count > limit) {
      return { allowed: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS };
    }
  } catch (e) {
    debugError('Inbound rate limit check unavailable:', e);
  }

  return { allowed: true, retryAfter: 0 };
};
