import { INVOICE_STATUS, SCHEDULE_STATUS } from '../definitions/constants';
import {
  ICalcDivideParams,
  ICalcTrParams,
  ITransactionDocument,
} from '../definitions/transactions';
import {
  afterNextScheduled,
  betweenScheduled,
  onNextScheduled,
  onPreScheduled,
} from './scheduleUtils';
import {
  calcInterest,
  getUnduePercent,
  getDiffDay,
  getFullDate,
  getDatesDiffMonth,
} from './utils';

export const getAOESchedules = async (models, contract) => {
  // with skipped of done
  const preSchedule = await models.RepaymentSchedules.findOne({
    contractId: contract._id,
    status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] },
  })
    .sort({ payDate: -1 })
    .lean();

  const nextSchedule = await models.RepaymentSchedules.findOne({
    contractId: contract._id,
    status: { $in: [SCHEDULE_STATUS.PENDING, SCHEDULE_STATUS.LESS] },
  })
    .sort({ payDate: 1 })
    .lean();

  return { preSchedule, nextSchedule };
};

export const getCalcedAmounts = async (
  models: any,
  memoryStorage: any,
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
  };
  result = {
    undue: 0,
    interestEve: 0,
    interestNonce: 0,
    insurance: 0,
    debt: 0,
    payment: 0,
    total: 0,
    preSchedule: undefined,
  };

  if (!doc.contractId) {
    return result;
  }

  const trDate = getFullDate(doc.payDate);

  const contract = await models.LoanContracts.getContract(models, {
    _id: doc.contractId,
  });

  let { preSchedule, nextSchedule } = await getAOESchedules(models, contract);

  if (!preSchedule && !nextSchedule) {
    return result;
  }

  const startDate = getFullDate(contract.startDate);

  if (trDate < startDate) {
    return result;
  }

  if (!preSchedule) {
    preSchedule = {
      balance: contract.leaseAmount,
      payDate: startDate,
      insurance: nextSchedule.insurance,
      debt: contract.debt,
    };
  }

  const prePayDate = getFullDate(preSchedule.payDate);
  result.preSchedule = preSchedule;

  // closed contract
  if (!nextSchedule) {
    const unduePercent =
      (await getUnduePercent(models, memoryStorage, preSchedule.payDate)) ||
      contract.unduePercent ||
      0.2;
    result.undue = Math.round(
      (preSchedule.balance / 100) *
        unduePercent *
        getDiffDay(prePayDate, trDate)
    );
    const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);
    result.interestEve = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve,
    });
    result.interestNonce = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce,
    });
    result.insurance = preSchedule.insurance;
    result.payment = preSchedule.balance;

    return result;
  }

  result.debt = nextSchedule.debt;

  // correct run
  if (trDate < prePayDate) {
    return result;
  }

  // one day two pay
  if (getDiffDay(trDate, prePayDate) === 0) {
    result.undue = (preSchedule.undue || 0) - (preSchedule.didUndue || 0);
    result.interestEve =
      (preSchedule.interestEve || 0) - (preSchedule.didInterestEve || 0);
    result.interestNonce =
      (preSchedule.interestNonce || 0) - (preSchedule.didInterestNonce || 0);
    result.insurance =
      (preSchedule.insurance || 0) - (preSchedule.didInsurance || 0);
    result.debt = (preSchedule.debt || 0) - (preSchedule.didDebt || 0);
    result.payment = (preSchedule.payment || 0) - (preSchedule.didPayment || 0);

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
    const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);
    result.interestEve = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve,
    });
    result.interestNonce = calcInterest({
      balance: preSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce,
    });

    const percentOfDay =
      getDiffDay(preSchedule.payDate, trDate) /
      getDiffDay(preSchedule.payDate, nextSchedule.payDate);
    result.insurance = Math.round(preSchedule.insurance * percentOfDay);
    result.payment = Math.round(nextSchedule.payment * percentOfDay);
    return result;
  }

  // scheduled
  if (getDiffDay(trDate, nextPayDate) === 0) {
    result.interestEve = nextSchedule.interestEve;
    result.interestNonce = nextSchedule.interestNonce;
    result.insurance = nextSchedule.insurance;
    result.debt = nextSchedule.debt;
    result.payment = nextSchedule.payment;

    return result;
  }

  // after
  const unduePercent =
    (await getUnduePercent(models, memoryStorage, preSchedule.payDate)) ||
    contract.unduePercent ||
    0.2;
  result.undue = Math.round(
    (preSchedule.balance / 100) * unduePercent * getDiffDay(nextPayDate, trDate)
  );
  const { diffEve, diffNonce } = getDatesDiffMonth(prePayDate, trDate);

  result.interestEve = calcInterest({
    balance: preSchedule.balance,
    interestRate: contract.interestRate,
    dayOfMonth: diffEve,
  });
  result.interestNonce = calcInterest({
    balance: preSchedule.balance,
    interestRate: contract.interestRate,
    dayOfMonth: diffNonce,
  });

  result.insurance = nextSchedule.insurance;
  result.payment = nextSchedule.payment;

  const doubleSkipped = await models.RepaymentSchedules.find({
    _id: { $ne: nextSchedule },
    $and: [
      { payDate: { $gte: nextSchedule.payDate } },
      { payDate: { $lte: trDate } },
    ],
  });

  for (const sch of doubleSkipped) {
    result.insurance += sch.insurance;
    result.payment += sch.payment;
  }

  return result;
};

