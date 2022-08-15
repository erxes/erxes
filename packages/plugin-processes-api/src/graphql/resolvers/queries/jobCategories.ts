// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const jobCategoryQueries = {
  jobCategories(
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

    console.log('jobCategories:', filter);

    return models.JobCategories.find(filter)
      .sort({ order: 1 })
      .lean();
  },

  jobCategoriesTotalCount(_root, _params, { models }: IContext) {
    return models.JobCategories.find().countDocuments();
  },

  jobCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.JobCategories.findOne({ _id }).lean();
  }
};

// requireLogin(jobCategoryQueries, 'jobsTotalCount');
// checkPermission(jobCategoryQueries, 'jobCategories', 'showJobRefers');

export default jobCategoryQueries;
