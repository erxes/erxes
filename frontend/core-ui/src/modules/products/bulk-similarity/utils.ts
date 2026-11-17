import {
  BulkRowFormValue,
  BulkSimilarityFormValues,
} from './constants/bulkSimilaritySchema';
import { IBulkSaveInput, ISimilarityProduct } from './types';

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
): string =>
  fieldIds
    .map((fieldId) => combination[fieldId])
    .filter(Boolean)
    .join('-');

export const generateName = (
  name: string,
  fieldIds: string[],
  combination: Record<string, string>,
  labelOf: (fieldId: string, value: string) => string,
): string =>
  [
    name,
    ...fieldIds.map((fieldId) => labelOf(fieldId, combination[fieldId])),
  ]
    .filter(Boolean)
    .join(' ');

const matchesKnownValues = (
  combination: Record<string, string>,
  known: Record<string, string | string[]>,
): boolean =>
  Object.entries(known).every(([fieldId, raw]) => {
    const value = Array.isArray(raw) ? raw[0] : raw;
    return !value || !combination[fieldId] || combination[fieldId] === value;
  });

// When a group starts from a product whose option values are empty or only
// cover some of the chosen variant fields, bind that product to the first
// compatible new combination so saving includes the source product.
const findFallbackSeedKey = ({
  combinations,
  fieldIds,
  productByKey,
  previousByKey,
  previousRows,
  starProduct,
}: {
  combinations: Record<string, string>[];
  fieldIds: string[];
  productByKey: Map<string, ISimilarityProduct>;
  previousByKey: Map<string, BulkRowFormValue>;
  previousRows: BulkRowFormValue[];
  starProduct: ISimilarityProduct;
}): string | undefined => {
  const keys = combinations.map((c) => combinationKey(fieldIds, c));
  const alreadyMatched = keys.some(
    (key) =>
      productByKey.get(key)?._id === starProduct._id ||
      previousByKey.get(key)?.productId === starProduct._id,
  );
  if (alreadyMatched) return undefined;

  const previousStarRow = previousRows.find(
    (row) => row.productId === starProduct._id,
  );
  const known =
    previousStarRow?.combination ||
    ((starProduct.propertiesData || {}) as Record<string, string | string[]>);

  const isUnassignedNewKey = (combo: Record<string, string>) => {
    const key = combinationKey(fieldIds, combo);
    return !productByKey.has(key) && !previousByKey.has(key);
  };

  const candidate =
    combinations.find(
      (combo) => isUnassignedNewKey(combo) && matchesKnownValues(combo, known),
    ) ?? combinations.find(isUnassignedNewKey);

  return candidate ? combinationKey(fieldIds, candidate) : undefined;
};

export const buildRows = ({
  fieldIds,
  selection,
  code,
  name = '',
  products = [],
  starProductId,
  labelOf,
  previousRows = [],
  baseCodeDirty = false,
  baseNameDirty = false,
}: {
  fieldIds: string[];
  selection: Record<string, string[]>;
  code: string;
  name?: string;
  products?: ISimilarityProduct[];
  starProductId?: string;
  labelOf: (fieldId: string, value: string) => string;
  previousRows?: BulkRowFormValue[];
  baseCodeDirty?: boolean;
  baseNameDirty?: boolean;
}): BulkRowFormValue[] => {
  const combinations = generateCombinations(fieldIds, selection);

  const productByKey = new Map<string, ISimilarityProduct>();
  for (const product of products) {
    const pd = (product.propertiesData || {}) as Record<
      string,
      string | string[]
    >;
    productByKey.set(combinationKey(fieldIds, pd), product);
  }

  const previousByKey = new Map(previousRows.map((row) => [row.key, row]));

  const starProduct = starProductId
    ? products.find((p) => p._id === starProductId)
    : undefined;
  if (starProduct && combinations.length > 0) {
    const fallbackKey = findFallbackSeedKey({
      combinations,
      fieldIds,
      productByKey,
      previousByKey,
      previousRows,
      starProduct,
    });
    if (fallbackKey !== undefined) {
      productByKey.set(fallbackKey, starProduct);
    }
  }

  return combinations.map((combination) => {
    const key = combinationKey(fieldIds, combination);
    const product = productByKey.get(key);
    const previous = previousByKey.get(key);
    const suffix = generateCodeSuffix(fieldIds, combination);
    const derivedCode = `${code}${suffix}`;
    const autoCode = baseCodeDirty ? derivedCode : (product?.code ?? derivedCode);
    const derivedName = generateName(name, fieldIds, combination, labelOf);
    const autoName = baseNameDirty
      ? derivedName
      : (product?.name ?? derivedName);

    if (previous) {
      if (previous.codeEdited && previous.nameEdited) return previous;
      return {
        ...previous,
        productId: product?._id ?? previous.productId,
        code: previous.codeEdited ? previous.code : autoCode,
        name: previous.nameEdited ? previous.name : autoName,
      };
    }

    return {
      key,
      productId: product?._id,
      combination,
      code: autoCode,
      codeEdited: false,
      name: autoName,
      nameEdited: false,
      unitPrice: product?.unitPrice,
      isExcluded: false,
      isStar: product ? product._id === starProductId : false,
    };
  });
};

export const toSavePayload = ({
  properties,
  rows,
  ...info
}: BulkSimilarityFormValues): IBulkSaveInput => ({
  info,
  propertiesData: Object.fromEntries(
    properties
      .filter((p) => p.values.length > 0)
      .map((p) => [p.fieldId, p.values]),
  ),
  rows: rows.map(
    ({ productId, code, name, unitPrice, isExcluded, isStar, combination }) => ({
      productId,
      code,
      name,
      unitPrice,
      isExcluded,
      ...(isStar ? { isDefault: true } : {}),
      propertiesData: Object.fromEntries(
        Object.entries(combination).map(([fieldId, value]) => [
          fieldId,
          [value],
        ]),
      ),
    }),
  ),
});
