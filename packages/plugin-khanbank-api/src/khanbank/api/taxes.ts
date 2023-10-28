import { TransferParams } from '../types';
import { BaseApi } from './base';

export class TaxesApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * get customer TIN number
   * @param {string} registrationNumber - registration number
   * @return {object} - Returns a response object
   * TODO: Add proper return type
   */
  async getCustomerTIN(registrationNumber: string) {
    try {
      const res = await this.request({
        method: 'GET',
        path: 'tax/inquiry/register',
        params: {
          pin: registrationNumber
        }
      });

      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * get taxes list
   * @param {string} fromAccount - from account number
   * @param {string} toAccount - to account number
   * @return {[object]} - Returns an array of objects
   * TODO: Add proper return type
   */
  async list(type: string, value: string) {
    const path =
      type === 'byCapitalNumber'
        ? 'tax/inquiry/capitalnumber'
        : 'tax/inquiry/invoicenumber';

    try {
      const res = await this.request({
        method: 'GET',
        path,
        params: {
          value
        }
      });

      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
