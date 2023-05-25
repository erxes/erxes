import { IModels } from '../../connectionResolver';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import { ITransactionDocument } from '../definitions/transactions';
import { trAfterSchedule, transactionRule } from './transactionUtils';
import {
  addMonths,
  calcInterest,
  calcPerMonthEqual,
  calcPerMonthFixed,
  checkNextDay,
  getChanged,
  getDatesDiffMonth,
  getDiffDay,
  getEqualPay,
  getFullDate,
  getNextMonthDay,
  IPerHoliday
} from './utils';

export const scheduleHelper = async (
  contract: IContractDocument,
  bulkEntries: any[],
  startDate: Date,
  balance: number,
  tenor: number,
  salvageAmount: number,
  salvageTenor: number,
  nextDate: Date,
  perHolidays: IPerHoliday[]
) => {
  if (tenor === 0) {
    return bulkEntries;
  }
  let currentDate = getFullDate(startDate);

  const dateRange = contract.scheduleDays.sort((a, b) => a - b);
  var mainDate = new Date(startDate);
  var endDate = addMonths(new Date(startDate), contract.tenor);

  var dateRanges: Date[] = [];

  for (let index = 0; index < contract.tenor + 2; index++) {
    dateRange.map((day, i) => {
      const ndate = getFullDate(new Date(mainDate));
      const year = ndate.getFullYear();
      const month = i === 0 ? ndate.getMonth() + 1 : ndate.getMonth();

      if (day > 28 && new Date(year, month, day).getDate() !== day)
        mainDate = new Date(year, month + 1, 0);
      else mainDate = new Date(year, month, day);
      dateRanges.push(mainDate);
    });
  }

  const paymentDates = dateRanges.filter(date => {
    const diffDay =
      date.getMonth() === startDate.getMonth() && getDiffDay(startDate, date);

    date = checkNextDay(
      date,
      contract.weekends,
      contract.useHoliday,
      perHolidays
    );

    if (
      date < startDate ||
      (diffDay && diffDay < 10 && date.getMonth() === startDate.getMonth()) ||
      date > endDate
    )
      return false;
    return true;
  });

  if (contract.repayment === 'equal') {
    const payment = Math.round(
      (balance - (salvageAmount || 0)) / paymentDates.length
    );

    for (let i = 0; i < paymentDates.length; i++) {
      const perMonth = await calcPerMonthEqual(
        contract,
        balance,
        currentDate,
        payment,
        perHolidays,
        paymentDates[i]
      );
      currentDate = perMonth.date;
      balance = perMonth.loanBalance;

      bulkEntries.push({
        createdAt: new Date(new Date().getTime() - i * 2),
        contractId: contract._id,
        version: '0',
        payDate: currentDate,
        balance: balance,
        payment,
        interestEve: perMonth.calcedInterestEve,
        interestNonce: perMonth.calcedInterestNonce,
        total: perMonth.totalPayment,
        isDefault: true
      });
    }
  } else {
    let total = await getEqualPay({
      startDate,
      interestRate: contract.interestRate,
      nextDate,
      leaseAmount: balance,
      salvage: salvageAmount,
      weekends: contract.weekends,
      useHoliday: contract.useHoliday,
      perHolidays,
      paymentDates
    });

    for (let i = 0; i < paymentDates.length - salvageTenor; i++) {
      const perMonth = await calcPerMonthFixed(
        contract,
        balance,
        currentDate,
        total,
        perHolidays,
        paymentDates[i]
      );
      currentDate = perMonth.date;
      balance = perMonth.loanBalance;

      bulkEntries.push({
        createdAt: new Date(new Date().getTime() - i * 2),
        contractId: contract._id,
        version: '0',
        payDate: currentDate,
        balance,
        payment: perMonth.loanPayment,
        interestEve: perMonth.calcedInterestEve,
        interestNonce: perMonth.calcedInterestNonce,
        total,
        isDefault: true
      });
    }
  }

  const tempBalance = balance - (salvageAmount || 0);
  const lastEntry = bulkEntries[bulkEntries.length - 1];
  lastEntry.total = lastEntry.total + tempBalance;
  lastEntry.balance = salvageAmount || 0;
  lastEntry.payment = lastEntry.payment + tempBalance;
  bulkEntries[bulkEntries.length - 1] = lastEntry;
  return bulkEntries;
};

