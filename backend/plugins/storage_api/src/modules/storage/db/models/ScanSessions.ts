import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IScanSessionDocument } from '@/storage/@types/storage';
import { scanSessionSchema } from '@/storage/db/definitions/scanSessions';

export type IScanSessionModel = Model<IScanSessionDocument>;

export const loadScanSessionClass = (_models: IModels, _subdomain: string) => {
  return scanSessionSchema;
};
