import { TransferParams } from '../types';
import { BaseApi } from './base';

export class TransferApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * make transfer from khanbank to khanbank
   * @param {string} fromAccount - from account number
   * @param {string} toAccount - to account number
   * @param {number} amount - amount
   * @param {string} description - description
   * @param {string} currency - currency
   * @param {string} loginName - login name
   * @param {string} password - password
   * @param {string} transferid - transfer id
   * @return {object} - Returns a response object
   */
  async domestic(args: TransferParams) {
    const { password } = args;

    const data: any = args;

    data.tranPassword = Buffer.from(password).toString('base64');

    try {
      const res = await this.request({
        method: 'POST',
        path: 'transfer/domestic',
        data
      });

      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * make transfer from khanbank to other banks
   * @param {string} fromAccount - from account number
   * @param {string} toAccount - to account number
   * @param {number} amount - amount
   * @param {string} description - description
   * @param {string} currency - currency
   * @param {string} loginName - login name
   * @param {string} password - password
   * @param {string} transferid - transfer id
   * @param {string} toCurrency - to currency
   * @param {string} toAccountName - to account name
   * @param {string} toBank - to bank
   * @return {object} - Returns a response object
   */
  async interbank(
    args: TransferParams & {
      toCurrency: string;
      toAccountName: string;
      toBank: string;
    }
  ) {
    const { password } = args;

    const data: any = args;

    data.tranPassword = Buffer.from(password).toString('base64');

    try {
      const res = await this.request({
        method: 'POST',
        path: 'transfer/interbank',
        data
      });

      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
