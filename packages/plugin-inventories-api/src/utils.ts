export const getRatio = (product: any, uomId: string) => {
  if (product.uomId === uomId) {
    return 1;
  }

  const subUom = (product.subUoms || []).find(su => su.uomId === uomId);
  if (!subUom) {
    return 0;
  }

  return subUom.ratio;
};
