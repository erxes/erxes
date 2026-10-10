import { BaseApi } from './base';

import {
  TdbAccountsResponse,
  TdbBalanceResponse,
  TdbStatementResponse,
} from '../@types/tdb';

export class AccountsApi extends BaseApi {
  /**
   * Get customer's account list.
   *
   * GET /accounts
   */
  async list(): Promise<TdbAccountsResponse> {
    return this.request<TdbAccountsResponse>({
      method: 'GET',
      path: 'accounts',
    });
  }

  /**
   * Get account balance.
   *
   * identifier can be either:
   * - account number
   * - IBAN
   *
   * GET /accounts/{acntno}/balance
   */
  async getBalance(accountNumberOrIban: string): Promise<TdbBalanceResponse> {
    const response = await this.request<any>({
      method: 'GET',
      path: `accounts/${encodeURIComponent(accountNumberOrIban)}/balance`,
    });

    const account = response.data?.invoice || response.acntno;

    return {
      success: response.success,
      msg: response.msg || response.message || '',
      data: account
        ? {
            invoice: {
              acntno: Number(account.acntno ?? account.ACNTNO),
              iban: account.iban ?? account.IBAN ?? '',
              ACNTNAME: account.ACNTNAME,
              ACNTMODE: account.ACNTMODE,
              CURCODE: account.CURCODE,
              BALANCE: account.BALANCE,
              CUSTNO: account.CUSTNO,
              AVAILABLEBAL: account.AVAILABLEBAL,
              HOLDBAL: account.HOLDBAL,
            },
          }
        : null,
    };
  }

  /**
   * Get account statement.
   *
   * CGW documentation:
   * - maximum statement period: 3 months
   * - date format: YYYY/MM/DD
   */
  async getStatement(args: {
    accountNumberOrIban: string;
    from: string;
    to: string;
    page?: number;
    size?: number;
  }): Promise<TdbStatementResponse> {
    const response = await this.request<any>({
      method: 'GET',
      path: `accounts/statement/${encodeURIComponent(args.accountNumberOrIban)}`,
      params: {
        from: args.from,
        to: args.to,
        page: args.page ?? 1,
        size: args.size ?? 100,
      },
    });

    const header = Array.isArray(response.header)
      ? response.header
      : response.header
        ? [response.header]
        : [];

    return {
      success: response.success,
      msg: response.msg || response.message || '',
      header,
      txn: Array.isArray(response.txn) ? response.txn : [],
    };
  }
  async findTransaction(args: {
    accountNumberOrIban: string;
    amount: number;
    description: string;
    from: string;
    to: string;
  }) {
    const response = await this.getStatement({
      accountNumberOrIban: args.accountNumberOrIban,
      from: args.from,
      to: args.to,
      page: 1,
      size: 100,
    });

    const transactions = response.txn ?? [];
    const expectedDescription = args.description.trim();

    return transactions.find((item) => {
      const statementDescription = item.txndesc?.trim();

      return (
        Number(item.credit) === Number(args.amount) &&
        statementDescription?.startsWith(expectedDescription)
      );
    });
  }
}
