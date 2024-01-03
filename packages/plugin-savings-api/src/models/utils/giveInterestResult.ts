import { IModels } from '../../connectionResolver';
import {
  INTEREST_GIVE_INTERVAL,
  INTEREST_RESULT_TYPE
} from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import storeInterest from './storeInterestUtils';
import { getDaysInMonth, getFullDate } from './utils';

export async function giveInterestResult(
  contract: IContractDocument,
  date: Date,
  models: IModels
) {
  const currentDate = getFullDate(date);
  if (contract.lastStoredDate < currentDate) {
    await storeInterest(contract, models, currentDate);
    const updatedContract = await models.Contracts.findOne({
      _id: contract._id
    }).lean<IContractDocument>();
    if (updatedContract)
      contract.storedInterest = updatedContract?.storedInterest;
  }

  const transaction = {
    contractId: contract._id,
    payDate: currentDate,
    description: 'Auto transaction',
    total: contract.storedInterest,
    companyId: contract.customerType === '' ? contract.customerId : '',
    customerId: contract.customerType === '' ? contract.customerId : '',
    paymentInfo: null,
    transactionType: 'giveStoredInterest',
    closeInterestRate: 0,
    closeInterest: 0,
    interestRate: 0,
    savingAmount: 0
  };

  switch (contract.interestGiveType) {
    case INTEREST_RESULT_TYPE.CURRENT_ACCOUNT:
      models.Transactions.createTransaction(transaction);
      break;
    case INTEREST_RESULT_TYPE.DEPOSIT_ACCOUNT:
      const depositAccount = await models.Contracts.findOne({
        _id: contract.depositAccount
      }).lean<IContractDocument>();
      if (depositAccount) {
        transaction.contractId = depositAccount._id;
        models.Transactions.createTransaction(transaction);
      } else throw new Error(`Deposit account doesn't found`);
      break;
    default:
      break;
  }

  await models.Contracts.updateOne(
    { _id: contract._id },
    { $set: { storedInterest: 0 } }
  );
}

export async function checkContractInterestGive(
  contract: IContractDocument,
  date: Date,
  models: IModels
) {
  switch (contract.interestCalcType) {
    case INTEREST_GIVE_INTERVAL.END_OF_MONTH:
      if (getDaysInMonth(date) === date.getDate())
        giveInterestResult(contract, date, models);
      break;
    case INTEREST_GIVE_INTERVAL.END_OF_CONTRACT:
      if (date === contract.endDate) giveInterestResult(contract, date, models);
      break;
    default:
      break;
  }
}
