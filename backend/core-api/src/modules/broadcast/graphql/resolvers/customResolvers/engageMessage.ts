import { IEngageMessageDocument } from '@/broadcast/@types';
import {
  findCampaignAutomation,
  isWorkflowCampaign,
  prepareNotificationStats,
} from '@/broadcast/utils';
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

  /**
   * Resolved rather than stored: the automation carries `ownerContentId`, so
   * the link has one source of truth and nothing to keep in sync.
   */
  async workflowAutomationId(
    { _id, method }: IEngageMessageDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!isWorkflowCampaign(method)) {
      return null;
    }

    const automation = await findCampaignAutomation(models, _id);

    return automation?._id || null;
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

    // Methods that keep no stats document report none. A sentinel string here
    // passes the JSON scalar untouched and reaches the client as `stats`.
    return null;
  },
};
