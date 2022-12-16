import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { IDayLabelDocument } from '../../../models/definitions/dayLabels';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.DayLabels.findOne({ _id });
  },

  async branch(dayLabel: IDayLabelDocument, _, { subdomain }: IContext) {
    if (!dayLabel.branchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: dayLabel.branchId },
      isRPC: true
    });
  },

  async department(dayLabel: IDayLabelDocument, _, { subdomain }: IContext) {
    if (!dayLabel.departmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: dayLabel.departmentId },
      isRPC: true
    });
  },

  async labels(dayLabel: IDayLabelDocument, _, { models }: IContext) {
    return await models.Labels.find({ _id: { $in: dayLabel.labelIds } });
  }
};
