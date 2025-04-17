import { IContext } from "../../../connectionResolver";
import { sendCommonMessage } from "../../../messageBroker";
import { IScoreLog } from "../../../models/definitions/scoreLog";
import { getOwner } from "../../../models/utils";

const TARGET_ACTIONS = {
  pos: { action: "orders.findOne", fields: ["items", "number", "totalAmount"] },
  sales: { action: "deals.findOne", fields: ["productsData", "number"] },
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
  const { action, fields } = TARGET_ACTIONS[serviceName] || {};

  if (!targetId || !serviceName || !TARGET_ACTIONS[serviceName]) {
    return null;
  }

  const target = await sendCommonMessage({
    subdomain,
    serviceName,
    action,
    data: {
      _id: targetId,
    },
    isRPC: true,
    defaultValue: null,
  });

  if (!target) {
    return null;
  }

  return Object.fromEntries(
    fields.map((field: string) => [field, target[field]])
  );
};

export default {
  async campaign(score: IScoreLog, _args, { models, subdomain }: IContext) {
    return await models.ScoreCampaigns.findOne({ _id: score.campaignId });
  },

  type(score: IScoreLog) {
    return score?.serviceName || null;
  },
  async target(score: IScoreLog, _args, { models, subdomain }: IContext) {
    if (!score?.targetId || !score.serviceName) {
      return null;
    }
    return await fetchTarget({
      targetId: score?.targetId,
      serviceName: score.serviceName,
      subdomain,
    });
  },
};
