import { EngageMessages, Integrations, Segments, Tags } from '../../db/models';
import { IEngageMessageDocument } from '../../db/models/definitions/engages';
import { IContext } from '../types';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export const deliveryReport = {
  engage(root) {
    return EngageMessages.findOne(
      { _id: root.engageMessageId },
      { title: 1 }
    ).lean();
  }
};

export const message = {
  segments(
    engageMessage: IEngageMessageDocument,
    _,
    { dataLoaders }: IContext
  ) {
    return dataLoaders?.segment.loadMany(engageMessage.segmentIds || []);
  },

  brands(engageMessage: IEngageMessageDocument) {
    return getDocumentList('brands', { _id: { $in: engageMessage.brandIds } });
  },

  customerTags(
    engageMessage: IEngageMessageDocument,
    _,
    { dataLoaders }: IContext
  ) {
    return dataLoaders?.tag.loadMany(engageMessage.customerTagIds || []);
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return getDocument('users', { _id: engageMessage.fromUserId });
  },

  // common tags
  getTags(engageMessage: IEngageMessageDocument, _, { dataLoaders }: IContext) {
    return dataLoaders?.tag.loadMany(engageMessage.tagIds || []);
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;

    if (messenger && messenger.brandId) {
      return getDocument('brands', { _id: messenger.brandId });
    }
  },

  stats(
    engageMessage: IEngageMessageDocument,
    _args,
    { dataSources }: IContext
  ) {
    return dataSources.EngagesAPI.engagesStats(engageMessage._id);
  },

  logs(
    engageMessage: IEngageMessageDocument,
    _args,
    { dataSources }: IContext
  ) {
    return dataSources.EngagesAPI.engagesLogs(engageMessage._id);
  },

  smsStats(
    engageMessage: IEngageMessageDocument,
    _args,
    { dataSources }: IContext
  ) {
    return dataSources.EngagesAPI.engagesSmsStats(engageMessage._id);
  },

  fromIntegration(engageMessage: IEngageMessageDocument) {
    if (
      engageMessage.shortMessage &&
      engageMessage.shortMessage.fromIntegrationId
    ) {
      return Integrations.getIntegration({
        _id: engageMessage.shortMessage.fromIntegrationId
      });
    }

    return null;
  },

  async createdUser(engageMessage: IEngageMessageDocument): Promise<string> {
    const user = await getDocument('users', { _id: engageMessage.createdBy });

    if (!user) {
      return '';
    }

    return user.username || user.email || user._id;
  }
};
