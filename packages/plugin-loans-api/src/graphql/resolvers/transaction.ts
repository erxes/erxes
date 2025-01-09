import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { ITransaction } from '../../models/definitions/transactions';

const Transactions = {
  async company(transaction: ITransaction, _, { subdomain }: IContext) {
    return sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: transaction.companyId },
        isRPC: true
      },
      'core'
    );
  },
  async customer(transaction: ITransaction, _, { subdomain }: IContext) {
    return sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: transaction.companyId },
        isRPC: true
      },
      'core'
    );
  },
  async contract(transaction: ITransaction, _, { models }: IContext) {
    return models.Contracts.findOne({ _id: transaction.contractId });
  },
  async invoice(transaction: ITransaction, _, { models }: IContext) {
    return models.Invoices.findOne({ _id: transaction.invoiceId });
  }
};

export default Transactions;
