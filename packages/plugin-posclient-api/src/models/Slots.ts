import { IModels } from '../connectionResolver';
import { IPosSlotDocument, posSlotSchema } from './definitions/slots';
import { Model } from 'mongoose';

export interface IPosSlotModel extends Model<IPosSlotDocument> {}

export const loadPosSlotClass = (_models: IModels) => {
  class PosSlot {}

  posSlotSchema.loadClass(PosSlot);

  return posSlotSchema;
};
