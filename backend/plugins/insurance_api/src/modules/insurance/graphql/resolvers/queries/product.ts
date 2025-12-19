import { IContext } from '~/connectionResolvers';

export const productQueries = {
  insuranceProducts: async (_parent: undefined, _args: any, { models }: IContext) => {
    return models.Product.find({}).populate('insuranceType');
  },

  insuranceProduct: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Product.findById(id).populate({
      path: 'insuranceType coveredRisks.risk',
    });
  },

  productsByType: async (_parent: undefined, { typeId }: { typeId: string }, { models }: IContext) => {
    return models.Product.find({ insuranceType: typeId }).populate('insuranceType');
  },
};