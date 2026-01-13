import { IEngageMessageDocument } from '@/broadcast/@types';
import { prepareNotificationStats } from '@/broadcast/utils';
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

  segments({ targetType, targetIds = [] }: IEngageMessageDocument) {
    if (targetType !== 'segment') {
      return [];
    }

    return targetIds.map((segmentId) => ({
      __typename: 'Segment',
      _id: segmentId,
    }));
  },

  brands({ targetType, targetIds = [] }: IEngageMessageDocument) {
    if (targetType !== 'brand') {
      return [];
    }

    return targetIds.map((brandId) => ({
      __typename: 'Brand',
      _id: brandId,
    }));
  },

  customerTags({ targetType, targetIds = [] }: IEngageMessageDocument) {
    if (targetType !== 'tag') {
      return [];
    }

    return targetIds.map((customerTagId) => ({
      __typename: 'Tag',
      _id: customerTagId,
    }));
  },

  fromUser({ fromUserId }: IEngageMessageDocument) {
    return { __typename: 'User', _id: fromUserId };
  },

  // common tags
  getTags(engageMessage: IEngageMessageDocument) {
    const { targetType, targetIds = [] } = engageMessage;

    if (targetType !== 'tag') {
      return [];
    }

    return targetIds.map((tagId) => ({
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

    if (method === CAMPAIGN_METHODS.NOTIFICATION) {
      return prepareNotificationStats(models, _id);
    }

    return 'Invalid method';
  },
};
