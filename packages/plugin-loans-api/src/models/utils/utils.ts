import { IContractDocument } from '../definitions/contracts';
import { IDefaultScheduleParam } from '../definitions/schedules';
import { IModels } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
export const calcInterest = ({
  balance,
  interestRate,
  dayOfMonth = 30,
  fixed = 2
}: {
  balance: number;
  interestRate: number;
  fixed?: number;
  dayOfMonth?: number;
}): number => {
  const interest = new BigNumber(interestRate).div(100).div(365)
  return new BigNumber(balance).multipliedBy(interest).multipliedBy(dayOfMonth).dp(fixed, BigNumber.ROUND_HALF_UP).toNumber()
};

export function isWeekend(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday is 0, Saturday is 6
}

export function nextOffWeekend(date: Date) {
  let nextDate = moment(date).add(1, 'day'); // Start with the next day
  while (isWeekend(nextDate.toDate())) {
    nextDate = nextDate.add(1, 'day'); // Increment until we find a non-weekend day
  }
  return nextDate.toDate();
}

export function preOffWeekend(date: Date) {
  let nextDate = moment(date).add(-1, 'day'); // Start with the next day
  while (isWeekend(nextDate.toDate())) {
    nextDate = nextDate.add(-1, 'day'); // Increment until we find a non-weekend day
  }
  return nextDate.toDate();
}

export const calcPerVirtual = (doc: IDefaultScheduleParam) => {
  const loanPayment = doc.leaseAmount / doc.tenor;
  const loanBalance = doc.leaseAmount - loanPayment;

  const calcedInterest = calcInterest({
    balance: doc.leaseAmount,
    interestRate: doc.interestRate
  });

  const totalPayment = loanPayment + calcedInterest;

  return {
    loanBalance,
    loanPayment,
    calcedInterest,
    totalPayment
  };
};

export const getDaysInMonth = (date: Date) => {
  const ndate = getFullDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth() + 1;
  // Here January is 1 based
  //Day 0 is the last day in the previous month
  return new Date(year, month, 0).getDate();
  // Here January is 0 based
  // return new Date(year, month+1, 0).getDate();
};

export const getFullDate = (date: Date) => {
  return new Date(moment(date).format('YYYY-MM-DD'));
};

export const addMonths = (date, months) => {
  date.setMonth(date.getMonth() + months);

  return new Date(date);
};

export const getNextMonthDay = (date: Date, days: number[]) => {
  const ndate = getFullDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth() + 1;
  return new Date(year, month, days[0]);
};

export const getDatesDiffMonth = (fromDate: Date, toDate: Date) => {
  const fDate = getFullDate(fromDate);
  const tDate = getFullDate(toDate);

  if (fDate.getMonth() === tDate.getMonth()) {
    return {
      diffEve: getDiffDay(fromDate, toDate),
      diffNonce: 0
    };
  }

  const year = fDate.getFullYear();
  const month = fDate.getMonth();
  const lastDate = new Date(year, month, getDaysInMonth(fDate));

  return {
    diffEve: getDiffDay(fromDate, lastDate),
    diffNonce: getDiffDay(lastDate, toDate)
  };
};

export const getDiffDay = (fromDate: Date, toDate: Date) => {
  const date1 = getFullDate(fromDate);
  const date2 = getFullDate(toDate);
  return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
};

export interface IPerHoliday {
  month: number;
  day: number;
}

export const checkNextDay = (
  date: Date,
  weekends: number[],
  useHoliday: boolean,
  perHolidays: IPerHoliday[]
) => {
  if (weekends.includes(date.getDay())) {
    date = new Date(date.getTime() - 1000 * 3600 * 24);
    checkNextDay(date, weekends, useHoliday, perHolidays);
  }

  if (useHoliday) {
    for (const perYear of perHolidays) {
      const holiday = new Date(date.getFullYear(), perYear.month, perYear.day);
      if (getDiffDay(date, holiday) === 0) {
        date = new Date(date.getTime() - 1000 * 3600 * 24);
        checkNextDay(date, weekends, useHoliday, perHolidays);
      }
    }
  }

  return date;
};

export const calcPerMonthEqual = async (
  doc: IContractDocument,
  balance: number,
  currentDate: Date,
  payment: number,
  perHolidays: IPerHoliday[],
  nextDate: Date,
  skipInterestCalcDate: Date,
  calculationFixed: number
) => {
  let nextDay = nextDate;
  nextDay = checkNextDay(nextDay, doc.weekends, doc.useHoliday, perHolidays);

  if (getDiffDay(nextDate, skipInterestCalcDate) >= 0) {
    const loanBalance = new BigNumber(balance).minus(payment).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();
    const totalPayment = payment;

    return {
      date: nextDay,
      loanBalance,
      calcedInterestEve: 0,
      calcedInterestNonce: 0,
      totalPayment
    };
  }


  const diffDay = getDiffDay(currentDate, nextDay)

  const interest = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(currentDate, nextDay);

  const calcedInterestEve = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });

  const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()

  const loanBalance = new BigNumber(balance).minus(payment).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()

  const totalPayment = new BigNumber(payment).plus(calcedInterestEve).plus(calcedInterestNonce).toNumber();

  return {
    date: nextDay,
    loanBalance,
    calcedInterestEve,
    calcedInterestNonce,
    totalPayment
  };
};

