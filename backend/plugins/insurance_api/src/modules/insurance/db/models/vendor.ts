import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { vendorSchema } from '@/insurance/db/definitions/vendor';
import { IVendorDocument } from '@/insurance/@types/vendor';

export type IVendorModel = Model<IVendorDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadVendorClass = (_models: IModels) => {
  class Vendor {}

  vendorSchema.loadClass(Vendor);

  return vendorSchema;
};
