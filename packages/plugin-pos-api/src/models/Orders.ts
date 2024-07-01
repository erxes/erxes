import { IPosOrderDocument, posOrderSchema } from './definitions/orders';
import { Model } from 'mongoose';

export interface IPosOrderModel extends Model<IPosOrderDocument> {}

export const loadPosOrderClass = (_models, _subdomain) => {
  class PosOrder {}

  posOrderSchema.loadClass(PosOrder);

  return posOrderSchema;
};
