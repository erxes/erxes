import { IModels } from '../../connectionResolver';
import {
  INVOICE_STATUS,
  SCHEDULE_STATUS,
  UNDUE_CALC_TYPE
} from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import {
  ICalcDivideParams,
  ICalcTrParams,
  ITransactionDocument
} from '../definitions/transactions';
import {
  afterNextScheduled,
  betweenScheduled,
  onNextScheduled,
  onPreScheduled
} from './scheduleUtils';
import { addMonths } from './utils';
import {
  calcInterest,
  getUnduePercent,
  getDiffDay,
  getFullDate,
  getDatesDiffMonth
} from './utils';

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
    $or: [
      { payDate: { $lt: trDate } },
      {
        status: {
          $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS, SCHEDULE_STATUS.PRE]
        }
      }
    ]
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
 * @param unduePercent
 * @param diff
 * @returns calculatedUndue
 */
export const calcUndue = async (
  preSchedule: IScheduleDocument,
  contract: IContractDocument,
  unduePercent,
  diff: number
): Promise<number> => {
  let result = 0;

  switch (contract.undueCalcType) {
    case UNDUE_CALC_TYPE.FROMAMOUNT:
      result = Math.round((preSchedule.payment || 0) * unduePercent * diff);
      break;

    case UNDUE_CALC_TYPE.FROMINTEREST:
      result = Math.round(
        ((preSchedule.balance * contract.interestRate) / 100 / 365) *
          unduePercent *
          diff
      );
      break;

    case UNDUE_CALC_TYPE.FROMENDAMOUNT:
      result = Math.round(preSchedule.balance * unduePercent * diff);
      break;

    case UNDUE_CALC_TYPE.FROMTOTALPAYMENT:
      result = Math.round(preSchedule.total * unduePercent * diff);
      break;

    default:
      result = Math.round(
        ((preSchedule.balance * contract.interestRate) / 100 / 365) *
          unduePercent *
          diff
      );
      break;
  }
  return result;
};

/**
 * this method generate loan payment data
 * @param models
 * @param subdomain
 * @param doc
 * @returns {undue: number; interestEve: number;   interestNonce: number;   total: number;   insurance: number;   debt: number;   payment: number;   preSchedule: any;}
 */
