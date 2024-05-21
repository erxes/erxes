import { BaseApi } from './base';

export class BurenScoringApi extends BaseApi {
  
  async getScoring(params: {
    keyword: string;
    reportPurpose: string;
  }) {
    try {
      return await this.request({
        method: 'POST',
        path: 'api/v1/scoring',
        data: {
          keyword: params.keyword,
          reportPurpose: params.reportPurpose
        }
      }).then(r=>r.json());
     
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}