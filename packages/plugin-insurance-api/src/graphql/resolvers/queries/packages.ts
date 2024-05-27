import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  insurancePackageList: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: string;
    },
    { models }: IContext
  ) => {
    const qry: any = {};

    if (searchValue) {
      qry.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    return {
      list: paginate(
        models.Packages.find(qry).sort({ [sortField]: sortOrder }),
        {
          page,
          perPage
        }
      ),
      totalCount: models.Packages.find(qry).count()
    };
  },

  insurancePackages: async (
    _root,
    {
      searchValue,
      page,
      perPage
    }: { searchValue: string; page: number; perPage: number },
    { models }: IContext
  ) => {
    const qry: any = {};

    if (searchValue) {
      qry.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    return paginate(models.Packages.find(qry), {
      page,
      perPage
    });
  },

  insurancePackage: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Packages.findOne({ _id }).lean();
  }
};

export default queries;
