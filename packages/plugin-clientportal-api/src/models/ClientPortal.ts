import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  clientPortalSchema,
  IClientPortal,
  IClientPortalDocument
} from './definitions/clientPortal';

import {
  removeLastTrailingSlash,
  removeExtraSpaces
} from '@erxes/api-utils/src/commonUtils';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

export const loadClientPortalClass = (models: IModels) => {
  class ClientPortal {
    public static async getConfig(_id: string) {
      const config = await models.ClientPortals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IClientPortal) {
      let config = await models.ClientPortals.findOne({ _id });

      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url));
      }

      if (!config) {
        config = await models.ClientPortals.create(doc);

        return config.toJSON();
      }

      await models.ClientPortals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true }
      );

      return models.ClientPortals.findOne({ _id: config._id });
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};
