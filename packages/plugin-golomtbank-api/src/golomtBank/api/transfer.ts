import { TransferParams } from "../types";
import { BaseApi } from "./base";

export class TransferApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * make transfer from golomtBank to golomtBank
   * @param {string} fromAccount - from account number
   * @param {string} toAccount - to account number
   * @param {number} amount - amount
   * @param {string} description - description
   * @param {string} currency - currency
   * @param {string} loginName - login name
   * @param {string} password - password
   * @param {string} transferid - transfer id
   * @param {string} genericType
   * @param {string} registerNumber
   * @param {string} type
   * @param {string} refCode
   * @param {string} initiatorGenericType
   * @param {string} initiatorAcctName
   * @param {string} initiatorAcctNo
   * @param {string} initiatorAmountValue
   * @param {string} initiatorAmountCurrency
   * @param {string} initiatorParticulars
   * @param {string} initiatorBank
   * @param {string} receivesGenericType
   * @param {string} receivesAcctName
   * @param {string} receivesAcctNo
   * @param {string} receivesAmountValue
   * @param {string} receivesAmountCurrency
   * @param {string} receivesParticulars
   * @param {string} receivesBank
   * @param {string} receivesRemark

   * @return {object} - Returns a response object
   */
  async transfer(tranfer: any) {
    try {
      return await this.request({
        method: "POST",
        path: "v1/transaction/cgw/transfer",
        type: "CGWTXNADD",
        data: tranfer,
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
    try {
      return await this.request({
        method: "POST",
        path: "transfer/interbank",
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
