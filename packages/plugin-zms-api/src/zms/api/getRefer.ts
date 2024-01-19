import { BaseApi } from './base';

export class InquireApi extends BaseApi {
  async getInquire(params: {
    typeInquire: string;
    keyword: string;
    reportPurpose: string;
    foreignCitizen?: boolean;
    liveStockYear?: string;
    resultType?: string;
    organizationType?: string;
  }) {
    try {
      const res = await this.request({
        method: 'POST',
        path: 'api/v2/products/' + params.typeInquire + '/inquire',
        data: {
          keyword: params.keyword,
          reportPurpose: params.reportPurpose,
          foreignCitizen: params.foreignCitizen,
          liveStockYear: params.liveStockYear,
          organizaionType: params.organizationType,
          resultType: params.resultType
        }
      });
      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
