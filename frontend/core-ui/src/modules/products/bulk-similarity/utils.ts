import { IMatrixRow, ISimilarityProduct } from './types';

export const combinationKey = (
  fieldIds: string[],
  combination: Record<string, string | string[]>,
): string =>
  fieldIds
    .map((fieldId) => {
      const value = combination[fieldId];
      return (Array.isArray(value) ? value[0] : value) ?? '';
    })
    .join(':');

export const generateCombinations = (
  fieldIds: string[],
  selection: Record<string, string[]>,
): Record<string, string>[] => {
  const hasSelection = fieldIds.some((id) => (selection[id] || []).length > 0);
  if (!hasSelection) return [];

  let combos: Record<string, string>[] = [{}];

  for (const fieldId of fieldIds) {
    const values = selection[fieldId] || [];
    if (!values.length) continue;

    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of values) {
        next.push({ ...combo, [fieldId]: value });
      }
    }
    combos = next;
  }

  return combos;
};

export const generateCodeSuffix = (
  fieldIds: string[],
  combination: Record<string, string>,
  labelOf: (fieldId: string, value: string) => string,
): string =>
  fieldIds
    .map((fieldId) => labelOf(fieldId, combination[fieldId]))
    .filter(Boolean)
    .join('-');

export const buildMatrix = ({
  fieldIds,
  selection,
  baseCode,
  products = [],
  starProductId,
  labelOf,
}: {
  fieldIds: string[];
  selection: Record<string, string[]>;
  baseCode: string;
  products?: ISimilarityProduct[];
  starProductId?: string;
  labelOf: (fieldId: string, value: string) => string;
}): IMatrixRow[] => {
  const combinations = generateCombinations(fieldIds, selection);

  const byKey = new Map<string, ISimilarityProduct>();
  for (const product of products) {
    const pd = (product.propertiesData || {}) as Record<
      string,
      string | string[]
    >;
    const key = combinationKey(fieldIds, pd);
    byKey.set(key, product);
  }

  return combinations.map((combination) => {
    const key = combinationKey(fieldIds, combination);
    const product = byKey.get(key);
    const suffix = generateCodeSuffix(fieldIds, combination, labelOf);

    return {
      key,
      productId: product?._id,
      combination,
      code: product?.code ?? `${baseCode}${suffix}`,
      unitPrice: product?.unitPrice,
      isExcluded: false,
      isStar: product ? product._id === starProductId : false,
    };
  });
};
