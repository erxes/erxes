import { adsSchema, IadsDocument } from './definitions/ads';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IAdsModel extends Model<IadsDocument> {}

export const loadAdsClass = (models: IModels, subdomain: string) => {
  class Ads {}

  adsSchema.loadClass(Ads);

  return adsSchema;
};
