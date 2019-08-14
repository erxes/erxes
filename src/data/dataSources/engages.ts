import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';
import { debugBase } from '../../debuggers';
import { getEnv } from '../utils';

export default class EngagesAPI extends RESTDataSource {
  constructor() {
    super();

    const ENGAGES_API_DOMAIN = getEnv({ name: 'ENGAGES_API_DOMAIN' });

    this.baseURL = ENGAGES_API_DOMAIN;
    this.httpCache = new HTTPCache();
  }

  public didEncounterError(e) {
    const error = e.extensions || {};
    const { response } = error;
    const { body } = response;

    throw new Error(body);
  }

  public async engagesConfigDetail() {
    return this.get(`/configs/detail`);
  }

  public async engagesConfigSave(params) {
    return this.post(`/configs/save`, params);
  }

  public async engagesStats(engageMessageId) {
    let stats = {};

    try {
      stats = await this.get(`/deliveryReports/statsList/${engageMessageId}`);
    } catch (e) {
      debugBase(e.message);
    }

    return stats;
  }
}
