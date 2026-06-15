import { BeforeResolversConfig } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const productMutationResolvers = [
  'productsEdit',
  'productsRemove',
  'productsMerge',
] as const;

const getStringIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && id !== '')
    : [];

const getProductIds = (
  resolver: string,
  args: Record<string, unknown>,
): string[] => {
  if (resolver === 'productsEdit') {
    return typeof args._id === 'string' && args._id !== '' ? [args._id] : [];
  }

  if (resolver === 'productsRemove' || resolver === 'productsMerge') {
    return getStringIds(args.productIds);
  }

  return [];
};

export const beforeResolvers: BeforeResolversConfig = {
  resolvers: {
    products: [...productMutationResolvers],
  },

  handler: async (subdomain, params) => {
    const { resolver, args = {} } = params;
    const productIds = getProductIds(resolver, args);

    if (!productIds.length) {
      return { status: 'ok' };
    }

    const models = await generateModels(subdomain);
    const usedProductIds: string[] = await models.Deals.distinct(
      'productsData.productId',
      {
        'productsData.productId': { $in: productIds },
      },
    );

    if (usedProductIds.length > 0) {
      return {
        status: 'blocked',
        code: 'PRODUCT_USED_IN_SALES_DEALS',
        message:
          'Cannot update or remove product because it is used in sales deals.',
        details: {
          productIds: usedProductIds,
        },
      };
    }

    return { status: 'ok' };
  },
};
