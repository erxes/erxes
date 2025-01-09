import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IBmsBranch } from '../../../models/definitions/bmsbranch';

interface IBmsBranchEdit extends IBmsBranch {
  _id: string;
}

const mutations = {
  bmsBranchAdd: async (
    _root,
    params: IBmsBranch,
    { models, user, subdomain }: IContext,
  ) => {
    const branch = await models.BmsBranch.add(user, params);
    return branch;
  },

  bmsBranchEdit: async (
    _root,
    { _id, ...doc }: IBmsBranchEdit,
    { models, subdomain }: IContext,
  ) => {
    const updatedDocument = await models.BmsBranch.edit(_id, { ...doc });
    return updatedDocument;
  },

  bmsBranchRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) => {
    const one = await models.BmsBranch.findById(_id);
    return await one?.deleteOne();
  },
};

export default mutations;
