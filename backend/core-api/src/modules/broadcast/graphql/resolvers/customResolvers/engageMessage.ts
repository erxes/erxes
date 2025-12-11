import { IEngageMessageDocument } from '@/broadcast/@types';
import { prepareNotificationStats, prepareSmsStats } from '@/broadcast/utils';
import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference(
    { _id }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.EngageMessages.findOne({ _id });
  },

  segments({ segmentIds = [] }: IEngageMessageDocument) {
    return segmentIds.map((segmentId) => ({
      __typename: 'Segment',
      _id: segmentId,
    }));
  },

  brands({ brandIds = [] }: IEngageMessageDocument) {
    return brandIds.map((brandId) => ({
      __typename: 'Brand',
      _id: brandId,
    }));
  },

  customerTags({ customerTagIds = [] }: IEngageMessageDocument) {
    return customerTagIds.map((customerTagId) => ({
      __typename: 'Tag',
      _id: customerTagId,
    }));
  },

  fromUser({ fromUserId }: IEngageMessageDocument) {
    return { __typename: 'User', _id: fromUserId };
  },

  // common tags
  getTags(engageMessage: IEngageMessageDocument) {
    return (engageMessage.tagIds || []).map((tagId) => ({
      __typename: 'Tag',
      _id: tagId,
    }));
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;

    if (messenger && messenger.brandId) {
      return { __typename: 'Brand', _id: messenger.brandId };
    }

    return null;
  },

  async stats(
    { _id }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Stats.findOne({ engageMessageId: _id });
  },

  smsStats(
    { _id }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return prepareSmsStats(models, _id);
  },

  async notificationStats(
    { _id }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return prepareNotificationStats(models, _id);
  },

  fromIntegration(engageMessage: IEngageMessageDocument) {
    if (
      engageMessage.shortMessage &&
      engageMessage.shortMessage.fromIntegrationId
    ) {
      return {
        __typename: 'Integration',
        _id: engageMessage.shortMessage.fromIntegrationId,
      };
    }

    return null;
  },

  async createdUserName(
    { createdBy = '' }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    const user = await models.Users.findOne({ _id: createdBy }).lean();

    if (!user) {
      return '';
    }

    return user.username || user.email || user._id;
  },
};
