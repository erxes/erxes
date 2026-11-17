import type { DealProductData } from '@/deals/utils/dealJson';

type ProductDataPatch = Partial<DealProductData>;

export const getProductsDataPatches = (
  next: DealProductData[],
  previous: DealProductData[],
) => {
  const previousById = new Map(
    previous.map((productData) => [productData._id, productData]),
  );

  return next.reduce<Record<string, ProductDataPatch>>((patches, nextRow) => {
    const previousRow = previousById.get(nextRow._id);

    if (!previousRow) {
      return patches;
    }

    const patch = Object.fromEntries(
      Object.entries(nextRow).filter(
        ([key, value]) =>
          key !== '_id' &&
          key !== 'product' &&
          JSON.stringify(value) !==
            JSON.stringify(previousRow[key as keyof DealProductData]),
      ),
    ) as ProductDataPatch;

    if (Object.keys(patch).length) {
      patches[String(nextRow._id)] = patch;
    }

    return patches;
  }, {});
};
