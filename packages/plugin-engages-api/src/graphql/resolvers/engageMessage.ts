import { IContext } from '../../connectionResolver';
import { IEngageMessageDocument } from '../../models/definitions/engages';
import { prepareSmsStats } from '../../telnyxUtils';

export default {
  __resolveReference({ _id }: IEngageMessageDocument, _args, { models }: IContext) {
    return models.EngageMessages.findOne({ _id });
  },

  async segments({ segmentIds = [] }: IEngageMessageDocument) {
    return segmentIds.map(segmentId => ({
      __typename: 'Segment',
      _id: segmentId
    }));
  },

  brands({ brandIds = [] }: IEngageMessageDocument) {
    return brandIds.map(brandId => ({
      __typename: 'Brand',
      _id: brandId
    }));
  },

  async customerTags({ customerTagIds = [] }: IEngageMessageDocument) {
    return customerTagIds.map(customerTagId => ({
      __typename: 'Tag',
      _id: customerTagId
    }));
  },

  fromUser({ fromUserId }: IEngageMessageDocument) {
    return { __typename: 'User', _id: fromUserId };
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

    return null;
  },

  stats({ _id }: IEngageMessageDocument, _args, { models }: IContext) {
    return models.Stats.findOne({ engageMessageId: _id });
  },

  smsStats({ _id }: IEngageMessageDocument, _args, { models }: IContext) {
    return prepareSmsStats(models, _id);
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
    if (engageMessage.createdBy) {
      return { __typename: 'User', _id: engageMessage.createdBy };
    }

    return null;
  },
  
  logs(engageMessage: IEngageMessageDocument, _args, { models }: IContext) {
    return models.Logs.find({ engageMessageId: engageMessage._id }).lean();
  }
};
