import { formatDate } from '../utils';
import { BaseApi } from './base';

// YYYY-MM-DD in Ulaanbaatar time, the bank's statement day
const toUBDate = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' });

// "1000 — Installment 1" / "1000-installment1" -> ["1000", "installment", "1"]
const tokenize = (text?: string) =>
  (text || '')
    .toLowerCase()
    .replace(/([a-zа-яөү])(\d)|(\d)([a-zа-яөү])/gi, '$1$3 $2$4')
    .split(/[^a-z0-9а-яөү]+/i)
    .filter(Boolean);

// tranDate "2026-11-17" + time "11393704" (hhmmssss) -> Date, Ulaanbaatar time
const statementTime = (item: any): Date | undefined => {
  const day = item?.tranDate || item?.postDate;
  const time = String(item?.time || '').padStart(8, '0');

  if (!day) {
    return undefined;
  }

  const date = new Date(
    `${day}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}+08:00`,
  );

  return isNaN(date.getTime()) ? undefined : date;
};

export class StatementsApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * get statement list
   * @param {string} accountNumber - account number
   * @param {string} startDate - start date string
   * @param {string} endDate - end date string
   * @param {number} page - page number
   * @param {number} perPage - per page
   * @param {number} record - record number
   * @return {[object]} - Returns an array of statements
   * TODO: update return type
   */
  async list(args: {
    accountNumber: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
    record?: number;
  }) {
    const { accountNumber, startDate, endDate, page, perPage, record } = args;

    const queryParams: any = { sort: 'date,desc' };

    if (startDate) {
      queryParams.from = formatDate(startDate);
      delete queryParams.record;
    }

    if (endDate) {
      queryParams.to = formatDate(endDate);
      delete queryParams.record;
    }

    if (page) {
      queryParams.page = page - 1;
    }

    if (perPage) {
      queryParams.size = perPage;
    }

    if (record) {
      queryParams.record = record;
      delete queryParams.from;
      delete queryParams.to;
    }

    // queryParams.from = '20190101';

    try {
      return await this.request({
        method: 'GET',
        path: `statements/${accountNumber}`,
        params: queryParams,
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async record(accountNumber: string, record: number) {
    try {
      return await this.request({
        method: 'GET',
        path: `statements/${accountNumber}/record`,
        params: { record },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
  /**
   * Incoming statement lines that match an invoice: same amount, every word
   * of the invoice description present as a whole word, and (when `since` is
   * given) made after `since`. Oldest first.
   *
   * Words are compared lowercased and with punctuation removed, because the
   * bank drops characters such as "—" and appends text like
   * "ХААНААС: 320000 <sender>" to the description.
   */
  async findTransactions({
    accountNumber,
    amount,
    description,
    since,
    record,
  }: {
    accountNumber: string;
    amount: number;
    description?: string;
    since?: Date;
    record?: number;
  }) {
    const today = toUBDate(new Date());

    const response = record
      ? await this.list({ accountNumber, record })
      : await this.list({
          accountNumber,
          startDate: since ? toUBDate(since) : today,
          endDate: today,
        });

    const statements: any[] =
      response?.content ??
      response?.transactions ??
      (Array.isArray(response) ? response : []);

    const expected = tokenize(description);

    if (!expected.length) {
      return [];
    }

    return statements
      .filter((item: any) => {
        if (Number(item.amount) !== Number(amount)) {
          return false;
        }

        if (since) {
          const madeAt = statementTime(item);

          if (madeAt && madeAt < since) {
            return false;
          }
        }

        const words = new Set(tokenize(item.description));

        // whole words, so "installment 1" does not match "installment 10"
        return expected.every((word) => words.has(word));
      })
      .sort(
        (a: any, b: any) =>
          (statementTime(a)?.getTime() || 0) -
          (statementTime(b)?.getTime() || 0),
      );
  }

  async findTransaction(args: {
    accountNumber: string;
    amount: number;
    description?: string;
    since?: Date;
    record?: number;
  }) {
    const [first] = await this.findTransactions(args);

    return first;
  }
}
