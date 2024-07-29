import { IContext } from "../../connectionResolver";
import { sendCoreMessage } from "../../messageBroker";
import { IRiskIndicatorsDocument } from "../../models/definitions/indicator";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskIndicators.findOne({ _id });
  },

  async tags(indicator: IRiskIndicatorsDocument, {}, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: "tagFind",
      data: {
        _id: { $in: indicator.tagIds }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};
