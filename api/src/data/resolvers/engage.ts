import {
  Brands,
  EngageMessages,
  Integrations,
  Segments,
  Tags,
  Users
} from '../../db/models';
import { IEngageMessageDocument } from '../../db/models/definitions/engages';
import { IContext } from '../types';

export const deliveryReport = {
  engage(root) {
    return EngageMessages.findOne(
      { _id: root.engageMessageId },
      { title: 1 }
    ).lean();
  }
};

export const message = {
  segments(engageMessage: IEngageMessageDocument) {
    return Segments.find({ _id: { $in: engageMessage.segmentIds } });
  },

  brands(engageMessage: IEngageMessageDocument) {
    return Brands.find({ _id: { $in: engageMessage.brandIds } });
  },

  tags(engageMessage: IEngageMessageDocument) {
    return Tags.find({ _id: { $in: engageMessage.tagIds } });
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return Users.findOne({ _id: engageMessage.fromUserId });
  },

  getTags(engageMessage: IEngageMessageDocument) {
    return Tags.find({ _id: { $in: engageMessage.tagIds || [] } });
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;

    if (messenger && messenger.brandId) {
      return Brands.findOne({ _id: messenger.brandId });
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
      return Integrations.getIntegration(
        engageMessage.shortMessage.fromIntegrationId
      );
    }

    return null;
  },

  async createdUser(engageMessage: IEngageMessageDocument): Promise<string> {
    const user = await Users.findOne({ _id: engageMessage.createdBy });

    if (!user) {
      return '';
    }

    return user.username || user.email || user._id;
  }
};
