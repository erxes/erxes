import { redis } from 'erxes-api-shared/utils';
import { WHATSAPP_IN_FLIGHT_REPLY_TTL_SECONDS } from '@/integrations/whatsapp/constants';

const inFlightKey = (subdomain: string, wamid: string) =>
  `whatsapp:in-flight:${subdomain}:${wamid}`;

/**
 * Remembers a reply id sent to WhatsApp until the inbox stores the reply, so
 * a status that arrives first is retried instead of dropped.
 */
export const markWhatsappReplyInFlight = async (
  subdomain: string,
  wamid: string,
): Promise<void> => {
  await redis.set(
    inFlightKey(subdomain, wamid),
    '1',
    'EX',
    WHATSAPP_IN_FLIGHT_REPLY_TTL_SECONDS,
  );
};

/** Forgets reply ids the inbox will never store, so their statuses are ignored. */
export const clearWhatsappRepliesInFlight = async (
  subdomain: string,
  wamids: string[],
): Promise<void> => {
  if (!wamids.length) return;

  await redis.del(...wamids.map((wamid) => inFlightKey(subdomain, wamid)));
};

export const isWhatsappReplyInFlight = async (
  subdomain: string,
  wamid: string,
): Promise<boolean> =>
  (await redis.exists(inFlightKey(subdomain, wamid))) === 1;
