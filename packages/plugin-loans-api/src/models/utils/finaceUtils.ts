import { IModels } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { CONTRACT_CLASSIFICATION } from '../definitions/constants';
import { IContractTypeDocument } from '../definitions/contractTypes';
import { IContractDocument } from '../definitions/contracts';
import { ITransactionDocument } from '../definitions/transactions';

export async function generateFinance(
  tr: ITransactionDocument,
  models: IModels,
  periodLockId: string,
  subdomain: string
) {
  const contract = await models.Contracts.findOne({ _id: tr.contractId }).lean<
    IContractDocument
  >();

  let customerCode = '';

  if (contract?.customerType == 'customer') {
    const customer = await sendMessageBroker(
      {
        action: 'customers.findOne',
        data: { _id: tr.customerId },
        subdomain,
        isRPC: true
      },
      'contacts'
    );

    customerCode = customer?.code;
  } else {
    const company = await sendMessageBroker(
      {
        action: 'customers.findOne',
        data: { _id: tr.customerId },
        subdomain,
        isRPC: true
      },
      'contacts'
    );
    customerCode = company?.code;
  }

  const contractType = await models.ContractTypes.findOne({
    _id: contract?.contractTypeId
  }).lean<IContractTypeDocument>();
  if (!contract)
    throw new Error('there is not connected transaction with contract');

  let financeTransaction = fillTransaction(
    tr,
    contract,
    contractType?.config,
    periodLockId,
    customerCode
  );

  return financeTransaction;
}

function findAccounts(
  classification: string,
  config: any
): {
  paymentAccount: string;
  interestAccount: string;
  undueAccount: string;
  transAccount: string;
  debtAccount: string;
  insuranceAccount: string;
} {
  const accounts = {
    paymentAccount: config.normalAccount,
    interestAccount: config.interestAccount,
    undueAccount: config.undueAccount,
    transAccount: config.transAccount,
    debtAccount: config.debtAccount,
    insuranceAccount: config.insuranceAccount
  };

  switch (classification) {
    case CONTRACT_CLASSIFICATION.EXPIRED:
      accounts.paymentAccount = config.expiredAccount;
      break;

    case CONTRACT_CLASSIFICATION.DOUBTFUL:
      accounts.paymentAccount = config.doubtfulAccount;
      break;

    case CONTRACT_CLASSIFICATION.NEGATIVE:
      accounts.paymentAccount = config.negativeAccount;
      break;

    case CONTRACT_CLASSIFICATION.BAD:
      accounts.paymentAccount = config.badAccount;
      break;

    default:
      break;
  }

  return accounts;
}

function fillTransaction(
  tr: ITransactionDocument,
  contract: IContractDocument,
  config: any,
  periodLockId: string,
  customerCode: string
) {
  var dtl: {
    amount: number;
    account: string;
    side: 'debit' | 'credit';
  }[] = [];

  const account = findAccounts(contract.classification, config);

  if (tr.payment && tr.payment > 0) {
    dtl.push({
      amount: tr.payment,
      account: account.paymentAccount,
      side: 'credit'
    });
  }
  const interest = (tr.interestEve || 0) + (tr.interestNonce || 0);
  if (interest > 0) {
    dtl.push({
      amount: interest,
      side: 'credit',
      account: account.interestAccount
    });
  }

  if (tr.undue && tr.undue > 0) {
    dtl.push({
      amount: tr.undue,
      side: 'credit',
      account: account.undueAccount
    });
  }

  if (tr.debt && tr.debt > 0) {
    dtl.push({
      amount: tr.debt,
      side: 'credit',
      account: account.debtAccount
    });
  }

  if (tr.insurance && tr.insurance > 0) {
    dtl.push({
      amount: tr.insurance,
      side: 'credit',
      account: account.insuranceAccount
    });
  }

  dtl.push({
    side: 'debit',
    amount: tr.total,
    account: account.transAccount
  });

  return {
    contractId: tr.contractId,
    customerId: tr.customerId,
    customerCode: customerCode,
    periodLockId: periodLockId,
    transactionId: tr._id,
    description: tr.description,
    payDate: tr.payDate,
    generalNumber: `${contract.number}-${new Date(tr.payDate)
      .toISOString()
      .slice(0, 10)}`,
    amount: tr.total,
    dtl
  };
}
