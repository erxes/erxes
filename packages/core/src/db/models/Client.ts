import { nanoid } from 'nanoid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import { clientSchema, IClient, IClientDocument } from './definitions/client';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import { IPermission } from './definitions/permissions';

export interface IClientModel extends Model<IClientDocument> {
  getClient(doc: any): Promise<IClientDocument>;
  createClient({
    name,
    permissions,
    whiteListedIps,
  }: {
    name: string;
    permissions: IPermission[];
    whiteListedIps: string[];
  }): IClientDocument;
  updateClient(_id: string, fields: IClient): IClientDocument;
  removeClient(_id: string): IClientDocument;
  resetSecret(_id: string): IClientDocument;
}

export const loadClientClass = (models: IModels) => {
  class Client {
    /*
     * Get a Client
     */
    public static async getClient(doc: any) {
      const client = await models.Clients.findOne(doc).lean();

      if (!client) {
        throw new Error('Client not found');
      }

      const { clientSecret, ...clientWithoutSecret } = client;

      return clientWithoutSecret;
    }

    public static async createClient({
      name,
      permissions,
      whiteListedIps,
    }: {
      name: string;
      permissions: IPermission[];
      whiteListedIps: string[];
    }) {
      const maxRetries = 5;
      let retries = 0;

      const user = await models.Users.findOne({ username: name });

      if (user) {
        throw new Error('App name already taken, please choose another name');
      }

      while (retries < maxRetries) {
        const clientID = crypto.randomBytes(16).toString('hex');
        const clientSecret = crypto.randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(clientSecret, 10);

        try {
          const client = await models.Clients.create({
            name,
            clientID,
            clientSecret: hashedSecret,
            permissions,
          });

          const systemUser = await models.Users.create({
            username: name,
            password: hashedSecret,
            appId: client._id,
            isActive: true,
            role: USER_ROLES.SYSTEM,
            details: {
              fullName: name,
            },
          });

          const appPermissions = permissions.map((permission) => ({
            userId: systemUser._id,
            ...permission,
          }));

          await models.Permissions.insertMany(appPermissions);
          return client;
        } catch (error: any) {
          if (error.code === 11000 && error.keyPattern?.appId) {
            retries++;
            console.warn(
              `Duplicate appId detected. Retrying... (${retries}/${maxRetries})`
            );
            continue;
          }

          throw new Error(error.message || 'Failed to create client');
        }
      }

      throw new Error(
        'Max retries reached. Could not generate a unique appId.'
      );
    }

    public static async updateClient(_id: string, fields: IClient) {
      await models.Clients.updateOne({ _id }, { $set: { ...fields } });
      return models.Clients.findOne({ _id });
    }

    public static async removeClient(_id) {
      const clientObj = await models.Clients.findOneAndDelete({ _id });

      if (!clientObj) {
        throw new Error(`Client not found with id ${_id}`);
      }

      return clientObj;
    }
  }

  clientSchema.loadClass(Client);

  return clientSchema;
};
