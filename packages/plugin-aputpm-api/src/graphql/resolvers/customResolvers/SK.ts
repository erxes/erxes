import { IContext } from '../../../connectionResolver';
import { sendKbMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.SafetyTips.findOne({ _id });
  },

  async kbCategory(
    { customFieldsData },
    p,
    { subdomain }: IContext,
    { variableValues: { kbFieldId } }
  ) {
    const skProperty = customFieldsData.find(
      ({ field }) => field === kbFieldId
    );

    return skProperty
      ? sendKbMessage({
          subdomain,
          action: 'categories.findOne',
          data: { query: { _id: skProperty.value } },
          isRPC: true,
          defaultValue: null
        })
      : null;
  }
};
