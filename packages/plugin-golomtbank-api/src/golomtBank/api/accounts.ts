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
    },
    {
      "requestId": "390f23f821b24ac9afc6a93557dcc6b2",
      "accountId": "1605214227",
      "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
      "shortName": "ОЧИР УНДРА",
      "currency": "MNT",
      "branchId": "160",
      "isSocialPayConnected": "N",
      "accountType": {
        "schemeCode": "CA658",
        "schemeType": "SBA"
      }
    },
    {
      "requestId": "0bf7c96f0fc64e1bb8b85cf7f4025d94",
      "accountId": "8115006941",
      "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
      "shortName": "ОЧИР УНДРА",
      "currency": "MNT",
      "branchId": "814",
      "isSocialPayConnected": "N",
      "accountType": {
        "schemeCode": "CA602",
        "schemeType": "SBA"
      }
    },
    {
      "requestId": "1ea0f85ffd684d09b60a8633ff6a0949",
      "accountId": "1905008266",
      "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
      "shortName": "ОЧИР УНДРА",
      "currency": "MNT",
      "branchId": "814",
      "isSocialPayConnected": "N",
      "accountType": {
        "schemeCode": "CA602",
        "schemeType": "SBA"
      }
    },
    
    {
      "requestId": "b0f9d6ab66ef475ba4393ff3c202eb14",
      "accountId": "1605172170",
      "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
      "shortName": "ОЧИР УНДРА",
      "currency": "MNT",
      "branchId": "814",
      "isSocialPayConnected": "N",
      "accountType": {
        "schemeCode": "CA658",
        "schemeType": "SBA"
      }
    },


    
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
