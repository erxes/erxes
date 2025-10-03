import { Model } from 'mongoose';
import { IPosOrderDocument } from '../../@types/orders';
import { posOrderSchema } from '../definitions/orders';


export type IPosOrderModel = Model<IPosOrderDocument>

export const loadPosOrderClass = (_models, _subdomain) => {
  class PosOrder { }

  posOrderSchema.loadClass(PosOrder);

  return posOrderSchema;
};
