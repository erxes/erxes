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

// Every formula kind reads exactly one boundary: balances use an opening or
// closing remainder, transactions use the turnover between the boundaries.
export const validateReportFormulaPeriod = (
  kind: IReportFormula['kind'],
  getDate: IReportFormula['getDate'],
): void => {
  if (!getDate)
    throw new Error(
      'Every formula cell needs a period: set it on the formula, column or row',
    );
  if (kind === 'balance' && getDate === 'between')
    throw new Error('Balance formulas need an opening or closing date');
  if (kind === 'transaction' && getDate !== 'between')
    throw new Error('Transaction formulas need the between period');
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
