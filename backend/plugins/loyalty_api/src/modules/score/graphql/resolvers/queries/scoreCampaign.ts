import {
  IScoreCampaignDocument,
  IScoreCampaignParams,
} from '@/score/@types/scoreCampaign';
import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { IEarnTable } from '@/score/@types/earnTable';
import { previewEarnTable } from '@/score/services/earnTable';
import { getOwnerBalance } from '@/score/services/scoreLedger';
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

export interface IScoreCampaignService {
  name: string;
  label: string;
  isAviableAdditionalConfig: boolean;
  icon: string;
}

const generateFilter = (
  params: IScoreCampaignParams,
): FilterQuery<IScoreCampaignDocument> => {
  const filter: FilterQuery<IScoreCampaignDocument> = {};

  if (params.searchValue) {
    filter.title = new RegExp(`^${escapeRegExp(params.searchValue)}`);
  }

  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  } else if (params.status !== 'all') {
    filter.status = { $ne: SCORE_CAMPAIGN_STATUSES.ARCHIVED };
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
      params: {
        ...params,
        orderBy: params.orderBy ?? { order: 1, createdAt: -1 },
      },
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

  // What the earning table being edited gives for a sample purchase, so the
  // form shows the same numbers the ledger will.
  async scoreCampaignEarnPreview(
    _root: undefined,
    {
      accountTypeId,
      table,
      amount,
    }: { accountTypeId?: string; table: IEarnTable; amount: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');

    const accountType = accountTypeId
      ? await models.LoyaltyAccountTypes.findOne({ _id: accountTypeId }).lean()
      : null;

    return previewEarnTable({
      table,
      amount: Number(amount) || 0,
      ratio: Number(accountType?.currencyRatio) || 1,
      tiers: (accountType?.tiers || []).filter(
        ({ deprecated }) => !deprecated,
      ),
    });
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

    const campaign = campaignId
      ? await models.ScoreCampaigns.findOne({ _id: campaignId }).lean()
      : null;

    if (campaignId && !campaign) {
      throw new Error('Campaign not found');
    }

    return getOwnerBalance({
      models,
      subdomain,
      ownerType,
      ownerId,
      fieldId: campaign?.fieldId,
      owner,
    });
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
