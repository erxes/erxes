import { IContext } from '~/connectionResolvers';

export const scoreQueries = {
  getScore: async (
    _parent: undefined,
    { ownerId, ownerType },
    { models }: IContext,
  ) => {
    return models.Score.getScore(ownerId, ownerType);
  },
};
