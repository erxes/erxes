import { IContext } from "../../connectionResolver";
import { sendCoreMessage } from "../../messageBroker";
import { IIndicatorsGroupsDocument } from "../../models/definitions/indicator";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.IndicatorsGroups.findOne({ _id });
  },
  async tags(
    indicator: IIndicatorsGroupsDocument,
    {},
    { subdomain }: IContext
  ) {
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
