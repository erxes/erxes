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
import { serviceDiscovery } from '../configs';

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

    static removeFieldsWithoutPermission = async doc => {
      const kbAvailable = await serviceDiscovery.isEnabled('knowledgebase');
      const cardAvailable = await serviceDiscovery.isEnabled('cards');
      const inboxAviable = await serviceDiscovery.isEnabled('inbox');

      if (!cardAvailable) {
        delete doc.ticketLabel;
        delete doc.taskLabel;
        delete doc.taskPublicBoardId;
        delete doc.taskPublicPipelineId;
        delete doc.taskStageId;
        delete doc.taskPipelineId;
        delete doc.taskBoardId;
        delete doc.ticketStageId;
        delete doc.ticketPipelineId;
        delete doc.ticketBoardId;
      }
      if (!kbAvailable) {
        delete doc.knowledgeBaseLabel;
        delete doc.knowledgeBaseTopicId;
      }
      if (inboxAviable) {
        delete doc.messengerBrandCode;
      }
      return doc;
    };

    public static async createOrUpdateConfig({ _id, ...doc }: IClientPortal) {
      let config = await models.ClientPortals.findOne({ _id });
      doc = await ClientPortal.removeFieldsWithoutPermission(doc);

      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url));
      }

      if (!config) {
        config = await models.ClientPortals.create(doc);

        return config.toJSON();
      }

      return models.ClientPortals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true }
      );
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};
