//#region  import
import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import {
  addMonths,
  calcPerMonthEqual,
  calcPerMonthFixed,
  checkNextDay,
  getDiffDay,
  getEqualPay,
  getFullDate,
  getNextMonthDay,
  IPerHoliday
} from './utils';
//#endregion

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

const getMainDate = (mainDate: Date, index: number, day: number) => {
  const nDate = getFullDate(new Date(mainDate));
  const year = nDate.getFullYear();
  const month = index === 0 ? nDate.getMonth() + 1 : nDate.getMonth();

  if (day > 28 && new Date(year, month, day).getDate() !== day)
    mainDate = new Date(year, month + 1, 0);
  else mainDate = new Date(year, month, day);
  return mainDate;
};

const paymentDatesGenerate = async (
  contract: IContractDocument,
  startDate: Date,
  perHolidays: IPerHoliday[]
) => {
  const dateRange = contract.scheduleDays.sort((a, b) => a - b);
  let mainDate = new Date(startDate);

  let endDate = addMonths(new Date(startDate), contract.tenor);

  let dateRanges: Date[] = [];

  for (let index = 0; index < contract.tenor + 2; index++) {
    dateRange.forEach((day, i) => {
      mainDate = getMainDate(mainDate, i, day);
      dateRanges.push(mainDate);
    });
  }

  let paymentDates = dateRanges.filter(date => {
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

  if (paymentDates.length === 0) paymentDates.push(endDate);

  return paymentDates;
};

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

  let skipInterestCalcDate = addMonths(
    new Date(currentDate),
    contract.skipInterestCalcMonth ?? 0
  );

  let paymentDates = await paymentDatesGenerate(
    contract,
    startDate,
    perHolidays
  );

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
        paymentDates[i],
        skipInterestCalcDate
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
      paymentDates,
      skipInterestCalcDate
    });

    for (let i = 0; i < paymentDates.length - salvageTenor; i++) {
      const perMonth = await calcPerMonthFixed(
        contract,
        balance,
        currentDate,
        total,
        perHolidays,
        paymentDates[i],
        skipInterestCalcDate
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

const getNextDate = contract => {
  const firstNextDate = getNextMonthDay(
    contract.startDate,
    contract.scheduleDays
  );

  const diffDay = getDiffDay(contract.startDate, firstNextDate);

  // diff from startDate to nextDate valid: max 42 min 10 day, IsValid then undefined or equal nextMonthDay
  let nextDate: any = undefined;

  if (diffDay > 42 || contract.isPayFirstMonth) {
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

  return nextDate;
};

const generateInsurance = async (contract, models, bulkEntries) => {
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
};

const generateDebt = async (contract, bulkEntries) => {
  // insurance debt
  const debtTenor = Math.min(contract.debtTenor || 0, bulkEntries.length) || 1;

  const perDebt = Math.round(contract.debt / debtTenor);
  const firstDebt = contract.debt - perDebt * (debtTenor - 1);

  let monthDebt = perDebt;
  for (let i = 0; i < debtTenor; i++) {
    monthDebt = i === 0 ? firstDebt : perDebt;
    bulkEntries[i].debt = monthDebt;
    bulkEntries[i].total += monthDebt;
  }
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

  startDate.setDate(startDate.getDate() + 1);

  // diff from startDate to nextDate valid: max 42 min 10 day, IsValid then undefined or equal nextMonthDay
  let nextDate = getNextDate(contract);

  bulkEntries = await scheduleHelper(
    contract,
    bulkEntries,
    startDate,
    balance,
    tenor,
    contract.salvageAmount ?? 0,
    contract.salvageTenor ?? 0,
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
    contract.salvageAmount ?? 0,
    contract.salvageTenor ?? 0,
    0,
    0,
    nextDate,
    perHolidays
  );

  // insurance schedule
  await generateInsurance(contract, models, bulkEntries);

  if (contract.debt) {
    await generateDebt(contract, bulkEntries);
  }

  await models.Schedules.deleteMany({ contractId: contract._id });
  await models.Schedules.insertMany(bulkEntries);

  await models.FirstSchedules.deleteMany({ contractId: contract._id });
  await models.FirstSchedules.insertMany(bulkEntries);
};

export const getGraphicValue = async (
  contract: any,
  perHolidays: IPerHoliday[]
) => {
  let bulkEntries: any[] = [];
  let balance = contract.leaseAmount;
  let startDate: Date = contract.startDate;
  let tenor = contract.tenor;

  if (tenor === 0) {
    return;
  }

  startDate.setDate(startDate.getDate() + 1);

  const firstNextDate = getNextMonthDay(
    contract.startDate,
    contract.scheduleDays
  );

  const diffDay = getDiffDay(contract.startDate, firstNextDate);

  // diff from startDate to nextDate valid: max 42 min 10 day, IsValid then undefined or equal nextMonthDay
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

  return bulkEntries;
};
