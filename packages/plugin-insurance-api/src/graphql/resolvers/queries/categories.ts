import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const queries = {
  insuranceCategoryList: async (
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
        models.Categories.find(qry).sort({ [sortField]: sortOrder }),
        {
          page,
          perPage
        }
      ),
      totalCount: models.Categories.find(qry).count()
    };
  },

  insuranceCategories: async (
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

    return paginate(models.Categories.find(qry), {
      page,
      perPage
    });
  },

  insuranceCategory: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Categories.findOne({ _id }).lean();
  }
};

export default queries;
