import { IContext } from "../../connectionResolver";
import { IDeliveryReportsDocument } from "../../models/DeliveryReports";

export default {
  __resolveReference({ _id }: IDeliveryReportsDocument, _args, { models }: IContext) {
    return models.DeliveryReports.findOne({ _id });
  },
  engage({ engageMessageId }: IDeliveryReportsDocument, _args, { models }: IContext) {
    return models.EngageMessages.findOne({ _id: engageMessageId }, { title: 1 });
  }
};
