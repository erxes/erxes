import { IContext } from '~/connectionResolvers';

export const spinQueries = {
  getSpin: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Spin.getSpin(_id);
  },

  getSpins: async (_parent: undefined, { models }: IContext) => {
    return models.Spin.getSpins();
  },
};
