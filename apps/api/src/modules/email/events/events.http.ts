import { emailSettings, withOrg } from '@erxes/core-db';
import express, { type Request, type RequestHandler, type Response, Router } from 'express';
import { z } from 'zod';
import { config } from '~/config';
import { fail, invalidInput } from '~/http/errors';
import type { KeyObject } from '~/lib/crypto';
import { noticeMissingEventsKey } from '../rampNotices';
import { applyBatch, type DeliveryEvent } from './apply';
import { isSendgridSignature, readSendgrid, sendgridKey } from './sendgrid';
import { confirmSubscription, isSnsSignature, readSes, SnsMessage } from './ses';

const Params = z.object({ orgId: z.string().min(1).max(64) });

const bodyOf = (req: Request) => (Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0));

const jsonOf = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * A self-hosted organisation's own provider settings, for its own address
 * (`…/:orgId`); none on SaaS, where every email goes through the server's.
 */
const ownSettings = async (req: Request) => {
  const { orgId } = Params.parse(req.params);

  if (config.saas.enabled) return null;

  const [settings] = await withOrg(orgId, (tx) => tx.select().from(emailSettings).limit(1));

  return settings ? { orgId, settings } : null;
};

const notSetUp = (what: string) => fail('NOT_FOUND', `${what} events are not set up here`);

/**
 * An organisation's own provider posts events it has no key or topic for:
 * refused, and its admins told once (`noticeMissingEventsKey` checks the
 * settings again).
 */
const refuseOwn = async (own: { orgId: string } | null, what: string) => {
  if (own) await withOrg(own.orgId, (tx) => noticeMissingEventsKey(tx));

  return notSetUp(what);
};

/**
 * Applies a batch's events, each in its organisation's scope; an organisation's
 * own address takes only its own. Untagged, foreign and unknown ones are
 * skipped and counted, in one line per batch.
 */
const receive = async (
  req: Request,
  res: Response,
  batch: { received: number; events: DeliveryEvent[]; untagged: number },
  onlyOrg?: string,
) => {
  const events = onlyOrg ? batch.events.filter((event) => event.orgId === onlyOrg) : batch.events;
  const unknown = await applyBatch(events);

  const counts = {
    received: batch.received,
    applied: events.length - unknown,
    untagged: batch.untagged,
    foreign: batch.events.length - events.length,
    unknown,
  };

  if (counts.untagged || counts.foreign || counts.unknown) {
    req.log.info(counts, 'email events skipped');
  }

  res.status(204).end();
};

/** A SendGrid batch, signed with `key` over the timestamp and the raw body. */
const sendgridEvents = async (req: Request, res: Response, key: KeyObject, onlyOrg?: string) => {
  const body = bodyOf(req);

  const signed = {
    signature: req.header('x-twilio-email-event-webhook-signature') ?? '',
    timestamp: req.header('x-twilio-email-event-webhook-timestamp') ?? '',
    body,
  };

  if (!isSendgridSignature(key, signed)) throw fail('INVALID_SIGNATURE', 'Invalid signature');

  const items = z.array(z.unknown()).safeParse(jsonOf(body.toString('utf8')));

  if (!items.success) throw invalidInput(items.error);

  await receive(req, res, readSendgrid(items.data), onlyOrg);
};

/**
 * An SNS message from a topic `allowed` takes, signed by AWS: a subscription
 * to confirm, or an SES event. Any other topic is refused before its
 * signature is checked (anyone can publish to a topic of their own).
 */
const sesEvents = async (
  req: Request,
  res: Response,
  allowed: (topicArn: string) => boolean,
  onlyOrg?: string,
) => {
  const parsed = SnsMessage.safeParse(jsonOf(bodyOf(req).toString('utf8')));

  if (!parsed.success) throw invalidInput(parsed.error);

  const message = parsed.data;

  if (!allowed(message.TopicArn)) throw fail('INVALID_SIGNATURE', 'Not a topic events come from');

  if (!(await isSnsSignature(message))) throw fail('INVALID_SIGNATURE', 'Invalid signature');

  if (message.Type === 'SubscriptionConfirmation' && message.SubscribeURL) {
    await confirmSubscription(message.SubscribeURL);
  }

  if (message.Type !== 'Notification') {
    res.status(204).end();

    return;
  }

  const read = readSes(jsonOf(message.Message));

  await receive(req, res, { received: 1, ...read }, onlyOrg);
};

/**
 * `/core/v1/email/events/…`: what the providers report after taking an email
 * (delivered, bounced, complained, deferred), tagged with the organisation
 * and delivery row it carried (`tagHeaders`).
 * - `POST sendgrid`, `POST ses`: the server's provider (`EMAIL_SMTP_URL`),
 *   checked with `SENDGRID_WEBHOOK_PUBLIC_KEY` or `SES_EVENTS_TOPIC_ARNS`.
 * - `POST sendgrid/:orgId`, `POST ses/:orgId`: a self-hosted organisation's own
 *   account, checked with the key or topic saved in its settings; only its
 *   own events count.
 * Raw bodies (the signature covers them), no sign-in.
 */
export const emailEventsRouter = (limits: RequestHandler[]) => {
  const raw = express.raw({ type: () => true, limit: '5mb' });

  return Router()
    .post('/email/events/sendgrid', ...limits, raw, async (req, res) => {
      const key = sendgridKey(config.email.events.sendgridKey ?? '');

      if (!key) throw notSetUp('SendGrid');

      await sendgridEvents(req, res, key);
    })
    .post('/email/events/sendgrid/:orgId', ...limits, raw, async (req, res) => {
      const own = await ownSettings(req);

      const key =
        own?.settings.provider === 'sendgrid' ? sendgridKey(own.settings.eventsKey) : null;

      if (!own || !key) throw await refuseOwn(own, 'SendGrid');

      await sendgridEvents(req, res, key, own.orgId);
    })
    .post('/email/events/ses', ...limits, raw, async (req, res) => {
      const topics = config.email.events.sesTopicArns;

      if (!topics.length) throw notSetUp('Amazon SES');

      await sesEvents(req, res, (arn) => topics.includes(arn));
    })
    .post('/email/events/ses/:orgId', ...limits, raw, async (req, res) => {
      const own = await ownSettings(req);
      const topic = own?.settings.provider === 'ses' ? own.settings.eventsTopicArn : '';

      if (!own || !topic) throw await refuseOwn(own, 'Amazon SES');

      await sesEvents(req, res, (arn) => arn === topic, own.orgId);
    });
};
