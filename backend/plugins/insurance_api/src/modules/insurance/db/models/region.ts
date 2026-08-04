import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { regionSchema } from '@/insurance/db/definitions/region';
import { IRegionDocument } from '@/insurance/@types/region';

export type IRegionModel = Model<IRegionDocument>;

export const loadRegionClass = (_models: IModels) => {
  void _models;
  class Region {}

  regionSchema.loadClass(Region);

  return regionSchema;
};
