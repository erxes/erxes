// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';

import { sendProductsMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';

const getFilter = ({
  parentId,
  searchValue,
  status
}: {
  parentId: string;
  searchValue: string;
  status: string;
}) => {
  const filter: any = {};

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
  return filter;
};
const flowCategoryQueries = {
  async flowCategories(
    _root,
    {
      parentId,
      searchValue,
      status
    }: { parentId: string; searchValue: string; status: string },
    { subdomain }: IContext
  ) {
    const query = getFilter({ parentId, searchValue, status });

    return await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: { query, sort: { order: 1 } },
      isRPC: true,
      defaultValue: []
    });
  },

  async flowCategoriesTotalCount(
    _root,
    {
      parentId,
      searchValue,
      status
    }: { parentId: string; searchValue: string; status: string },
    { subdomain }: IContext
  ) {
    const query = getFilter({ parentId, searchValue, status });

    return await sendProductsMessage({
      subdomain,
      action: 'categories.count',
      data: { query },
      isRPC: true,
      defaultValue: []
    });
  }
};

// requireLogin(flowCategoryQueries, 'flowsTotalCount');
// checkPermission(flowCategoryQueries, 'flowCategories', 'showJobs');

export default flowCategoryQueries;
