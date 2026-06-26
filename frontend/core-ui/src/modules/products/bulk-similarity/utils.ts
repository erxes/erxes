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
