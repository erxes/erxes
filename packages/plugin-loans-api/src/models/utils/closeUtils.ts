import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { getCalcedAmountsOnDate } from './calcHelpers';
import { getFullDate } from './utils';

export const getCloseInfo = async (
  models: IModels,
  contract: IContractDocument,
  date: Date = new Date()
) => {
  const closeDate = getFullDate(date);
  const paymentInfo = await getCalcedAmountsOnDate(models, contract, closeDate, 2);

  return { ...paymentInfo, interest: paymentInfo.calcInterest, total: paymentInfo.closeAmount };
};