const insuranceHelper = (
  contract: IContractDocument,
  insuranceTypeRulesById: any,
  currentYear: number
) => {
  let perMonthInsurance = 0;
  let perYearInsurance = 0;
  for (const data of contract.collateralsData) {
    const insuranceType =
      data.insuranceTypeId && insuranceTypeRulesById[data.insuranceTypeId];

    if (!insuranceType) {
      continue;
    }

    const rules = insuranceType.yearPercents || [100];
    const percentOfCost =
      rules.length > currentYear ? rules[currentYear] : rules[rules.length - 1];
    const insurance =
      ((((data.leaseAmount + data.marginAmount) / 100) * percentOfCost) / 100) *
      insuranceType.percent;
    perMonthInsurance += insurance / 11;
    perYearInsurance += insurance;
  }

  const first10 = Math.ceil(perMonthInsurance);
  const on11 = perYearInsurance - first10 * 10;

  return { first10, on11 };
};

export const reGenerateSchedules = async (
  models: IModels,
  contract: IContractDocument,
  perHolidays: IPerHoliday[]
) => {
  if (!contract.collateralsData) {
    return;
  }

  if (!contract.leaseAmount) {
    return;
  }

  let bulkEntries: any[] = [];
  let balance = contract.leaseAmount;
  let startDate: Date = contract.startDate;
  let tenor = contract.tenor;

  if (tenor === 0) {
    return;
  }

  const firstNextDate = getNextMonthDay(
    contract.startDate,
    contract.scheduleDays
  );
  const diffDay = getDiffDay(contract.startDate, firstNextDate);

  // diff from startDate to nextDate valid: max 42 min 10 day, IsValid then undifined or equal nextMonthDay
  let nextDate: any = undefined;
  if (diffDay > 42) {
    nextDate = new Date(
      contract.startDate.getFullYear(),
      contract.startDate.getMonth(),
      contract.scheduleDays?.[0] || 1
    );
  } else if (diffDay < 10) {
    nextDate = new Date(
      firstNextDate.getFullYear(),
      firstNextDate.getMonth() + 1,
      contract.scheduleDays?.[0] || 1
    );
  }

  bulkEntries = await scheduleHelper(
    contract,
    bulkEntries,
    startDate,
    balance,
    tenor,
    contract.salvageAmount || 0,
    contract.salvageTenor || 0,
    nextDate,
    perHolidays
  );

  if (bulkEntries.length) {
    const preEntry: any = bulkEntries[bulkEntries.length - 1];
    startDate = preEntry.payDate;
  }
  bulkEntries = await scheduleHelper(
    contract,
    bulkEntries,
    startDate,
    contract.salvageAmount || 0,
    contract.salvageTenor || 0,
    0,
    0,
    nextDate,
    perHolidays
  );

  // insurance schedule
  const insuranceTypeIds = contract.collateralsData.map(
    coll => coll.insuranceTypeId
  );
  const insuranceTypes = await models.InsuranceTypes.find({
    _id: { $in: insuranceTypeIds }
  });
  const insuranceTypeRulesById = {};
  for (const insType of insuranceTypes) {
    insuranceTypeRulesById[insType._id] = insType;
  }

  let insuranceIndex = 0;
  let first10 = 0;
  let on11 = 0;
  let monthCounter = 1;
  while (insuranceIndex < bulkEntries.length - 12) {
    const currentYear = parseInt(String(insuranceIndex / 12)) + 1;
    if (monthCounter === 1) {
      const helper = insuranceHelper(
        contract,
        insuranceTypeRulesById,
        currentYear
      );
      first10 = helper.first10;
      on11 = helper.on11;
    }
    if (monthCounter === 12) {
      monthCounter = 1;
      insuranceIndex += 1;
      continue;
    }

    const monthInsurance = monthCounter === 11 ? on11 : first10;
    bulkEntries[insuranceIndex].insurance = monthInsurance;
    bulkEntries[insuranceIndex].total += monthInsurance;

    insuranceIndex += 1;
    monthCounter += 1;
  }

  if (contract.debt) {
    const debtTenor =
      Math.min(contract.debtTenor || 0, bulkEntries.length) || 1;

    const perDebt = Math.round(contract.debt / debtTenor);
    const firstDebt = contract.debt - perDebt * (debtTenor - 1);

    let monthDebt = perDebt;
    for (let i = 0; i < debtTenor; i++) {
      monthDebt = i === 0 ? firstDebt : perDebt;
      bulkEntries[i].debt = monthDebt;
      bulkEntries[i].total += monthDebt;
    }
  }

  await models.Schedules.deleteMany({ contractId: contract._id });
  await models.Schedules.insertMany(bulkEntries);

  await models.FirstSchedules.deleteMany({ contractId: contract._id });
  await models.FirstSchedules.insertMany(bulkEntries);
};

