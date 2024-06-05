import { GolomtBankAccount } from '../types';
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
   * TODO: update return type
   */
  async list() {
    try {
      const res = await this.request({
        method: 'POST',
        path: 'v1/account/list',
        type:'ACCTLST',
        data: {
          "registerNo": this.params.registerId
        },
        params:{
          "client_id": this.params.clientId
        }
      });
      const  list =  [
        {
          "requestId": "cc65ebc637d04541a7e45d753aaddce2",
          "accountId": "1605242952",
          "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
          "shortName": "ОЧИР УНДРА",
          "currency": "USD",
          "branchId": "160",
          "isSocialPayConnected": "N",
          "accountType": {
            "schemeCode": "CA658",
            "schemeType": "SBA"
          }
        }
      ]
      // const accounts: GolomtBankAccount[] = res.accounts.map(account => {
      //   return {
      //     requestId: account.requestId,
      //     accountId: account.accountId,
      //     accountName: account.accountName,
      //     shortName: account.shortName,
      //     currency: account.currency,
      //     branchId: account.branchId,
      //     isSocialPayConnected: account.isSocialPayConnected,
      //     accountType: account.accountType
      //   };
      // });

      return list;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get account detail
   * @param {string} accountId - account number
   * @return {object} - Returns an account object
   * TODO: update return type
   */
  async get(accountId: string) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `accounts/${accountId}/`
      });

      return 'res.account;'
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
   * TODO: update return type
   */
  // async getHolder(accountId: string, bankCode?: string) {
  //   try {
  //     const res = await this.request({
  //       method: 'GET',
  //       path: `accounts/${accountId}/name?bank=${bankCode}`
  //     });

  //     return { ...res.account, ...res.customer };
  //   } catch (e) {
  //     throw new Error(e.message);
  //   }
  // }
}
 