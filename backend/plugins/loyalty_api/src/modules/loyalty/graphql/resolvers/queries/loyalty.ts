
  import { IContext } from '~/connectionResolvers';

   export const loyaltyQueries = {
    getLoyalty: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Loyalty.getLoyalty(_id);
    },
    
    getLoyaltys: async (_parent: undefined, { models }: IContext) => {
      return models.Loyalty.getLoyaltys();
    },
  };
