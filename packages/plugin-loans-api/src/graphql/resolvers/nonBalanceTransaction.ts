import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { INonBalanceTransaction } from '../../models/definitions/nonBalanceTransactions';

const nonBalanceTransactions = {

  async customer(nonBalanceTransaction: INonBalanceTransaction, _, { subdomain }: IContext) {
    return sendMessageBroker(
      {
        subdomain,
        action: 'customers.findOne',
        data: { _id: nonBalanceTransaction.customerId },
        isRPC: true
      },
      'core'
    );
  },
  async contract(nonBalanceTransaction: INonBalanceTransaction, _, { models }: IContext) {
    return models.Contracts.findOne({ _id: nonBalanceTransaction.contractId });
  }
};

export default nonBalanceTransactions;
