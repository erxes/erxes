import { IScoreCampaignParams } from '@/score/@types/scoreCampaign';
import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import {
  cursorPaginate,
  escapeRegExp,
  getPlugin,
  getPlugins,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

const generateFilter = (params: any) => {
  const filter: any = {
    status: { $ne: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
  };

  if (params.searchValue) {
    filter.title = new RegExp(`^${escapeRegExp(params.searchValue)}`);
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.serviceName) {
    filter.serviceName = params.serviceName;
  }

  return filter;
};

export const scoreCampaignQueries = {
  scoreCampaigns: async (
    _root: undefined,
    params: IScoreCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.ScoreCampaigns,
      params,
      query: filter,
    });
  },

  scoreCampaign: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ScoreCampaigns.getScoreCampaign(_id);
  },

  scoreCampaignAttributes: async (
    _root: undefined,
    { serviceName }: { serviceName: string },
    { subdomain }: IContext,
  ) => {
    let attributes: any[] = [];

    // note: for (const serviceName of services) {
    const service = await getPlugin(serviceName);
    const meta = service.config?.meta || {};

    if (meta?.loyalties?.aviableAttributes) {
      const serviceAttributes = await sendTRPCMessage({
        subdomain,
        pluginName: serviceName,
        method: 'query',
        module: 'fields',
        action: 'getScoreCampaingAttributes',
        input: {},
        defaultValue: [],
      });

      if (Array.isArray(serviceAttributes)) {
        attributes = [...attributes, ...serviceAttributes];
      }
    }

    return attributes;
  },

  async scoreCampaignServices() {
    const services = await getPlugins();
    const result: any[] = [];

    for (const name of services) {
      const service = await getPlugin(name);
      const meta = service?.config?.meta || {};

      if (meta?.loyalties?.aviableAttributes) {
        result.push({
          name,
          label:
            meta?.loyalties?.label ||
            name.charAt(0).toUpperCase() + name.slice(1),
          isAviableAdditionalConfig:
            meta?.loyalties?.isAviableAdditionalConfig || false,
          icon: meta?.loyalties?.icon || 'IconSettings',
        });
      }
    }

    return result;
  },
  async checkOwnerScore(
    _root: undefined,
    {
      ownerId,
      ownerType,
      campaignId,
    }: { ownerId: string; ownerType: string; campaignId: string },
    { subdomain, models }: IContext,
  ) {
    const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

    if (!owner) {
      throw new Error('Owner not found');
    }

    if (!campaignId) {
      return owner?.score || 0;
    }

    const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const { value = 0 } =
      (owner?.customFieldsData || []).find(
        ({ field }) => field === campaign?.fieldId,
      ) || {};

    return value;
  },
};
