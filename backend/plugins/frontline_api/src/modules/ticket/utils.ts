import { TICKET_DEFAULT_STATUSES } from '@/ticket/constants/types';
import { IModels } from '~/connectionResolvers';

export const generateDefaultStatuses = (channelId: string) => {
  return TICKET_DEFAULT_STATUSES.map((status, index) => ({
    ...status,
    channelId,
    order: status.order ?? index + 1,
  }));
};

export const checkChannel = async ({
  models,
  channelId,
}: {
  models: IModels;
  channelId?: string;
}) => {
  if (!channelId) {
    throw new Error('ChannelId is required');
  }

  const channel = await models.Channels.findOne({ _id: channelId });

  if (!channel) {
    throw new Error('Channel is not found');
  }
};