export const fixSchedules = async (
  models: IModels,
  contractId: string,
  subdomain: string
) => {
  const contract = await models.Contracts.findOne({ _id: contractId })
    .select('startDate customerId')
    .lean();

  const periodLock = await models.PeriodLocks.findOne()
    .sort({ date: -1 })
    .lean();

  const today = getFullDate(new Date());

  const unresolvedSchedules = await models.Schedules.find({
    contractId: contractId,
    payDate: {
      $lte: new Date(today.getTime() + 1000 * 3600 * 24),
      ...(periodLock?.date ? { $gt: periodLock?.date } : {})
    },
    status: SCHEDULE_STATUS.PENDING,
    balance: { $gt: 0 },
    isDefault: true
  }).sort({ payDate: 1 });

  let prevSchedule: any = null;
  if (unresolvedSchedules.length > 0)
    for await (let scheduleRow of unresolvedSchedules) {
      const transactions = await models.Transactions.find({
        contractId,
        payDate: {
          $lte: scheduleRow.payDate,
          $gt: prevSchedule?.payDate || contract?.startDate
        }
      })
        .sort({ payDate: 1 })
        .lean();

      prevSchedule = scheduleRow;

      for await (let { _id, ...transaction } of transactions) {
        const trInfo = await transactionRule(models, subdomain, transaction);

        await models.Transactions.updateOne(
          { _id },
          { $set: { ...transaction, ...trInfo } }
        );
        //now resolve schedules
        await trAfterSchedule(models, { ...transaction, ...trInfo } as any);
      }
      if (transactions.find(a => a.payDate === scheduleRow.payDate)) continue;
      //create empty row transaction to the schedule
      let doc = {
        contractId: contractId,
        payDate: scheduleRow.payDate,
        description: `schedule correction`,
        total: 0,
        customerId: contract?.customerId
      };

      //create tmp transaction
      const trInfo = await transactionRule(models, subdomain, doc);
      //now resolve schedules
      await trAfterSchedule(models, { ...doc, ...trInfo } as any);
    }

  const transactions = await models.Transactions.find({
    contractId,
    payDate: {
      $gt: prevSchedule?.payDate || contract?.startDate
    }
  })
    .sort({ payDate: 1 })
    .lean();

  if (transactions.length > 0)
    for await (let { _id, ...transaction } of transactions) {
      const trInfo = await transactionRule(models, subdomain, transaction);
      await models.Transactions.updateOne(
        { _id },
        { $set: { ...transaction, ...trInfo } }
      );
      //now resolve schedules
      await trAfterSchedule(models, { ...transaction, ...trInfo } as any);
    }
};

const fillAmounts = async (
  models: IModels,
  doc: IScheduleDocument,
  tr: ITransactionDocument,
  preSchedule: IScheduleDocument,
  isSetAmount: boolean = false
) => {
  if (isSetAmount) {
    doc.undue = tr?.calcedInfo?.undue || 0;
    doc.interestEve = tr?.calcedInfo?.interestEve || 0;
    doc.interestNonce = tr?.calcedInfo?.interestNonce || 0;
    doc.payment = tr?.calcedInfo?.payment || 0;
    doc.insurance = tr?.calcedInfo?.insurance || 0;
    doc.debt = tr?.calcedInfo?.debt || 0;
    doc.total = tr?.calcedInfo?.total || 0;
  }

  doc.undue = doc.undue || 0;
  doc.didUndue = (doc.didUndue || 0) + (tr.undue || 0);
  doc.didInterestEve = (doc.didInterestEve || 0) + (tr.interestEve || 0);
  doc.didInterestNonce = (doc.didInterestNonce || 0) + (tr.interestNonce || 0);
  doc.didPayment = (doc.didPayment || 0) + (tr.payment || 0);
  doc.didInsurance = (doc.didInsurance || 0) + (tr.insurance || 0);
  doc.didDebt = (doc.didDebt || 0) + (tr.debt || 0);
  doc.didTotal = (doc.didTotal || 0) + (tr.total || 0);
  doc.surplus = (doc.surplus || 0) + (tr.surplus || 0);

  doc.balance = (preSchedule.balance || 0) - (tr.payment || 0);

  doc.payDate = tr.payDate;
  doc.transactionIds = doc.transactionIds
    ? doc.transactionIds.concat([tr._id])
    : [tr._id];

  if (doc.balance < 0) {
    doc.surplus = -1 * doc.balance;
    doc.didPayment = (tr?.payment || 0) + doc.balance;
    await models.Transactions.updateOne(
      { _id: tr._id },
      { $set: { surplus: doc.surplus, payment: doc.didPayment } }
    );
    doc.balance = 0;
  }
  return doc;
};

