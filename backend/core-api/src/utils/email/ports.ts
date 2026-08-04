import { TMailKind } from 'erxes-api-shared/core-modules';
import {
  IDeliveryLogPort,
  ISuppressionPort,
  normalizeEmail,
  toDeliveryLogProvider,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { listHalted } from '~/utils/email/ramp';

const MARKETING_SOURCES = ['broadcast'];

export const mailKindOf = (source?: string): TMailKind =>
  MARKETING_SOURCES.includes(source || '') ? 'marketing' : 'transactional';

export const createDeliveryLogPort = (models: IModels): IDeliveryLogPort => ({
  async create(input) {
    const delivery = await models.EmailDeliveries.createEmailDelivery({
      toEmails: input.toEmails,
      ccEmails: input.ccEmails,
      from: input.from,
      subject: input.subject,
      provider: toDeliveryLogProvider(input.provider),
      source: input.source,
      sourceId: input.sourceId,
      userId: input.userId,
      notificationId: input.notificationId,
      status: 'queued',
    });

    return delivery?._id;
  },

  async update(id, patch) {
    await models.EmailDeliveries.recordHandoff(id, patch);
  },
});

export const createSuppressionPort = (models: IModels): ISuppressionPort => ({
  async blocked(emails, source) {
    const addresses = emails.map(normalizeEmail);

    const closed = await models.EmailAddresses.listSuppressed(
      addresses,
      mailKindOf(source),
    );
    const halted = await listHalted(models, addresses);

    return emails.filter(
      (email) =>
        closed.has(normalizeEmail(email)) || halted.has(normalizeEmail(email)),
    );
  },
});
