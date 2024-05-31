import { GolomtAccount } from '../types';
import { BaseApi } from './base';

export class AccountsApi extends BaseApi {
  public params;
  constructor(args) {
    super(args);
    this.params = args;
  }

  async list() {

    try {

      // const res = await this.request({
      //   method: 'POST',
      //   path: 'v1/account/list?client_id="88974537498305151326"&amp;state={{state}}&amp;scope={{scope}}',
      //   data: 
      //     {
      //       "registerNo": "2734745",
      //       "accountId":"4005110163"
      //   }
      // });
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
  
      return list;
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


}
