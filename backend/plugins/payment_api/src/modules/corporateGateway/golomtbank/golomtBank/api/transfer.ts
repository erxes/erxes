import { TransferParams } from '../types';
import { BaseApi } from './base';

export class TransferApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * make transfer from golomtBank to golomtBank
   * @param {string} type
   * @param {string} fromAccount
   * @param {number} toAccount
   * @param {string} amount
   * @param {string} description
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @param {string} toAccountName
   * @param {string} fromAccountName
   * @param {string} toBank
   * @param {string} refCode
   * @param {string} registerId

   * @return {object} - Returns a response object
   */
  async transfer(transfer: TransferParams, registerId: string) {
    try {
      return await this.request({
        method: 'POST',
        path: 'v1/transaction/cgw/transfer',
        type: 'CGWTXNADD',
        data: {
          genericType: null,
          registerNumber: registerId,
          type: transfer.type,
          refCode: transfer.refCode || '123',
          initiator: {
            genericType: null,
            acctName: transfer.fromAccountName,
            acctNo: transfer.fromAccount,
            amount: {
              value: transfer.amount,
              currency: transfer.fromCurrency,
            },
            particulars: transfer.description,
            bank: '15',
          },
          receives: [
            {
              genericType: null,
              acctName: transfer.toAccountName,
              acctNo: transfer.toAccount,
              amount: {
                value: transfer.amount,
                currency: transfer.toCurrency,
              },
              particulars: transfer.description,
              bank: transfer.toBank,
            },
          ],
          remarks: transfer.description,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  /**
   * make transfer from golomtBank to other banks
   * @param {string} fromAccount - from account number
   * @param {string} toAccount - to account number
   * @param {number} amount - amount
   * @param {string} description - description
   * @param {string} toCurrency - toCurrency
   * @param {string} fromCurrency - from currency
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
    },
  ) {
    try {
      return await this.request({
        method: 'POST',
        path: 'transfer/interbank',
        data: {
          ...args,
          tranPassword: args,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
