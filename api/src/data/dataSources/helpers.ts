import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';
import { getSubServiceDomain } from '../utils';

export default class HelpersApi extends RESTDataSource {
  constructor() {
    super();

    const HELPERS_DOMAIN = getSubServiceDomain({ name: 'HELPERS_DOMAIN' });

    this.baseURL = HELPERS_DOMAIN;
    this.httpCache = new HTTPCache();
  }

  public willSendRequest(request) {
    const { user } = this.context || {};

    if (user) {
      request.headers.set('userId', user._id);
    }
  }

  public didEncounterError(e) {
    const error = e.extensions || {};
    const { response } = error;
    const { body } = response || { body: e.message };

    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error('Helper is not running is not running');
    }

    throw new Error(body);
  }

  public async fetchApi(path, params) {
    return this.get(path, params);
  }
}
