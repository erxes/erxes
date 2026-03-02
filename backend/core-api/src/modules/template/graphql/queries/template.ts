import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITemplateDocument, ITemplateParams } from '../../@types';
import { FilterQuery } from 'mongoose';

const generateFilter = async (params: ITemplateParams) => {
  const { searchValue, categoryIds, contentType } = params;

  const filter: FilterQuery<ITemplateDocument> = {};

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (categoryIds?.length) {
    filter.categoryIds = { $in: categoryIds };
  }

  if (contentType) {
    filter.contentType = contentType;
  }

  return filter;
};

const templateQueries = {
  templateList: async (
    _root: undefined,
    params: ITemplateParams,
    { models }: IContext,
  ) => {
    const filter: FilterQuery<ITemplateDocument> = await generateFilter(params);

    return await cursorPaginate({
      model: models.Template,
      params: { ...params, orderBy: { createdAt: -1 } },
      query: filter,
    });
  },

  templateDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Template.getTemplate(_id);
  },
};

export default templateQueries;
