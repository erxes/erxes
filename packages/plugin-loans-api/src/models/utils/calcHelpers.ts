import { BigNumber } from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { calcLoss } from './lossUtils';
import { calcInterest, getDatesDiffMonth, getDiffDay, getFullDate } from './utils';
import { IScheduleDocument } from '../definitions/schedules';

export const getCalcedAmountsOnDate = async (models: IModels, contract: IContractDocument, date: Date, calculationFixed?: number) => {
  if (!calculationFixed) {
    calculationFixed = 2
  }
  const currentDate = getFullDate(date)
  const result: {
    balance: number;
    didBalance: number;
    unUsedBalance: number;

    loss: number;
    interestEve: number;
    interestNonce: number;
    storedInterest: number;
    commitmentInterest: number;
    payment: number;
    insurance: number;
    debt: number;
    total: number;
    giveAmount: number;
    calcInterest: number;
    closeAmount: number;
    preSchedule?: IScheduleDocument,
    skippedSchedules?: IScheduleDocument[]
  } = {
    // status: 'pending' | 'done' | 'skipped' | 'pre' | 'less' | 'expired' | 'give';
    balance: 0,
    didBalance: 0,
    unUsedBalance: 0,

    loss: 0,
    interestEve: 0,
    interestNonce: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    payment: 0,
    insurance: 0,
    debt: 0,
    total: 0,
    giveAmount: 0,
    calcInterest: 0,
    closeAmount: 0,
  }

  const preSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: { $lte: currentDate },
    didBalance: { $exists: true, $gte: 0 }
  }).sort({ payDate: -1, createdAt: -1 }).lean();

  if (!preSchedule) {
    return result;
  }

  const skippedSchedules = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $gt: preSchedule.payDate, $lte: currentDate },
  }).sort({ payDate: -1, createdAt: -1 }).lean();

  const diffDay = getDiffDay(preSchedule.payDate, currentDate);
  if (!diffDay) {
    return {
      balance: preSchedule.balance ?? 0,
      didBalance: preSchedule.didBalance ?? 0,
      unUsedBalance: preSchedule.unUsedBalance ?? 0,

      loss: (preSchedule.loss ?? 0) - (preSchedule.didLoss ?? 0),
      interestEve: (preSchedule.interestEve ?? 0) - (preSchedule.didInterestEve ?? 0),
      interestNonce: (preSchedule.interestNonce ?? 0) - (preSchedule.didInterestNonce ?? 0),
      storedInterest: (preSchedule.storedInterest ?? 0) - (preSchedule.didStoredInterest ?? 0),
      commitmentInterest: preSchedule.commitmentInterest ?? 0,
      payment: (preSchedule.payment ?? 0) - (preSchedule.didPayment ?? 0),
      insurance: (preSchedule.insurance ?? 0) - (preSchedule.didInsurance ?? 0),
      debt: (preSchedule.debt ?? 0) - (preSchedule.didDebt ?? 0),
      total: (preSchedule.total ?? 0) - (preSchedule.total ?? 0),
      giveAmount: preSchedule.giveAmount ?? 0,
      calcInterest: BigNumber(preSchedule.storedInterest ?? 0).plus(preSchedule.interestEve ?? 0).plus(preSchedule.interestNonce ?? 0)
        .minus(preSchedule.didStoredInterest ?? 0).minus(preSchedule.didInterestEve ?? 0).minus(preSchedule.didInterestNonce ?? 0).toNumber(),
      closeAmount: BigNumber(preSchedule.didBalance ?? 0).plus(preSchedule.total).minus(preSchedule.didTotal ?? 0).toNumber(),
      preSchedule,
      skippedSchedules
    }
  }

  result.unUsedBalance = preSchedule.unUsedBalance;
  result.insurance = (preSchedule.insurance ?? 0) - (preSchedule.didInsurance ?? 0);
  result.debt = (preSchedule.debt ?? 0) - (preSchedule.didDebt ?? 0);

  const interest = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(preSchedule.payDate, currentDate);

  const calcedInterestEve = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });
  const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();

  const commitmentInterest = calcInterest({
    balance: preSchedule.unUsedBalance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  result.interestEve = new BigNumber(preSchedule.interestEve ?? 0).minus(preSchedule.didInterestEve ?? 0).plus(calcedInterestEve).toNumber();
  result.interestNonce = new BigNumber(preSchedule.interestNonce || 0).minus(preSchedule.didInterestNonce ?? 0).plus(calcedInterestNonce).toNumber();
  result.storedInterest = new BigNumber(preSchedule.storedInterest || 0).minus(preSchedule.didStoredInterest ?? 0).toNumber();
  result.commitmentInterest = new BigNumber(preSchedule.commitmentInterest || 0).plus(commitmentInterest).toNumber();
  result.payment = new BigNumber(preSchedule.payment ?? 0).minus(preSchedule.didPayment ?? 0).plus((skippedSchedules || []).reduce((sum, cur) => sum + (cur.payment ?? 0), 0)).toNumber();


  result.balance = new BigNumber(preSchedule.balance).plus(preSchedule.payment ?? 0).minus(result.payment).toNumber();
  result.didBalance = new BigNumber(preSchedule.didBalance ?? 0).toNumber();

  result.loss = new BigNumber(preSchedule.loss ?? 0).minus(preSchedule.didLoss ?? 0).toNumber();
  let lossDiffDay = diffDay - (contract?.skipLossDay || 0);
  if (lossDiffDay > 0) {
    result.loss = new BigNumber(result.loss ?? 0).plus(
      await calcLoss(
        contract,
        {
          balance: preSchedule.balance,
          interest: new BigNumber(preSchedule.interestEve ?? 0).plus(preSchedule.interestEve ?? 0).plus(preSchedule.storedInterest ?? 0).toNumber(),
          payment: preSchedule.payment ?? 0
        },
        contract.lossPercent ?? 0,
        lossDiffDay,
        { calculationFixed }
      )
    ).toNumber()
  }

  result.total = new BigNumber(result.payment)
    .plus(result.interestEve).plus(result.interestNonce).plus(result.storedInterest)
    .plus(result.insurance).plus(result.debt).plus(result.loss).toNumber();

  const closeAmount = BigNumber(preSchedule.didBalance ?? preSchedule.balance).plus(result.total).toNumber();

  return {
    ...result,
    calcInterest: BigNumber(result.storedInterest).plus(result.interestEve).plus(result.interestNonce).toNumber(),
    closeAmount,
    preSchedule,
    skippedSchedules
  };
}

export const getAmountByPriority = (
  total: number, params: {
    debt: number, loss: number,
    storedInterest: number, interestEve: number, interestNonce: number,
    insurance: number, payment: number
  }
) => {
  const {
    debt, loss, storedInterest, interestEve, interestNonce, payment, insurance,
  } = params;

  const result = {
    status: SCHEDULE_STATUS.LESS,
    didPayment: 0,
    didLoss: 0,
    didInterestEve: 0,
    didInterestNonce: 0,
    didInsurance: 0,
    didDebt: 0,
    didStoredInterest: 0,
  }

  let mainAmount = total;

  if (debt > mainAmount) {
    result.didDebt = mainAmount;
    return result;
  }

  result.didDebt = debt;
  mainAmount = mainAmount - debt;
  if (loss > mainAmount) {
    result.didLoss = mainAmount;
    return result;
  }

  result.didLoss = loss;
  mainAmount = mainAmount - loss;
  if (storedInterest > mainAmount) {
    result.didStoredInterest = mainAmount;
    return result;
  }

  result.didStoredInterest = storedInterest;
  mainAmount = mainAmount - storedInterest;
  if (interestEve > mainAmount) {
    result.didInterestEve = mainAmount;
    return result;
  }

  result.didInterestEve = interestEve;
  mainAmount = mainAmount - interestEve;
  if (interestNonce > mainAmount) {
    result.didInterestNonce = mainAmount;
    return result;
  }

  result.didInterestNonce = interestNonce;
  mainAmount = mainAmount - interestNonce;
  if (payment > mainAmount) {
    result.didPayment = mainAmount;
    return result;
  }

  result.status = SCHEDULE_STATUS.DONE;
  result.didPayment = payment;
  mainAmount = mainAmount - payment;
  if (insurance > mainAmount) {
    result.didInsurance = mainAmount;
    return result;
  }

  result.didInsurance = insurance;
  mainAmount = mainAmount - insurance;
  result.didPayment = result.didPayment + mainAmount;

  return result;
}

export const getFreezeAmount = async (firstPayAmount, didPayment, preBalance, interestRate, diffDay, calculationFixed) => {
  let nowBalance = preBalance - didPayment;

  const interest = calcInterest({
    balance: nowBalance,
    interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const diff = new BigNumber(interest).plus(didPayment).minus(firstPayAmount).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();

  if (diff > 0) {
    return await getFreezeAmount(firstPayAmount, didPayment - diff, preBalance, interestRate, diffDay, calculationFixed);
  }

  return interest;
}
