import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendFormsMessage } from '../../../messageBroker';

const blockQueries = {
  async getBalance(_root, { erxesCustomerId }, { models }: IContext) {
    const block = await models.Blocks.findOne({ erxesCustomerId });

    let balance = 0;

    if (block) {
      balance = block.balance;
    }

    return balance;
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

    const amount = total[0] ? total[0].total || 0 : 0;

    return amount;
  },

  async totalInvestmentCount(_root, _arg, { models }: IContext) {
    const total = await models.Investments.find({}).count();

    return total;
  },

  async investments(_root, { erxesCustomerId }, { models }: IContext) {
    return models.Investments.find({ erxesCustomerId }).sort({ createdAt: -1 });
  },

  async isVerified(_root, { erxesCustomerId }, { models }: IContext) {
    let isVerified = 'false';

    const block = await models.Blocks.findOne({ erxesCustomerId });

    if (block) {
      isVerified = block.isVerified;
    }

    return isVerified;
  }
};

export default blockQueries;
