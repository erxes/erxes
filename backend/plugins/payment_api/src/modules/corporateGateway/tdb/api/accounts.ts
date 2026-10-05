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
    return this.request<TdbBalanceResponse>({
      method: 'GET',
      path: `accounts/${encodeURIComponent(accountNumberOrIban)}/balance`,
    });
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
    return this.request<TdbStatementResponse>({
      method: 'GET',
      path: `accounts/statement/${encodeURIComponent(
        args.accountNumberOrIban,
      )}`,
      params: {
        from: args.from,
        to: args.to,
        page: args.page ?? 1,
        size: args.size ?? 100,
      },
    });
  }
}
