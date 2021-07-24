import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';
import { debugError } from '../../debuggers';
import { getSubServiceDomain } from '../utils';

export default class AutomationAPI extends RESTDataSource {
  constructor() {
    super();

    const AUTOMATIONS_API_DOMAIN = getSubServiceDomain({
      name: 'AUTOMATIONS_API_DOMAIN'
    });
    this.baseURL = AUTOMATIONS_API_DOMAIN;
    this.httpCache = new HTTPCache();
  }

  public didEncounterError(e) {
    const error = e.extensions || {};
    const { response } = error;
    const { body } = response || { body: e.message };

    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error('Automations api is not running');
    }

    throw new Error(body);
  }

  // fetches all automations
  public async getAutomations(selector) {
    try {
      const response = await this.get('/queries/automations', selector);

      return response;
    } catch (e) {
      debugError(e);

      return { error: e.message };
    }
  }

  // fetches all automationsMain
  public async getAutomationsMain(params) {
    try {
      console.log(params, 'zzzzzzzzzzzzzzzz');
      const response = await this.get('/queries/automations-main', params);

      return response;
    } catch (e) {
      debugError(e);

      return { error: e.message };
    }
  }

  // fetches all automationsDetail
  public async getAutomationDetail(automationsId) {
    try {
      const response = await this.get(
        `/queries/automation-detail/${automationsId}`
      );

      return response;
    } catch (e) {
      debugError(e);

      return { error: e.message };
    }
  }

  public async createAutomation(doc) {
    try {
      return this.post(`/mutations/createAutomation`, doc);
    } catch (e) {
      debugError(e);
      return { error: e.message };
    }
  }

  public async updateAutomation(doc) {
    try {
      return this.post(`/mutations/updateAutomation`, doc);
    } catch (e) {
      debugError(e);
      return { error: e.message };
    }
  }

  public async removeAutomations(automationIds) {
    try {
      return this.post(`/mutations/removeAutomations`, automationIds);
    } catch (e) {
      debugError(e);
      return { error: e.message };
    }
  }
} // end class
