import { LoanSchedule } from '../interface/LoanContract';

type Params = {
  tenor: number;
  customPayment?: number;
  customInterest?: number;
  interestRate: number;
  isPayFirstMonth?: boolean;
  leaseAmount: number;
  dateRange: number[];
  startDate: Date;
  skipAmountCalcMonth: number;
};

export const getDiffDay = (fromDate: Date, toDate: Date) => {
  const date1 = fromDate;
  const date2 = toDate;
  return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
};

export function generateCustomGraphic({
  dateRange,
  interestRate,
  leaseAmount,
  startDate,
  tenor,
  customInterest,
  customPayment,
  isPayFirstMonth,
  skipAmountCalcMonth
}: Params) {
  let schedules: LoanSchedule[] = [];
  let payment = customPayment || leaseAmount / (tenor * dateRange.length);
  let sumAmount = 0;
  dateRange = dateRange.sort((a, b) => a - b);

  let mainDate = startDate;
  let balance = leaseAmount;
  for (let index = 0; index < tenor + 1; index++) {
    dateRange.map((day, i) => {
      const nDate = new Date(mainDate);
      const year = nDate.getFullYear();
      let month = nDate.getMonth();
      if (i === 0 && (index !== 0 || isPayFirstMonth !== true))
        month = nDate.getMonth() + 1;

      if (day > 28 && new Date(year, month, day).getDate() !== day)
        mainDate = new Date(year, month + 1, 0);
      else mainDate = new Date(year, month, day);

      if (isPayFirstMonth === true && mainDate < startDate) {
        return;
      }

      let amount = skipAmountCalcMonth > index ? 0 : payment;
      if (
        sumAmount + amount > leaseAmount ||
        tenor * dateRange.length == schedules.length + 1
      )
        amount = leaseAmount - sumAmount;
      amount = Number(amount.toFixed(0));

      const diffDay = Number(getDiffDay(nDate, mainDate).toFixed(0));

      const mustPayinterest =
        Number(customInterest) ||
        Number(
          Number(((balance * interestRate) / 100 / 365) * diffDay).toFixed(0)
        ) ||
        0;
      const mustpayment = amount || 0;
      const element: LoanSchedule = {
        order: schedules.length + 1,
        payment: mustpayment,
        interestNonce: mustPayinterest,
        balance,
        diffDay,
        payDate: mainDate,
        total: mustpayment + mustPayinterest
      };
      balance -= amount;
      sumAmount += amount;
      if (tenor * dateRange.length > schedules.length) schedules.push(element);
    });
  }

  return schedules;
}
