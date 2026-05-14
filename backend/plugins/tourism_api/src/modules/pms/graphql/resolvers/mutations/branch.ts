import { IContext } from '~/connectionResolvers';
import { IPmsBranch, IPmsBranchEdit } from '~/modules/pms/@types/branch';

const branchMutations = {
  async pmsBranchAdd(_root, params: IPmsBranch, { models, user }: IContext) {
    const branch = await models.PmsBranch.add(user, params);
    return branch;
  },

  async pmsBranchEdit(
    _root,
    { _id, ...doc }: IPmsBranchEdit,
    { models }: IContext,
  ) {
    const updatedDocument = await models.PmsBranch.edit(_id, { ...doc });
    return updatedDocument;
  },

  async pmsBranchRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const one = await models.PmsBranch.deleteOne({ _id });
    return one as any;
  },
};
export default branchMutations;
