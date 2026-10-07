import { IContext } from '~/connectionResolvers';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import {
  IResponseTemplateDocument,
  ResponseTemplatesFilter,
} from '@/response/@types/responseTemplates';

const generateFilter = (args: ResponseTemplatesFilter) => {
  const { channelId, searchValue } = args;

  const filter: any = {};

  if (channelId) {
    filter.channelId = channelId;
  }

  if (searchValue) {
    filter.$or = [
      { name: new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i') },
      { content: new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i') },
    ];
  }

  return filter;
};

export const responseTemplateQueries = {
  async responseTemplates(
    _parent: undefined,
    args: { filter?: ResponseTemplatesFilter | null },

    { models }: IContext,
  ) {
    const filter: ResponseTemplatesFilter = args.filter ?? {};
    const filterQuery = generateFilter(filter);

    filterQuery.channelId = { $exists: true, $ne: null };

    if (filter.channelId) {
      filterQuery.channelId = filter.channelId;
    }

    return await cursorPaginate<IResponseTemplateDocument>({
      model: models.ResponseTemplates,
      params: {
        orderBy: {
          order: 'asc',
          createdAt: 'asc',
        },
        ...filter,
      },
      query: filterQuery,
    });
  },

  async responseTemplate(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ResponseTemplates.findById(_id);
  },
};
