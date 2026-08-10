import {
  IScoreCampaignDocument,
  IScoreCampaignParams,
} from '@/score/@types/scoreCampaign';
import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  escapeRegExp,
  getPlugin,
  getPlugins,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

export interface IScoreCampaignAttribute {
  name: string;
  label: string;
}

export interface IScoreCampaignService {
  name: string;
  label: string;
  isAviableAdditionalConfig: boolean;
  icon: string;
}

const generateFilter = (
  params: IScoreCampaignParams,
): FilterQuery<IScoreCampaignDocument> => {
  const filter: FilterQuery<IScoreCampaignDocument> = {
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

export const scoreCampaignQueries: Record<string, Resolver> = {
  scoreCampaigns: async (
    _root: undefined,
    params: IScoreCampaignParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('loyaltyCampaignView');
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.ScoreCampaigns,
      params: { ...params, orderBy: { order: 1, createdAt: -1 } },
      query: filter,
    });
  },

  scoreCampaign: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('loyaltyCampaignView');
    return models.ScoreCampaigns.getScoreCampaign(_id);
  },

  scoreCampaignAttributes: async (
    _root: undefined,
    { serviceName }: { serviceName: string },
    { subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('loyaltyCampaignView');
    let attributes: IScoreCampaignAttribute[] = [];

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

  async scoreCampaignServices(
    _root: undefined,
    _args: undefined,
    { checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const services = await getPlugins();
    const result: IScoreCampaignService[] = [];

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
      clientPortal,
    }: {
      ownerId: string;
      ownerType: string;
      campaignId: string;
      clientPortal: string;
    },
    { subdomain, models, checkPermission, user }: IContext,
  ) {
    if (user) {
      await checkPermission('scoreLogView');
    }
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

    const value =
      owner?.propertiesData?.[campaign?.fieldId] ??
      (owner?.customFieldsData || []).find(
        ({ field }) => field === campaign?.fieldId,
      )?.value ??
      0;

    return value;
  },

  async cpCheckOwnerScore(
    _root: undefined,
    args: {
      ownerId: string;
      ownerType: string;
      campaignId: string;
      clientPortal: string;
    },
    context: IContext,
    info: any,
  ) {
    return scoreCampaignQueries.checkOwnerScore(_root, args, context, info);
  },
};

scoreCampaignQueries.cpCheckOwnerScore.wrapperConfig = {
  forClientPortal: true,
};
