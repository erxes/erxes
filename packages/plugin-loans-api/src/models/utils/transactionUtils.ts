/* transaction logic */
//#region  import
import BigNumber from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import {
  INVOICE_STATUS,
  LEASE_TYPES,
  SCHEDULE_STATUS
} from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { ISchedule, IScheduleDocument } from '../definitions/schedules';
import {
  ICalcDivideParams,
  ICalcTrParams,
  ITransactionDocument
} from '../definitions/transactions';
import { getDiffDay, getFullDate, getDatesDiffMonth, calcInterest } from './utils';
import { IConfig } from '../../interfaces/config';
import { getConfig } from '../../messageBroker';
import { scheduleFixAfterCurrent } from './scheduleFixUtils';
//#endregion

/**
 * @param models
 * @param contract
 * @param trDate
 * @returns
 */
export const getAOESchedules = async (
  models: IModels,
  contract,
  trDate
): Promise<{
  preSchedule: IScheduleDocument & any;
  nextSchedule: IScheduleDocument & any;
}> => {
  // with skipped of done
  const preSchedule: any = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: { $lt: trDate },
    status: {
      $in:
        contract.leaseType === LEASE_TYPES.LINEAR
          ? [SCHEDULE_STATUS.PENDING]
          : [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS, SCHEDULE_STATUS.PRE]
    }
  })
    .sort({ payDate: -1 })
    .lean<IScheduleDocument & any>();

  const nextSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    status: { $in: [SCHEDULE_STATUS.PENDING] },
    payDate: { $gte: trDate }
  })
    .sort({ payDate: 1 })
    .lean<IScheduleDocument & any>();

  return { preSchedule, nextSchedule };
};

/**
 * @param preSchedule must pay default schedule
 * @param contract
 * @param lossPercent
 * @param diff
 * @returns calculatedLoss
 */

async function fillCommitmentInterest(
  contract: IContractDocument,
  result: any,
  models: IModels
) {
  const schedules = await models.Schedules.find({
    contractId: contract._id,
    status: SCHEDULE_STATUS.PENDING
  }).sort({ payDate: 1 });

  let beginDate = contract.startDate;
  let unUsedBalance = contract.leaseAmount;

  for await (let schedule of schedules) {
    const { diffEve, diffNonce } = getDatesDiffMonth(
      beginDate,
      schedule.payDate
    );

    beginDate = schedule.payDate;
    unUsedBalance = contract.leaseAmount - schedule.balance;

    result.commitmentInterestEve += calcInterest({
      balance: unUsedBalance,
      interestRate: contract.commitmentInterest,
      dayOfMonth: diffEve
    });

    result.commitmentInterestNonce += calcInterest({
      balance: unUsedBalance,
      interestRate: contract.commitmentInterest,
      dayOfMonth: diffNonce
    });
  }

  result.commitmentInterest =
    result.commitmentInterestEve + result.commitmentInterestNonce;

  result.balance = result.schedule?.[-1]?.balance;

  return result;
}

/**
 * this method generate loan payment data
 * @param models
 * @param subdomain
 * @param doc
 * @returns {loss: number; interestEve: number;   interestNonce: number;   total: number;   insurance: number;   debt: number;   payment: number;   preSchedule: any;}
 */
export const getCalcedAmounts = async (
  models: IModels,
  subdomain: string,
  doc: ICalcDivideParams,
  config: IConfig
) => {
  let result: {
    loss: number;
    total: number;
    insurance: number;
    debt: number;
    payment: number;
    balance: number;
    unUsedBalance: number;
    storedInterest: number;
    commitmentInterest: number;
    calcInterest: number;
    closeAmount: number;
  } = {
    loss: 0,
    insurance: 0,
    debt: 0,
    payment: 0,
    total: 0,
    balance: 0,
    unUsedBalance: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    calcInterest: 0,
    closeAmount: 0
  };

  if (!doc.contractId) {
    return result;
  }

  const trDate = getFullDate(doc.payDate);

  const contract = await models.Contracts.getContract({
    _id: doc.contractId
  });

  /**
   * @property preSchedule /schedule of done or less payed/
   * @property nextSchedule /schedule of pending/
   */
  result.balance = contract.loanBalanceAmount;
  result.storedInterest = contract.storedInterest;

  let schedules = await models.Schedules.find({
    contractId: contract._id,
    status: { $ne: 'give' },
    payDate: {
      $lte: trDate
    }
  });

  schedules.forEach((row) => {
    result.payment = new BigNumber(result.payment)
      .plus(row.payment || 0)
      .minus(row.didPayment || 0)
      .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();
  });

  result.payment = Math.max(0, result.payment)

  const diffDay = contract.lastStoredDate ? getDiffDay(contract.lastStoredDate, trDate) : 0;

  result.calcInterest = calcInterest({
    balance: contract.loanBalanceAmount,
    interestRate: contract.interestRate,
    dayOfMonth: diffDay,
    fixed: config.calculationFixed
  });

  result.total = result.calcInterest + result.balance + result.storedInterest;

  return result;
};

/**
 * get payment information
 * @param models
 * @param subdomain
 * @param doc
 * @param result
 * @returns
 */
