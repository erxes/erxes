import { formatDate } from '../../utils/utils';
import { BaseApi } from './base';

export class StatementsApi extends BaseApi {
  public params;

  constructor(args) {
    super(args);
    this.params = args;
  }

  /**
   * get statement list
   * @param {string} accountId - account number
   * @param {string} startDate - start date string
   * @param {string} endDate - end date string
   * @param {number} page - page number
   * @param {number} perPage - per page
   * @param {number} record - record number
   * @return {[object]} - Returns an array of statements
   * TODO: update return type
   */
  async list(args: {
    accountId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
    record?: number;
  }) {
    const { accountId, startDate, endDate, page, perPage, record } = args;

    const queryParams: any = { client_id: this.params.client_id };
    const data: any = { registerNo: this.params.registerId, accountId:accountId };

    if (startDate) {
      data.startDate = startDate;
    }

    if (endDate) {
      data.endDate = endDate;
    }

    // if (page) {
    //   queryParams.page = page - 1;
    // }

    // if (perPage) {
    //   queryParams.size = perPage;
    // }

    // if (record) {
    //   queryParams.record = record;
    //   delete queryParams.from;
    //   delete queryParams.to;
    // }
    // queryParams.from = '20190101';

    try {
      return await this.request({
        method: 'POST',
        path: `v1/account/operative/statement`,
        params: queryParams,
        type:'OPERACCTSTA',
        data: data
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
