import { nanoid } from 'nanoid';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import { clientSchema, IClient, IClientDocument } from './definitions/client';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import { IPermission } from './definitions/permissions';
import { userActionsMap } from '@erxes/api-utils/src/core';
import redis from '@erxes/api-utils/src/redis';

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
  updateClient({
    _id,
    name,
    whiteListedIps,
    permissions,
  }: {
    _id: string;
    name?: string;
    whiteListedIps?: string[];
    permissions?: IClientPermission[];
  }): IClientDocument;
  removeClient(_id: string): IClientDocument;
  resetSecret(_id: string): IClientDocument;
}

interface IClientPermission {
  module: string;
  actions: string[];
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
      permissions: IClientPermission[];
      whiteListedIps: string[];
    }) {
      const maxRetries = 5;
      let retries = 0;

      const user = await models.Users.findOne({ username: name });

      if (user) {
        throw new Error('App name already taken, please choose another name');
      }

      while (retries < maxRetries) {
        const clientId = crypto.randomBytes(16).toString('hex');
        const clientSecret = crypto.randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(clientSecret, 10);

        try {
          const client = await models.Clients.create({
            name,
            clientId,
            clientSecret: hashedSecret,
            whiteListedIps,
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

          const prohibitedModules = ['users', 'usersGroups', 'permissions', 'clients', 'logs', 'generalSettings'];

          const filteredPermissions = permissions.filter((permission) => {
            return !prohibitedModules.includes(permission.module);
          })
          await Promise.all(
            filteredPermissions.map(async (permission) => {
              const appPermission = await models.Permissions.createPermission({
                userIds: [systemUser._id],
                actions: permission.actions,
                allowed: true,
                module: permission.module,
              });

              return appPermission;
            })
          );

          return { clientId, clientSecret };
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

    public static async updateClient({
      _id,
      name,
      whiteListedIps,
      permissions,
    }: {
      _id: string;
      name?: string;
      whiteListedIps?: string[];
      permissions?: IClientPermission[];
    }) {
      try {
        const user = await models.Users.findOne({ appId: _id });
        if (!user) {
          throw new Error('User not found');
        }
        const client = await models.Clients.findOne({ _id });

        if (!client) {
          throw new Error('Client not found');
        }

        let doc: any = {};

        if (name) {
          user.username = name;
          if (user.details) {
            user.details.fullName = name;
          }
          await models.Users.updateOne({ appId: _id }, { $set: user });
          doc.name = name;
        }

        if (whiteListedIps) {
          doc.whiteListedIps = whiteListedIps;
        }

        if (permissions) {
          await models.Permissions.deleteMany({ userId: user._id });
          await Promise.all(
            permissions.map(async (permission) => {
              const appPermission = await models.Permissions.createPermission({
                userIds: [user._id],
                actions: permission.actions,
                allowed: true,
                module: permission.module,
              });

              return appPermission;
            })
          );

          const userPermissions = await models.Permissions.find({
            userId: user._id,
          });
        
          const actionMap = await userActionsMap(userPermissions, [], user);
        
          await redis.set(`user_permissions_${user._id}`, JSON.stringify(actionMap));
        }

        await models.Clients.updateOne({ _id }, { $set: doc });
      } catch (e) {
        console.error(e);
        throw new Error(e);
      }
    }

    public static async removeClient(_id) {
      const clientObj = await models.Clients.findOneAndDelete({ _id });

      if (!clientObj) {
        throw new Error(`Client not found with id ${_id}`);
      }

      const user = await models.Users.findOneAndDelete({ appId: _id });

      if (user) {
        await models.Permissions.deleteMany({ userId: user._id });
      }

      return clientObj;
    }

    public static async resetSecret(_id: string) {
      const client = await models.Clients.findOne({ _id });

      if (!client) {
        throw new Error('Client not found');
      }

      const newSecret = crypto.randomBytes(32).toString('hex');
      const hashedSecret = await bcrypt.hash(newSecret, 10);

      client.clientSecret = hashedSecret;
      await client.save();

      return {
        clientId: client.clientId,
        clientSecret: newSecret,
      };
    }
  }

  clientSchema.loadClass(Client);

  return clientSchema;
};
