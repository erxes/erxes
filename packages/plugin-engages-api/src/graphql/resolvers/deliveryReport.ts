import { DeliveryReports, EngageMessages } from '../../models';

export default {
  __resolveReference({ _id }) {
    return DeliveryReports.findOne({ _id });
  },
  engage(root) {
    return EngageMessages.findOne(
      { _id: root.engageMessageId },
      { title: 1 }
    ).lean();
  }
};
