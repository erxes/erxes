import { IReportFormula } from '../../@types/report';

const DAY = 86400000;
export const reportPeriod = (
  fromDate: string,
  toDate: string,
  isPre = false,
) => {
  const first = new Date(`${fromDate}T00:00:00Z`).getTime();
  const end = new Date(`${toDate}T00:00:00Z`).getTime() + DAY;
  return isPre
    ? { from: new Date(first - (end - first)), end: new Date(first) }
    : { from: new Date(first), end: new Date(end) };
};

export const reportDateMatch = (
  fromDate: string,
  toDate: string,
  period: { getDate?: IReportFormula['getDate']; isPre: boolean },
): Record<string, Date> => {
  const { from, end } = reportPeriod(fromDate, toDate, period.isPre);
  if (period.getDate === 'first') return { $lt: from };
  if (period.getDate === 'last') return { $lt: end };
  if (period.getDate === 'between') return { $gte: from, $lt: end };
  throw new Error('Formula period is required');
};
