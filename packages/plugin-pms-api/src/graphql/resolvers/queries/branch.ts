import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext, IModels } from "../../../connectionResolver";
import { paginate } from "@erxes/api-utils/src/core";

const queries = {
  pmsBranchList: async (
    _root,
    params,
    {
      commonQuerySelector,
      models
    }: { models: IModels; commonQuerySelector: any }
  ) => {
    const list = paginate(models.TmsBranch.find(commonQuerySelector), params);
    return list;
  },

  pmsBranchDetail: async (_root, { _id }, { models }: { models: IModels }) => {
    return await models.TmsBranch.get({ $or: [{ _id }, { token: _id }] });
  }
};

export default queries;
