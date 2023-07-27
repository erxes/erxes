import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  vendorCompanyConfigSchema,
  vendorProductsMappingSchema,
  IVendorCompanyConfig,
  IVendorCompanyConfigDocument,
  IVendorProductsMapping,
  IVendorProductsMappingDocument
} from './definitions/vendorCompanyConfig';

export interface IVendorCompanyConfigModel
  extends Model<IVendorCompanyConfigDocument> {
  createVendorCompanyConfig(
    args: IVendorCompanyConfig
  ): Promise<IVendorCompanyConfigDocument>;
  updateVendorCompanyConfig(
    _id: string,
    args: IVendorCompanyConfig
  ): Promise<IVendorCompanyConfigDocument>;
  removeVendorCompanyConfig(_id: string): Promise<IVendorCompanyConfigDocument>;
}

export const loadVendorCompanyConfigClass = (models: IModels) => {
  class VendorCompanyConfig {
    public static async createVendorCompanyConfig(args: IVendorCompanyConfig) {
      const vendorCompanyConfig = await models.VendorCompanyConfigs.create(
        args
      );

      return vendorCompanyConfig;
    }

    public static async updateVendorCompanyConfig(
      _id: string,
      args: IVendorCompanyConfig
    ) {
      const vendorCompanyConfig = await models.VendorCompanyConfigs.findOneAndUpdate(
        { _id },
        { $set: args },
        { new: true }
      );

      return vendorCompanyConfig;
    }

    public static async removeVendorCompanyConfig(_id: string) {
      await models.VendorCompanyConfigs.remove({ _id });

      return _id;
    }
  }

  vendorCompanyConfigSchema.loadClass(VendorCompanyConfig);

  return vendorCompanyConfigSchema;
};

export interface IVendorProductsMappingModel
  extends Model<IVendorProductsMappingDocument> {
  createVendorProductsMapping(
    args: IVendorProductsMapping
  ): Promise<IVendorProductsMappingDocument>;
  updateVendorProductsMapping(
    _id: string,
    args: IVendorProductsMapping
  ): Promise<IVendorProductsMappingDocument>;
  removeVendorProductsMapping(
    _id: string
  ): Promise<IVendorProductsMappingDocument>;
}

export const loadVendorProductsMappingClass = (models: IModels) => {
  class VendorProductsMapping {
    public static async createVendorProductsMapping(
      args: IVendorProductsMapping
    ) {
      const vendorProductsMapping = await models.VendorProducts.create(args);

      return vendorProductsMapping;
    }

    public static async updateVendorProductsMapping(
      _id: string,
      args: IVendorProductsMapping
    ) {
      const vendorProductsMapping = await models.VendorProducts.findOneAndUpdate(
        { _id },
        { $set: args },
        { new: true }
      );

      return vendorProductsMapping;
    }

    public static async removeVendorProductsMapping(_id: string) {
      await models.VendorProducts.remove({ _id });

      return _id;
    }
  }

  vendorProductsMappingSchema.loadClass(VendorProductsMapping);

  return vendorProductsMappingSchema;
};
