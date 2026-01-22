import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
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
      { name: new RegExp(`.*${searchValue}.*`, 'i') },
      { content: new RegExp(`.*${searchValue}.*`, 'i') },
    ];
  }

  return filter;
};

export const responseTemplateQueries = {
  async responseTemplates(
    _parent: undefined,
    { filter }: { filter: ResponseTemplatesFilter },

    { models }: IContext,
  ) {
    const filterQuery: any = {
      channelId: { $exists: true, $ne: null },
    };

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

  async responseTemplatesTotalCount(
    _parent: undefined,
    args: ResponseTemplatesFilter,
    { models }: IContext,
  ) {
    const filterQuery = generateFilter(args);

    return models.ResponseTemplates.find(filterQuery).countDocuments();
  },
};

requireLogin(responseTemplateQueries, 'responseTemplates');
requireLogin(responseTemplateQueries, 'responseTemplate');
requireLogin(responseTemplateQueries, 'responseTemplatesTotalCount');
