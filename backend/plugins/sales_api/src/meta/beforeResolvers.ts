import { BeforeResolversConfig, sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const productMutationResolvers = ['productsRemove', 'productsMerge'] as const;

// Only these mutations carry a `productIds` array that we rewrite to the
// unused ids. `productsEdit` stays in the list but is allowed through as-is.
const productIdsResolvers = ['productsRemove', 'productsMerge'];

const getStringIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && id !== '')
    : [];

export const beforeResolvers: BeforeResolversConfig = {
  resolvers: {
    products: [...productMutationResolvers],
  },

  handler: async (subdomain, params) => {
    const { resolver, args = {} } = params;

    if (!productIdsResolvers.includes(resolver)) {
      return { status: 'ok' };
    }

    const productIds = getStringIds(args.productIds);

    if (!productIds.length) {
      return { status: 'ok' };
    }

    const models = await generateModels(subdomain);
    const requestedIdSet = new Set(productIds);
    // distinct() returns every productId in matching deals' productsData array,
    // not just the ones satisfying the $in filter, so it must be re-intersected.
    const matchedProductIds: string[] = await models.Deals.distinct(
      'productsData.productId',
      {
        'productsData.productId': { $in: productIds },
      },
    );
    const usedProductIds = matchedProductIds.filter((id) =>
      requestedIdSet.has(id),
    );

    if (!usedProductIds.length) {
      return { status: 'ok' };
    }

    // Soft-delete the products that are referenced by sales deals.
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'products',
      action: 'updateProducts',
      input: {
        query: { _id: { $in: usedProductIds } },
        doc: { status: 'deleted' },
      },
      defaultValue: null,
    });

    const usedSet = new Set(usedProductIds);
    const unusedProductIds = productIds.filter((id) => !usedSet.has(id));

    return {
      status: 'ok',
      args: { productIds: unusedProductIds },
    };
  },
};
