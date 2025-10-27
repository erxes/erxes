import { IFieldGroup, IFieldGroupParams } from '@/properties/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = async (params: IFieldGroupParams) => {
  const { contentType, contentTypeId, isDefinedByErxes, codes } = params;

  const filter: FilterQuery<IFieldGroup> = {
    contentType,
  };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (isDefinedByErxes) {
    filter.isDefinedByErxes = isDefinedByErxes;
  }

  if (codes && codes.length > 0) {
    filter.code = { $in: codes };
  }

  return filter;
};

export const groupQueries = {
  fieldsGroups: async (
    _: undefined,
    params: IFieldGroupParams,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    return await cursorPaginate({
      model: models.FieldsGroups,
      params,
      query: filter,
    });
  },
};
