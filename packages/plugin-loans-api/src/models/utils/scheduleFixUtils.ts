import { IModels } from '../../connectionResolver';
import { IConfig } from '../../interfaces/config';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import {
  ITransaction,
  ITransactionDocument
} from '../definitions/transactions';
import { getInterest } from './interestUtils';
import { calcLoss } from './lossUtils';
import { calcInterest, getDatesDiffMonth, getDiffDay } from './utils';
import { BigNumber } from 'bignumber.js';

// balance payment interest loss payDate

export async function scheduleFixCurrent(
  contract: IContractDocument,
  currentDate: Date,
  tr: ITransaction,
  models: IModels,
  config: IConfig
) {
  const scheduleList = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $lte: currentDate }
  }).sort({ payDate: 1 });

  let balance = 0;
  let mustPayDate: Date = contract.firstPayDate;
  let lastDefaultSchedule: any = scheduleList
    .reverse()
    .find((a) => a.isDefault === true && a.payDate !== currentDate);
  let lastSchedule: any = scheduleList.reverse().at(0);
  let totalPaymentAmount = 0;
  let totalInterestAmount = 0;
  let totalMustPay = 0;
  let totalPayed = 0;

  for await (let schedule of scheduleList) {
    if (lastDefaultSchedule.payDate <= schedule.payDate) {
      totalMustPay = new BigNumber(totalMustPay)
        .plus(schedule.payment || 0)
        .plus(schedule.interestEve || 0)
        .plus(schedule.interestNonce || 0)
        .plus(schedule.loss || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      totalPayed = new BigNumber(totalPayed)
        .plus(schedule.didPayment || 0)
        .plus(schedule.didInterestEve || 0)
        .plus(schedule.didInterestNonce || 0)
        .plus(schedule.didLoss || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
    }

    if (schedule.status === 'give') {
      balance = new BigNumber(schedule.total)
        .plus(balance)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      continue;
    } else {
      totalPaymentAmount = new BigNumber(totalPaymentAmount)
        .plus(schedule.payment || 0)
        .minus(schedule.didPayment || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      totalInterestAmount = new BigNumber(totalInterestAmount)
        .plus(schedule.interestEve || 0)
        .plus(schedule.interestNonce || 0)
        .minus(schedule.didInterestEve || 0)
        .minus(schedule.didInterestNonce || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      balance = new BigNumber(balance)
        .minus(schedule.didPayment || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
    }
  }

  const expiredPayment = new BigNumber(totalMustPay)
    .minus(totalPayed)
    .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
  let loss = 0;
  let preSchedule: IScheduleDocument | undefined = scheduleList.reverse().at(1);

  if (expiredPayment > 0) {
    const diff = getDiffDay(
      preSchedule?.payDate || contract.firstPayDate,
      currentDate
    );
    if (diff > 0)
      loss = await calcLoss(
        contract,
        {
          balance: preSchedule?.balance || 0,
          payment: totalPaymentAmount,
          interest: totalInterestAmount
        },
        contract.lossPercent,
        diff,
        config
      );
  }

  if (lastSchedule.payDate === currentDate) {
    await models.Schedules.updateOne(
      { _id: lastSchedule._id },
      {
        $set: { loss: loss },
        $inc: {
          didStoredInterest: tr.storedInterest,
          didLoss: tr.loss,
          didPayment: tr.payment,
          didCommitmentInterest: tr.commitmentInterest
        }
      }
    );
  } else {
    const diff = getDiffDay(
      preSchedule?.payDate || contract.startDate,
      currentDate
    );
    const interest = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diff,
      fixed: config.calculationFixed
    });

    const { diffNonce } = getDatesDiffMonth(
      preSchedule?.payDate || contract.startDate,
      currentDate
    );

    const interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce,
      fixed: config.calculationFixed
    });

    const interestEve = new BigNumber(interest)
      .minus(interestNonce)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    await models.Schedules.updateOne(
      { _id: lastSchedule._id },
      {
        $set: { interestEve, interestNonce, loss },
        $inc: {
          didStoredInterest: tr.storedInterest,
          didLoss: tr.loss,
          didPayment: tr.payment,
          didCommitmentInterest: tr.commitmentInterest,
          payment: 0
        }
      }
    );
  }

  return { mustPayDate, balance };
}

