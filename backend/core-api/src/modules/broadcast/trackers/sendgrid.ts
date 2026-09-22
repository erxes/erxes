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

const isHardBounce = (event: ISendgridEvent) => {
  const name = String(event.event);

  if (name === 'dropped') {
    return true;
  }

  return name === 'bounce' && String(event.type || 'bounce') !== 'blocked';
};

const isPermanent = (event: ISendgridEvent) =>
  String(event.event) === 'spamreport' || isHardBounce(event);

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
        ...(event.reason ? { providerResponse: String(event.reason) } : {}),
        deliveryStatusAt: new Date(),
        updatedAt: new Date(),
      },
      ...(field && event.email ? { $addToSet: { [field]: event.email } } : {}),
    },
  );
};

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

  if (mapped.suppress && event.CustomerId && isPermanent(event)) {
    await models.Customers.updateSubscriptionStatus({
      _id: event.CustomerId as string,
      status: mapped.sesType,
    });
  }
};

export const sendgridTracker = async (req: Request, res: Response) => {
  const requestSubdomain = getSubdomain(req);

  const publicKey =
    getEnv({ name: 'SENDGRID_WEBHOOK_PUBLIC_KEY' }) ||
    (await getConfig(
      'SENDGRID_WEBHOOK_PUBLIC_KEY',
      '',
      await generateModels(requestSubdomain),
    ));

  const verified = verifySendgridSignature({
    publicKey,
    signature: String(req.headers[SENDGRID_SIGNATURE_HEADER] || ''),
    timestamp: String(req.headers[SENDGRID_TIMESTAMP_HEADER] || ''),
    payload: (req as any).rawBody ?? JSON.stringify(req.body),
  });

  if (!verified) {
    console.error(
      `SendGrid webhook rejected: ${
        !publicKey
          ? 'no SENDGRID_WEBHOOK_PUBLIC_KEY in env or mail config'
          : !req.headers[SENDGRID_SIGNATURE_HEADER]
            ? 'request carried no signature header'
            : 'signature did not match the configured key'
      }`,
    );

    return res.status(403).end('invalid signature');
  }

  const events: ISendgridEvent[] = Array.isArray(req.body) ? req.body : [];
  const isShared = !!getEnv({ name: 'SENDGRID_WEBHOOK_PUBLIC_KEY' });

  let foreign = 0;

  for (const event of events) {
    try {
      const subdomain = (event.Subdomain as string) || requestSubdomain;

      if (isShared && !event.Subdomain) {
        foreign++;

        continue;
      }

      const models = await generateModels(subdomain);

      await handleEvent(models, event);
    } catch (error) {
      console.error(`Failed to handle SendGrid event: ${error.message}`);
    }
  }

  // Counted rather than listed: on a shared provider account most of a batch
  // belongs to other systems, and one line per event buries everything else.
  if (foreign) {
    console.log(
      `Skipped ${foreign}/${events.length} SendGrid events carrying no subdomain`,
    );
  }

  return res.end('success');
};
