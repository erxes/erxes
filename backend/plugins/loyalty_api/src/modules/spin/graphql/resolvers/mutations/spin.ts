import { IContext } from '~/connectionResolvers';

export const spinMutations = {
  createSpin: async (_parent: undefined, { name }, { models }: IContext) => {
    return models.Spin.createSpin({ name });
  },

  updateSpin: async (
    _parent: undefined,
    { _id, name },
    { models }: IContext,
  ) => {
    return models.Spin.updateSpin(_id, { name });
  },

  removeSpin: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Spin.removeSpin(_id);
  },
};