export const generatePendingSchedules = async (
  models: IModels,
  contract: IContractDocument,
  updatedSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[],
  tr: ITransactionDocument,
  trReaction,
  allowLess: boolean = false
) => {
  let changeDoc = {};

  /**when didDebt less than debt then only change status */
  if (
    !!updatedSchedule.didDebt &&
    !!updatedSchedule.debt &&
    updatedSchedule.didDebt < updatedSchedule.debt
  ) {
    trReaction.push({
      scheduleId: updatedSchedule._id,
      preData: { status: updatedSchedule.status }
    });
    await models.Schedules.updateOne(
      { _id: updatedSchedule._id },
      { $set: { status: SCHEDULE_STATUS.LESS } }
    );
    tr._id &&
      (await models.Transactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      ));
    return;
  }

  if (
    !!updatedSchedule.didUndue &&
    !!updatedSchedule.undue &&
    updatedSchedule.didUndue < updatedSchedule.undue
  ) {
    // allowLess is forever false
    trReaction.push({
      scheduleId: updatedSchedule._id,
      preData: { status: updatedSchedule.status }
    });
    await models.Schedules.updateOne(
      { _id: updatedSchedule._id },
      { $set: { status: SCHEDULE_STATUS.LESS } }
    );
    tr._id &&
      (await models.Transactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      ));
    return;
  }

  let diff =
    (updatedSchedule.didPayment || 0) +
    (updatedSchedule.didInterestEve || 0) +
    (updatedSchedule.didInterestNonce || 0) -
    (updatedSchedule.payment || 0) -
    (updatedSchedule.interestEve || 0) -
    (updatedSchedule.interestNonce || 0);

  let preSchedule = updatedSchedule;
  let schedule = pendingSchedules[0];
  let balance = updatedSchedule.balance;
  let paymentBalance =
    (updatedSchedule.payment || 0) - (updatedSchedule.didPayment || 0);
  let interestEve = 0;
  let interestNonce = 0;
  let index = 0;
  let payment = 0;
  if (
    paymentBalance < 0 &&
    (tr.payment || 0) > 0 &&
    paymentBalance < (tr.payment || 0) * -1
  )
    paymentBalance = (tr.payment || 0) * -1;
  // less pay then pendingSchedules not change current schedule status to less
  if (diff < 0) {
    // TODO debt (limit) check
    if (!allowLess) {
      trReaction.push({
        scheduleId: updatedSchedule._id,
        preData: { status: updatedSchedule.status }
      });
      await models.Schedules.updateOne(
        { _id: updatedSchedule._id },
        { $set: { status: SCHEDULE_STATUS.LESS } }
      );
      tr._id &&
        (await models.Transactions.updateOne(
          { _id: tr._id },
          {
            $set: { reactions: trReaction }
          }
        ));
    }

    const { diffEve, diffNonce } = getDatesDiffMonth(
      preSchedule.payDate,
      schedule.payDate
    );
    interestEve = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve
    });

    interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce
    });
    payment = schedule.payment || 0;
    if (paymentBalance < 0) {
      payment = payment + paymentBalance;
      if (payment < 0) {
        payment = 0;
      }
    } else balance -= payment;

    changeDoc = {
      interestEve,
      interestNonce,
      payment,
      balance,
      total: payment + interestEve + interestNonce
    };

    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    await models.Schedules.updateOne(
      { _id: schedule._id },
      { $set: { ...changeDoc } }
    );
    tr._id &&
      (await models.Transactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      ));
    return;
  }

  if (
    !!updatedSchedule.didInsurance &&
    !!updatedSchedule.insurance &&
    updatedSchedule.didInsurance < updatedSchedule.insurance
  ) {
    const insurance = updatedSchedule.insurance - updatedSchedule.didInsurance;
    changeDoc = {
      insurance: (schedule.insurance || 0) + insurance,
      total: schedule.total + insurance
    };

    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    await models.Schedules.updateOne(
      { _id: schedule._id },
      { $set: { ...changeDoc } }
    );
    tr._id &&
      (await models.Transactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      ));
    return;
  }

  if (
    !!updatedSchedule.didDebt &&
    !!updatedSchedule.debt &&
    updatedSchedule.didDebt < updatedSchedule.debt
  ) {
    // debt less then next schedule debt up and not change other fields
    const debt = updatedSchedule.debt - updatedSchedule.didDebt;

    changeDoc = { debt, total: schedule.total + debt };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });
    await models.Schedules.updateOne(
      { _id: schedule._id },
      {
        $set: { ...changeDoc }
      }
    );
    tr._id &&
      (await models.Transactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      ));
    return;
  }

  // more pay then pendingSchedules change payment to lower
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: any };
    };
  }> = [];

  while (
    diff > (schedule.payment || 0) &&
    index < pendingSchedules.length - 1
  ) {
    const { diffEve, diffNonce } = getDatesDiffMonth(
      preSchedule.payDate,
      schedule.payDate
    );
    interestEve = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve
    });

    interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce
    });

    diff = diff - (schedule.payment || 0);

    payment = schedule.payment || 0;
    if (paymentBalance < 0 && payment > 0) {
      payment += paymentBalance;
      if (payment < 0) {
        paymentBalance = paymentBalance + (schedule.payment || 0);
        payment = 0;
      } else paymentBalance = 0;
    }

    changeDoc = {
      payment,
      interestEve,
      interestNonce,
      balance,
      total: payment + interestEve + interestNonce + (schedule.insurance || 0)
    };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: schedule._id },
        update: { $set: { ...changeDoc } }
      }
    });

    index = index + 1;
    preSchedule = schedule;
    schedule = pendingSchedules[index];
  }

  // on lastSchedule
  if (index === pendingSchedules.length - 1) {
    const { diffEve, diffNonce } = getDatesDiffMonth(
      preSchedule.payDate,
      schedule.payDate
    );
    interestEve = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve
    });
    interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce
    });
    diff = diff - (schedule.payment || 0);

    changeDoc = {
      debt: 0,
      payment: 0,
      interestEve,
      interestNonce,
      balance: 0,
      surplus: diff,
      total: interestEve + interestNonce + diff + (schedule.insurance || 0)
    };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: schedule._id },
        update: { $set: { ...changeDoc } }
      }
    });
  } else {
    const { diffEve, diffNonce } = getDatesDiffMonth(
      preSchedule.payDate,
      schedule.payDate
    );
    interestEve = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffEve
    });
    interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffNonce
    });
    payment = schedule.payment || 0;
    if (paymentBalance < 0) {
      payment = payment + paymentBalance;
      balance = balance - payment;
    } else balance = balance - payment;

    changeDoc = {
      debt: 0,
      payment,
      interestEve,
      interestNonce,
      balance,
      total: interestEve + interestNonce + payment - (schedule.insurance || 0)
    };

    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: schedule._id },
        update: { $set: { ...changeDoc } }
      }
    });
  }

  // changed pre balance then after only interests change
  index = index + 1;
  preSchedule = schedule;
  schedule = pendingSchedules[index];

  if (schedule) {
    const diffs = getDatesDiffMonth(preSchedule.payDate, schedule.payDate);
    interestEve = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffs.diffEve
    });
    interestNonce = calcInterest({
      balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffs.diffNonce
    });
    changeDoc = { interestEve, interestNonce };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: schedule._id },
        update: { $set: { ...changeDoc } }
      }
    });
  }

  tr._id &&
    (await models.Transactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    ));
  await models.Schedules.bulkWrite(bulkOps);
};
/**
 *
 * @param models
 * @param contract
 * @param tr transactionData
 * @param preSchedule
 * @param pendingSchedules
 * this method called when the loan repayment not done that current date
 */
