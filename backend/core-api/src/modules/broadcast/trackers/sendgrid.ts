import { getConfig } from '@/organization/settings/utils/configs';
import {
  ISendgridEvent,
  SENDGRID_SIGNATURE_HEADER,
  SENDGRID_TIMESTAMP_HEADER,
  verifySendgridSignature,
} from 'erxes-api-shared/utils';
import { getEnv, getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';
import { generateModels, IModels } from '~/connectionResolvers';

/**
 * How each SendGrid event maps onto what erxes already records. The names on
 * the right are the SES event names the stats and suppression paths were built
 * around, so both providers end up counted the same way.
 */
const EVENT_MAP: Record<
  string,
  { sesType: string; field?: string; suppress?: boolean }
> = {
  delivered: { sesType: 'delivery' },
  open: { sesType: 'open', field: 'opened' },
  click: { sesType: 'click', field: 'clicked' },
  bounce: { sesType: 'bounce', field: 'bounced', suppress: true },
  dropped: { sesType: 'reject', field: 'bounced', suppress: true },
  spamreport: { sesType: 'complaint', field: 'complained', suppress: true },
};

/**
 * SendGrid reports a full mailbox and a mailbox that does not exist under the
 * same `bounce` event, separating them only by `type`. Treating both as
 * permanent would close addresses whose owner was merely over quota that day.
 */
const isHardBounce = (event: ISendgridEvent) => {
  const name = String(event.event);

  if (name === 'dropped') {
    // SendGrid refused it against what it already knows about the address.
    return true;
  }

  return name === 'bounce' && String(event.type || 'bounce') !== 'blocked';
};

/** A verdict there is no coming back from: the address is gone, or unwanted. */
const isPermanent = (event: ISendgridEvent) =>
  String(event.event) === 'spamreport' || isHardBounce(event);

/** The delivery row's own status, which is a narrower set than the events. */
const DELIVERY_STATUS: Record<string, string> = {
  delivered: 'delivered',
  open: 'opened',
  click: 'clicked',
  bounce: 'bounced',
  dropped: 'dropped',
  spamreport: 'complained',
};

const recordDelivery = async (
  models: IModels,
  event: ISendgridEvent,
  field?: string,
) => {
  const deliveryId = event.EmailDeliveryId as string | undefined;

  if (!deliveryId) {
    return;
  }

  const status = DELIVERY_STATUS[String(event.event)];

  await models.EmailDeliveries.updateOne(
    { _id: deliveryId },
    {
      $set: {
        ...(status ? { deliveryStatus: status } : {}),
        // What the receiving server actually said. The address record keeps
        // only the current verdict, so the per-send explanation lives here.
        ...(event.reason ? { providerResponse: String(event.reason) } : {}),
        deliveryStatusAt: new Date(),
        updatedAt: new Date(),
      },
      // Providers retry, and a recipient may open the same mail twice; the
      // address belongs in the list once either way.
      ...(field && event.email ? { $addToSet: { [field]: event.email } } : {}),
    },
  );
};

/**
 * Campaign statistics and the per-recipient report predate the delivery log and
 * are what the broadcast UI reads, so SendGrid has to feed them too.
 */
const recordCampaign = async (models: IModels, event: ISendgridEvent) => {
  const engageMessageId = event.EngageMessageId as string | undefined;

  if (!engageMessageId) {
    return;
  }

  const { sesType } = EVENT_MAP[String(event.event)];

  const report = {
    engageMessageId,
    mailId: event.MailMessageId as string | undefined,
    customerId: event.CustomerId as string | undefined,
    email: event.email,
  };

  // SendGrid delivers at least once, so the same event can arrive twice.
  const exists = await models.DeliveryReports.findOne({
    ...report,
    status: sesType,
  });

  if (exists) {
    return;
  }

  await models.Stats.updateStats(engageMessageId, sesType);

  await models.DeliveryReports.create({ ...report, status: sesType });
};

/**
 * Updates what this organization knows about the address itself, which is what
 * later decides whether it may be mailed again. Everything else the webhook
 * writes is per-message; this is the part that outlives the message.
 */
const recordAddress = async (models: IModels, event: ISendgridEvent) => {
  const name = String(event.event);
  const email = event.email;

  if (!email) {
    return;
  }

  if (name === 'delivered') {
    return models.EmailAddresses.recordDelivered(email);
  }

  if (name === 'spamreport') {
    return models.EmailAddresses.suppress(email, 'complaint');
  }

  if (name !== 'bounce' && name !== 'dropped') {
    return;
  }

  if (isHardBounce(event)) {
    return models.EmailAddresses.suppress(email, 'hard_bounce');
  }

  const limit = Number(getEnv({ name: 'EMAIL_SOFT_BOUNCE_LIMIT' }) || 3);

  await models.EmailAddresses.recordSoftBounce(email, limit);
};

const handleEvent = async (models: IModels, event: ISendgridEvent) => {
  const mapped = EVENT_MAP[String(event.event)];

  if (!mapped) {
    return;
  }

  await recordDelivery(models, event, mapped.field);
  await recordCampaign(models, event);
  await recordAddress(models, event);

  // A temporary failure is not a reason to stop mailing someone, so only the
  // permanent verdicts reach the customer's own subscription flag.
  if (mapped.suppress && event.CustomerId && isPermanent(event)) {
    await models.Customers.updateSubscriptionStatus({
      _id: event.CustomerId as string,
      status: mapped.sesType,
    });
  }
};

/**
 * Events arrive in batches that may span organizations, because a shared
 * provider account has one webhook URL for every tenant on it. Each event
 * carries the subdomain it was sent from; a self-hosted install owns its
 * account, so its own host answers instead.
 */
export const sendgridTracker = async (req: Request, res: Response) => {
  const requestSubdomain = getSubdomain(req);

  const publicKey = await getConfig(
    'SENDGRID_WEBHOOK_PUBLIC_KEY',
    '',
    await generateModels(requestSubdomain),
  );

  const verified = verifySendgridSignature({
    publicKey,
    signature: String(req.headers[SENDGRID_SIGNATURE_HEADER] || ''),
    timestamp: String(req.headers[SENDGRID_TIMESTAMP_HEADER] || ''),
    payload: (req as any).rawBody ?? JSON.stringify(req.body),
  });

  if (!verified) {
    return res.status(403).end('invalid signature');
  }

  const events: ISendgridEvent[] = Array.isArray(req.body) ? req.body : [];

  for (const event of events) {
    try {
      const models = await generateModels(
        (event.Subdomain as string) || requestSubdomain,
      );

      await handleEvent(models, event);
    } catch (error) {
      // One unusable event must not drop the rest of the batch, and SendGrid
      // retries the whole batch on a non-2xx.
      console.error(`Failed to handle SendGrid event: ${error.message}`);
    }
  }

  return res.end('success');
};
