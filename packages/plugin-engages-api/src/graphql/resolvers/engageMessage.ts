import { IEngageMessageDocument } from '../../models/definitions/engages';
import { Stats, EngageMessages } from '../../models';
import { prepareSmsStats } from '../../telnyxUtils';

export default {
  __resolveReference({ _id }) {
    return EngageMessages.findOne({ _id });
  },

  async segments(engageMessage: IEngageMessageDocument) {
    return (engageMessage.segmentIds || []).map(segmentId => ({
      __typename: 'Segment',
      _id: segmentId
    }));
  },

  brands(engageMessage: IEngageMessageDocument) {
    return (engageMessage.brandIds || []).map(brandId => ({
      __typename: 'Brand',
      _id: brandId
    }));
  },

  async customerTags(engageMessage: IEngageMessageDocument) {
    return (engageMessage.customerTagIds || []).map(customerTagId => ({
      __typename: 'Tag',
      _id: customerTagId
    }));
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return { __typename: 'User', _id: engageMessage.fromUserId };
  },

  // common tags
  async getTags(engageMessage: IEngageMessageDocument) {
    return (engageMessage.tagIds || []).map(tagId => ({
      __typename: 'Tag',
      _id: tagId
    }));
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;
    if (messenger && messenger.brandId) {
      return { __typename: 'Brand', _id: messenger.brandId };
    }
  },

  stats(engageMessage: IEngageMessageDocument) {
    return Stats.findOne({ engageMessageId: engageMessage._id });
  },

  smsStats(engageMessage: IEngageMessageDocument) {
    return prepareSmsStats(engageMessage._id);
  },

  fromIntegration(engageMessage: IEngageMessageDocument) {
    if (
      engageMessage.shortMessage &&
      engageMessage.shortMessage.fromIntegrationId
    ) {
      return {
        __typename: 'Integration',
        _id: engageMessage.shortMessage.fromIntegrationId
      };
    }

    return null;
  },

  async createdUser(engageMessage: IEngageMessageDocument) {
    return { __typename: 'User', _id: engageMessage.createdBy };
  }
};
