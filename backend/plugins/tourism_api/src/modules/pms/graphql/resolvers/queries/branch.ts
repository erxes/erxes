import { IModels } from '~/connectionResolvers';
import { cursorPaginate, paginate } from 'erxes-api-shared/utils';

const queries = {
  pmsBranchList: async (
    _root,
    params,
    {
      commonQuerySelector,
      models,
    }: { models: IModels; commonQuerySelector: any },
  ) => {
    const list = paginate(models.PmsBranch.find(commonQuerySelector), params);
    return list;
  },

  pmsBranchDetail: async (_root, { _id }, { models }: { models: IModels }) => {
    return await models.PmsBranch.get({ $or: [{ _id }, { token: _id }] });
  },
};

export default queries;
