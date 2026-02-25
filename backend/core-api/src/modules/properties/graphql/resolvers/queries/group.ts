import {
  IFieldGroup,
  IFieldGroupCursorParams,
  IFieldGroupDocument,
  IFieldGroupOffsetParams,
  IFieldGroupParams,
} from '@/properties/@types';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, defaultPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = async (params: Partial<IFieldGroupParams>) => {
  const { contentType, contentTypeId, codes } = params;

  const filter: FilterQuery<IFieldGroup> = {
    contentType,
  };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (codes && codes.length > 0) {
    filter.code = { $in: codes };
  }

  return filter;
};

export const groupQueries: Record<string, Resolver> = {
  fieldGroups: async (
    _: undefined,
    { params }: { params: IFieldGroupCursorParams },
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    return await cursorPaginate<IFieldGroupDocument>({
      model: models.FieldsGroups,
      params,
      query: filter,
    });
  },

  cpFieldGroups: async (
    _: undefined,
    { params }: { params: IFieldGroupOffsetParams },
    { models }: IContext,
  ) => {
    const { sortField = 'code', sortDirection = 1 } = params || {};

    const filter = await generateFilter(params);

    return defaultPaginate(
      models.FieldsGroups.find(filter).sort({ [sortField]: sortDirection }),
      params,
    );
  },
};

groupQueries.cpFieldGroups.wrapperConfig = {
  forClientPortal: true,
};
