import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { IContractDocument } from '../../models/definitions/contracts';
import { IContract } from '../../models/definitions/contracts';

const Contracts = {
  contractType(contract: IContract, {}, { models }: IContext) {
    return models.ContractTypes.findOne({ _id: contract.contractTypeId });
  },

  async customers(contract: IContract, {}, { subdomain }: IContext) {
    if (contract.customerType !== 'customer') return null;

    const customer = await sendMessageBroker(
      {
        subdomain,
        action: 'customers.findOne',
        data: { _id: contract.customerId },
        isRPC: true
      },
      'contacts'
    );

    return customer;
  },

  async companies(contract: IContract, {}, { subdomain }: IContext) {
    if (contract.customerType !== 'company') return null;

    const company = await sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: contract.customerId },
        isRPC: true
      },
      'contacts'
    );

    return company;
  },

  async hasTransaction(contract: IContractDocument, {}, { models }: IContext) {
    return (
      (await models.Transactions.countDocuments({
        contractId: contract._id
      })) > 0
    );
  },

  async savingTransactionHistory(
    contract: IContractDocument,
    {},
    { models }: IContext
  ) {
    const transactions = await models.Transactions.find({
      contractId: contract._id
    })
      .sort({ createdAt: -1 })
      .lean();

    return transactions;
  },
  async storeInterest(contract: IContractDocument, {}, { models }: IContext) {
    const transactions = await models.Transactions.find({
      contractId: contract._id
    })
      .sort({ createdAt: -1 })
      .lean();

    return transactions;
  }
};

export default Contracts;
