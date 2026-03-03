import {
  IField,
  IFieldCursorParams,
  IFieldDocument,
  IFieldOffsetParams,
  IFieldParams,
} from '@/properties/@types';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, defaultPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (
  models: IModels,
  params: Partial<IFieldParams>,
) => {
  const { contentType, contentTypeId, groupId } = params;

  const filter: FilterQuery<IField> = { contentType };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (groupId) {
    filter.groupId = groupId;
  }

  return filter;
};

export const fieldQueries: Record<string, Resolver> = {
  fields: async (
    _: undefined,
    { params }: { params: IFieldCursorParams },
    { models }: IContext,
  ) => {
    const filter = await generateFilter(models, params);

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    return await cursorPaginate<IFieldDocument>({
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

  cpFields: async (
    _: undefined,
    { params }: { params: IFieldOffsetParams },
    { models }: IContext,
  ) => {
    const { sortField = 'code', sortDirection = 1 } = params || {};

    const filter = await generateFilter(models, params);

    return await defaultPaginate(
      models.Fields.find(filter).sort({ [sortField]: sortDirection }),
      params,
    );
  },

  cpFieldDetail: async (
    _: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Fields.getField({ _id });
  },
};

fieldQueries.cpFields.wrapperConfig = {
  forClientPortal: true,
};

fieldQueries.cpFieldDetail.wrapperConfig = {
  forClientPortal: true,
};
