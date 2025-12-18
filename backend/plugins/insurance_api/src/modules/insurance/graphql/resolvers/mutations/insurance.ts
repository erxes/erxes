
  import { IContext } from '~/connectionResolvers';

  export const insuranceMutations = {
    createInsurance: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Insurance.createInsurance({name});
    },

    updateInsurance: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Insurance.updateInsurance(_id, {name});
    },

    removeInsurance: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Insurance.removeInsurance(_id);
    },
  };

