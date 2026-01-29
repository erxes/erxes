import { IContext } from '~/connectionResolvers';
import { checkPermission } from 'erxes-api-shared/core-modules';

export const scoreMutations = {
  createScore: async (_parent: undefined, doc, { models }: IContext) => {
    return models.Score.changeScore(doc);
  },
};

checkPermission(scoreMutations, 'changeScore', 'adjustLoyaltyScore');