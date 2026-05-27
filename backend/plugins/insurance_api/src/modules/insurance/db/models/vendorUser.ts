import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { vendorUserSchema } from '@/insurance/db/definitions/vendorUser';
import { IVendorUserDocument } from '@/insurance/@types/vendorUser';

export type IVendorUserModel = Model<IVendorUserDocument>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadVendorUserClass = (_models: IModels) => {
  class VendorUser {}

  vendorUserSchema.loadClass(VendorUser);

  return vendorUserSchema;
};
