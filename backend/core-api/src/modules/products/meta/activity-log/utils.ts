import { IProductDocument } from 'erxes-api-shared/core-types';
import { PRODUCT_ACTIVITY_FIELDS } from './constants';

export const getProductFieldLabel = (field: string) => {
  const match = PRODUCT_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || field;
};

export const getProductDisplayText = (doc: Partial<IProductDocument>) =>
  doc.name ||
  doc.shortName ||
  doc.code ||
  (doc._id ? `Product ${doc._id}` : 'this product');

export const buildProductTarget = (
  product: IProductDocument | { _id: string },
) => ({
  _id: product._id,
  moduleName: 'products',
  collectionName: 'products',
  text: getProductDisplayText(product as IProductDocument),
});
