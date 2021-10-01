import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';
import { getSubServiceDomain } from '../utils';

export default class ClientPortalsAPI extends RESTDataSource {
  constructor() {
    super();

    const CLIENT_PORTAL_DOMAIN = getSubServiceDomain({
      name: 'CLIENT_PORTAL_DOMAIN'
    });

    this.baseURL = CLIENT_PORTAL_DOMAIN;
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
      throw new Error('Client portal api is not running');
    }

    throw new Error(body);
  }

  public async sendMobileNotification(params) {
    return this.post(`/api/erxes/mobile-notifications`, params);
  }

  public async sendNotification(params) {
    return this.post(`/api/erxes/notifications`, params);
  }
} // end class
