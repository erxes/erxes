import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { ICPNotificationConfig } from '@/clientportal/types/cpNotificationConfig';

export const cpNotificationConfigMutations: Record<string, Resolver> = {
  async clientPortalNotificationConfigAdd(
    _root: unknown,
    {
      config,
    }: {
      config: ICPNotificationConfig;
    },
    { models }: IContext,
  ) {
    const existing = await models.CPNotificationConfigs.findOne({
      clientPortalId: config.clientPortalId,
      eventType: config.eventType,
    });

    if (existing) {
      throw new Error(
        'Notification config for this event type already exists. Use update instead.',
      );
    }

    return models.CPNotificationConfigs.create(config);
  },

  async clientPortalNotificationConfigUpdate(
    _root: unknown,
    {
      _id,
      config,
    }: {
      _id: string;
      config: ICPNotificationConfig;
    },
    { models }: IContext,
  ) {
    const existing = await models.CPNotificationConfigs.findOne({
      _id,
    });

    if (!existing) {
      throw new Error('Notification config not found');
    }

    const duplicate = await models.CPNotificationConfigs.findOne({
      clientPortalId: config.clientPortalId,
      eventType: config.eventType,
      _id: { $ne: _id },
    });

    if (duplicate) {
      throw new Error(
        'Another notification config for this event type already exists.',
      );
    }

    return models.CPNotificationConfigs.findOneAndUpdate(
      { _id },
      { $set: config },
      { new: true },
    );
  },

  async clientPortalNotificationConfigDelete(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const config = await models.CPNotificationConfigs.findOne({ _id });

    if (!config) {
      throw new Error('Notification config not found');
    }

    await models.CPNotificationConfigs.deleteOne({ _id });

    return { success: true };
  },
};
