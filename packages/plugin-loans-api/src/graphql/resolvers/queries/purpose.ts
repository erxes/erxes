import { paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { escapeRegExp } from '@erxes/api-utils/src/core';

const generateFilter = async (params, models, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.name = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
  }

  if (params.hasParentId) {
    filter.parentId = { $exists: false };
  }

  if (params.parentId) {
    if (params.withChild) {
      const category = await (models as IModels).LoanPurpose.getPurpose({
        _id: params.parentId,
      });

      const relatedCategoryIds = (
        await models.ProductCategories.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: 1 }
        ).lean()
      ).map((c) => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = params.parentId;
    }
  }

  return filter;
};

const purposeQueries = {
  /**
   * Purpose for only list
   */

  purposesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, models, commonQuerySelector);

    return {
      list: await paginate(models.LoanPurpose.find(filter), {
        page: params.page,
        perPage: params.perPage,
      }),
      totalCount: await models.LoanPurpose.find(filter).countDocuments(),
    };
  },
};

moduleRequireLogin(purposeQueries);

export default purposeQueries;
