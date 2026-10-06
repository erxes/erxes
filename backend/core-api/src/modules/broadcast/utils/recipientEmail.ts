import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { prepareEmailParams } from './email';
import { getBroadcastAlignedFrom, toOutboundEmail } from './outboundEmail';
import { renderBroadcastEmail } from './renderEmail';

export type TRecipientEmail = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  status: string;
  reason?: string;
  sentAt?: Date;
  events: { status: string; createdAt?: Date }[];
};

/**
 * One recipient's copy of the campaign, rebuilt.
 *
 * The body is rendered again rather than stored per person — ten thousand
 * copies of one email to answer a question about one of them is not a
 * trade worth making — and it is rendered through the same functions the
 * worker used, so what this shows is what that person was sent.
 */
export const getRecipientEmail = async ({
  models,
  subdomain,
  recipientId,
}: {
  models: IModels;
  subdomain: string;
  recipientId: string;
}): Promise<TRecipientEmail | null> => {
  const recipient = await models.BroadcastRecipients.findOne({
    _id: recipientId,
  }).lean();

  if (!recipient) {
    return null;
  }

  const [run, customer] = await Promise.all([
    models.BroadcastRuns.findOne({ _id: recipient.runId }).lean(),
    models.Customers.findOne({
      _id: recipient.customerId,
    }).lean<ICustomerDocument | null>(),
  ]);

  if (!run || !customer) {
    return null;
  }

  const email = run.email || {};

  const [postalAddress, alignedFrom, events] = await Promise.all([
    getPostalAddress(models).then(formatPostalAddress),
    getBroadcastAlignedFrom(models),
    models.DeliveryReports.find({
      engageMessageId: run.engageMessageId,
      customerId: customer._id,
    })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const { htmlContent, link } = await renderBroadcastEmail({
    models,
    subdomain,
    email,
    customer,
    postalAddress,
  });

  const message = toOutboundEmail(
    prepareEmailParams(
      subdomain,
      customer as any,
      {
        _id: run.engageMessageId,
        email: { ...email, content: htmlContent },
      } as any,
      run.fromEmail || '',
      run.configSet,
    ),
    { unsubscribeUrl: link, alignedFrom },
  );

  return {
    to: message.to[0] || '',
    from: message.from,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html || '',
    status: recipient.status,
    reason: recipient.reason,
    sentAt: recipient.finishedAt,
    events: events.map((event) => ({
      status: event.status || '',
      createdAt: event.createdAt,
    })),
  };
};
