//#region  import
import { IModels } from '../../connectionResolver';
import { CONTRACT_STATUS, SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import { ITransactionDocument } from '../definitions/transactions';
import { trAfterSchedule, transactionRule } from './transactionUtils';
import {
  addMonths,
  calcInterest,
  calcPerMonthEqual,
  calcPerMonthFixed,
  getChanged,
  getDatesDiffMonth,
  getDiffDay,
  getEqualPay,
  getFullDate,
  IPerHoliday
} from './utils';
import * as moment from 'moment'
import { BigNumber } from 'bignumber.js'
import { getConfig } from '../../messageBroker';
//#endregion

const getCorrectDate = (genDate, holidayType, weekends, perHolidays) => {
  if (!['before', 'after'].includes(holidayType)) {
    return genDate;
  }

  const month = genDate.getMonth();
  const day = genDate.getDate();

  if (weekends.includes(genDate.getDay()) || perHolidays.find(ph => ph.month === month + 1 && ph.day === day)) {
    let multiplier = 1;
    if (holidayType === 'before') {
      multiplier = -1;
    }
    return getCorrectDate(new Date(moment(genDate).add(multiplier, 'day').format('YYYY-MM-DD')), holidayType, weekends, perHolidays)
  } else {
    return genDate;
  }
}

const generateDates = (startDate: Date, scheduleDays, tenor, holidayType, weekends, perHolidays: IPerHoliday[], firstPayDate?: Date) => {
  let mainDate: Date;
  var dateRanges: Date[] = [];

  // ehnii tuluh udur todorhoi bol ter uduriig ni dates-d oroltsuulna harin todorhoigui bol startDate ees hoishhi anh oldson huvaarit udruur todorhoilogdono
  if (firstPayDate) {
    mainDate = getFullDate(firstPayDate)
    dateRanges.push(mainDate)
  } else {
    mainDate = getFullDate(startDate)
  }

  const dateRange = scheduleDays.sort((a, b) => a - b);

  for (let index = 0; index < tenor + 2; index++) {
    const year = moment(mainDate).year();
    const month = moment(mainDate).month();

    for (const subDay of dateRange) {
      const genDate = getFullDate(new Date(year, month, subDay));

      if (dateRanges.includes(genDate) || mainDate > genDate) {
        continue;
      }

      const correctDate = getCorrectDate(genDate, holidayType, weekends, perHolidays);

      if (!dateRanges.includes(correctDate)) {
        dateRanges.push(correctDate)
      }
    }

    mainDate = new Date(moment(new Date(year, month, 1)).add(1, 'M').format('YYYY-MM-DD'));
  }

  return dateRanges
}

const insuranceHelper = (
  contract: IContractDocument,
  insuranceTypeRulesById: any,
  currentYear: number
) => {
  let perMonthInsurance = 0;
  let perYearInsurance = 0;
  for (const data of contract.collateralsData || []) {
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

const getSkipDate = (currentDate: Date, skipMonth?: number, skipDay?: number) => {
  if (skipDay) {
    return new Date(moment(new Date(currentDate)).add(skipDay, 'day').format('YYYY-MM-DD'));
  }
  if (skipMonth) {
    return new Date(moment(new Date(currentDate)).add(skipMonth, 'M').format('YYYY-MM-DD'));
  }
  return;
}

const scheduleHelper = async (
  bulkEntries: any[],
  {
    contractId,
    scheduleDays,
    repayment,
    startDate,
    balance,
    interestRate,
    tenor,
    salvageAmount,
    weekends,
    holidayType,
    firstPayDate,
    unUsedBalance,
    skipInterestCalcMonth,
    skipInterestCalcDay,
    skipAmountCalcMonth,
    skipAmountCalcDay
  }: {
    contractId: string,
    scheduleDays: number[],
    repayment: string,
    startDate: Date,
    balance: number,
    interestRate: number,
    tenor: number,
    salvageAmount: number,
    weekends: number[],
    holidayType: string,

    firstPayDate?: Date,
    unUsedBalance?: number,
    skipInterestCalcMonth?: number,
    skipInterestCalcDay?: number,
    skipAmountCalcMonth?: number,
    skipAmountCalcDay?: number
  },
  perHolidays: IPerHoliday[],
  calculationFixed: number = 2
) => {
  if (tenor === 0) {
    return bulkEntries;
  }
  let currentDate = getFullDate(startDate);

  let endDate = addMonths(new Date(startDate), tenor);

  let dateRanges: Date[] = generateDates(startDate, scheduleDays, tenor, holidayType, weekends, perHolidays, firstPayDate)

  const paymentDates = dateRanges.filter(date => {
    if (
      date < startDate || date >= endDate
    )
      return false;
    return true;
  });

  const skipInterestCalcDate = getSkipDate(currentDate, skipInterestCalcMonth, skipInterestCalcDay);
  const skipAmountCalcDate = getSkipDate(currentDate, skipAmountCalcMonth, skipAmountCalcDay);

  if (repayment === 'equal') {
    const payment = new BigNumber(balance - (salvageAmount || 0)).div(paymentDates.length).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()

    for (const payDate of paymentDates) {
      const perMonth = await calcPerMonthEqual({
        currentDate,
        balance,
        interestRate,
        payment,
        nextDate: payDate,
        calculationFixed,
        unUsedBalance,
        skipInterestCalcDate,
        skipAmountCalcDate,
      });

      currentDate = perMonth.date;
      balance = perMonth.loanBalance;

      bulkEntries.push({
        createdAt: new Date(),
        contractId,
        version: '0',
        payDate: currentDate,
        balance: balance,
        payment,
        interestEve: perMonth.calcedInterestEve,
        interestNonce: perMonth.calcedInterestNonce,
        total: perMonth.totalPayment,
        unUsedBalance,
        commitmentInterest: perMonth.commitmentInterest,
        isDefault: true
      });
    }
  } else {
    let total = await getEqualPay({
      startDate,
      interestRate: interestRate,
      leaseAmount: balance,
      paymentDates,
      calculationFixed
    });

    for (const payDate of paymentDates) {
      const perMonth = await calcPerMonthFixed({
        currentDate,
        balance,
        interestRate,
        total,
        nextDate: payDate,
        calculationFixed,
        unUsedBalance,
        skipInterestCalcDate,
        skipAmountCalcDate,
      });

      currentDate = perMonth.date;
      balance = perMonth.loanBalance;

      bulkEntries.push({
        createdAt: new Date(),
        contractId,
        version: '0',
        payDate: currentDate,
        balance,
        payment: perMonth.loanPayment,
        interestEve: perMonth.calcedInterestEve,
        interestNonce: perMonth.calcedInterestNonce,
        total,
        unUsedBalance,
        commitmentInterest: perMonth.commitmentInterest,
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

export const generateSchedules = async (subdomain: string, models: IModels, contract: IContractDocument, unUsedBalance?: number) => {
  let bulkEntries: any[] = [];
  let balance = contract.leaseAmount;
  let startDate: Date = getFullDate(contract.startDate);
  let tenor = contract.tenor;

  const holidayConfigs = await getConfig('holidayConfig', subdomain, []);
  const perHolidays = !holidayConfigs?.value
    ? []
    : Object.keys(holidayConfigs.value).map((key) => ({
      month: Number(holidayConfigs.value[key].month) - 1,
      day: Number(holidayConfigs.value[key].day),
    }));

  const mainConfigs = await getConfig('loansConfig', subdomain, {});

  if (contract.stepRules?.length) {
    for (const stepRule of contract.stepRules.sort((a, b) => a.firstPayDate.getTime() - b.firstPayDate.getTime())) {
      if (!stepRule.salvageAmount) {
        if (stepRule.totalMainAmount) {
          stepRule.salvageAmount = balance - stepRule.totalMainAmount;
        }

        if (stepRule.mainPayPerMonth) {
          stepRule.salvageAmount = balance - (stepRule.mainPayPerMonth * stepRule.tenor)
        }
      }

      bulkEntries = await scheduleHelper(
        bulkEntries,
        {
          contractId: contract._id,
          scheduleDays: stepRule.scheduleDays || contract.scheduleDays,
          repayment: stepRule.repayment || contract.repayment,
          startDate,
          balance,
          interestRate: stepRule.interestRate ?? contract.interestRate,
          tenor: stepRule.tenor,
          salvageAmount: stepRule.salvageAmount || 0,
          weekends: contract.weekends || [],
          holidayType: contract.holidayType || 'exact',
          firstPayDate: stepRule.firstPayDate,
          skipInterestCalcMonth: stepRule.skipInterestCalcMonth,
          skipInterestCalcDay: stepRule.skipInterestCalcDay,
          skipAmountCalcMonth: stepRule.skipAmountCalcMonth,
          skipAmountCalcDay: stepRule.skipAmountCalcDayd,
        },
        perHolidays,
        mainConfigs.calculationFixed,
      )

      if (bulkEntries.length) {
        const preEntry: any = bulkEntries[bulkEntries.length - 1];
        startDate = preEntry.payDate;
        balance = preEntry.balance;
      }
      tenor = tenor - stepRule.tenor
    }
  }

  if (tenor > 0) {
    bulkEntries = await scheduleHelper(
      bulkEntries,
      {
        contractId: contract._id,
        scheduleDays: contract.scheduleDays,
        repayment: contract.repayment,
        startDate,
        balance,
        interestRate: contract.interestRate,
        tenor,
        salvageAmount: 0,
        weekends: contract.weekends || [],
        holidayType: contract.holidayType || 'exact',
        firstPayDate: bulkEntries.length && contract.firstPayDate || undefined,
        unUsedBalance,
        skipInterestCalcMonth: !bulkEntries.length && contract.skipInterestCalcMonth || undefined,
        skipInterestCalcDay: !bulkEntries.length && contract.skipInterestCalcDay || undefined,
        skipAmountCalcMonth: !bulkEntries.length && contract.skipAmountCalcMonth || undefined,
        skipAmountCalcDay: !bulkEntries.length && contract.skipAmountCalcDay || undefined
      },
      perHolidays,
      mainConfigs.calculationFixed
    )
  }

  // insurance schedule
  const insuranceTypeIds = (contract.collateralsData || []).map(
    coll => coll.insuranceTypeId
  );
  (contract.insurancesData || []).map(ins => ins.insuranceTypeId)

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

  return bulkEntries
}

// hamgiin anh geree hiigdehed buyu yamar negen guilgee garaagui bol shinechleed baij boloh bugdiig tseverleed dahina gesen ug
export const reGenerateSchedules = async (subdomain: string, models: IModels, contract: IContractDocument) => {
  const oneTr = await models.Transactions.findOne({ contractId: contract._id }).lean();
  if (oneTr) {
    throw new Error('not generate schedule, cause: has a transaction')
  }

  if (
    !contract.leaseAmount ||
    !contract.tenor ||
    !contract.firstPayDate ||
    !contract.scheduleDays?.length ||
    !contract.startDate ||
    !contract.endDate
  ) {
    return;
  }

  const bulkEntries = await generateSchedules(subdomain, models, contract)

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
    doc.loss = tr?.calcedInfo?.loss ?? 0;
    doc.interestEve = tr?.calcedInfo?.interestEve ?? 0;
    doc.interestNonce = tr?.calcedInfo?.interestNonce ?? 0;
    doc.payment = tr?.calcedInfo?.payment ?? 0;
    doc.insurance = tr?.calcedInfo?.insurance ?? 0;
    doc.debt = tr?.calcedInfo?.debt ?? 0;
    doc.total = tr?.calcedInfo?.total ?? 0;
    doc.commitmentInterest = tr?.calcedInfo?.commitmentInterest ?? 0;
  }

  doc.loss = doc.loss ?? 0;
  doc.didLoss = (doc.didLoss ?? 0) + (tr.loss ?? 0);
  doc.didInterestEve = (doc.didInterestEve ?? 0) + (tr.interestEve ?? 0);
  doc.didInterestNonce = (doc.didInterestNonce ?? 0) + (tr.interestNonce ?? 0);
  doc.didCommitmentInterest =
    (doc.didCommitmentInterest ?? 0) + (tr.commitmentInterest ?? 0);
  doc.didPayment = (doc.didPayment ?? 0) + (tr.payment ?? 0);
  doc.didInsurance = (doc.didInsurance ?? 0) + (tr.insurance ?? 0);
  doc.didDebt = (doc.didDebt ?? 0) + (tr.debt ?? 0);
  doc.didTotal = (doc.didTotal ?? 0) + (tr.total ?? 0);
  doc.surplus = (doc.surplus ?? 0) + (tr.surplus ?? 0);

  doc.balance = (preSchedule.balance ?? 0) - (tr.payment ?? 0);

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

const generatePendingSchedules = async (
  models: IModels,
  contract: IContractDocument,
  updatedSchedule: IScheduleDocument,
  pendingSchedules: IScheduleDocument[],
  tr: ITransactionDocument,
  trReaction,
  allowLess: boolean = false
) => {
  let changeDoc = {};

  //this preMainSchedule is payment is less but if prev schedule is done and
  const preMainSchedule: any =
    !updatedSchedule.isDefault &&
    (await models.Schedules.findOne({
      contractId: contract._id,
      isDefault: true,
      payDate: { $lt: updatedSchedule.payDate }
    }).sort({ dayDate: -1 }));

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
      {
        $set: {
          status:
            preMainSchedule?.status === SCHEDULE_STATUS.DONE ||
              preMainSchedule === null
              ? SCHEDULE_STATUS.PRE
              : SCHEDULE_STATUS.LESS
        }
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

  // if loss payed less than must pay loss then this section will be true
  if (
    !!updatedSchedule.didLoss &&
    !!updatedSchedule.loss &&
    updatedSchedule.didLoss < updatedSchedule.loss
  ) {
    // allowLess is forever false
    trReaction.push({
      scheduleId: updatedSchedule._id,
      preData: { status: updatedSchedule.status }
    });
    await models.Schedules.updateOne(
      { _id: updatedSchedule._id },
      {
        $set: {
          status:
            preMainSchedule?.status === SCHEDULE_STATUS.DONE ||
              preMainSchedule === null
              ? SCHEDULE_STATUS.PRE
              : SCHEDULE_STATUS.LESS
        }
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

  //this diff is payment diff payed greater is less
  let diff =
    (updatedSchedule.didPayment || 0) +
    (updatedSchedule.didInterestEve || 0) +
    (updatedSchedule.didInterestNonce || 0) -
    (updatedSchedule.payment || 0) -
    (updatedSchedule.interestEve || 0) -
    (updatedSchedule.interestNonce || 0);

  let preSchedule = updatedSchedule; //current schedule
  let schedule = pendingSchedules[0]; //feature schedule

  if (!schedule) {
    return;
  }

  let balance = updatedSchedule.balance; //current balance

  //must pay payment paid greater than or less than payed
  let paymentBalance =
    (updatedSchedule.payment || 0) - (updatedSchedule.didPayment || 0);

  let interestEve = 0; //this is for calculate interestEve for between schedules
  let interestNonce = 0; //this is for calculate interestNonce for between schedules
  let index = 0; //this index for while loop for correction future schedules
  let payment = 0;

  const skipInterestCalcDate = addMonths(
    new Date(getFullDate(contract.startDate)),
    // contract.skipInterestCalcMonth || 0
    new Date(getFullDate(contract.startDate)),
  );

  const isSkipInterestCalc =
    getDiffDay(updatedSchedule.payDate, skipInterestCalcDate) >= 0;

  let updatePrevScheduleReactions: any = []; //this updatePrevScheduleReactions variable for transaction reaction
  let updatePrevSchedulesBulk: any = [];

  //undoneSchedules this list is undone default schedules
  const undoneSchedules = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $lt: tr.payDate },
    scheduleDidStatus: { $ne: SCHEDULE_STATUS.DONE },
    isDefault: true
  })
    .sort({ payDate: 1 })
    .lean();

  if (undoneSchedules.length > 0) {
    undoneSchedules.map((schedule: IScheduleDocument) => {
      let changeDoc = {
        scheduleDidPayment: schedule.scheduleDidPayment || 0,
        scheduleDidInterest: schedule.scheduleDidInterest || 0,
        scheduleDidStatus: SCHEDULE_STATUS.PENDING
      };

      let sumPayment =
        (updatedSchedule.didPayment || 0) + (changeDoc.scheduleDidPayment || 0);

      if (updatedSchedule.didPayment && sumPayment >= (schedule.payment || 0)) {
        changeDoc.scheduleDidPayment = schedule.payment || 0;
        changeDoc.scheduleDidStatus = SCHEDULE_STATUS.DONE;
      } else {
        changeDoc.scheduleDidPayment = sumPayment;
        changeDoc.scheduleDidStatus = SCHEDULE_STATUS.LESS;
      }

      let sumInterest =
        (updatedSchedule.didInterestEve || 0) +
        (updatedSchedule.didInterestNonce || 0) +
        (changeDoc.scheduleDidInterest || 0);

      if (
        (updatedSchedule.didInterestEve || 0) +
        (updatedSchedule.didInterestNonce || 0) >
        0 &&
        sumInterest >=
        (schedule.didInterestEve || 0) + (schedule.didInterestNonce || 0)
      ) {
        changeDoc.scheduleDidInterest =
          (schedule.interestEve || 0) + (schedule.interestNonce || 0);
      } else {
        changeDoc.scheduleDidInterest = sumInterest;
      }

      updatePrevScheduleReactions.push({
        scheduleId: updatedSchedule._id,
        preData: { ...getChanged({ ...schedule }, { ...changeDoc }) }
      });

      updatePrevSchedulesBulk.push({
        updateOne: {
          filter: { _id: schedule._id },
          update: { $set: { ...changeDoc } }
        }
      });
    });
  }

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
        {
          $set: {
            status:
              preMainSchedule?.status === SCHEDULE_STATUS.DONE ||
                preMainSchedule === null
                ? SCHEDULE_STATUS.PRE
                : SCHEDULE_STATUS.LESS
          }
        }
      );
      tr._id &&
        (await models.Transactions.updateOne(
          { _id: tr._id },
          {
            $set: { reactions: [...trReaction, ...updatePrevScheduleReactions] }
          }
        ));
    }

    if (isSkipInterestCalc) {
      interestEve = 0;
      interestNonce = 0;
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
    }

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
          $set: { reactions: [...trReaction, ...updatePrevScheduleReactions] }
        }
      ));

    //updatePrevSchedulesBulk this update section must be update schedule Payment is done
    updatePrevSchedulesBulk.length > 0 &&
      (await models.Schedules.bulkWrite(updatePrevSchedulesBulk));
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
          $set: { reactions: [...trReaction, ...updatePrevScheduleReactions] }
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
          $set: { reactions: [...trReaction, ...updatePrevScheduleReactions] }
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
    if (
      isSkipInterestCalc &&
      getDiffDay(schedule.payDate, skipInterestCalcDate) >= 0
    ) {
      interestEve = 0;
      interestNonce = 0;
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
    }

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
    if (
      isSkipInterestCalc &&
      getDiffDay(schedule.payDate, skipInterestCalcDate) >= 0
    ) {
      interestEve = 0;
      interestNonce = 0;
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
    }

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
    if (
      isSkipInterestCalc &&
      getDiffDay(schedule.payDate, skipInterestCalcDate) >= 0
    ) {
      interestEve = 0;
      interestNonce = 0;
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
    }
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
    if (
      isSkipInterestCalc &&
      getDiffDay(schedule.payDate, skipInterestCalcDate) >= 0
    ) {
      interestEve = 0;
      interestNonce = 0;
    } else {
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
    }
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

  //updatePrevSchedulesBulk this update section must be update schedule Payment is done
  updatePrevSchedulesBulk.length > 0 &&
    (await models.Schedules.bulkWrite(updatePrevSchedulesBulk));

  if (tr._id) {
    let transactionReaction: any = {
      reactions: [...trReaction, ...updatePrevScheduleReactions]
    };

    if (updatedSchedule.balance === 0 && contract._id) {
      transactionReaction.contractReaction = {
        _id: contract._id,
        status: contract.status
      };
      await models.Contracts.updateOne(
        { _id: contract._id },
        { $set: { status: CONTRACT_STATUS.CLOSED } }
      );
    }

    await models.Transactions.updateOne(
      { _id: tr._id },
      {
        $set: transactionReaction
      }
    );
  }

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
const onPreScheduled = async (
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
  doc.status = 'done';

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

const betweenScheduled = async (
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

  const preMainSchedule: any = await models.Schedules.findOne({
    contractId: contract._id,
    isDefault: true,
    payDate: { $lt: tr.payDate }
  }).sort({ dayDate: -1 });

  const diff =
    (doc.payment || 0) -
    (doc.didPayment || 0) +
    (doc.interestEve || 0) -
    (doc.didInterestEve || 0) +
    (doc.interestNonce || 0) -
    (doc.didInterestNonce || 0);

  doc.contractId = contract._id;
  doc.payDate = tr.payDate;
  doc.status =
    diff > 0
      ? preMainSchedule?.status === SCHEDULE_STATUS.DONE ||
        preMainSchedule === null
        ? 'pre'
        : 'less'
      : 'done';

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

const onNextScheduled = async (
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
  doc.status = 'done';

  trReaction.push({
    scheduleId: nextSchedule._id,
    preData: { ...getChanged(nextSchedule, doc) }
  });
  await models.Schedules.updateOne({ _id: nextSchedule._id }, { $set: doc });
  const updatedSchedule = await models.Schedules.findOne({
    _id: nextSchedule._id
  }).lean();

  if (!updatedSchedule) {
    throw new Error(`Schedule ${nextSchedule._id} not found`);
  }

  await generatePendingSchedules(
    models,
    contract,
    { ...updatedSchedule },
    pendingSchedules.filter(s => s._id !== nextSchedule._id),
    tr,
    trReaction
  );
};

const afterNextScheduled = async (
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
      scheduleId: skippedSchedule._id || '',
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
