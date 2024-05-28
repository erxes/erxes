import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendKbMessage } from '../../../messageBroker';
import { ISafetyTip } from '../../../models/definitions/safetyTips';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.SafetyTips.findOne({ _id });
  },

  async branches(
    { branchIds }: ISafetyTip,
    {},
    { models, subdomain }: IContext
  ) {
    return !!branchIds?.length
      ? await sendCoreMessage({
          subdomain,
          action: 'branches.find',
          data: {
            query: { _id: { $in: branchIds } },
            fields: { title: 1 }
          },
          isRPC: true,
          defaultValue: []
        })
      : null;
  },

  async kbCategory({ kbCategoryId }, {}, { subdomain }: IContext) {
    return kbCategoryId
      ? sendKbMessage({
          subdomain,
          action: 'categories.findOne',
          data: { query: { _id: kbCategoryId } },
          isRPC: true,
          defaultValue: null
        })
      : null;
  }
};