export const onPreScheduled = async (
  models: IModels,
  contract: IContractDocument,
  tr: ITransactionDocument,
  preSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[]
) => {
  const trReaction: any[] = [];

  // multi pay on day
  const doc = await fillAmounts(
    models,
    Object.assign({}, preSchedule),
    tr,
    preSchedule,
    false
  );
  doc.status = SCHEDULE_STATUS.DONE;

  let updatedSchedule: any = undefined;
  if (preSchedule._id) {
    trReaction.push({
      scheduleId: preSchedule._id,
      preData: { ...getChanged(preSchedule, doc) }
    });
    await models.Schedules.updateOne(
      { _id: preSchedule._id },
      { $set: { ...doc } }
    );
    updatedSchedule = await models.Schedules.findOne({
      _id: preSchedule._id
    });
  } else {
    // on contracted date to pay
    updatedSchedule = await models.Schedules.create({
      ...preSchedule,
      ...doc,
      isDefault: false
    });
    trReaction.push({ scheduleId: updatedSchedule._id, preData: undefined });
  }

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule._doc },
    pendingSchedules,
    tr,
    trReaction
  );
};

export const betweenScheduled = async (
  models: IModels,
  contract: IContractDocument,
  tr: ITransactionDocument,
  preSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[]
) => {
  const trReaction: any = [];
  const doc = await fillAmounts(
    models,
    {} as IScheduleDocument,
    tr,
    preSchedule,
    true
  );

  const diff =
    (doc.payment || 0) -
    (doc.didPayment || 0) +
    (doc.interestEve || 0) -
    (doc.didInterestEve || 0) +
    (doc.interestNonce || 0) -
    (doc.didInterestNonce || 0);

  doc.contractId = contract._id;
  doc.payDate = tr.payDate;
  doc.status = diff > 0 ? SCHEDULE_STATUS.LESS : SCHEDULE_STATUS.DONE;

  const updatedSchedule: any = await models.Schedules.create({
    ...doc,
    isDefault: false
  });

  trReaction.push({ scheduleId: updatedSchedule._id, preData: undefined });

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule?._doc },
    pendingSchedules,
    tr,
    trReaction,
    true
  );
};

