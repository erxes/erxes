import BigNumber from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { calcInterest, getDiffDay } from './utils';

export const getCloseInfo = async (
  models: IModels,
  subdomain,
  contract: IContractDocument,
  date: Date = new Date()
) => {
  const day = getDiffDay(contract.startDate, date);
  const preCloseInterest = calcInterest({
    balance: contract.savingAmount,
    interestRate: contract.closeInterestRate,
    dayOfMonth: day,
    fixed: 2
  });
  const result = {
    balance: contract.savingAmount,
    storedInterest: contract.storedInterest,
    calcedInterest: 0,
    preCloseInterest: preCloseInterest,
    total: 0
  };

  if (date < contract.endDate) {
    result.total = new BigNumber(contract.savingAmount)
      .plus(preCloseInterest)
      .toNumber();
  } else {
    result.total = new BigNumber(contract.savingAmount)
      .plus(contract.storedInterest)
      .toNumber();
  }
  return result;
};