export const getCalcedAmounts = async (
  models: IModels,
  subdomain: string,
  doc: ICalcDivideParams
) => {
  let result: {
    undue: number;
    interestEve: number;
    interestNonce: number;
    total: number;
    insurance: number;
    debt: number;
    payment: number;
    preSchedule: any;
    balance: number;
    closeAmount: number;
  } = {
    undue: 0,
    interestEve: 0,
    interestNonce: 0,
    insurance: 0,
    debt: 0,
    payment: 0,
    total: 0,
    preSchedule: undefined,
    balance: 0,
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
  let { preSchedule, nextSchedule } = await getAOESchedules(
    models,
    contract,
    trDate
  );

  if (!preSchedule && !nextSchedule) {
    return result;
  }

  const startDate = getFullDate(contract.startDate);
  const skipInterestCalcDate = addMonths(
    new Date(startDate),
    contract.skipInterestCalcMonth || 0
  );

  const isSkipInterestCalc = getDiffDay(trDate, skipInterestCalcDate) >= 0;

  if (trDate < startDate) {
    return result;
  }

  //there will be first payment
  if (!preSchedule) {
    preSchedule = {
      balance: contract.leaseAmount,
      payDate: startDate,
      insurance: nextSchedule.insurance,
      debt: nextSchedule.debt
    };
  }

  const prePayDate = getFullDate(preSchedule.payDate);
  result.preSchedule = preSchedule;

  result.balance = preSchedule.balance;

  // closed contract
  if (!nextSchedule) {
    const unduePercent = await getUnduePercent(
      models,
      subdomain,
      preSchedule.payDate,
      contract
    );

    result.undue =
      (preSchedule.undue || 0) -
      (preSchedule.didUndue || 0) +
      (await calcUndue(
        preSchedule,
        contract,
        unduePercent,
        getDiffDay(prePayDate, trDate)
      ));

    if (isSkipInterestCalc) {
      result.interestEve = 0;
      result.interestNonce = 0;
    } else {
      const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);
      result.interestEve =
        (preSchedule.interestEve || 0) -
        (preSchedule.didInterestEve || 0) +
        calcInterest({
          balance: preSchedule.balance,
          interestRate: contract.interestRate,
          dayOfMonth: diffEve
        });
      result.interestNonce =
        (preSchedule.interestNonce || 0) -
        (preSchedule.didInterestNonce || 0) +
        calcInterest({
          balance: preSchedule.balance,
          interestRate: contract.interestRate,
          dayOfMonth: diffNonce
        });
    }

    result.insurance = preSchedule.insurance;
    result.payment = preSchedule.balance;
    return result;
  }
  // correct run
  if (trDate < prePayDate) {
    return result;
  }

  // one day two pay
  if (getDiffDay(trDate, prePayDate) === 0) {
    //when less payed prev schedule there will be must add amount's of
    if (
      preSchedule.status === SCHEDULE_STATUS.LESS ||
      preSchedule.status === SCHEDULE_STATUS.PRE
    ) {
      result.undue = (preSchedule.undue || 0) - (preSchedule.didUndue || 0);
      result.interestEve =
        (preSchedule.interestEve || 0) - (preSchedule.didInterestEve || 0);
      result.interestNonce =
        (preSchedule.interestNonce || 0) - (preSchedule.didInterestNonce || 0);
      result.insurance =
        (preSchedule.insurance || 0) - (preSchedule.didInsurance || 0);
      result.payment =
        (preSchedule.payment || 0) - (preSchedule.didPayment || 0);
      result.debt = (preSchedule.debt || 0) - (preSchedule.didDebt || 0);
    }

    if (result.undue < 0) {
      result.interestEve = result.interestEve + result.undue;
      result.undue = 0;
    }

    if (result.interestEve < 0) {
      result.interestNonce = result.payment + result.interestEve;
      result.interestEve = 0;
    }

    if (result.interestNonce < 0) {
      result.payment = result.payment + result.interestNonce;
      result.interestNonce = 0;
    }

    if (result.payment < 0) {
      result.insurance = result.insurance + result.payment;
      result.payment = 0;
    }

    if (result.insurance < 0) {
      result.debt = result.debt + result.insurance;
      result.insurance = 0;
    }

    if (result.debt < 0) {
      result.debt = 0;
    }

    return result;
  }

  const nextPayDate = getFullDate(nextSchedule.payDate);

  // between prepay
  if (trDate < nextPayDate) {
    if (trDate > prePayDate && startDate < prePayDate) {
      result.interestEve =
        (preSchedule.interestEve || 0) - (preSchedule.didInterestEve || 0);

      result.interestNonce =
        (preSchedule.interestNonce || 0) - (preSchedule.didInterestNonce || 0);

      result.payment =
        (preSchedule.payment || 0) - (preSchedule.didPayment || 0);

      if (result.payment < 0) result.payment = 0;

      result.debt = (preSchedule.debt || 0) - (preSchedule.didDebt || 0);
    }

    if (!preSchedule) result.debt += nextSchedule.debt;

    /** calculating interest eve and nonce from prev date to transaction date */

    if (isSkipInterestCalc) {
      result.interestEve = 0;
      result.interestNonce = 0;
    } else {
      const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);

      result.interestEve += calcInterest({
        balance: preSchedule.balance,
        interestRate: contract.interestRate,
        dayOfMonth: diffEve
      });

      result.interestNonce += calcInterest({
        balance: preSchedule.balance,
        interestRate: contract.interestRate,
        dayOfMonth: diffNonce
      });
    }

    if (preSchedule.status === SCHEDULE_STATUS.LESS) {
      result.undue = (preSchedule.undue || 0) - (preSchedule.didUndue || 0);
      const unduePercent = await getUnduePercent(
        models,
        subdomain,
        preSchedule.payDate,
        contract
      );

      result.undue += await calcUndue(
        preSchedule,
        contract,
        unduePercent,
        getDiffDay(prePayDate, trDate)
      );
    }
    return result;
  }

  // scheduled
  if (getDiffDay(trDate, nextPayDate) === 0) {
    if (trDate > prePayDate && startDate < prePayDate) {
      result.interestEve =
        (preSchedule.interestEve || 0) - (preSchedule.didInterestEve || 0);

      result.interestNonce =
        (preSchedule.interestNonce || 0) - (preSchedule.didInterestNonce || 0);

      result.debt = (preSchedule.debt || 0) - (preSchedule.didDebt || 0);

      result.payment =
        (preSchedule.payment || 0) - (preSchedule.didPayment || 0);

      if (result.payment < 0) result.payment = 0;
    }

    result.interestEve += nextSchedule.interestEve || 0;

    result.interestNonce += nextSchedule.interestNonce || 0;
    result.insurance = nextSchedule.insurance || 0;

    result.debt += nextSchedule.debt || 0;

    result.payment += nextSchedule.payment || 0;
    if (preSchedule.status === SCHEDULE_STATUS.LESS) {
      result.undue = (preSchedule.undue || 0) - (preSchedule.didUndue || 0);
      const unduePercent = await getUnduePercent(
        models,
        subdomain,
        preSchedule.payDate,
        contract
      );

      result.undue += await calcUndue(
        preSchedule,
        contract,
        unduePercent,
        getDiffDay(prePayDate, trDate)
      );
    }

    if (result.payment < 0) result.payment = 0;

    return result;
  }

  // after
  const unduePercent = await getUnduePercent(
    models,
    subdomain,
    preSchedule.payDate,
    contract
  );

  result.undue = await calcUndue(
    preSchedule,
    contract,
    unduePercent,
    getDiffDay(prePayDate, trDate)
  );

  if (isSkipInterestCalc) {
    result.interestEve = 0;
    result.interestNonce = 0;
  } else {
    const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);

    result.interestEve = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve
    });
    result.interestNonce = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce
    });
  }

  result.insurance = nextSchedule.insurance;
  //result.payment = nextSchedule.payment;
  if (nextSchedule.status === SCHEDULE_STATUS.LESS) {
    result.payment = (preSchedule.payment || 0) - (preSchedule.didPayment || 0);
    if (result.payment < 0) result.payment = 0;
  }
  const doubleSkipped = await models.Schedules.find({
    _id: { $ne: nextSchedule },
    contractId: contract._id,
    $and: [
      { payDate: { $gte: nextSchedule.payDate } },
      { payDate: { $lte: trDate } }
    ]
  });
  if (!doubleSkipped) return result;

  for (const sch of doubleSkipped) {
    result.insurance += sch.insurance || 0;
    result.payment += sch.payment || 0;
  }

  return result;
};

