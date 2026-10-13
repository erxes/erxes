import { IProduct } from 'ui-modules';

type ProductSubUom = {
  uom?: string | null;
};

type ProductWithSubUoms = IProduct & {
  subUoms?: ProductSubUom[] | null;
};

const cleanUomCode = (uom?: string | null) => uom?.trim() || '';

export const getProductDefaultUom = (product?: IProduct) =>
  cleanUomCode(product?.uom);

export const getProductRowUom = (product?: IProduct, uom?: string) =>
  uom?.trim() ? uom : getProductDefaultUom(product);

export const getProductUomCodes = (
  product?: ProductWithSubUoms,
  selectedUom?: string,
) => {
  const codes = [
    selectedUom || '',
    cleanUomCode(product?.uom),
    ...(product?.subUoms || []).map((subUom) => cleanUomCode(subUom.uom)),
  ].filter((uom): uom is string => uom.length > 0);

  return Array.from(new Set(codes));
};
