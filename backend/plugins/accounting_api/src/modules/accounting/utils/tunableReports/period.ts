import { IReportFormula } from '../../@types/report';

const DAY = 86400000;
const utc = (value: string) => new Date(`${value}T00:00:00Z`);
const monthStart = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 1));

// Returns the run window as [from, end) with an exclusive end boundary.
// The previous window has the same length: whole calendar months shift by
// months, so month-length differences never move the boundaries; any other
// range shifts by its inclusive day count.
export const reportPeriod = (
  fromDate: string,
  toDate: string,
  isPre = false,
): { from: Date; end: Date } => {
  const from = utc(fromDate);
  const end = new Date(utc(toDate).getTime() + DAY);
  if (!isPre) return { from, end };
  if (from.getUTCDate() === 1 && end.getUTCDate() === 1) {
    const months =
      (end.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      end.getUTCMonth() -
      from.getUTCMonth();
    return {
      from: monthStart(from.getUTCFullYear(), from.getUTCMonth() - months),
      end: from,
    };
  }
  return {
    from: new Date(from.getTime() - (end.getTime() - from.getTime())),
    end: from,
  };
};

// A cell's period resolves formula → column → row; a cell where none of them
// sets one cannot be calculated. Every kind accepts every period: a balance over
// `between` is the net period change (closing minus opening, natural side).
export const reportPeriodIssue = (
  getDate: IReportFormula['getDate'],
): string | undefined =>
  getDate ? undefined : 'Set a period on the formula, column or row';

export const validateReportFormulaPeriod = (
  getDate: IReportFormula['getDate'],
  cellLabel: string,
): void => {
  const issue = reportPeriodIssue(getDate);
  if (issue) throw new Error(`${issue}: ${cellLabel}`);
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
