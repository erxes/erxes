import { IBranch } from '@/bms/@types/branch';
import { IContext } from '~/connectionResolvers';

const mutations = {
  bmsBranchAdd: async (_root, params: IBranch, { models, user }: IContext) => {
    return models.Branches.add(user, params);
  },

  bmsBranchEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const updatedDocument = await models.Branches.edit(_id, doc as IBranch);
    return updatedDocument;
  },

  bmsBranchRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const branch = await models.Branches.findOne({ _id });

    if (!branch) {
      throw new Error('Branch not found');
    }

    await branch.deleteOne();

    return {
      _id,
      message: 'Branch deleted successfully',
    };
  },
};

export default mutations;
