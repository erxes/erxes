import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { IScoreLog } from '../../../models/definitions/scoreLog';
import { getOwner } from '../../../models/utils';

const TARGET_ACTIONS = {
  pos: 'orders.find',
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
  if (!targetId || !serviceName) {
    return [];
  }

  const target = await sendCommonMessage({
    subdomain,
    serviceName,
    action: TARGET_ACTIONS[serviceName],
    data: {
      _id: targetId,
    },
    isRPC: true,
    defaultValue: [],
  });

  return target;
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

      const [target] = await fetchTarget({ targetId, serviceName, subdomain });

      const campaign = scoreCampaigns.find(
        (scoreCampaign) => scoreCampaign._id === campaignId,
      );

      updatedScoreLogs.push({
        ...scoreLog,
        target,
        campaign,
      });
    }

    return updatedScoreLogs;
  },
};
