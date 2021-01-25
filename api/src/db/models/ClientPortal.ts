import { Model, model } from 'mongoose';
import {
  clientPortalSchema,
  IClientPortal,
  IClientPortalDocument
} from './definitions/clientPortal';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(): Promise<IClientPortalDocument>;
  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

export const loadClass = () => {
  class ClientPortal {
    public static async getConfig() {
      return ClientPortals.findOne();
    }

    public static async createOrUpdateConfig(doc: IClientPortal) {
      const config = await ClientPortals.findOne({});

      if (!config) {
        return ClientPortals.create(doc);
      }

      return ClientPortals.updateOne({ _id: config._id }, { $set: doc });
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
