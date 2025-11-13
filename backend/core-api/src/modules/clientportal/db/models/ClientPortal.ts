import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
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
import * as dotenv from 'dotenv';

dotenv.config();

const { JWT_TOKEN_SECRET = 'SECRET' } = process.env;

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createClientPortal(name: string): Promise<IClientPortalDocument>;
  createClientPortalToken(clientPortalId: string): Promise<string>;
  updateClientPortal(_id: string, doc: IClientPortal): Promise<void>;
  clientPortalChangeToken(_id: string): Promise<string>;
}

export const loadClientPortalClass = (models: IModels) => {
  class ClientPortal {
    public static async createClientPortal(name: string) {
      const clientPortal = await models.ClientPortal.create({ name });

      const token = await models.ClientPortal.createClientPortalToken(
        clientPortal._id,
      );

      return models.ClientPortal.findOneAndUpdate(
        { _id: clientPortal._id },
        { $set: { token } },
        { new: true },
      );
    }

    public static async createClientPortalToken(clientPortalId: string) {
      const clientPortal = await models.ClientPortal.findOne({
        _id: clientPortalId,
      });
      if (!clientPortal) {
        throw new Error('Client portal not found');
      }

      const token = jwt.sign(
        { clientPortalId: clientPortal._id },
        JWT_TOKEN_SECRET,
      );

      return token;
    }

    public static async clientPortalChangeToken(_id: string) {
      const token = await models.ClientPortal.createClientPortalToken(_id);

      await models.ClientPortal.findOneAndUpdate({ _id }, { $set: { token } });
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
