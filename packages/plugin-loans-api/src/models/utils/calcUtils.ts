import { BigNumber } from 'bignumber.js';
import * as moment from 'moment';
import { IModels } from '../../connectionResolver';
import { IConfig } from '../../interfaces/config';
import { getConfig } from '../../messageBroker';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { ITransactionDocument } from '../definitions/transactions';
import { calcLoss } from './lossUtils';
import { generateSchedules } from './scheduleUtils';
import { calcInterest, getDatesDiffMonth, getDiffDay, getFullDate } from './utils';
import { ISchedule, IScheduleDocument } from '../definitions/schedules';
import { after } from 'node:test';

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

      loss: preSchedule.loss ?? 0,
      interestEve: preSchedule.interestEve ?? 0,
      interestNonce: preSchedule.interestNonce ?? 0,
      storedInterest: preSchedule.storedInterest ?? 0,
      commitmentInterest: preSchedule.commitmentInterest ?? 0,
      payment: preSchedule.payment ?? 0,
      insurance: preSchedule.insurance ?? 0,
      debt: preSchedule.debt ?? 0,
      total: preSchedule.total ?? 0,
      giveAmount: preSchedule.giveAmount ?? 0,
      calcInterest: BigNumber(preSchedule.storedInterest ?? 0).plus(preSchedule.interestEve ?? 0).plus(preSchedule.interestNonce ?? 0).toNumber(),
      closeAmount: BigNumber(preSchedule.didBalance ?? 0).plus(preSchedule.total).toNumber(),
    }
  }

  result.unUsedBalance = preSchedule.unUsedBalance;
  result.insurance = (preSchedule.insurance ?? 0) - (preSchedule.didInsurance ?? 0);
  result.debt = (preSchedule.debt ?? 0) - (preSchedule.didDebt ?? 0);

  const interest = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: contract.interestRate, // stepRule
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(preSchedule.payDate, currentDate);

  const calcedInterestEve = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: contract.interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });
  const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();

  const commitmentInterest = calcInterest({
    balance: preSchedule.unUsedBalance,
    interestRate: contract.interestRate, // stepRule
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

  const closeAmount = BigNumber(preSchedule.didBalance ?? preSchedule.balance).plus(result.total).toNumber()
  return {
    ...result,
    calcInterest: BigNumber(result.storedInterest).plus(result.interestEve).plus(result.interestNonce).toNumber(),
    closeAmount,
    preSchedule,
    skippedSchedules
  };
}

const firstGiveTr = async (subdomain, models: IModels, contract: IContractDocument, tr: ITransactionDocument) => {
  const unUsedBalance = new BigNumber(contract.leaseAmount).minus(tr.total).toNumber()
  await models.Schedules.create({
    contractId: contract._id,
    status: SCHEDULE_STATUS.GIVE,
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).toNumber(),
    didBalance: new BigNumber(tr.total || 0).toNumber(),
    unUsedBalance,
    interestEve: 0,
    interestNonce: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    loss: 0,
    payment: 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  contract.leaseAmount = tr.total;
  contract.startDate = getFullDate(tr.payDate);
  const bulkEntries = await generateSchedules(subdomain, models, contract, unUsedBalance);

  await models.Schedules.insertMany(bulkEntries.map(b => ({ ...b, unUsedBalance })));
}

export const fixFutureSchedules = async (subdomain, models: IModels, contract: IContractDocument, futureSchedules: ISchedule[], currentSchedule: ISchedule) => {
  // TODO: dahin uldseniig uguhud ireeduin huvaari uldegdeldee dahin generate
  // const fakeContract = {
  //   ...contract

  // };
  // const bulkEntries: any[] = [];
  // for (const fSch of futureSchedules) {

  // }

}

export const afterGiveTrInSchedule = async (subdomain, models: IModels, contract: IContractDocument, tr: ITransactionDocument, calculationFixed = 2) => {
  const alreadySchedules = await models.Schedules.findOne({ contractId: contract._id }).lean();
  const alreadyTrs = await models.Transactions.find({ contractId: contract._id }).lean();

  if (!alreadySchedules?._id) {
    await firstGiveTr(subdomain, models, contract, tr);
    return;
  }

  const afterSchedules = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $gt: tr.payDate }
  }).sort({ payDate: 1, giveAmount: -1, didStoredInterest: -1, didInterestNonce: -1, didInterestEve: -1 }).lean();

  const amounts = await getCalcedAmountsOnDate(models, contract, tr.payDate, calculationFixed);

  let unUsedBalance = new BigNumber(amounts.unUsedBalance).minus(tr.total).toNumber();
  if (unUsedBalance < 0) {
    // hetrelt baij bolzoshgui shalgah
    unUsedBalance = 0;
  }

  const currentSchedule = await models.Schedules.create({
    contractId: contract._id,
    status: SCHEDULE_STATUS.GIVE,
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).plus(amounts.balance).toNumber(),
    didBalance: new BigNumber(tr.total || 0).plus(amounts.didBalance).toNumber(),
    unUsedBalance,
    interestEve: amounts.interestEve ?? 0,
    interestNonce: amounts.interestNonce ?? 0,
    storedInterest: amounts.storedInterest ?? 0,
    commitmentInterest: amounts.commitmentInterest ?? 0,
    insurance: amounts.insurance ?? 0,
    debt: amounts.debt ?? 0,
    payment: amounts.payment ?? 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  await fixFutureSchedules(subdomain, models, contract, afterSchedules, currentSchedule);
}

