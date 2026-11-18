import { PAYMENT_STATUS } from '~/constants';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import Khanbank from '~/modules/corporateGateway/khanbank/khanbank/khanbank';
import { KhanbankStatementLine } from '~/modules/corporateGateway/khanbank/khanbank/types';
import { redis } from 'erxes-api-shared/utils';

// How long a statement line stays reserved for the transaction that matched
// it. The saved match on the transaction is the lasting record; the
// reservation only has to outlive concurrent checks.
const RESERVATION_TTL_SECONDS = 90 * 24 * 60 * 60;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const reservationKey = (accountNumber: string, record: number) =>
  `payment:khanbank:statement:${accountNumber}:${record}`;

export interface IKhanbankConfig {
  configId: string;
  accountNumber: string;
  ibanAcctNo?: string;
}

export class KhanbankAPI {
  private config: IKhanbankConfig;
  private models: IModels;

  constructor(config: IKhanbankConfig, models: IModels) {
    if (!config?.configId) {
      throw new Error('Khanbank configId is required');
    }

    if (!config?.accountNumber) {
      throw new Error('Khanbank account number is required');
    }

    this.config = config;
    this.models = models;
  }

  private async getKhanbank() {
    const config = await this.models.KhanbankConfigs.getConfig({
      _id: this.config.configId,
    });

    if (!config) {
      throw new Error(
        `Khanbank config not found: ${this.config.configId}`,
      );
    }

    return new Khanbank(config);
  }

  async createInvoice(transaction: ITransactionDocument) {
    return {
      accountNumber: this.config.accountNumber,
      ibanAcctNo: this.config.ibanAcctNo || '',
      description: transaction.description || '',
      amount: transaction.amount,
    };
  }

  // Statement records already settled by another transaction on the same
  // bank account, through any Khanbank payment method. Matches saved before
  // the response was nested under `matched` are read from `response.record`.
  private async usedRecords(
    transactionId: string,
    records: number[],
  ): Promise<Set<number>> {
    const methods = await this.models.PaymentMethods.find(
      { kind: 'khanbank', 'config.accountNumber': this.config.accountNumber },
      { _id: 1 },
    ).lean();

    const used = await this.models.Transactions.find(
      {
        _id: { $ne: transactionId },
        paymentId: { $in: methods.map((method) => method._id) },
        $or: [
          { 'response.matched.record': { $in: records } },
          { 'response.record': { $in: records } },
        ],
      },
      { 'response.matched.record': 1, 'response.record': 1 },
    ).lean();

    const result = new Set<number>();

    for (const item of used) {
      const response: unknown = item.response;
      const matched: unknown = isObject(response) ? response.matched : undefined;

      for (const value of [
        isObject(matched) ? matched.record : undefined,
        isObject(response) ? response.record : undefined,
      ]) {
        if (typeof value === 'number') {
          result.add(value);
        }
      }
    }

    return result;
  }

  // Atomically claims a statement line for one transaction, so two checks
  // running at once cannot both settle their invoice with the same transfer.
  // Re-claiming a line this transaction already holds succeeds.
  private async reserve(
    line: KhanbankStatementLine,
    transactionId: string,
  ): Promise<boolean> {
    const key = reservationKey(this.config.accountNumber, line.record);

    const acquired = await redis.set(
      key,
      transactionId,
      'EX',
      RESERVATION_TTL_SECONDS,
      'NX',
    );

    if (acquired) {
      return true;
    }

    return (await redis.get(key)) === transactionId;
  }

  async checkInvoice(transaction: ITransactionDocument) {
    const khanbank = await this.getKhanbank();

    // a payment cannot be older than its invoice; a few minutes of slack
    // covers clock differences between erxes and the bank
    const since = new Date(
      new Date(transaction.createdAt).getTime() - 5 * 60 * 1000,
    );

    const candidates = await khanbank.statements.findTransactions({
      accountNumber: this.config.accountNumber,
      amount: transaction.amount,
      description: transaction.description,
      since,
    });

    if (!candidates.length) {
      return PAYMENT_STATUS.PENDING;
    }

    const used = await this.usedRecords(
      transaction._id,
      candidates.map((line) => line.record),
    );

    // one bank payment pays one invoice
    for (const line of candidates) {
      if (used.has(line.record)) {
        continue;
      }

      if (!(await this.reserve(line, transaction._id))) {
        continue;
      }

      transaction.response = {
        ...transaction.response,
        matched: line,
      };

      return PAYMENT_STATUS.PAID;
    }

    return PAYMENT_STATUS.PENDING;
  }

  async manualCheck(transaction: ITransactionDocument) {

    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument) {
    return { success: true };
  }
}