export const transactionRule = async (
  models: any,
  memoryStorage: any,
  doc: ICalcTrParams,
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
    calcedInfo: undefined,
  };

  if (!doc.contractId) {
    return result;
  }

  result.calcedInfo = await getCalcedAmounts(models, memoryStorage, {
    contractId: doc.contractId,
    payDate: doc.payDate,
  });

  const {
    payment = 0,
    undue = 0,
    interestEve = 0,
    interestNonce = 0,
    insurance = 0,
    debt = 0,
    preSchedule,
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

export const trAfterSchedule = async (models, tr: ITransactionDocument) => {
  if (!tr.contractId) {
    return;
  }

  const trDate = getFullDate(tr.payDate);

  const contract = await models.LoanContracts.getContract(models, {
    _id: tr.contractId,
  });

  // with skipped of done
  let preSchedule = await models.RepaymentSchedules.findOne({
    contractId: contract._id,
    status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] },
  })
    .sort({ payDate: -1 })
    .lean();

  const pendingSchedules = await models.RepaymentSchedules.find({
    contractId: contract._id,
    status: SCHEDULE_STATUS.PENDING,
  })
    .sort({ payDate: 1 })
    .lean();

  // hasnt schedule
  if ((!pendingSchedules || !pendingSchedules.length) && !preSchedule) {
    // reschedule
  }

  // closed contract
  if (!pendingSchedules || !pendingSchedules.length) {
    throw new Error('transaction is closed');
  }

  const nextSchedule = pendingSchedules[0];
  const nextPayDate = getFullDate(nextSchedule.payDate);

  // first pay
  if (!preSchedule) {
    preSchedule = {
      payDate: contract.startDate,
      contractId: contract._id,
      debt: contract.debt,
      balance: contract.leaseAmount,
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
  models: any,
  tr: any,
  noDeleteSchIds: any[] = []
) => {
  if (!Object.keys(tr.reactions || {}).length) {
    return;
  }

  const nextTrs = await models.LoanTransactions.find({
    contractId: tr.contractId,
    payDate: { $gt: tr.payDate },
  }).lean();
  if (nextTrs && nextTrs.length) {
    throw new Error(
      'this transaction is not last transaction. Please This contracts last transaction only to change or remove'
    );
  }

  if (tr.invoiceId) {
    await models.LoanInvoices.updateInvoice(models, tr.invoiceId, {
      status: INVOICE_STATUS.PENDING,
    });
  }

  const bulkOps: any[] = [];
  const delIds: string[] = [];
  for (const reaction of tr.reactions) {
    if (noDeleteSchIds.length && noDeleteSchIds.includes(reaction.scheduleId)) {
      continue;
    }

    if (!reaction.preData || !Object.keys(reaction.preData).length) {
      delIds.push(reaction.scheduleId);
    } else {
      bulkOps.unshift({
        updateOne: {
          filter: { _id: reaction.scheduleId },
          update: { $set: { ...reaction.preData } },
        },
      });
    }
  }

  if (bulkOps && bulkOps.length) {
    await models.RepaymentSchedules.bulkWrite(bulkOps);
  }

  if (delIds.length) {
    await models.RepaymentSchedules.deleteMany({ _id: { $in: delIds } });
  }
};