export const onNextScheduled = async (
  models: IModels,
  contract: IContractDocument,
  tr: ITransactionDocument,
  preSchedule: IScheduleDocument,
  nextSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[]
) => {
  const trReaction: any[] = [];

  const doc = await fillAmounts(
    models,
    Object.assign({}, nextSchedule),
    tr,
    preSchedule,
    true
  );
  doc.status = SCHEDULE_STATUS.DONE;

  trReaction.push({
    scheduleId: nextSchedule._id,
    preData: { ...getChanged(nextSchedule, doc) }
  });
  await models.Schedules.updateOne({ _id: nextSchedule._id }, { $set: doc });
  const updatedSchedule = await models.Schedules.findOne({
    _id: nextSchedule._id
  }).lean();

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule },
    pendingSchedules.filter(s => s._id !== nextSchedule._id),
    tr,
    trReaction
  );
};

export const afterNextScheduled = async (
  models: IModels,
  contract: IContractDocument,
  tr: ITransactionDocument,
  preSchedule: IScheduleDocument,
  nextSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[]
) => {
  interface ITrReaction {
    scheduleId: string;
    preData?: any;
  }
  const trReaction: ITrReaction[] = [];
  const doc = await fillAmounts(
    models,
    Object.assign({}, nextSchedule),
    tr,
    preSchedule,
    true
  );

  const updatedSchedule = await models.Schedules.create({
    ...doc,
    _id: undefined,
    isDefault: false,
    status: SCHEDULE_STATUS.DONE
  });

  trReaction.push({ scheduleId: updatedSchedule._id, preData: undefined });

  const skippedSchedules = await models.Schedules.find(
    {
      $and: [
        { payDate: { $gte: nextSchedule.payDate } },
        { payDate: { $lte: updatedSchedule.payDate } },
        { _id: { $ne: updatedSchedule._id } }
      ],
      contractId: preSchedule.contractId
    },
    { _id: 1 }
  ).lean();

  for (const skippedSchedule of skippedSchedules) {
    trReaction.push({
      scheduleId: skippedSchedule._id || 0,
      preData: { status: SCHEDULE_STATUS.PENDING }
    });
  }

  await models.Schedules.updateMany(
    {
      $and: [
        { payDate: { $gte: nextSchedule.payDate } },
        { payDate: { $lte: updatedSchedule.payDate } },
        { _id: { $ne: updatedSchedule._id } }
      ],
      contractId: preSchedule.contractId
    },
    { $set: { status: SCHEDULE_STATUS.SKIPPED } }
  );

  await generatePendingSchedules(
    models,
    contract,
    updatedSchedule,
    pendingSchedules.filter(s => s.payDate > updatedSchedule.payDate),
    tr,
    trReaction
  );
};
