import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendFormsMessage } from '../../../messageBroker';
import { getBalance } from '../../../utils';

const blockQueries = {
  async getBalance(_root, { erxesCustomerId }, { subdomain }: IContext) {
    return getBalance(subdomain, erxesCustomerId);
  },

  async totalInvestment(_root, _arg, { models }: IContext) {
    const total =
      (await models.Investments.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount'
            }
          }
        }
      ])) || [];

    const amount = total[0] ? total[0].total : 0;

    return amount;
  },

  async investments(_root, { erxesCustomerId }, { models }: IContext) {
    return models.Investments.find({ erxesCustomerId }).sort({ createdAt: -1 });
  },

  async isVerified(_root, { erxesCustomerId }, { subdomain }: IContext) {
    let isVerified = false;

    const field = await sendFormsMessage({
      subdomain,
      action: 'fields.findOne',
      data: {
        query: {
          code: 'verified'
        }
      },
      isRPC: true
    });

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: erxesCustomerId },
      isRPC: true,
      defaultValue: {}
    });

    const customFieldsData = customer.customFieldsData || [];

    if (customFieldsData.length > 0) {
      for (const customField of customFieldsData) {
        if (customField.field === field._id) {
          isVerified = customField.value === 'true' ? true : false;
        }
      }
    }

    return isVerified;
  }
};

export default blockQueries;
