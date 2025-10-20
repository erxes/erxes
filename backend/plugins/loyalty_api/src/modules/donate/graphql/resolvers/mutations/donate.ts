import { IContext } from '~/connectionResolvers';

export const donateMutations = {
  createDonate: async (_parent: undefined, { name }, { models }: IContext) => {
    return models.Donate.createDonate({ name });
  },

  updateDonate: async (
    _parent: undefined,
    { _id, name },
    { models }: IContext,
  ) => {
    return models.Donate.updateDonate(_id, { name });
  },

  removeDonate: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Donate.removeDonate(_id);
  },
};
