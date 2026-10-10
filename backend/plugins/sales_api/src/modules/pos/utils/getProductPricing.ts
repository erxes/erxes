import { chunkArray, sendTRPCMessage } from 'erxes-api-shared/utils';

type PricingProduct = {
  _id: string;
  unitPrice: number;
};

type ProductPricing = Record<string, { value: number }>;

export const getProductPricing = async (
  subdomain: string,
  pos: { departmentId?: string; branchId?: string },
  products: PricingProduct[],
): Promise<ProductPricing> => {
  const pricing: ProductPricing = {};

  // Query inputs travel in the URL; keep catalog sync requests small.
  for (const batches of chunkArray(chunkArray(products, 100), 4)) {
    const batchResults: ProductPricing[] = await Promise.all(
      batches.map((batch) =>
        sendTRPCMessage({
          subdomain,
          pluginName: 'loyalty',
          module: 'pricing',
          action: 'checkPricing',
          throwOnError: true,
          input: {
            prioritizeRule: 'only',
            totalAmount: 0,
            departmentId: pos.departmentId,
            branchId: pos.branchId,
            products: batch.map((product) => ({
              itemId: product._id,
              productId: product._id,
              quantity: 1,
              price: product.unitPrice,
            })),
          },
          defaultValue: {},
        }),
      ),
    );

    for (const batchPricing of batchResults) {
      Object.assign(pricing, batchPricing);
    }
  }

  return pricing;
};
