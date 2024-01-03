import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  risksPaginated: async (
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
      risks: paginate(models.Risks.find(qry).sort({ [sortField]: sortOrder }), {
        page,
        perPage
      }),
      count: models.Risks.find(qry).count()
    };
  },

  risks: async (
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

    return paginate(models.Risks.find(qry), {
      page,
      perPage
    });
  },

  risk: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return models.Risks.findOne({ _id }).lean();
  }
};

export default queries;
