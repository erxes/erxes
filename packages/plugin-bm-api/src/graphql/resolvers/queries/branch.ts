import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

const queries = {
  bmsBranchList: async (
    _root,
    params,
    {
      commonQuerySelector,
      models,
    }: { models: IModels; commonQuerySelector: any },
  ) => {
    const list = paginate(models.BmsBranch.find(commonQuerySelector), params);
    return list;
  },

  bmsBranchDetail: async (_root, { _id }, { models }: { models: IModels }) => {
    return await models.BmsBranch.get({ $or: [{ _id }, { token: _id }] });
  },
};

export default queries;
