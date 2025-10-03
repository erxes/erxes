import { IModels } from '~/connectionResolvers';
import { cursorPaginate, paginate } from 'erxes-api-shared/utils';

const queries = {
  bmsBranchList: async (
    _root,
    params,
    {
      commonQuerySelector,
      models,
    }: { models: IModels; commonQuerySelector: any },
  ) => {
    const filter = {
      ...commonQuerySelector,
    };

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Branches,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  bmsBranches: async (_root, params, { models }: { models: IModels }) => {
    return paginate(models.Branches.find(params), params);
  },

  bmsBranchDetail: async (_root, { _id }, { models }: { models: IModels }) => {
    return await models.Branches.get({ $or: [{ _id }, { token: _id }] });
  },
};

export default queries;
