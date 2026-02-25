import { IBundleConditionDocument } from '@/bundle/@types';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const bundleConditionQueries = {
  async allBundleConditions(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.BundleCondition.find({}).lean();
  },

  async bundleConditions(
    _root: undefined,
    params: { searchValue: string } & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const { searchValue } = params || {};

    const query: FilterQuery<IBundleConditionDocument> = {};

    if (searchValue) {
      query.name = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    }

    return models.BundleCondition.find(query).sort({ createdAt: -1 }).lean();
  },

  async bundleConditionDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.BundleCondition.findOne({ _id }).lean();
  },

  async bundleConditionTotalCount(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.BundleCondition.find({}).countDocuments();
  },
};
