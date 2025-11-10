import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IClientPortal,
  IClientPortalDocument,
} from '@/clientportal/types/clientPortal';
import { clientPortalSchema } from '@/clientportal/db/definitions/clientPortal';
import {
  removeExtraSpaces,
  removeLastTrailingSlash,
} from 'erxes-api-shared/utils';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;

  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

export const loadPortalClass = (models: IModels) => {
  class ClientPortal {
    public static async getConfig(_id: string) {
      const config = await models.ClientPortal.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IClientPortal) {
      let config = await models.ClientPortal.findOne({ _id });

      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url));
      }

      if (!config) {
        config = await models.ClientPortal.create(doc);

        return config.toJSON();
      }

      await models.ClientPortal.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true },
      );

      return models.ClientPortal.findOne({ _id: config._id });
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};
