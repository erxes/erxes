import BigNumber from 'bignumber.js';
import { IConfig } from '../../interfaces/config';
import { LOSS_CALC_TYPE } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';

interface IPaymentInfo {
  payment: number;
  interest: number;
  balance: number;
}

export const calcLoss = async (
  contract: IContractDocument,
  paymentInfo: IPaymentInfo,
  lossPercent: number,
  diff: number,
  config: IConfig
): Promise<number> => {
  let result = 0;

  switch (contract.lossCalcType) {
    case LOSS_CALC_TYPE.FROMAMOUNT:
      result = new BigNumber(paymentInfo.payment)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    case LOSS_CALC_TYPE.FROMINTEREST:
      result = new BigNumber(paymentInfo.interest)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    case LOSS_CALC_TYPE.FROMTOTALPAYMENT:
      result = new BigNumber(
        new BigNumber(paymentInfo.payment).plus(paymentInfo.interest)
      )
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    default:
      result = new BigNumber(paymentInfo.balance)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;
  }
  return result;
};
