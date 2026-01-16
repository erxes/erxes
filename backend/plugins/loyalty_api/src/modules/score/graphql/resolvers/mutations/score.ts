import { IContext } from '~/connectionResolvers';

export const scoreMutations = {
  createScore: async (_parent: undefined, doc, { models }: IContext) => {
    return models.Score.changeScore(doc);
  },
};
