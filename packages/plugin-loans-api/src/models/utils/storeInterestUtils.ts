import BigNumber from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { IStoredInterest, IStoredInterestDocument } from '../definitions/storedInterest';
import { calcInterest, getDiffDay, getFullDate } from './utils';
import { IConfig } from '../../interfaces/config';

export async function storeInterestContract(
  contract: IContractDocument,
  storeDate: Date,
  models: IModels,
  periodLockId: string,
  config: IConfig
) {
  // const beginDate = getFullDate(contract.lastStoredDate);
  const beginDate = getFullDate(storeDate);
  const invDate = getFullDate(storeDate);

  const lastStoredInterest = await models.StoredInterest.findOne({
    invDate: { $lte: invDate }
  })
    .sort({ invDate: -1 })
    .lean<IStoredInterestDocument>();

  if (invDate === lastStoredInterest?.invDate) return;

  const diffDay = getDiffDay(beginDate, invDate);

  const storeInterestAmount = calcInterest({
    balance: 0, //contract.loanBalanceAmount,
    interestRate: contract.interestRate,
    dayOfMonth: diffDay,
    fixed: config.calculationFixed
  });

  if (storeInterestAmount > 0) {

    const storeInterest: IStoredInterest = {
      amount: storeInterestAmount,
      contractId: contract._id,
      invDate: invDate,
      prevStoredDate: new Date(),//contract.lastStoredDate,
      commitmentInterest: 0,
      periodLockId,
      number: contract.number,
      description: '',
      type: ''
    }

    await models.StoredInterest.create(storeInterest);

    // if (new BigNumber(contract.storedInterest).isGreaterThan(0))
    if (new BigNumber(0).isGreaterThan(0))
      await models.Contracts.updateOne(
        { _id: contract._id },
        {
          $inc: { storedInterest: storeInterestAmount },
          $set: {
            lastStoredDate: invDate
          }
        }
      );
    else {
      await models.Contracts.updateOne(
        { _id: contract._id },
        {
          $set: {
            lastStoredDate: invDate,
            storedInterest: storeInterestAmount
          }
        }
      );
    }
  }
}
