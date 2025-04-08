//#region  import
import { IModels } from '../../connectionResolver';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { trAfterSchedule, transactionRule } from './transactionUtils';
import {
  addMonths,
  calcPerMonthEqual,
  calcPerMonthFixed,
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

export const insuranceHelper = (
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

export const scheduleHelper = async (
  bulkEntries: any[],
  {
    contractId,
    repayment,
    startDate,
    balance,
    interestRate,
    tenor,
    salvageAmount,
    unUsedBalance,
    skipInterestCalcMonth,
    skipInterestCalcDay,
    skipAmountCalcMonth,
    skipAmountCalcDay,
    dateRanges
  }: {
    contractId: string,
    repayment: string,
    startDate: Date,
    balance: number,
    interestRate: number,
    tenor: number,
    salvageAmount: number,
    unUsedBalance?: number,
    skipInterestCalcMonth?: number,
    skipInterestCalcDay?: number,
    skipAmountCalcMonth?: number,
    skipAmountCalcDay?: number,
    dateRanges: Date[]
  },
  calculationFixed: number = 2
) => {
  if (tenor === 0) {
    return bulkEntries;
  }
  let currentDate = getFullDate(startDate);

  let endDate = addMonths(new Date(startDate), tenor);

  const paymentDates = dateRanges.filter(date => {
    if (
      date <= startDate || date > endDate
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
        interestRate: interestRate ?? 0,
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
        interestRate: perMonth.interestRate ?? 0,
        balance: balance,
        payment,
        firstPayment: payment,
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
      interestRate: interestRate ?? 0,
      leaseAmount: balance,
      paymentDates,
      calculationFixed
    });

    for (const payDate of paymentDates) {
      const perMonth = await calcPerMonthFixed({
        currentDate,
        balance,
        interestRate: interestRate ?? 0,
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
        interestRate: perMonth.interestRate,
        balance,
        payment: perMonth.loanPayment,
        interestEve: perMonth.calcedInterestEve,
        interestNonce: perMonth.calcedInterestNonce,
        total,
        firstTotal: total,
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

      const dateRanges: Date[] = generateDates(
        startDate, stepRule.scheduleDays || contract.scheduleDays,
        tenor, contract.holidayType || 'exact', contract.weekends || [], perHolidays, stepRule.firstPayDate
      )

      bulkEntries = await scheduleHelper(
        bulkEntries,
        {
          contractId: contract._id,
          repayment: contract.repayment,
          startDate,
          balance,
          interestRate: stepRule.interestRate ?? contract.interestRate,
          tenor: stepRule.tenor,
          salvageAmount: stepRule.salvageAmount || 0,
          skipInterestCalcMonth: stepRule.skipInterestCalcMonth,
          skipInterestCalcDay: stepRule.skipInterestCalcDay,
          skipAmountCalcMonth: stepRule.skipAmountCalcMonth,
          skipAmountCalcDay: stepRule.skipAmountCalcDay,
          dateRanges
        },
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
    const dateRanges: Date[] = generateDates(
      startDate, contract.scheduleDays, tenor,
      contract.holidayType || 'exact', contract.weekends || [], perHolidays,
      bulkEntries.length && contract.firstPayDate || undefined
    )

    bulkEntries = await scheduleHelper(
      bulkEntries,
      {
        contractId: contract._id,
        repayment: contract.repayment,
        startDate,
        balance,
        interestRate: contract.interestRate,
        tenor,
        salvageAmount: 0,
        unUsedBalance,
        skipInterestCalcMonth: !bulkEntries.length && contract.skipInterestCalcMonth || undefined,
        skipInterestCalcDay: !bulkEntries.length && contract.skipInterestCalcDay || undefined,
        skipAmountCalcMonth: !bulkEntries.length && contract.skipAmountCalcMonth || undefined,
        skipAmountCalcDay: !bulkEntries.length && contract.skipAmountCalcDay || undefined,
        dateRanges
      },
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