export const transactionRule = async (
  models: IModels,
  subdomain: string,
  doc: ICalcTrParams | any,
  result?: {
    payment: number;
    insurance: number;
    debt: number;
    loss: number;
    interestEve: number;
    interestNonce: number;
    surplus: number;
    storedInterest: number;
    calcInterest: number;
    calcedInfo: any;
    commitmentInterest: number;
  }
) => {
  result = {
    payment: 0,
    loss: 0,
    interestEve: 0,
    interestNonce: 0,
    insurance: 0,
    debt: 0,
    surplus: 0,
    storedInterest: 0,
    calcInterest: 0,
    calcedInfo: undefined,
    commitmentInterest: 0
  };

  if (!doc.contractId) {
    return result;
  }

  const config = await getConfig('loansConfig', subdomain);

  result.calcedInfo = await getCalcedAmounts(
    models,
    subdomain,
    {
      contractId: doc.contractId,
      payDate: doc.payDate
    },
    config
  );

  const {
    payment = 0,
    loss = 0,
    interestEve = 0,
    interestNonce = 0,
    insurance = 0,
    debt = 0,
    preSchedule,
    commitmentInterest
  } = result.calcedInfo;
  result.calcedInfo.total =
    payment +
    loss +
    interestEve +
    interestNonce +
    insurance +
    debt +
    commitmentInterest;

  delete result.calcedInfo.preSchedule;

  let mainAmount = doc.total;

  if (debt > mainAmount) {
    result.debt = mainAmount;
    return result;
  }

  result.debt = debt;
  mainAmount = mainAmount - debt;
  if (loss > mainAmount) {
    result.loss = mainAmount;
    return result;
  }

  result.loss = loss;
  mainAmount = mainAmount - loss;
  if (commitmentInterest > mainAmount) {
    result.commitmentInterest = mainAmount;
    return result;
  }

  result.commitmentInterest = commitmentInterest;
  mainAmount = mainAmount - commitmentInterest;
  if (interestEve > mainAmount) {
    result.interestEve = mainAmount;
    return result;
  }

  result.interestEve = interestEve;
  mainAmount = mainAmount - interestEve;
  if (interestNonce > mainAmount) {
    result.interestNonce = mainAmount;
    return result;
  }

  result.interestNonce = interestNonce;
  mainAmount = mainAmount - interestNonce;
  if (payment > mainAmount) {
    result.payment = mainAmount;
    return result;
  }

  result.payment = payment;
  mainAmount = mainAmount - payment;
  if (insurance > mainAmount) {
    result.insurance = mainAmount;
    return result;
  }

  result.insurance = insurance;
  mainAmount = mainAmount - insurance;
  result.payment = result.payment + mainAmount;

  // TODO check payment > remiander condition
  if (preSchedule?.balance < result.payment) {
    result.payment = preSchedule.balance;
    result.surplus = result.payment - preSchedule.balance;
  }

  return result;
};

/**
 * when transaction done
 * then schedule must be modified by paid amount
 */
export const trAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument
) => {
  if (!tr.contractId) {
    return;
  }

  const trDate = getFullDate(tr.payDate);

  const contract = await models.Contracts.getContract({
    _id: tr.contractId
  });

  // with skipped of done
  let schedule = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: trDate
  });

  if (schedule) {
    await models.Schedules.updateOne(
      { _id: schedule._id },
      {
        $inc: {
          didPayment: tr.payment ?? 0,
          didStoredInterest: tr.storedInterest ?? 0,
          didLoss: tr.loss ?? 0,
          didDebt: tr.debt ?? 0,
          didCommitmentInterest: tr.commitmentInterest ?? 0,
          didTotal: tr.total ?? 0
        }
      }
    );
  } else {
    const schedule: ISchedule = {
      balance: contract.loanBalanceAmount,
      contractId: contract._id,
      isDefault: false,
      payDate: trDate,
      transactionIds: [tr._id],
      didPayment: tr.payment ?? 0,
      didStoredInterest: tr.storedInterest ?? 0,
      didLoss: tr.loss ?? 0,
      didDebt: tr.debt ?? 0,
      didCommitmentInterest: tr.commitmentInterest ?? 0,
      didTotal: tr.total ?? 0,
      total: tr.total,
      version: '',
      createdAt: new Date(),
      status: 'done',
      unUsedBalance: 0
    };

    await models.Schedules.create(schedule);
  }

  return;
};

/**
 * transaction remove action
 * @param models
 * @param tr
 * @param noDeleteSchIds
 * @returns
 */
export const removeTrAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument,
  config: IConfig,
  noDeleteSchIds: any[] = []
) => {
  if (!Object.keys(tr.reactions || {}).length) {
    return;
  }

  const nextTrsCount = await models.Transactions.countDocuments({
    contractId: tr.contractId,
    payDate: { $gt: tr.payDate }
  }).lean();

  if (nextTrsCount > 0) {
    throw new Error(
      'this transaction is not last transaction. Please This contracts last transaction only to change or remove'
    );
  }

  if (tr.invoiceId) {
    const invoiceData: any = { status: INVOICE_STATUS.PENDING };
    await models.Invoices.updateInvoice(tr.invoiceId, invoiceData);
  }

  const bulkOps: any[] = [];
  const delIds: string[] = [];
  for (const reaction of tr.reactions || []) {
    if (noDeleteSchIds.length && noDeleteSchIds.includes(reaction.scheduleId)) {
      continue;
    }

    if (!reaction.preData || !Object.keys(reaction.preData).length) {
      delIds.push(reaction.scheduleId);
    } else {
      bulkOps.unshift({
        updateOne: {
          filter: { _id: reaction.scheduleId },
          update: { $set: { ...reaction.preData } }
        }
      });
    }
  }



  if (bulkOps && bulkOps.length) {
    await models.Schedules.bulkWrite(bulkOps);
  }

  if (delIds.length) {
    await models.Schedules.deleteMany({
      _id: { $in: delIds },
      isDefault: { $ne: true }
    });
  }

  if (tr.contractReaction) {
    const { _id, ...otherData } = tr.contractReaction;
    await models.Contracts.updateOne({ _id: _id }, { $set: otherData });
    await scheduleFixAfterCurrent(tr.contractReaction, tr.payDate, models, config)
  }
};
