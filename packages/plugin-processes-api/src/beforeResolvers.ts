import { IModels } from './connectionResolver';

export default {
  contacts: ['productsRemove']
};

export const beforeResolverHandlers = async (models: IModels, params) => {
  const { args } = params;
  const productIds = args.productIds;
  const jobRefers = await models.JobRefers.find({
    $or: [
      { 'needProducts.productId': productIds },
      { 'resultProducts.productId': productIds }
    ]
  });

  if (jobRefers.length > 0) {
    throw new Error('This product used on Processes->Job');
  }
};
