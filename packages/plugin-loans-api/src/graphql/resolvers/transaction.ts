import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { ITransaction } from '../../models/definitions/transactions';

const Transactions = {
  company(transaction: ITransaction, _, { subdomain }: IContext) {
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
  customer(transaction: ITransaction, _, { subdomain }: IContext) {
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
  contract(transaction: ITransaction, _, { models }: IContext) {
    return models.Contracts.findOne({ _id: transaction.contractId });
  },
  invoice(transaction: ITransaction, _, { models }: IContext) {
    return models.Invoices.findOne({ _id: transaction.invoiceId });
  }
};

export default Transactions;
