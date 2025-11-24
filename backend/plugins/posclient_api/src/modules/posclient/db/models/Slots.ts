import { IModels } from '~/connectionResolvers';
import { Model } from 'mongoose';
import { IPosSlotDocument } from '~/modules/posclient/@types/slots';
import { posSlotSchema } from '~/modules/posclient/db/definitions/slots';

export interface IPosSlotModel extends Model<IPosSlotDocument> {}

export const loadPosSlotClass = (_models: IModels) => {
  class PosSlot {}

  posSlotSchema.loadClass(PosSlot);

  return posSlotSchema;
};
