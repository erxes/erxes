import { EngageMessages, Integrations } from '../../db/models';
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
  async segments(
    engageMessage: IEngageMessageDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const segments = await dataLoaders.segment.loadMany(
      engageMessage.segmentIds || []
    );
    return segments.filter(segment => segment);
  },

  brands(engageMessage: IEngageMessageDocument) {
    return getDocumentList('brands', { _id: { $in: engageMessage.brandIds } });
  },

  async customerTags(
    engageMessage: IEngageMessageDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const tags = await dataLoaders.tag.loadMany(
      engageMessage.customerTagIds || []
    );
    return tags.filter(tag => tag);
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return getDocument('users', { _id: engageMessage.fromUserId });
  },

  // common tags
  async getTags(
    engageMessage: IEngageMessageDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const tags = await dataLoaders.tag.loadMany(engageMessage.tagIds || []);
    return tags.filter(tag => tag);
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
