import { SNS_MESSAGE_TYPES, SNS_SIGNATURE_VERSIONS } from '@erxes/core-db/emailEnums';
import { z } from 'zod';
import { createPublicKey, type KeyObject, verify } from '~/lib/crypto';
import { requestOutbound } from '~/lib/outbound';
import type { DeliveryEvent } from './apply';

/**
 * Where SNS keeps its signing certificates and confirmation links: its own
 * regional hosts only (`sns.us-east-1…`), so not an S3 bucket named `sns`
 * (`sns.s3.amazonaws.com`).
 */
const SNS_HOST = /^sns\.[a-z]{2}(-gov)?-[a-z]+-\d+\.amazonaws\.com(\.cn)?$/;

const snsUrl = z.url({ protocol: /^https$/, hostname: SNS_HOST });

/** An SNS HTTP(S) message: a notification, or the confirmation of a subscription. */
export const SnsMessage = z.object({
  Type: z.enum(SNS_MESSAGE_TYPES),
  MessageId: z.string(),
  TopicArn: z.string().max(300),
  Message: z.string(),
  Timestamp: z.string(),
  Subject: z.string().optional(),
  Token: z.string().optional(),
  SubscribeURL: snsUrl.optional(),
  SignatureVersion: z.enum(SNS_SIGNATURE_VERSIONS),
  Signature: z.string(),
  SigningCertURL: snsUrl.refine((url) => url.endsWith('.pem'), 'a .pem file'),
});

export type SnsMessage = z.infer<typeof SnsMessage>;

/**
 * SNS's signing certificates by address, kept for the process's life (AWS
 * rotates them under new addresses). Read once, from `sns.<region>.amazonaws.com` only.
 */
export const snsCertificates = new Map<string, Promise<KeyObject>>();

const fetchCertificate = async (url: string) => {
  const answer = await requestOutbound(url, {
    method: 'GET',
    body: '',
    headers: {},
    maxBytes: 16_384,
    overflow: 'fail',
  });

  if (answer.status !== 200) throw new Error(`SNS certificate ${url} answered ${answer.status}`);

  return createPublicKey(answer.body.toString('utf8'));
};

const certificate = (url: string) => {
  const kept = snsCertificates.get(url);

  if (kept) return kept;

  // A failed read is forgotten, so the next message reads it again.
  const read = fetchCertificate(url).catch((error: unknown) => {
    snsCertificates.delete(url);
    throw error;
  });

  snsCertificates.set(url, read);

  return read;
};

/** The fields SNS signs, in its order, each as `name\nvalue\n`. */
const signedText = (message: SnsMessage) => {
  const names =
    message.Type === 'Notification'
      ? (['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'] as const)
      : ([
          'Message',
          'MessageId',
          'SubscribeURL',
          'Timestamp',
          'Token',
          'TopicArn',
          'Type',
        ] as const);

  return names
    .flatMap((name) => {
      const value = message[name];

      return value === undefined ? [] : [`${name}\n${value}\n`];
    })
    .join('');
};

/** SNS's signature (RSA, SHA-1 for version 1, SHA-256 for 2) against its certificate. */
export const isSnsSignature = async (message: SnsMessage) => {
  const key = await certificate(message.SigningCertURL);

  try {
    return verify(
      message.SignatureVersion === '1' ? 'sha1' : 'sha256',
      Buffer.from(signedText(message)),
      key,
      Buffer.from(message.Signature, 'base64'),
    );
  } catch {
    return false;
  }
};

/** Subscribes the endpoint to the topic, as the confirmation asks. */
export const confirmSubscription = async (url: string) => {
  const answer = await requestOutbound(url, { method: 'GET', body: '', headers: {} });

  if (answer.status !== 200)
    throw new Error(`SNS subscription confirmation answered ${answer.status}`);
};

const Tag = z.array(z.string().min(1).max(64)).min(1);

const At = z.object({ timestamp: z.string() });

/**
 * An SES event from a configuration set's SNS destination (`eventType`; the
 * identity notifications' `notificationType` too). `mail.tags` carries the
 * message tags the email set (`X-SES-MESSAGE-TAGS`).
 */
const SesEvent = z.object({
  eventType: z.string().optional(),
  notificationType: z.string().optional(),
  mail: z.object({ tags: z.object({ erxes_org: Tag, erxes_delivery: Tag }) }),
  bounce: At.extend({
    bounceType: z.string(),
    bounceSubType: z.string().optional(),
    bouncedRecipients: z.array(z.object({ diagnosticCode: z.string().optional() })).optional(),
  }).optional(),
  complaint: At.extend({ complaintFeedbackType: z.string().optional() }).optional(),
  delivery: At.optional(),
  deliveryDelay: At.extend({ delayType: z.string().optional() }).optional(),
});

type SesEvent = z.infer<typeof SesEvent>;

type Effect = Pick<DeliveryEvent, 'kind' | 'suppress' | 'detail'> & { at: string };

/** What an event tells, or null for one that changes nothing here (Send, Open, Click …). */
const effectOf = (event: SesEvent): Effect | null => {
  const { bounce, complaint, delivery, deliveryDelay } = event;

  switch (event.eventType ?? event.notificationType) {
    case 'Bounce':
      return bounce
        ? {
            kind: 'bounced',
            // Transient and undetermined bounces are this time only.
            suppress: bounce.bounceType === 'Permanent',
            detail:
              bounce.bouncedRecipients?.[0]?.diagnosticCode ??
              [bounce.bounceType, bounce.bounceSubType].filter(Boolean).join(': '),
            at: bounce.timestamp,
          }
        : null;
    case 'Complaint':
      return complaint
        ? {
            kind: 'complained',
            suppress: true,
            detail: complaint.complaintFeedbackType ?? 'Marked as spam',
            at: complaint.timestamp,
          }
        : null;
    case 'Delivery':
      return delivery
        ? { kind: 'delivered', suppress: false, detail: null, at: delivery.timestamp }
        : null;
    case 'DeliveryDelay':
      return deliveryDelay
        ? {
            kind: 'deferred',
            suppress: false,
            detail: deliveryDelay.delayType ?? null,
            at: deliveryDelay.timestamp,
          }
        : null;
    default:
      return null;
  }
};

/** A notification's event in core's terms; `untagged` when it lacks erxes' tags. */
export const readSes = (message: unknown) => {
  const parsed = SesEvent.safeParse(message);

  if (!parsed.success) return { events: [], untagged: 1 };

  const effect = effectOf(parsed.data);
  const { tags } = parsed.data.mail;
  const [orgId] = tags.erxes_org;
  const [deliveryId] = tags.erxes_delivery;

  if (!effect || !orgId || !deliveryId) return { events: [], untagged: 0 };

  const { at, ...rest } = effect;
  const events: DeliveryEvent[] = [{ orgId, deliveryId, at: new Date(at), ...rest }];

  return { events, untagged: 0 };
};
