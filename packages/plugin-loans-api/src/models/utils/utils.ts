import { IContractDocument } from '../definitions/contracts';
import { IDefaultScheduleParam } from '../definitions/schedules';
import { IModels } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';

export const calcInterest = ({
  balance,
  interestRate,
  dayOfMonth = 30
}: {
  balance: number;
  interestRate: number;
  dayOfMonth?: number;
}): number => {
  return Math.round((((balance / 100) * interestRate) / 365) * dayOfMonth);
};

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

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = ndate.getTimezoneOffset() * 1000 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  return today;
};

export const addMonths = (date, months) => {
  date.setMonth(date.getMonth() + months);

  return date;
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

export const calcPerMonthEqual = (
  doc: IContractDocument,
  balance: number,
  currentDate: Date,
  payment: number,
  perHolidays: IPerHoliday[],
  nextDate: Date
) => {
  let nextDay = nextDate;
  nextDay = checkNextDay(nextDay, doc.weekends, doc.useHoliday, perHolidays);
  const { diffEve, diffNonce } = getDatesDiffMonth(currentDate, nextDay);

  const calcedInterestEve = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffEve
  });
  const calcedInterestNonce = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffNonce
  });

  const loanBalance = balance - payment;
  const totalPayment = payment + calcedInterestEve + calcedInterestNonce;

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
  salvage,
  weekends,
  useHoliday,
  perHolidays,
  paymentDates
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
}) => {
  if (!leaseAmount) {
    return 0;
  }

  let currentDate = getFullDate(startDate);
  let mainRatio = 0;
  let ratio = 1;
  for (let i = 0; i < paymentDates.length; i++) {
    let nextDay = paymentDates[i];
    nextDay = checkNextDay(nextDay, weekends, useHoliday, perHolidays);
    const dayOfMonth = getDiffDay(currentDate, nextDay);
    const newRatio = ratio / (1 + (dayOfMonth * (interestRate / 100)) / 365);
    mainRatio = mainRatio + newRatio;
    currentDate = nextDay;
    ratio = newRatio;
  }
  return Math.round((leaseAmount - (salvage || 0) * ratio) / mainRatio);
};

export const calcPerMonthFixed = (
  doc: IContractDocument,
  balance: number,
  currentDate: Date,
  total: number,
  perHolidays: IPerHoliday[],
  nextDate?: Date | any
) => {
  let nextDay = nextDate;
  nextDay = checkNextDay(nextDay, doc.weekends, doc.useHoliday, perHolidays);
  const { diffEve, diffNonce } = getDatesDiffMonth(currentDate, nextDay);

  const calcedInterestEve = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffEve
  });
  const calcedInterestNonce = calcInterest({
    balance,
    interestRate: doc.interestRate,
    dayOfMonth: diffNonce
  });

  const loanPayment = total - calcedInterestEve - calcedInterestNonce;
  const loanBalance = balance - loanPayment;

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
  const preNumbered = await models.Contracts.findOne({
    contractTypeId: contractTypeId
  }).sort({ number: -1 });

  const type = await models.ContractTypes.getContractType({
    _id: contractTypeId
  });

  if (!preNumbered) {
    return `${type.number}${'0'.repeat(type.vacancy - 1)}1`;
  }

  const preNumber = preNumbered.number;
  const preInt = Number(preNumber.replace(type.number, ''));

  const preStrLen = String(preInt).length;
  let lessLen = type.vacancy - preStrLen;

  if (lessLen < 0) lessLen = 0;

  return `${type.number}${'0'.repeat(lessLen)}${preInt + 1}`;
};

export const getUnduePercent = async (
  models: IModels,
  subdomain: string,
  date: Date,
  contract: IContractDocument
): Promise<number> => {
  const holidayConfig: any = await sendMessageBroker(
    {
      subdomain,
      action: 'configs.findOne',
      data: {
        query: {
          code: 'undueConfig'
        }
      },
      isRPC: true
    },
    'core'
  );

  const ruledUndueConfigs = Object.values<{
    startDate: Date;
    endDate: Date;
    percent: number;
  }>(holidayConfig?.value)
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

  if (!!ruledUndueConfigs && ruledUndueConfigs.length > 0) {
    return ruledUndueConfigs[0].percent;
  }

  if (contract.unduePercent > 0) return contract.unduePercent / 100;

  const contractType = await models.ContractTypes.findOne({
    _id: contract.contractTypeId
  }).lean();

  if (contractType?.unduePercent > 0) return contractType?.unduePercent / 100;
  return 0.2;
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
