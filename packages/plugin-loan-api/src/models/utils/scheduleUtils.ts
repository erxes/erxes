import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import {
  calcInterest,
  calcPerMonthEqual,
  calcPerMonthFixed,
  getChanged,
  getDatesDiffMonth,
  getDiffDay,
  getEqualPay,
  getFullDate,
  getNextMonthDay,
  IPerHoliday
} from './utils';

export const scheduleHelper = async (
  contract,
  bulkEntries,
  startDate,
  balance,
  tenor,
  salvageAmount,
  salvageTenor,
  nextDate,
  perHolidays
) => {
  if (tenor === 0) {
    return bulkEntries;
  }

  let currentDate = getFullDate(startDate);

  if (contract.repayment === 'equal') {
    const payment = Math.round((balance - (salvageAmount || 0)) / tenor);

    for (let i = 0; i < tenor; i++) {
      const perMonth = await calcPerMonthEqual(
        contract,
        balance,
        currentDate,
        payment,
        perHolidays,
        i === 0 && nextDate
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
      scheduleDay: contract.scheduleDay,
      interestRate: contract.interestRate,
      tenor: tenor - salvageTenor,
      nextDate,
      leaseAmount: balance,
      salvage: salvageAmount,
      weekends: contract.weekends,
      useHoliday: contract.useHoliday,
      perHolidays
    });

    for (let i = 0; i < tenor - salvageTenor; i++) {
      const perMonth = await calcPerMonthFixed(
        contract,
        balance,
        currentDate,
        total,
        perHolidays,
        i === 0 && nextDate
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

const insuranceHelper = (contract, insuranceTypeRulesById, currentYear) => {
  let perMonthInsurance = 0;
  let perYearInsurance = 0;
  for (const data of contract.collateralsData) {
    const insuranceType = insuranceTypeRulesById[data.insuranceTypeId];

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
  models,
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
    contract.scheduleDay
  );
  const diffDay = getDiffDay(contract.startDate, firstNextDate);

  // diff from startDate to nextDate valid: max 42 min 10 day, IsValid then undifined or equal nextMonthDay
  let nextDate: any = undefined;
  if (diffDay > 42) {
    nextDate = new Date(
      contract.startDate.getFullYear(),
      contract.startDate.getMonth(),
      contract.scheduleDay
    );
  } else if (diffDay < 10) {
    nextDate = new Date(
      firstNextDate.getFullYear(),
      firstNextDate.getMonth() + 1,
      contract.scheduleDay
    );
  }

  bulkEntries = await scheduleHelper(
    contract,
    bulkEntries,
    startDate,
    balance,
    tenor,
    contract.salvageAmount,
    contract.salvageTenor,
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
    contract.salvageAmount,
    contract.salvageTenor,
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

  await models.RepaymentSchedules.deleteMany({ contractId: contract._id });
  await models.RepaymentSchedules.insertMany(bulkEntries);

  await models.FirstSchedules.deleteMany({ contractId: contract._id });
  await models.FirstSchedules.insertMany(bulkEntries);
};

const fillAmounts = async (
  models,
  doc,
  tr,
  preSchedule,
  isSetAmount: boolean = false
) => {
  if (isSetAmount) {
    doc.undue = tr.calcedInfo.undue || 0;
    doc.interestEve = tr.calcedInfo.interestEve || 0;
    doc.interestNonce = tr.calcedInfo.interestNonce || 0;
    doc.payment = tr.calcedInfo.payment || 0;
    doc.insurance = tr.calcedInfo.insurance || 0;
    doc.debt = tr.calcedInfo.debt || 0;
    doc.total = tr.calcedInfo.total || 0;
  }

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
    doc.didPayment = tr.payment + doc.balance;
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      { $set: { surplus: doc.surplus, payment: doc.didPayment } }
    );
    doc.balance = 0;
  }

  return doc;
};

export const generatePendingSchedules = async (
  models,
  contract,
  updatedSchedule,
  pendingSchedules,
  tr,
  trReaction,
  allowLess: boolean = false
) => {
  let changeDoc = {};

  if (updatedSchedule.didDebt < updatedSchedule.debt) {
    trReaction.push({
      scheduleId: updatedSchedule._id,
      preData: { status: updatedSchedule.status }
    });
    await models.RepaymentSchedules.updateOne(
      { _id: updatedSchedule._id },
      { $set: { status: SCHEDULE_STATUS.LESS } }
    );
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    );
    return;
  }

  if (updatedSchedule.didUndue < updatedSchedule.undue) {
    // allowLess is forever false
    trReaction.push({
      scheduleId: updatedSchedule._id,
      preData: { status: updatedSchedule.status }
    });
    await models.RepaymentSchedules.updateOne(
      { _id: updatedSchedule._id },
      { $set: { status: SCHEDULE_STATUS.LESS } }
    );
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    );
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
  let interestEve = 0;
  let interestNonce = 0;
  let index = 0;

  // less pay then pendingSchedules not change current schedule status to less
  if (diff < 0) {
    // TODO debt (limit) check
    if (!allowLess) {
      trReaction.push({
        scheduleId: updatedSchedule._id,
        preData: { status: updatedSchedule.status }
      });
      await models.RepaymentSchedules.updateOne(
        { _id: updatedSchedule._id },
        { $set: { status: SCHEDULE_STATUS.LESS } }
      );
      await models.LoanTransactions.updateOne(
        { _id: tr._id },
        {
          $set: { reactions: trReaction }
        }
      );
      return;
    }

    // allowLess === true or only between less then only after schedule update
    interestEve =
      (updatedSchedule.interestEve || 0) -
      (updatedSchedule.didInterestEve || 0);
    interestNonce =
      (updatedSchedule.interestNonce || 0) -
      (updatedSchedule.didInterestNonce || 0);

    const payment = schedule.payment - updatedSchedule.didPayment;

    changeDoc = {
      interestEve: schedule.interestEve + interestEve,
      interestNonce: schedule.interestNonce + interestNonce,
      payment,
      balance: balance - payment,
      total:
        schedule.total +
        interestEve +
        interestNonce -
        updatedSchedule.didPayment
    };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    await models.RepaymentSchedules.updateOne(
      { _id: schedule._id },
      { $set: { ...changeDoc } }
    );
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    );
    return;
  }

  if (updatedSchedule.didInsurance < updatedSchedule.insurance) {
    const insurance = updatedSchedule.insurance - updatedSchedule.didInsurance;
    changeDoc = {
      insurance: schedule.insurance + insurance,
      total: schedule.total + insurance
    };

    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });

    await models.RepaymentSchedules.updateOne(
      { _id: schedule._id },
      { $set: { ...changeDoc } }
    );
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    );
    return;
  }

  if (updatedSchedule.didDebt < updatedSchedule.debt) {
    // debt less then next schedule debt up and not change other fields
    const debt = updatedSchedule.debt - updatedSchedule.didDebt;

    changeDoc = { debt, total: schedule.total + debt };
    trReaction.push({
      scheduleId: schedule._id,
      preData: { ...getChanged(schedule, changeDoc) }
    });
    await models.RepaymentSchedules.updateOne(
      { _id: schedule._id },
      {
        $set: { ...changeDoc }
      }
    );
    await models.LoanTransactions.updateOne(
      { _id: tr._id },
      {
        $set: { reactions: trReaction }
      }
    );
    return;
  }

  // more pay then pendingSchedules change payment to lower
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: any };
    };
  }> = [];

  while (diff > schedule.payment && index < pendingSchedules.length - 1) {
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
    diff = diff - schedule.payment;

    changeDoc = {
      debt: 0,
      payment: 0,
      interestEve,
      interestNonce,
      balance,
      total: interestEve + interestNonce + (schedule.insurance || 0)
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
    diff = diff - schedule.payment;

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
    // diff < 0 condition
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
    balance = balance - schedule.payment + diff;

    changeDoc = {
      debt: 0,
      payment: schedule.payment - diff,
      interestEve,
      interestNonce,
      balance,
      total:
        interestEve +
        interestNonce +
        schedule.payment -
        diff +
        (schedule.insurance || 0)
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

  await models.LoanTransactions.updateOne(
    { _id: tr._id },
    {
      $set: { reactions: trReaction }
    }
  );
  await models.RepaymentSchedules.bulkWrite(bulkOps);
};

export const onPreScheduled = async (
  models,
  contract,
  tr,
  preSchedule,
  pendingSchedules
) => {
  const trReaction: any[] = [];

  // multi pay on day
  const doc = await fillAmounts(
    models,
    { ...preSchedule },
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
    await models.RepaymentSchedules.updateOne(
      { _id: preSchedule._id },
      { $set: { ...doc } }
    );
    updatedSchedule = await models.RepaymentSchedules.findOne({
      _id: preSchedule._id
    });
  } else {
    // on contracted date to pay
    updatedSchedule = await models.RepaymentSchedules.create({
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
  models,
  contract,
  tr,
  preSchedule,
  pendingSchedules
) => {
  const trReaction: any = [];
  const doc = await fillAmounts(models, {}, tr, preSchedule, true);

  doc.contractId = contract._id;
  doc.payDate = tr.payDate;
  doc.status = SCHEDULE_STATUS.DONE;

  const updatedSchedule = await models.RepaymentSchedules.create({
    ...doc,
    isDefault: false
  });

  trReaction.push({ scheduleId: updatedSchedule._id, preData: undefined });

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule._doc },
    pendingSchedules,
    tr,
    trReaction,
    true
  );
};

export const onNextScheduled = async (
  models,
  contract,
  tr,
  preSchedule,
  nextSchedule,
  pendingSchedules
) => {
  const trReaction: any[] = [];

  const doc = await fillAmounts(
    models,
    { ...nextSchedule },
    tr,
    preSchedule,
    false
  );
  doc.status = SCHEDULE_STATUS.DONE;

  trReaction.push({
    scheduleId: nextSchedule._id,
    preData: { ...getChanged(nextSchedule, doc) }
  });
  await models.RepaymentSchedules.updateOne(
    { _id: nextSchedule._id },
    { $set: doc }
  );
  const updatedSchedule = await models.RepaymentSchedules.findOne({
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
  models,
  contract,
  tr,
  preSchedule,
  nextSchedule,
  pendingSchedules
) => {
  interface ITrReaction {
    scheduleId: string;
    preData?: any;
  }
  const trReaction: ITrReaction[] = [];
  const doc = await fillAmounts(
    models,
    { ...nextSchedule },
    tr,
    preSchedule,
    true
  );

  const updatedSchedule = await models.RepaymentSchedules.create({
    ...doc,
    _id: undefined,
    isDefault: false,
    status: SCHEDULE_STATUS.DONE
  });
  trReaction.push({ scheduleId: updatedSchedule._id, preData: undefined });

  const skippedSchedules = await models.RepaymentSchedules.find(
    {
      $and: [
        { payDate: { $gte: nextSchedule.payDate } },
        { payDate: { $lte: updatedSchedule.payDate } },
        { _id: { $ne: updatedSchedule._id } }
      ]
    },
    { _id: 1 }
  ).lean();

  for (const skippedSchedule of skippedSchedules) {
    trReaction.push({
      scheduleId: skippedSchedule._id || 0,
      preData: { status: SCHEDULE_STATUS.PENDING }
    });
  }

  await models.RepaymentSchedules.updateMany(
    {
      $and: [
        { payDate: { $gte: nextSchedule.payDate } },
        { payDate: { $lte: updatedSchedule.payDate } },
        { _id: { $ne: updatedSchedule._id } }
      ]
    },
    { $set: { status: SCHEDULE_STATUS.SKIPPED } }
  );

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule._doc },
    pendingSchedules.filter(s => s.payDate > updatedSchedule.payDate),
    tr,
    trReaction
  );
};
