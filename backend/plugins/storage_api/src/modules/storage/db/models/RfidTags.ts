import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IRfidTagDocument } from '@/storage/@types/storage';
import { rfidTagSchema } from '@/storage/db/definitions/rfidTags';

export type IRfidTagModel = Model<IRfidTagDocument>;

export const loadRfidTagClass = (_models: IModels, _subdomain: string) => {
  return rfidTagSchema;
};
