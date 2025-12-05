import { IField, IFieldParams } from '@/properties/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (models: IModels, params: IFieldParams) => {
  const { contentType, contentTypeId, groupIds } = params;

  const filter: FilterQuery<IField> = { contentType };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (groupIds?.length) {
    filter.groupId = { $in: groupIds };
  }

  return filter;
};

export const fieldQueries = {
  fields: async (
    _: undefined,
    { params }: { params: IFieldParams },
    { models }: IContext,
  ) => {
    const filter = await generateFilter(models, params);

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    return await cursorPaginate({
      model: models.Fields,
      params,
      query: filter,
    });
  },

  fieldDetail: async (
    _: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Fields.getField({ _id });
  },
};
