import { BaseApi } from './base';

export class AccountsApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * get account list
   * @return {[object]} - Returns an array of accounts
   * TODO: update return type
   */
  async list() {
    try {
      const res = await this.request({
        method: 'GET',
        path: 'accounts'
      });

      return res.accounts;
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
