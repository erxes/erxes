import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';

type ProductSubUom = {
  uom?: string | null;
  ratio?: number | string | null;
};

type ProductWithSubUoms = DealProduct & {
  subUoms?: ProductSubUom[] | null;
};

export type ProductUomInfo = {
  uom: string;
  ratio: number;
  unitPrice: number;
  quantity: number;
};

export type ProductDataWithUom = DealProductData;

const cleanUomCode = (uom?: string | null) => uom?.trim() || '';
const precise = (value: number): number => Number(value.toPrecision(15));
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isValidRatio = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const getEntryValues = (
  row: Pick<DealProductData, 'unitPrice' | 'quantity'>,
  ratio: number,
): Pick<ProductUomInfo, 'unitPrice' | 'quantity'> => ({
  unitPrice: ratio === 1 ? row.unitPrice ?? 0 : (row.unitPrice ?? 0) / ratio,
  quantity:
    ratio === 1 ? row.quantity || 0 : precise((row.quantity || 0) * ratio),
});

export const getProductDefaultUom = (product?: DealProduct) =>
  cleanUomCode(product?.uom);

export const getProductBaseUom = (row: ProductDataWithUom) =>
  cleanUomCode(row.uom) || getProductDefaultUom(row.product);

export const getProductUomRatio = (
  product: ProductWithSubUoms | undefined,
  uom: string,
  baseUom = getProductDefaultUom(product),
): number | undefined => {
  if (uom === baseUom) return 1;

  const ratio = Number(
    product?.subUoms?.find((subUom) => cleanUomCode(subUom.uom) === uom)?.ratio,
  );
  return isValidRatio(ratio) ? ratio : undefined;
};

export const getProductUomInfo = (row: ProductDataWithUom): ProductUomInfo => {
  const saved = row.uomInfo;
  const baseUom = getProductBaseUom(row);
  const uom = cleanUomCode(saved?.uom) || baseUom;
  const savedRatio = isValidRatio(saved?.ratio) ? saved.ratio : undefined;
  const ratio =
    uom === baseUom
      ? 1
      : savedRatio ?? getProductUomRatio(row.product, uom, baseUom) ?? 1;
  const defaults = getEntryValues(row, ratio);

  // Ratios express sub-units per base unit (e.g. 0.1 box per piece).
  return {
    uom,
    ratio,
    unitPrice: isFiniteNumber(saved?.unitPrice)
      ? saved.unitPrice
      : defaults.unitPrice,
    quantity: isFiniteNumber(saved?.quantity)
      ? saved.quantity
      : defaults.quantity,
  };
};

export const syncProductUomInfo = (
  row: ProductDataWithUom,
  product = row.product,
): ProductDataWithUom => {
  const withProduct = { ...row, product };
  const info = getProductUomInfo(withProduct);
  return {
    ...row,
    uom: getProductBaseUom(withProduct),
    uomInfo: {
      ...info,
      ...getEntryValues(row, info.ratio),
    },
  };
};

export const normalizeProductUom = (
  row: ProductDataWithUom,
  product = row.product,
): ProductDataWithUom => {
  const withProduct = { ...row, product };
  const uom = getProductBaseUom(withProduct);
  const uomInfo = getProductUomInfo(withProduct);
  return {
    ...row,
    uom,
    unitPrice:
      uomInfo.ratio === 1
        ? uomInfo.unitPrice
        : precise(uomInfo.unitPrice * uomInfo.ratio),
    quantity:
      uomInfo.ratio === 1
        ? uomInfo.quantity
        : precise(uomInfo.quantity / uomInfo.ratio),
    ...(uomInfo.uom ? { uomInfo } : {}),
  };
};

export const getProductUomCodes = (
  product?: ProductWithSubUoms,
  selectedUom?: string,
  cachedBaseUom?: string,
) => {
  const codes = [
    selectedUom || '',
    cleanUomCode(product?.uom),
    ...(product?.subUoms || []).map((subUom) => cleanUomCode(subUom.uom)),
  ].filter((uom): uom is string => uom.length > 0);

  const uniqueCodes = Array.from(new Set(codes));
  if (cachedBaseUom && !uniqueCodes.includes(cachedBaseUom)) {
    uniqueCodes.unshift(cachedBaseUom);
  }
  return uniqueCodes;
};
