import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const ticketConfigQueries = {
  ticketConfigs: async (
    _parent: undefined,
    { channelId }: { channelId: string },
    { models }: IContext,
  ) => {
    return models.TicketConfig.find({ channelId });
  },
};

requireLogin(ticketConfigQueries, 'ticketConfigs');
