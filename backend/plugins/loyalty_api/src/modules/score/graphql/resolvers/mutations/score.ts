
  import { IContext } from '~/connectionResolvers';

  export const scoreMutations = {
    createScore: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Score.createScore({name});
    },

    updateScore: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Score.updateScore(_id, {name});
    },

    removeScore: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Score.removeScore(_id);
    },
  };

