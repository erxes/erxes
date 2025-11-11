import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
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
import * as dotenv from 'dotenv';
dotenv.config();

const { JWT_TOKEN_SECRET = 'SECRET' } = process.env;

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createClientPortal(name: string): Promise<IClientPortalDocument>;
  createClientPortalToken(clientPortalId: string): Promise<string>;
  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

export const loadPortalClass = (models: IModels) => {
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

      const token = jwt.sign({ clientPortal }, JWT_TOKEN_SECRET);

      return token;
    }

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
