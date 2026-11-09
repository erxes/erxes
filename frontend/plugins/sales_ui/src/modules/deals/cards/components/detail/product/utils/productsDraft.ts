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

export type ProductsDraftBase = Pick<DealProductData, 'quantity' | 'unitPrice'>;

export type ProductsDraft = Record<
  string,
  { patch: ProductDataPatch; base: ProductsDraftBase }
>;

const DRAFT_BASE_TOLERANCE = 0.0001;

const isSameDraftBaseValue = (a?: number | null, b?: number | null) =>
  Math.abs((a ?? 0) - (b ?? 0)) < DRAFT_BASE_TOLERANCE;

export const getProductsDraftBase = (
  productData: DealProductData,
): ProductsDraftBase => ({
  quantity: productData.quantity,
  unitPrice: productData.unitPrice,
});

export const keepServerDraftPatches = (
  draft: ProductsDraft | null,
  serverProductsData: DealProductData[],
): ProductsDraftPatches => {
  if (!draft) {
    return {};
  }

  const serverById = new Map(
    serverProductsData.map((productData) => [
      String(productData._id),
      productData,
    ]),
  );

  return Object.fromEntries(
    Object.entries(draft)
      .filter(([id, { base }]) => {
        const serverRow = serverById.get(id);

        return (
          Boolean(serverRow) &&
          isSameDraftBaseValue(serverRow?.quantity, base.quantity) &&
          isSameDraftBaseValue(serverRow?.unitPrice, base.unitPrice)
        );
      })
      .map(([id, { patch }]) => [id, patch]),
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
