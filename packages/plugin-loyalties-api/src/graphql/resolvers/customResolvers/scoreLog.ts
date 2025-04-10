import { IContext } from "../../../connectionResolver";
import { sendCommonMessage } from "../../../messageBroker";
import { IScoreLog } from "../../../models/definitions/scoreLog";
import { getOwner } from "../../../models/utils";

const TARGET_ACTIONS = {
  pos: { action: "orders.find", field: "items" },
  sales: { action: "deals.find", field: "productsData" },
};

const fetchTarget = async ({
  targetId,
  serviceName,
  subdomain,
}: {
  targetId: string;
  serviceName: string;
  subdomain: string;
}) => {
  const { action, field } = TARGET_ACTIONS[serviceName] || {};

  if (!targetId || !serviceName || !TARGET_ACTIONS[serviceName]) {
    return [];
  }

  const [target] = await sendCommonMessage({
    subdomain,
    serviceName,
    action,
    data: {
      _id: targetId,
    },
    isRPC: true,
    defaultValue: [],
  });

  if (!target || !target[field]) {
    return [];
  }

  return target[field];
};

export default {
  async owner(voucher: IScoreLog, _args, { subdomain }: IContext) {
    return getOwner(subdomain, voucher.ownerType, voucher.ownerId);
  },
  async scoreLogs(score: any, _args, { models, subdomain }: IContext) {
    const { scoreLogs } = score;

    const campaignIds = scoreLogs.map((scoreLog) => scoreLog.campaignId);

    const scoreCampaigns = await models.ScoreCampaigns.find({
      _id: { $in: campaignIds },
    }).lean();

    const updatedScoreLogs: any = [];

    for (const scoreLog of scoreLogs) {
      const { campaignId, targetId, serviceName } = scoreLog;

      const target = await fetchTarget({ targetId, serviceName, subdomain });

      const campaign = scoreCampaigns.find(
        (scoreCampaign) => scoreCampaign._id === campaignId
      );

      updatedScoreLogs.push({
        ...scoreLog,
        target,
        type: serviceName,
        campaign,
      });
    }

    return updatedScoreLogs;
  },
};
