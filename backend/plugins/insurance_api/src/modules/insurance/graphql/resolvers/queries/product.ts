import { IContext } from '~/connectionResolvers';

export const productQueries = {
  insuranceProducts: async (_parent: undefined, _args: any, { models }: IContext) => {
    return models.Product.find({});
  },

  insuranceProduct: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Product.findById(id);
  },

  productsByType: async (_parent: undefined, { typeId }: { typeId: string }, { models }: IContext) => {
    return models.Product.find({ insuranceTypeId: typeId });
  },
};