import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  vendorPortalSchema,
  IVendorPortal,
  IVendorPortalDocument
} from './definitions/vendorPortal';

import {
  removeLastTrailingSlash,
  removeExtraSpaces
} from '@erxes/api-utils/src/commonUtils';

export interface IVendorPortalModel extends Model<IVendorPortalDocument> {
  getConfig(_id: string): Promise<IVendorPortalDocument>;
  createOrUpdateConfig(args: IVendorPortal): Promise<IVendorPortalDocument>;
}

export const loadVendorPortalClass = (models: IModels) => {
  class VendorPortal {
    public static async getConfig(_id: string) {
      const config = await models.VendorPortals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IVendorPortal) {
      let config = await models.VendorPortals.findOne({ _id });

      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url)) || '';
      }

      if (!config) {
        config = await models.VendorPortals.create(doc);

        return config.toJSON();
      }

      return models.VendorPortals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true }
      );
    }
  }

  vendorPortalSchema.loadClass(VendorPortal);

  return vendorPortalSchema;
};
