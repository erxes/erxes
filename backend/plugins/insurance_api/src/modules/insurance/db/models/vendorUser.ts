import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { vendorUserSchema } from '@/insurance/db/definitions/vendorUser';
import { IVendorUserDocument } from '@/insurance/@types/vendorUser';

export type IVendorUserModel = Model<IVendorUserDocument>;

export const loadVendorUserClass = (_models: IModels) => {
  void _models;
  class VendorUser {}

  vendorUserSchema.loadClass(VendorUser);

  return vendorUserSchema;
};
