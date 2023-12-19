import { IProductDocument } from '../models/definitions/jobs';

export const getRatio = (product: IProductDocument, uom: string) => {
  if (product.uom === uom) {
    return 1;
  }

  const subUom = (product.subUoms || []).find(su => su.uom === uom);
  if (!subUom) {
    return 0;
  }

  return subUom.ratio;
};
