import { checkPermission } from 'erxes-api-shared/core-modules';
import { escapeRegExp, paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { SCORE_CAMPAIGN_STATUSES } from '~/modules/loyalty/@types/scoreCampaigns';
import { getOwner } from '~/modules/loyalty/db/models/utils';

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

const scoreCampaignQueries = {
  async scoreCampaigns(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return await paginate(
      models.ScoreCampaigns.find(filter).sort({ createdAt: -1 }),
      params,
    );
  },

  async scoreCampaignsTotalCount(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return await models.ScoreCampaigns.countDocuments(filter);
  },

  async scoreCampaign(_root, { _id }, { models }: IContext) {
    return await models.ScoreCampaigns.findOne({ _id });
  },

  async scoreCampaignAttributes(
    _root,
    { serviceName },
    { models, subdomain }: IContext,
  ) {
    let attributes: any[] = [];

    // const service = await getService(serviceName);
    // const meta = service.config?.meta || {};

    // if (meta && meta?.loyalties && meta?.loyalties?.aviableAttributes) {
    //   const serviceAttributes = await sendCommonMessage({
    //     subdomain,
    //     serviceName: serviceName,
    //     action: 'getScoreCampaingAttributes',
    //     data: {},
    //     isRPC: true,
    //     defaultValue: [],
    //   });

    //   if (Array.isArray(serviceAttributes)) {
    //     attributes = [...attributes, ...serviceAttributes];
    //   }
    // }

    // return attributes;
    return null;
  },
  async scoreCampaignServices(_root, {}, {}: IContext) {
    // const services = await getServices();

    // const searviceNames: any[] = [];

    // for (const serviceName of services) {
    //   const service = await getService(serviceName);
    //   const meta = service.config?.meta || {};

    //   if (meta && meta?.loyalties && meta?.loyalties?.aviableAttributes) {
    //     const { name, label, isAviableAdditionalConfig, icon } =
    //       meta?.loyalties || {};
    //     searviceNames.push({ name, label, isAviableAdditionalConfig, icon });
    //   }
    // }

    // return searviceNames;
    return null;
  },

  async checkOwnerScore(
    _root,
    { ownerId, ownerType, campaignId },
    { subdomain, models }: IContext,
  ) {
    const owner = await getOwner(subdomain, ownerType, ownerId);

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

checkPermission(scoreCampaignQueries, 'scoreCampaigns', 'manageLoyalties');
checkPermission(
  scoreCampaignQueries,
  'scoreCampaignsTotalCount',
  'manageLoyalties',
);
checkPermission(scoreCampaignQueries, 'scoreCampaign', 'manageLoyalties');

export default scoreCampaignQueries;
