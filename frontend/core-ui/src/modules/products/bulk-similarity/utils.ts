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
  labelOf: (fieldId: string, value: string) => string,
): string =>
  fieldIds
    .map((fieldId) => labelOf(fieldId, combination[fieldId]))
    .filter(Boolean)
    .join('-');

// regenerates rows for the current property selection, carrying over
// user edits (code/unitPrice/isExcluded/isStar) for combinations that still exist
export const buildRows = ({
  fieldIds,
  selection,
  code,
  products = [],
  starProductId,
  labelOf,
  previousRows = [],
}: {
  fieldIds: string[];
  selection: Record<string, string[]>;
  code: string;
  products?: ISimilarityProduct[];
  starProductId?: string;
  labelOf: (fieldId: string, value: string) => string;
  previousRows?: BulkRowFormValue[];
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
    const suffix = generateCodeSuffix(fieldIds, combination, labelOf);
    const autoCode = product?.code ?? `${code}${suffix}`;

    if (previous) {
      return {
        ...previous,
        productId: product?._id ?? previous.productId,
        // keep the user's hand-typed code; otherwise re-derive from the
        // current base code + field suffix so base-code edits propagate
        code: previous.codeEdited ? previous.code : autoCode,
      };
    }

    return {
      key,
      productId: product?._id,
      combination,
      code: autoCode,
      codeEdited: false,
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
    ({ productId, code, unitPrice, isExcluded, isStar, combination }) => ({
      productId,
      code,
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
