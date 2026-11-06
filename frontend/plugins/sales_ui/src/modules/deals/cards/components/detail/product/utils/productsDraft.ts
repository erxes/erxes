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

export type ProductsDraftPatches = Record<string, ProductDataPatch>;

export const keepServerDraftPatches = (
  patches: ProductsDraftPatches | null,
  serverProductsData: DealProductData[],
): ProductsDraftPatches => {
  if (!patches) {
    return {};
  }

  const serverIds = new Set(
    serverProductsData.map((productData) => String(productData._id)),
  );

  return Object.fromEntries(
    Object.entries(patches).filter(([id]) => serverIds.has(id)),
  );
};

export const applyProductsDraftPatches = (
  productsData: DealProductData[],
  patches: ProductsDraftPatches,
) =>
  productsData.map((productData) => {
    const patch = patches[String(productData._id)];

    return patch ? { ...productData, ...patch } : productData;
  });
