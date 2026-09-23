import {
  IField,
  IFieldCursorParams,
  IFieldDocument,
  IFieldOffsetParams,
  IFieldParams,
} from '@/properties/@types';
import { IFieldOptionUsageCount } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, defaultPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';
import {
  extractOptionValues,
  getFieldOptionUsedValues,
} from '~/modules/properties/db/models/fieldOptionUsage';

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

export const fieldQueries: Record<string, Resolver<any, any, IContext>> = {
  fields: async (
    _: undefined,
    { params }: { params: IFieldCursorParams },
    { models }: IContext,
  ) => {
    const filter = await generateFilter(models, params);

    if (!params.orderBy) {
      params.orderBy = { order: 1 };
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

  fieldOptionUsedValues: async (
    _: undefined,
    { fieldId }: { fieldId: string },
    { models, subdomain }: IContext,
  ): Promise<IFieldOptionUsageCount[] | null> => {
    const field = await models.Fields.findOne({ _id: fieldId }).lean();

    if (!field) {
      return null;
    }

    const values = extractOptionValues(field.options);

    if (!values.length) {
      return [];
    }

    return getFieldOptionUsedValues(models, subdomain, field, values);
  },
};

fieldQueries.cpFields.wrapperConfig = {
  forClientPortal: true,
};

fieldQueries.cpFieldDetail.wrapperConfig = {
  forClientPortal: true,
};
