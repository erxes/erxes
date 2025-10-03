import { IContext } from '~/connectionResolvers';
export const branchsMutations = {
  async branchesAdd(_parent: undefined, doc, { user, models }: IContext) {
    const branch = await models.Branches.createBranch(doc, user);

    return branch;
  },

  async branchesEdit(
    _parent: undefined,
    { _id, ...doc },
    { user, models }: IContext,
  ) {
    const branch = await models.Branches.updateBranch(_id, doc, user);

    return branch;
  },

  async branchesRemove(_parent: undefined, { ids }, { models }: IContext) {
    if (!ids.length) {
      throw new Error('You must specify at least one branch id to remove');
    }
    const deleteResponse = await models.Branches.removeBranches(ids);
    return deleteResponse;
  },
};
