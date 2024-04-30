import { KhanbankAccount } from '../types';
import { BaseApi } from './base';

export class AccountsApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * get account list
   * @return {[KhanbankAccount]} - Returns an array of accounts
   * TODO: update return type
   */
  async list() {
    try {
      const res = await this.request({
        method: 'GET',
        path: 'accounts'
      });

      const accounts: KhanbankAccount[] = res.accounts.map(account => {
        return {
          number: account.number,
          type: account.type,
          currency: account.currency,
          status: account.status,
          balance: account.balance,
          name: account.name,
          holdBalance: account.holdBalance,
          availableBalance: account.availableBalance,
          openDate: account.openDate,
          homeBranch: account.homeBranch,
          intMethod: account.intMethod,
          intRate: account.intRate,
          homePhone: account.homePhone,
          businessPhone: account.businessPhone,
          lastMaintenceDate: account.lastMaintenceDate,
          lastFinancialTranDate: account.lastFinancialTranDate,
          intFrom: account.intFrom,
          intTo: account.intTo,
          addr1: account.addr1
        };
      });

      return accounts;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get account detail
   * @param {string} accountNumber - account number
   * @return {object} - Returns an account object
   * TODO: update return type
   */
  async get(accountNumber: string) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `accounts/${accountNumber}/`
      });

      return res.account;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get account holder
   * @param {string} accountNumber - account number
   * @param {string} bankCode - bank code
   * @return {object} - Returns an account object
   * TODO: update return type
   */
  async getHolder(accountNumber: string, bankCode?: string) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `accounts/${accountNumber}/name?bank=${bankCode}`
      });

      return { ...res.account, ...res.customer };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
