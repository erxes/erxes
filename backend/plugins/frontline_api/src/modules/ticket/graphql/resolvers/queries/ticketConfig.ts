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
  ticketConfig: async (
    _parent: undefined,
    { pipelineId }: { pipelineId: string },
    { models }: IContext,
  ) => {
    return models.TicketConfig.findOne({ pipelineId });
  },
};

requireLogin(ticketConfigQueries, 'ticketConfigs');