export const getEqualPay = async ({
  startDate,
  interestRate,
  leaseAmount,
  paymentDates,
  calculationFixed
}: {
  startDate: Date;
  interestRate: number;
  weekends: number[];
  useHoliday: boolean;
  perHolidays: IPerHoliday[];
  leaseAmount?: number;
  salvage?: number;
  nextDate?: Date;
  paymentDates: Date[];
  skipInterestCalcDate: Date;
  calculationFixed: number
}) => {
  if (!leaseAmount) {
    return 0;
  }

  let currentDate = getFullDate(moment(startDate).add(-1, 'day').toDate());
  let mainRatio = new BigNumber(0);
  let ratio = 1;
  for (let i = 0; i < paymentDates.length; i++) {
    let nextDay = paymentDates[i];
    const dayOfMonth = getDiffDay(currentDate, nextDay);
    let ratioDivider = new BigNumber(dayOfMonth).multipliedBy(new BigNumber(interestRate).dividedBy(100)).dividedBy(365).plus(1)
    const newRatio = new BigNumber(ratio).dividedBy(ratioDivider).toNumber();
    mainRatio = mainRatio.plus(newRatio);
    currentDate = getFullDate(nextDay);
    ratio = newRatio;
  }

  return new BigNumber(leaseAmount).div(mainRatio).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()
};

export const calcPerMonthFixed = async (
  doc: IContractDocument,
  balance: number,
  currentDate: Date,
  total: number,
  perHolidays: IPerHoliday[],
  nextDate: Date | any,
  skipInterestCalcDate: Date
) => {
  let nextDay = nextDate;
  nextDay = checkNextDay(nextDay, doc.weekends, doc.useHoliday, perHolidays);

  if (getDiffDay(nextDate, skipInterestCalcDate) >= 0) {
    const loanPayment = total;
    const loanBalance = new BigNumber(balance).minus(loanPayment).dp(2, BigNumber.ROUND_HALF_UP).toNumber();

    return {
      date: nextDay,
      loanBalance,
      loanPayment,
      calcedInterestEve: 0,
      calcedInterestNonce: 0
    };
  }
  const diffDay = getDiffDay(currentDate, nextDay)
  const interest = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffDay
  });

  const { diffEve, diffNonce } = getDatesDiffMonth(currentDate, nextDay);
  const calcedInterestEve = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffEve
  });

  const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(2, BigNumber.ROUND_HALF_UP).toNumber()

  const loanPayment = new BigNumber(total).minus(calcedInterestEve).minus(calcedInterestNonce).toNumber()
  const loanBalance = new BigNumber(balance).minus(loanPayment).dp(2, BigNumber.ROUND_HALF_UP).toNumber();;

  return {
    date: nextDay,
    loanBalance,
    loanPayment,
    calcedInterestEve,
    calcedInterestNonce
  };
};

export const generateRandomString = (len: number = 10) => {
  const charSet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(position, position + 1);
  }

  return randomString;
};

export const getRandomNumber = () => {
  const today = new Date();
  const random = generateRandomString(6);
  const yy = String(today.getFullYear()).substr(2, 2);
  const m = today.getMonth() + 1;
  const mm = m > 9 ? m : `0${m}`;
  const dd = today.getDate();

  return `${yy}${mm}${dd}-${random}`;
};

export const getNumber = async (models: IModels, contractTypeId: string) => {
  let preNumbered;

  const type = await models.ContractTypes.getContractType({
    _id: contractTypeId
  });

  const latestContracts = await models.Contracts.aggregate([
    {
      $match: {
        contractTypeId: contractTypeId,
        number: { $regex: `^${type.number}[0-9]+` }
      }
    },
    {
      $project: {
        number: 1,
        number_len: { $strLenCP: '$number' }
      }
    },
    { $sort: { number_len: -1, number: -1 } },
    { $limit: 1 }
  ]);

  if (!latestContracts.length) {
    return `${type.number}${'0'.repeat(type.vacancy - 1)}1`;
  }

  preNumbered = latestContracts[0];

  const preNumber = preNumbered.number;
  const preInt = Number(preNumber.replace(type.number, ''));

  const preStrLen = String(preInt).length;
  let lessLen = type.vacancy - preStrLen;

  if (lessLen < 0) lessLen = 0;

  return `${type.number}${'0'.repeat(lessLen)}${preInt + 1}`;
};

export const getLossPercent = async (
  models: IModels,
  subdomain: string,
  date: Date,
  contract: IContractDocument
): Promise<number> => {
  const holidayConfig: any =
    (await sendMessageBroker(
      {
        subdomain,
        action: 'configs.findOne',
        data: {
          query: {
            code: 'lossConfig'
          }
        },
        isRPC: true,
        defaultValue: {}
      },
      'core'
    )) || {};

  const lossConfigs = Object.values<{
    startDate: Date;
    endDate: Date;
    percent: number;
  }>(holidayConfig.value || {})
    .filter((conf: any) => conf.startDate < date && date < conf.endDate)
    .sort((a: any, b: any) =>
      a.endDate < b.endDate
        ? 1
        : a.endDate === b.endDate
          ? a.startDate < b.startDate
            ? 1
            : -1
          : -1
    );

  if (lossConfigs && lossConfigs.length) {
    return lossConfigs[0].percent;
  }

  if (contract.lossPercent > 0) return contract.lossPercent / 100;

  const contractType = await models.ContractTypes.findOne({
    _id: contract.contractTypeId
  }).lean();

  if (contractType?.lossPercent && contractType?.lossPercent > 0) return contractType?.lossPercent / 100;

  return 0;
};

export const getChanged = (old, anew) => {
  const diff = {};

  for (const key of Object.keys(anew)) {
    if (old[key] !== anew[key]) {
      diff[key] = old[key];
    }
  }

  return diff;
};
