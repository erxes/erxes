import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IClientPortal,
  IClientPortalDocument,
} from '@/clientportal/types/clientPortal';
import { clientPortalSchema } from 'erxes-api-shared/core-modules';
import {
  removeExtraSpaces,
  removeLastTrailingSlash,
} from 'erxes-api-shared/utils';
import { jwtManager } from '@/clientportal/services';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createClientPortal(name: string): Promise<IClientPortalDocument>;
  updateClientPortal(_id: string, doc: IClientPortal): Promise<void>;
  clientPortalChangeToken(_id: string): Promise<string>;
}

export const loadClientPortalClass = (models: IModels) => {
  class ClientPortal {
    public static async createClientPortal(name: string) {
      const clientPortal = await models.ClientPortal.create({ name });

      const token = jwtManager.createClientPortalToken(clientPortal._id);

      return models.ClientPortal.findOneAndUpdate(
        { _id: clientPortal._id },
        { $set: { token: token } },
        { new: true },
      );
    }

    public static async clientPortalChangeToken(_id: string) {
      const clientPortal = await models.ClientPortal.findOne({
        _id,
      });
      if (!clientPortal) {
        throw new Error('Client portal not found');
      }

      const token = jwtManager.createClientPortalToken(_id);

      await models.ClientPortal.findOneAndUpdate(
        { _id },
        { $set: { token: token } },
      );
      return token;
    }

    public static async getConfig(_id: string) {
      const config = await models.ClientPortal.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async updateClientPortal(_id: string, doc: IClientPortal) {
      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url));
      }

      await models.ClientPortal.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};
