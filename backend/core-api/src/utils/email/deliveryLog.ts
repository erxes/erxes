import {
  IDeliveryLogPort,
  toDeliveryLogProvider,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Backs the shared send path with this service's own models, so every email
 * leaving core-api is recorded without each caller having to remember to.
 */
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
