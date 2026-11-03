import type { DealProductData } from '@/deals/utils/dealJson';

type ProductDataPatch = Partial<DealProductData>;

export const getProductsDraftPatches = (
  draft: DealProductData[],
  serverProductsData: DealProductData[],
) => {
  const serverById = new Map(
    serverProductsData.map((productData) => [productData._id, productData]),
  );

  return draft.reduce<Record<string, ProductDataPatch>>((patches, draftRow) => {
    const serverRow = serverById.get(draftRow._id);

    if (!serverRow) {
      return patches;
    }

    const patch = Object.fromEntries(
      Object.entries(draftRow).filter(
        ([key, value]) =>
          key !== '_id' &&
          key !== 'product' &&
          JSON.stringify(value) !==
            JSON.stringify(serverRow[key as keyof DealProductData]),
      ),
    ) as ProductDataPatch;

    if (Object.keys(patch).length) {
      patches[String(draftRow._id)] = patch;
    }

    return patches;
  }, {});
};
