import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const buildSearchQuery = (searchValue?: string) =>
  searchValue
    ? [
        { code: { $regex: searchValue, $options: 'i' } },
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ]
    : [];

const appendAnd = (query: any, conditions: any[]) => {
  const safeConditions = conditions.filter(Boolean);
  if (!safeConditions.length) return query;

  query.$and = [...(query.$and || []), ...safeConditions];
  return query;
};

const queries: Record<string, Resolver> = {
  bmsCustomTourGroupList: async (
    _parent,
    args,
    { models }: IContext,
  ) => {
    const { branchId, searchValue } = args;
    const query = appendAnd(
      { branchId },
      buildSearchQuery(searchValue).length
        ? [{ $or: buildSearchQuery(searchValue) }]
        : [],
    );

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomTourFieldGroups,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  bmsCustomTourGroups: async (_parent, args, { models }: IContext) => {
    const { branchId, searchValue, tourType, tourId } = args;
    const query: any = appendAnd(
      { branchId },
      buildSearchQuery(searchValue).length
        ? [{ $or: buildSearchQuery(searchValue) }]
        : [],
    );

    if (tourType || tourId) {
      const visibilityOr: any[] = [];

      if (tourType) {
        visibilityOr.push(
          { customTourTypeIds: { $size: 0 } },
          { customTourTypeIds: tourType },
        );
      }

      if (tourId) {
        visibilityOr.push({ enabledTourIds: tourId });
      }

      appendAnd(query, [{ $or: visibilityOr }]);
    }

    const { list } = await cursorPaginate({
      model: models.CustomTourFieldGroups,
      params: args,
      query,
    });

    return list;
  },

  bmsCustomTourGroup: async (_parent, { _id }, { models }: IContext) => {
    return models.CustomTourFieldGroups.findOne({ _id });
  },

  bmsCustomTourTypeList: async (_parent, args, { models }: IContext) => {
    const { branchId, searchValue } = args;
    const query: any = appendAnd(
      {},
      buildSearchQuery(searchValue).length
        ? [{ $or: buildSearchQuery(searchValue) }]
        : [],
    );

    if (branchId) {
      query.branchId = branchId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomTourTypes,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  bmsCustomTourTypes: async (_parent, args, { models }: IContext) => {
    const { branchId, searchValue } = args;
    const query: any = appendAnd(
      {},
      buildSearchQuery(searchValue).length
        ? [{ $or: buildSearchQuery(searchValue) }]
        : [],
    );

    if (branchId) {
      query.branchId = branchId;
    }

    return models.CustomTourTypes.find(query).sort({ createdAt: -1 });
  },

  bmsCustomTourType: async (_parent, { _id }, { models }: IContext) => {
    return models.CustomTourTypes.findOne({ _id });
  },
};

export default queries;
