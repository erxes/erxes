import { formatDate } from '../utils';
import { KhanbankStatementLine, toStatementLines } from '../types';
import { BaseApi } from './base';

// statement lines requested per page while matching, and a hard stop so a
// misbehaving response cannot loop forever
const STATEMENT_PAGE_SIZE = 100;
const STATEMENT_MAX_PAGES = 50;

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

// The bank appends the sender to incoming transfers, e.g.
// "261117110740 - Deposit ХААНААС: 320000 <sender name>" (paying bank,
// 6-digit bank code, sender). Everything from that marker on is metadata and
// must not supply words of the invoice reference.
const SENDER_SUFFIX = /\s*[^\s:]+:\s*\d{6}(?:\s.*)?$/u;

const stripSender = (description?: string) =>
  (description || '').replace(SENDER_SUFFIX, '');

// true when `expected` appears in `words` as one unbroken run, in order;
// a bank prefix such as "EB-" before it is allowed
const containsSequence = (words: string[], expected: string[]) => {
  for (let start = 0; start + expected.length <= words.length; start++) {
    if (expected.every((word, offset) => words[start + offset] === word)) {
      return true;
    }
  }

  return false;
};

// tranDate "2026-11-17" + time "11393704" (hhmmssss) -> Date, Ulaanbaatar time
export const statementTime = (
  item: KhanbankStatementLine,
): Date | undefined => {
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
   * Every statement line from `startDate` to `endDate`, all pages.
   */
  async listAll(args: {
    accountNumber: string;
    startDate: string;
    endDate: string;
  }): Promise<KhanbankStatementLine[]> {
    const lines: KhanbankStatementLine[] = [];

    for (let page = 1; page <= STATEMENT_MAX_PAGES; page++) {
      const response: unknown = await this.list({
        ...args,
        page,
        perPage: STATEMENT_PAGE_SIZE,
      });

      const pageLines = toStatementLines(response);

      lines.push(...pageLines);

      if (pageLines.length < STATEMENT_PAGE_SIZE) {
        return lines;
      }
    }

    throw new Error(
      `Khanbank statement for ${args.accountNumber} has more than ${
        STATEMENT_PAGE_SIZE * STATEMENT_MAX_PAGES
      } lines in range`,
    );
  }

  /**
   * Incoming statement lines that match an invoice: same amount, every word
   * of the invoice description present as a whole word, and (when `since` is
   * given) made at or after `since`. Oldest first.
   *
   * Words are compared lowercased and with punctuation removed, because the
   * description that reaches the statement can lose characters such as "—".
   * The sender text the bank appends ("ХААНААС: 320000 <sender>") is cut off
   * first, and the invoice words must appear in order without gaps.
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
  }): Promise<KhanbankStatementLine[]> {
    const expected = tokenize(description);

    if (!expected.length) {
      return [];
    }

    const today = toUBDate(new Date());

    const statements = record
      ? toStatementLines(await this.list({ accountNumber, record }))
      : await this.listAll({
          accountNumber,
          startDate: since ? toUBDate(since) : today,
          endDate: today,
        });

    const withTime = statements.map((line) => ({
      line,
      madeAt: statementTime(line),
    }));

    return withTime
      .filter(({ line, madeAt }) => {
        if (line.amount !== Number(amount)) {
          return false;
        }

        // with a cutoff, a line whose time cannot be read cannot be shown
        // to be newer than the invoice, so it is not matched
        if (since && (!madeAt || madeAt < since)) {
          return false;
        }

        // the invoice words, in order and unbroken, in the part of the
        // description before the appended sender; whole words, so
        // "installment 1" does not match "installment 10"
        return containsSequence(
          tokenize(stripSender(line.description)),
          expected,
        );
      })
      .sort(
        (a, b) => (a.madeAt?.getTime() ?? 0) - (b.madeAt?.getTime() ?? 0),
      )
      .map(({ line }) => line);
  }

  async findTransaction(args: {
    accountNumber: string;
    amount: number;
    description?: string;
    since?: Date;
    record?: number;
  }): Promise<KhanbankStatementLine | undefined> {
    const [first] = await this.findTransactions(args);

    return first;
  }
}
