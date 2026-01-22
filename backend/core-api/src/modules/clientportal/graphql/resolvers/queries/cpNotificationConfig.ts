import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { ICPNotificationConfigDocument } from '@/clientportal/types/cpNotificationConfig';

export const cpNotificationConfigQueries: Record<string, Resolver> = {
  async clientPortalNotificationConfigs(
    _root: unknown,
    { clientPortalId }: { clientPortalId: string },
    { models }: IContext,
  ) {
    const list = await models.CPNotificationConfigs.find({
      clientPortalId,
    }).lean();

    const totalCount = await models.CPNotificationConfigs.countDocuments({
      clientPortalId,
    });

    return { list, totalCount };
  },

  async clientPortalNotificationConfig(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.CPNotificationConfigs.findOne({ _id });
  },
};
