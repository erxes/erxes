import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import {
  TicketsPipelineFilter,
  ITicketPipelineDocument,
} from '@/ticket/@types/pipeline';
import { FilterQuery } from 'mongoose';
import { cursorPaginate } from 'erxes-api-shared/utils';

export const pipelineQueries = {
  getTicketPipeline: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Pipeline.getPipeline(_id);
  },

  getTicketPipelines: async (
    _parent: undefined,
    { filter }: { filter: TicketsPipelineFilter },
    { models }: IContext,
  ) => {
    const filterQuery: FilterQuery<ITicketPipelineDocument> = {};

    if (filter.name) {
      filterQuery.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.createdAt) {
      filterQuery.createdAt = { $gte: filter.createdAt };
    }

    if (filter.channelId) {
      filterQuery.channelId = filter.channelId;
    }

    if (filter.userId) {
      filterQuery.userId = filter.userId;
    }

    return await cursorPaginate<ITicketPipelineDocument>({
      model: models.Pipeline,
      params: {
        ...filter,
        orderBy: {
          order: 'asc',
          createdAt: 'asc',
        },
      },
      query: filterQuery,
    });
  },
};

requireLogin(pipelineQueries, 'getTicketPipeline');
requireLogin(pipelineQueries, 'getTicketPipelines');
