// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const flowCategoryQueries = {
  flowCategories(
    _root,
    {
      parentId,
      searchValue,
      status
    }: { parentId: string; searchValue: string; status: string },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $nin: ['disabled', 'archived'] };

    if (status && status !== 'active') {
      filter.status = status;
    }

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.FlowCategories.find(filter)
      .sort({ order: 1 })
      .lean();
  },

  flowCategoriesTotalCount(_root, _params, { models }: IContext) {
    return models.FlowCategories.find().countDocuments();
  },

  flowCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.FlowCategories.findOne({ _id }).lean();
  }
};

// requireLogin(flowCategoryQueries, 'flowsTotalCount');
// checkPermission(flowCategoryQueries, 'flowCategories', 'showJobRefers');

export default flowCategoryQueries;
