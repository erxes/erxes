import BigNumber from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { calcInterest, getDiffDay } from './utils';
import { getConfig } from '../../messageBroker';

export const getCloseInfo = async (
  models: IModels,
  subdomain,
  contract: IContractDocument,
  date: Date = new Date()
) => {
  const contractType = await models.ContractTypes.findOne({
    _id: contract.contractTypeId
  }).lean();
  if (!contractType) {
    throw new Error('Contract Type not found');
  }

  const config = await getConfig('savingConfig', subdomain);

  const day = getDiffDay(contract.startDate, date);

  const preCloseInterest = calcInterest({
    balance: contract.savingAmount,
    interestRate: contractType.closeInterestRate,
    dayOfMonth: day,
    fixed: Number(config?.calculationFixed || 2)
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
