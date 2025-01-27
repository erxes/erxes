import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ITmsBranch } from '../../../models/definitions/tmsbranch';

interface IBmsBranchEdit extends ITmsBranch {
  _id: string;
}

const mutations = {
  tmsBranchAdd: async (
    _root,
    params: ITmsBranch,
    { models, user, subdomain }: IContext
  ) => {
    const branch = await models.TmsBranch.add(user, params);
    return branch;
  },

  tmsBranchEdit: async (
    _root,
    { _id, ...doc }: IBmsBranchEdit,
    { models, subdomain }: IContext
  ) => {
    const updatedDocument = await models.TmsBranch.edit(_id, { ...doc });
    return updatedDocument;
  },

  tmsBranchRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) => {
    const one = await models.TmsBranch.findById(_id);
    return await one?.deleteOne();
  }
};

export default mutations;