const getAmountByPriority = (
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
export const afterPayTrInSchedule = async (models: IModels, contract: IContractDocument, tr: ITransactionDocument, config) => {
  // contract.allowLateDay;
  const currentDate = getFullDate(tr.payDate);
  tr.total
  const calculationFixed = config.calculationFixed || 2

  const amounts = await getCalcedAmountsOnDate(models, contract, tr.payDate, calculationFixed);
  const { preSchedule, skippedSchedules } = amounts;
  if (!preSchedule) {
    return;
  }

  let surplus = 0;
  const didInfo = getAmountByPriority(
    tr.total, { ...amounts }
  );
  const { didDebt, didLoss, didStoredInterest, didInterestEve, didInterestNonce, didInsurance, didPayment } = didInfo;
  let status = didInfo.status;

  // payment iig tulvul balance uldeh yostoi baidgaas undeslev
  // let didBalance = preSchedule.balance + (preSchedule.payment ?? 0) - didPayment
  let didBalance = (preSchedule.didBalance ?? 0) - didPayment
  if (didBalance <= 0) {
    status = SCHEDULE_STATUS.COMPLETE;
    surplus = didBalance * -1
    didBalance = 0;
  }

  let currentSchedule = preSchedule?.payDate === currentDate ?
    preSchedule :
    skippedSchedules?.find(ss => ss.payDate === currentDate);


  if (currentSchedule) {
    models.Schedules.updateOne({
      _id: currentSchedule._id
    }, {
      $set: {
        status,
        didDebt,
        didLoss,
        didStoredInterest,
        didInterestEve,
        didInterestNonce,
        didInsurance,
        didPayment,
        didBalance,
        didTotal: tr.total,
        surplus
      },
      $addToSet: { transactionIds: tr._id }
    })
  } else {
    currentSchedule = await models.Schedules.create({
      contractId: contract._id,
      status,

      balance: amounts.balance,
      unUsedBalance: amounts.unUsedBalance,

      loss: amounts.loss,
      interestEve: amounts.interestEve,
      interestNonce: amounts.interestNonce,
      storedInterest: amounts.storedInterest,
      commitmentInterest: amounts.commitmentInterest,
      payment: amounts.payment,
      insurance: amounts.insurance,
      debt: amounts.debt,
      total: amounts.total,

      didDebt,
      didLoss,
      didStoredInterest,
      didInterestEve,
      didInterestNonce,
      didInsurance,
      didPayment,
      didBalance,
      didTotal: tr.total,
      surplus,
      transactionIds: [tr._id]
    })
  }
  const updStatusSchedules = skippedSchedules?.filter(ss => ss.payDate !== currentDate);
  if (updStatusSchedules?.length) {
    await models.Schedules.updateMany({ _id: { $in: updStatusSchedules.map(u => u._id) } }, { $set: { status: SCHEDULE_STATUS.SKIPPED } });
  }

  if (amounts.payment < didPayment) {
    const afterSchedules = await models.Schedules.find({
      contractId: contract._id,
      payDate: { $gt: tr.payDate }
    }).sort({ payDate: 1, createdAt: 1 }).lean();

    if (afterSchedules.length) {
      let diffPayment = didPayment - amounts.payment;
      let indBalance = currentSchedule.didBalance ?? 0;
      let indDate = currentSchedule.payDate;


      for (const afterCurrentSchedule of afterSchedules) {
        if (diffPayment <= 0) {
          break;
        }
        const diffDay = getDiffDay(currentDate, afterCurrentSchedule.payDate)

        const interest = calcInterest({
          balance: indBalance,
          interestRate: contract.interestRate,
          dayOfMonth: diffDay,
          fixed: calculationFixed
        });

        const { diffEve } = getDatesDiffMonth(currentDate, afterCurrentSchedule.payDate);

        const calcedInterestEve = calcInterest({
          balance: indBalance,
          interestRate: contract.interestRate,
          dayOfMonth: diffEve,
          fixed: calculationFixed
        });

        const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()
        let currPayment = 0;
        if (diffPayment < (afterCurrentSchedule.payment ?? 0)) {
          currPayment = (afterCurrentSchedule.payment ?? 0) - diffPayment
        }
        indBalance = indBalance - currPayment


        await models.Schedules.updateOne({ _id: afterCurrentSchedule._id }, {
          $set: {
            interestEve: calcedInterestEve,
            interestNonce: calcedInterestNonce,
            payment: currPayment,
            balance: indBalance,
            total: calcedInterestEve + calcedInterestNonce + currPayment

          }
        })

        diffPayment = diffPayment - (afterCurrentSchedule.payment ?? 0);
        indDate = afterCurrentSchedule.payDate;
      }
    }

  }




}

export const trInSchedule = async (subdomain: string, models: IModels, contract: IContractDocument, tr: ITransactionDocument) => {
  const config: IConfig = await getConfig("loansConfig", subdomain, {});
  if (tr.transactionType === 'give') {
    afterGiveTrInSchedule(subdomain, models, contract, tr, config.calculationFixed)
  } else {
    afterPayTrInSchedule(models, contract, tr, config)
  }
}