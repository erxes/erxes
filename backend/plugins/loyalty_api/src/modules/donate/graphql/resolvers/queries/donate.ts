import { IContext } from '~/connectionResolvers';

export const donateQueries = {
  getDonate: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Donate.getDonate(_id);
  },

  getDonates: async (_parent: undefined, { models }: IContext) => {
    return models.Donate.getDonates();
  },
};
