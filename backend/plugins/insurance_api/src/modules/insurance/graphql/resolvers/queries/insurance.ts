
  import { IContext } from '~/connectionResolvers';

   export const insuranceQueries = {
    getInsurance: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Insurance.getInsurance(_id);
    },
    
    getInsurances: async (_parent: undefined, { models }: IContext) => {
      return models.Insurance.getInsurances();
    },
  };
