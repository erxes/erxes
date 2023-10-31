import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { ITransaction } from '../../models/definitions/transactions';

const Transactions = {
  company(transaction: ITransaction, {}, { subdomain }: IContext) {
    return sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: transaction.companyId },
        isRPC: true
      },
      'contacts'
    );
  },
  customer(transaction: ITransaction, {}, { subdomain }: IContext) {
    return sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: transaction.companyId },
        isRPC: true
      },
      'contacts'
    );
  },
  contract(transaction: ITransaction, {}, { models }: IContext) {
    return models.Contracts.findOne({ _id: transaction.contractId });
  }
};

export default Transactions;
