import { BaseApi } from './base';

export class BurenScoringApi extends BaseApi {
  
  async getScoring(params: {
    keyword: string;
    reportPurpose: string;
  }) {
    try {
      const res = await this.request({
        method: 'POST',
        path: 'api/v1/scoring',
        data: {
          keyword: params.keyword,
          reportPurpose: params.reportPurpose
        }
      });
      return res;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}