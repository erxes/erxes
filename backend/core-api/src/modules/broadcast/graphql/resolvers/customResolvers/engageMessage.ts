import { IEngageMessageDocument } from '@/broadcast/@types';
import { prepareNotificationStats, prepareSmsStats } from '@/broadcast/utils';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_METHODS } from '~/modules/broadcast/constants';

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

  brandId({ messenger }: IEngageMessageDocument) {
    return messenger?.brandId;
  },

  async stats(
    { _id, method }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {

    if (method === CAMPAIGN_METHODS.EMAIL) {
      return models.Stats.findOne({ engageMessageId: _id });
    }

    if (method === CAMPAIGN_METHODS.SMS) {
      return prepareSmsStats(models, _id);
    }

    if (method === CAMPAIGN_METHODS.NOTIFICATION) {
      return prepareNotificationStats(models, _id);
    }

    return 'Invalid method';
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
};
