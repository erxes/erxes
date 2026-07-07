import { BaseApi } from './base';
export class AccountsApi extends BaseApi {
  public params;
  constructor(args) {
    super(args);
    this.params = args;
  }
  /**
   * get account list
   * @return {[GolomtBankAccount]} - Returns an array of accounts
   */
  async list() {
    try {
      return await this.request({
        method: 'POST',
        path: 'v1/account/list',
        type: 'ACCTLST',
        data: {
          registerNo: this.params.registerId,
        },
        params: {
          client_id: this.params.clientId,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get account detail
   * @param {string} accountId - account number
   * @return {object} - Returns an account object
   */
  async get(accountId: string) {
    try {
      return await this.request({
        method: 'POST',
        path: 'v1/account/operative/details',
        type: 'OPERACCTDET',
        data: {
          registerNo: this.params.registerId,
          accountId: accountId,
        },
        params: {
          client_id: this.params.clientId,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getBalance(accountId: string) {
    try {
      return await this.request({
        method: 'POST',
        path: 'v1/account/balance/inq',
        type: 'ACCTBALINQ',
        data: {
          registerNo: this.params.registerId,
          accountId: accountId,
        },
        params: {
          client_id: this.params.clientId,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get account holder
   * @param {string} accountId - account number
   * @param {string} bankCode - bank code
   * @return {object} - Returns an account object
   */
}
