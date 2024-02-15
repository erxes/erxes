export const queries = {
  checkPricing: async (root, args, { dataSources }) => {
    return await dataSources.pricingAPI.checkPricing(args);
  }
};