export const transactionRule = async (
  models: IModels,
  subdomain: string,
  doc: ICalcTrParams | any,
  result?: {
    payment: number;
    insurance: number;
    debt: number;
    undue: number;
    interestEve: number;
    interestNonce: number;
    surplus: number;
    calcedInfo: any;
  }
) => {
  result = {
    payment: 0,
    undue: 0,
    interestEve: 0,
    interestNonce: 0,
    insurance: 0,
    debt: 0,
    surplus: 0,
    calcedInfo: undefined
  };

  if (!doc.contractId) {
    return result;
  }

  result.calcedInfo = await getCalcedAmounts(models, subdomain, {
    contractId: doc.contractId,
    payDate: doc.payDate
  });

  const {
    payment = 0,
    undue = 0,
    interestEve = 0,
    interestNonce = 0,
    insurance = 0,
    debt = 0,
    preSchedule
  } = result.calcedInfo;
  result.calcedInfo.total =
    payment + undue + interestEve + interestNonce + insurance + debt;

  delete result.calcedInfo.preSchedule;

  let mainAmount = doc.total;

  if (debt > mainAmount) {
    result.debt = mainAmount;
    return result;
  }

  result.debt = debt;
  mainAmount = mainAmount - debt;
  if (undue > mainAmount) {
    result.undue = mainAmount;
    return result;
  }

  result.undue = undue;
  mainAmount = mainAmount - undue;
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
  if (preSchedule.balance < result.payment) {
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
  let preSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    status: {
      $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS, SCHEDULE_STATUS.PRE]
    }
  })
    .sort({ payDate: -1 })
    .lean();

  const pendingSchedules = await models.Schedules.find({
    contractId: contract._id,
    status: SCHEDULE_STATUS.PENDING
  })
    .sort({ payDate: 1 })
    .lean();

  // hasn't schedule
  if ((!pendingSchedules || !pendingSchedules.length) && !preSchedule) {
    // reschedule
  }

  // closed contract
  if (!pendingSchedules || !pendingSchedules.length) {
    await betweenScheduled(models, contract, tr, preSchedule, pendingSchedules);
    return;
  }

  const nextSchedule = pendingSchedules[0];
  const nextPayDate = getFullDate(nextSchedule.payDate);

  // first pay
  // in this case if this contract get first payment this will be in to the loan schedule then it's used on calculation
  if (!preSchedule) {
    preSchedule = {
      payDate: contract.startDate,
      contractId: contract._id,
      debt: contract.debt,
      balance: contract.leaseAmount
    };
  }

  const prePayDate = getFullDate(preSchedule.payDate);

  // wrong date
  if (trDate < prePayDate) {
    throw new Error('transaction is not valid date');
  }

  // one day multi pay
  if (getDiffDay(trDate, prePayDate) === 0) {
    await onPreScheduled(models, contract, tr, preSchedule, pendingSchedules);
    return;
  }

  // between
  if (trDate < nextPayDate) {
    await betweenScheduled(models, contract, tr, preSchedule, pendingSchedules);
    return;
  }

  // on schedule
  if (getDiffDay(trDate, nextPayDate) === 0) {
    await onNextScheduled(
      models,
      contract,
      tr,
      preSchedule,
      nextSchedule,
      pendingSchedules
    );
    return;
  }

  // delayed
  await afterNextScheduled(
    models,
    contract,
    tr,
    preSchedule,
    nextSchedule,
    pendingSchedules
  );
  return;
};

export const removeTrAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument,
  noDeleteSchIds: any[] = []
) => {
  if (!Object.keys(tr.reactions || {}).length) {
    return;
  }

  const nextTrsCount = await models.Transactions.count({
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

  if (tr.contractReaction) {
    const { _id, ...otherData } = tr.contractReaction;
    await models.Contracts.updateOne({ _id: _id }, { $set: otherData });
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
};