export async function scheduleFixAfterCurrent(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels,
  config: IConfig
) {
  console.log('scheduleFix');

  const scheduleList = await models.Schedules.find({
    contractId: contract._id
  }).sort({ payDate: 1 });

  const updateBulks: any[] = [];

  let balance = 0;
  let mustPayDate: Date = contract.firstPayDate;
  let preSchedule: any = undefined;
  let totalMustPay = 0;
  let totalPayed = 0;
  let totalPayedAmount = scheduleList.reduce(
    (a, b) =>
      new BigNumber(a)
        .plus(b.didPayment || 0)
        .plus(b.didStoredInterest || 0)
        .plus(b.didLoss || 0)
        .toNumber(),
    0
  );

  console.log('totalPayed', totalPayedAmount);

  for await (let schedule of scheduleList) {
    if (schedule.status === 'give') {
      balance = new BigNumber(schedule.total)
        .plus(balance)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      continue;
    }

    totalMustPay = new BigNumber(totalMustPay)
      .plus(schedule.payment || 0)
      .plus(schedule.storedInterest || 0)
      .plus(schedule.loss || 0)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    totalPayed = new BigNumber(totalPayed)
      .plus(schedule.didPayment || 0)
      .plus(schedule.didStoredInterest || 0)
      .plus(schedule.didLoss || 0)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    if (schedule.payDate > currentDate && preSchedule) {
      const diff = getDiffDay(preSchedule.payDate, schedule.payDate);
      const interest = calcInterest({
        balance,
        interestRate: contract.interestRate,
        dayOfMonth: diff,
        fixed: config.calculationFixed
      });

      const { diffNonce } = getDatesDiffMonth(
        preSchedule.payDate,
        schedule.payDate
      );

      const interestNonce = calcInterest({
        balance,
        interestRate: contract.interestRate,
        dayOfMonth: diffNonce,
        fixed: config.calculationFixed
      });

      const interestEve = new BigNumber(interest)
        .minus(interestNonce)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      if (
        schedule.interestEve !== interestEve ||
        schedule.interestNonce !== interestNonce
      ) {
        updateBulks.push({
          updateOne: {
            filter: {
              _id: schedule._id
            },
            update: {
              $set: {
                interestEve,
                interestNonce
              }
            }
          }
        });
      }
    }

    if (totalPayedAmount >= 0) mustPayDate = schedule.payDate;
    totalPayedAmount = new BigNumber(totalPayedAmount)
      .minus(schedule.payment || 0)
      .minus(schedule.storedInterest || 0)
      .minus(schedule.loss || 0)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    console.log(
      'row',
      balance,
      '-',
      totalMustPay,
      '-',
      totalPayed,
      '-',
      schedule.payDate
    );

    preSchedule = Object.assign({}, schedule);
    if (schedule.didPayment && schedule.didPayment > 0)
      balance = new BigNumber(balance)
        .minus(schedule.didPayment)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
  }

  await models.Schedules.bulkWrite(updateBulks);
  console.log('mustPayDate, balance', mustPayDate, balance);
  return { mustPayDate, balance };
}

export async function createTransactionSchedule(
  contract: IContractDocument,
  currentDate: Date,
  tr: ITransactionDocument,
  models: IModels,
  config: IConfig
) {
  let loanBalance = contract.loanBalanceAmount;

  const existedTransaction = await models.Transactions.find({
    contractId: contract._id,
    payDate: tr.payDate
  });

  if (existedTransaction) {
    await models.Schedules.updateOne(
      {
        contractId: contract._id,
        payDate: tr.payDate
      },
      {
        $inc: {
          didStoredInterest: tr.storedInterest,
          didLoss: tr.loss,
          didPayment: tr.payment,
          didCommitmentInterest: tr.commitmentInterest
        },
        $push: {
          transactionIds: tr._id
        }
      }
    );
  } else {
    const currentSchedule = await models.Schedules.findOne({contractId:contract._id,payDate:tr.payDate})
    const prevSchedule = await models.Schedules.findOne({contractId:contract._id,payDate:{$lt:tr.payDate}}).sort({payDate:-1})
    if(!currentSchedule && prevSchedule){
      const {interestEve,interestNonce} = await getInterest(contract,prevSchedule.payDate,tr.payDate,contract.loanBalanceAmount,config)
      
      const balance = new BigNumber(prevSchedule.balance).minus(tr.payment || 0).dp(config.calculationFixed,BigNumber.ROUND_HALF_UP)
      const total = interestEve + interestNonce
      await models.Schedules.create({
        createdAt: new Date(),
        contractId: contract._id,
        version: '0',
        payDate: currentDate,
        balance: balance,
        payment:0,
        interestEve: interestEve,
        interestNonce: interestNonce,
        total: total,
        isDefault: false,
        didStoredInterest: tr.storedInterest,
        didLoss: tr.loss,
        didPayment: tr.payment,
        didCommitmentInterest: tr.commitmentInterest
      })
    }
  }

  if (tr.payment) {
    loanBalance = new BigNumber(loanBalance)
      .minus(tr.payment)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    await models.Contracts.updateOne(
      { _id: contract._id },
      {
        $set: {
          loanBalanceAmount: loanBalance
        }
      }
    );
  }
}
