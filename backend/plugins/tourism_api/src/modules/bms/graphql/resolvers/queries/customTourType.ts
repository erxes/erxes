import { cursorPaginate } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const queries: Record<string, Resolver> = {
  bmsCustomTourGroupList: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ) => {
    const { branchId, searchValue } = args;

    const query: any = {
      branchId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomTourFieldGroups,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  bmsCustomTourGroups: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> => {
    const { branchId, searchValue, tourType, tourId } = args;

    const query: any = {
      branchId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (tourType) {
      query.customTourTypeIds = tourType;
    }

    if (tourId) {
      query.enabledTourIds = tourId;
    }

    const { list } = await cursorPaginate({
      model: models.CustomTourFieldGroups,
      params: args,
      query,
    });

    return list;
  },

  async bmsCustomTourGroup(_parent: any, args: any, { models }: IContext) {
    const { _id } = args;
    return models.CustomTourFieldGroups.findOne({ _id });
  },

  bmsCustomTourTypeList: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> => {
    const { searchValue, branchId } = args;

    const query: any = {};

    if (branchId) {
      query.branchId = branchId;
    }

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomTourTypes,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  bmsCustomTourTypes: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> => {
    const { searchValue, branchId } = args;

    const query: any = {};

    if (branchId) {
      query.branchId = branchId;
    }

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const customTypes = await models.CustomTourTypes.find(query).sort({
      createdAt: -1,
    });

    return customTypes || [];
  },

  bmsCustomTourType: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> => {
    const { _id } = args;

    return models.CustomTourTypes.findOne({ _id });
  },
};

export default queries;
