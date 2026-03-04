import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ITemplateDocument, ITemplateParams } from '../../@types';

const generateFilter = async (params: ITemplateParams) => {
  const {
    searchValue,
    categoryIds,
    contentType,
    createdBy,
    updatedBy,
    dateFilters,
  } = params;

  const filter: FilterQuery<ITemplateDocument> = {};

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (categoryIds?.length) {
    filter.categoryIds = { $in: categoryIds };
  }

  if (contentType?.length) {
    filter.contentType = { $in: contentType };
  }

  if (contentType?.length) {
    filter.contentType = { $in: contentType };
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (updatedBy) {
    filter.updatedBy = updatedBy;
  }

  if (dateFilters) {
    try {
      const dateFilter = JSON.parse(dateFilters || '{}');

      for (const [key, value] of Object.entries(dateFilter)) {
        const { gte, lte } = (value || {}) as { gte?: string; lte?: string };

        if (gte || lte) {
          filter[key] = {};

          if (gte) {
            filter[key]['$gte'] = gte;
          }

          if (lte) {
            filter[key]['$lte'] = lte;
          }
        }
      }
    } catch (error) {
      throw new Error(`Invalid dateFilters: ${error.message}`);
    }
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
