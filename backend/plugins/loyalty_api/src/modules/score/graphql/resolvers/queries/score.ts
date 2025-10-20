
  import { IContext } from '~/connectionResolvers';

   export const scoreQueries = {
    getScore: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Score.getScore(_id);
    },
    
    getScores: async (_parent: undefined, { models }: IContext) => {
      return models.Score.getScores();
    },
  };
