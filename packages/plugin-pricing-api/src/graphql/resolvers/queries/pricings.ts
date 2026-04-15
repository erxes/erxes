import { IContext } from '../../../connectionResolver';
import { checkPricing } from '../../../utils';

const pricingsQueries = {
  pricingCheckDiscount: async (
    _root,
    params: {
      prioritizeRule?: string,
      totalAmount: number,
      departmentId: string,
      branchId: string,
      pipelineId: string,
      products: Array<{
        itemId: string;
        productId: string;
        quantity: number;
        price: number;
        manufacturedDate?: string;
      }>;
    },
    { models, subdomain }: IContext
  ) => {
    const { prioritizeRule = 'exclude', totalAmount, departmentId, branchId, products, pipelineId } =
      params;

    return await checkPricing(
      models,
      subdomain,
      prioritizeRule,
      totalAmount,
      departmentId,
      branchId,
      pipelineId,
      products
    );
  },
};

export default pricingsQueries;
