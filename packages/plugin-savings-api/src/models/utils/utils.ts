import { IModels } from '../../connectionResolver';

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
  }).sort({ createdAt: -1 });

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
