import { IBroadcastEmailTemplateQueryParams } from '@/broadcast/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IBroadcastEmailTemplateDocument } from '@/broadcast/@types';

export const emailTemplateQueries = {
  async broadcastEmailTemplates(
    _root: undefined,
    params: IBroadcastEmailTemplateQueryParams,
    { models }: IContext,
  ) {
    const { searchValue } = params || {};

    const filter: FilterQuery<IBroadcastEmailTemplateDocument> = {};

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return cursorPaginate({
      model: models.BroadcastEmailTemplates,
      params: { ...params, orderBy: { createdAt: -1, _id: -1 } },
      query: filter,
    });
  },

  async broadcastEmailTemplateDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.BroadcastEmailTemplates.getEmailTemplate(_id);
  },
};
