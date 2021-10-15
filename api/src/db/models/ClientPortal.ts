import { Model, model } from 'mongoose';
import {
  clientPortalSchema,
  IClientPortal,
  IClientPortalDocument
} from './definitions/clientPortal';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

export const loadClass = () => {
  class ClientPortal {
    public static async getConfig(_id: string) {
      const config = await ClientPortals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IClientPortal) {
      let config = await ClientPortals.findOne({ _id });

      if (!config) {
        config = await ClientPortals.create(doc);

        return config.toJSON();
      }

      return ClientPortals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true }
      );
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};

loadClass();

const ClientPortals = model<IClientPortalDocument, IClientPortalModel>(
  'client_portal',
  clientPortalSchema
);

export default ClientPortals;
