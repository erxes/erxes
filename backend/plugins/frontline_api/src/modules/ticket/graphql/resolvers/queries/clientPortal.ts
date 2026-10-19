import {
  ICpTicketPipelineFilter,
  ITicketPipelineDocument,
} from '@/ticket/@types/pipeline';
import { ITicketFilter } from '@/ticket/@types/ticket';
import { generateFilter } from '@/ticket/utils';
import { IOffsetPaginateParams } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  defaultPaginate,
  escapeRegExp,
  markResolvers,
} from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const cpTicketQueries = {
  cpGetTickets: async (
    _root: undefined,
    args: { filter?: (Partial<ITicketFilter> & IOffsetPaginateParams) | null },
    { models, user, subdomain }: IContext,
  ) => {
    const filter: Partial<ITicketFilter> & IOffsetPaginateParams =
      args.filter ?? {};
    const { page, perPage, createdBy } = filter;

    const query = await generateFilter(
      filter,
      user,
      models,
      subdomain,
      !!createdBy,
    );

    if (createdBy) {
      query.createdBy = `cp:${createdBy}`;
    }

    return defaultPaginate(models.Ticket.find(query), { page, perPage });
  },

  cpGetTicket: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Ticket.getTicket(_id);
  },
  cpGetTicketTotalCount: async (
    _root: undefined,
    args: { filter?: (Partial<ITicketFilter> & IOffsetPaginateParams) | null },
    { models, user, subdomain }: IContext,
  ) => {
    const filter: Partial<ITicketFilter> & IOffsetPaginateParams =
      args.filter ?? {};
    const { createdBy } = filter;

    const query = await generateFilter(
      filter,
      user,
      models,
      subdomain,
      !!createdBy,
    );

    if (createdBy) {
      query.createdBy = `cp:${createdBy}`;
    }

    return models.Ticket.countDocuments(query);
  },
  cpGetTicketStatus: async (
    _parent: undefined,
    { _id },
    { models }: IContext,
  ) => {
    return models.Status.getStatus(_id);
  },

  cpGetTicketPipelines: async (
    _parent: undefined,
    { filter = {} }: { filter?: ICpTicketPipelineFilter },
    { models }: IContext,
  ) => {
    const { channelId, name, ...paginationParams } = filter;

    // readable with only a portal token, so private pipelines never leave the API
    const query: FilterQuery<ITicketPipelineDocument> = {
      visibility: { $ne: 'private' },
    };

    if (channelId) {
      query.channelId = channelId;
    }

    if (name) {
      query.name = { $regex: escapeRegExp(name), $options: 'i' };
    }

    return cursorPaginate<ITicketPipelineDocument>({
      model: models.Pipeline,
      params: {
        orderBy: { order: 'asc', createdAt: 'asc' },
        ...paginationParams,
      },
      query,
    });
  },

  cpTicketGetNotes: async (
    _parent: undefined,
    { ticketId }: { ticketId: string },
    { models }: IContext,
  ) => {
    return models.Note.find({
      contentId: ticketId,
      isInternal: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};

markResolvers<IContext>(cpTicketQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
