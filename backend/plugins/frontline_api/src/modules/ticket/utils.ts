import { TICKET_DEFAULT_STATUSES } from '@/ticket/constants/types';
import { IModels } from '~/connectionResolvers';

export const generateDefaultStatuses = (pipelineId: string) => {
  return TICKET_DEFAULT_STATUSES.map((status, index) => ({
    ...status,
    pipelineId,
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

export const checkPipeline = async ({
  models,
  pipelineId,
}: {
  models: IModels;
  pipelineId?: string;
}) => {
  if (!pipelineId) {
    throw new Error('PipelineId is required');
  }
  const pipeline = await models.Pipeline.findOne({ _id: pipelineId });
  if (!pipeline) {
    throw new Error('Pipeline is not found');
  }
  return pipeline;
};
