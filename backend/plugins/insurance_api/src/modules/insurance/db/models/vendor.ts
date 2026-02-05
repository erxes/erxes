import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { vendorSchema } from '@/insurance/db/definitions/vendor';
import { IVendorDocument } from '@/insurance/@types/vendor';

export type IVendorModel = Model<IVendorDocument>;

export const loadVendorClass = (_models: IModels) => {
  void _models;
  class Vendor {}

  vendorSchema.loadClass(Vendor);

  return vendorSchema;
};
