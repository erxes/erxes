import { IField, IFieldParams } from '@/properties/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (models: IModels, params: IFieldParams) => {
  const {
    contentType,
    contentTypeId,
    isVisible,
    searchable,
    groupIds,
    isVisibleToCreate,
  } = params;

  const filter: FilterQuery<IField> = { contentType };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (isVisible) {
    filter.isVisible = isVisible;
  }

  if (searchable) {
    filter.searchable = searchable;
  }

  const allGroupIds: string[] = [];

  if (isVisibleToCreate) {
    filter.isVisibleToCreate = isVisibleToCreate;

    const erxesDefinedGroup = await models.FieldsGroups.findOne({
      contentType,
      isDefinedByErxes: true,
      code: { $exists: false },
    }).lean();

    if (erxesDefinedGroup) {
      allGroupIds.push(erxesDefinedGroup._id.toString());
    }
  }

  if (groupIds?.length) {
    allGroupIds.push(...groupIds);
  }

  if (allGroupIds.length) {
    filter.groupId = { $in: allGroupIds };
  }

  return filter;
};

export const fieldQueries = {
  fields: async (_: undefined, params: IFieldParams, { models }: IContext) => {
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
