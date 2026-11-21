import { z } from 'zod';
import { createPublicKey, type KeyObject, verify } from '~/lib/crypto';
import type { DeliveryEvent } from './apply';

/**
 * SendGrid's Signed Event Webhook verification key: the base64 of a P-256
 * public key (SPKI), as its settings page shows it. Null when it isn't one.
 */
export const sendgridKey = (text: string): KeyObject | null => {
  try {
    const key = createPublicKey({
      key: Buffer.from(text.replace(/\s+/g, ''), 'base64'),
      format: 'der',
      type: 'spki',
    });

    return key.asymmetricKeyDetails?.namedCurve === 'prime256v1' ? key : null;
  } catch {
    return null;
  }
};

/** ECDSA (SHA-256, DER) over the timestamp header followed by the raw body. */
export const isSendgridSignature = (
  key: KeyObject,
  signed: { signature: string; timestamp: string; body: Buffer },
) => {
  try {
    return verify(
      'sha256',
      Buffer.concat([Buffer.from(signed.timestamp), signed.body]),
      key,
      Buffer.from(signed.signature, 'base64'),
    );
  } catch {
    return false;
  }
};

const Tag = z.string().min(1).max(64);

/** One event; `erxes_org` and `erxes_delivery` are the unique args the email carried (`X-SMTPAPI`). */
const SendgridEvent = z.object({
  event: z.string(),
  timestamp: z.number(),
  erxes_org: Tag,
  erxes_delivery: Tag,
  reason: z.string().optional(),
  response: z.string().optional(),
  /** A `bounce`'s kind: `bounce` (the address doesn't take mail) or `blocked` (refused this time). */
  type: z.string().optional(),
});

type SendgridEvent = z.infer<typeof SendgridEvent>;

/** What an event tells, or null for one that changes nothing here (processed, open, click …). */
const effectOf = (event: SendgridEvent): Pick<DeliveryEvent, 'kind' | 'suppress'> | null => {
  switch (event.event) {
    case 'delivered':
      return { kind: 'delivered', suppress: false };
    case 'bounce':
      return { kind: 'bounced', suppress: event.type !== 'blocked' };
    case 'dropped':
      return { kind: 'bounced', suppress: true };
    case 'spamreport':
      return { kind: 'complained', suppress: true };
    case 'deferred':
      return { kind: 'deferred', suppress: false };
    default:
      return null;
  }
};

/**
 * A batch's events in core's terms. An event without erxes' tags (sent by
 * something else on a shared account, or malformed) is counted as untagged.
 */
export const readSendgrid = (items: unknown[]) => {
  const events: DeliveryEvent[] = [];
  let untagged = 0;

  for (const item of items) {
    const parsed = SendgridEvent.safeParse(item);

    if (!parsed.success) {
      untagged += 1;
      continue;
    }

    const effect = effectOf(parsed.data);

    if (effect) {
      events.push({
        orgId: parsed.data.erxes_org,
        deliveryId: parsed.data.erxes_delivery,
        at: new Date(parsed.data.timestamp * 1000),
        detail: parsed.data.reason ?? parsed.data.response ?? null,
        ...effect,
      });
    }
  }

  return { received: items.length, events, untagged };
};
