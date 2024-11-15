import { escapeRegExp, paginate } from "@erxes/api-utils/src/core";
import { IContext } from "../../../connectionResolver";
import { SCORE_CAMPAIGN_STATUSES } from "../../../models/definitions/scoreCampaigns";
import { checkPermission } from "@erxes/api-utils/src";

const generateFilter = (params: any) => {
  const filter: any = {
    status: { $ne: SCORE_CAMPAIGN_STATUSES.ARCHIVED }
  };

  if (params.searchValue) {
    filter.title = new RegExp(`^${escapeRegExp(params.filter)}`);
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const scoreCampaignQueries = {
  async scoreCampaigns(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return await paginate(
      models.ScoreCampaigns.find(filter).sort({ createdAt: -1 }),
      params
    );
  },

  async scoreCampaignsTotalCount(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return await models.ScoreCampaigns.countDocuments(filter);
  },

  async scoreCampaign(_root, { _id }, { models }: IContext) {
    return await models.ScoreCampaigns.findOne({ _id });
  }
};

checkPermission(scoreCampaignQueries, "scoreCampaigns", "showScoreCampaigns");
checkPermission(
  scoreCampaignQueries,
  "scoreCampaignsTotalCount",
  "showScoreCampaigns"
);
checkPermission(scoreCampaignQueries, "scoreCampaign", "showScoreCampaigns");

export default scoreCampaignQueries;
