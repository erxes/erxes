import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';
import { getSubServiceDomain } from '../utils';

export default class IntegrationsAPI extends RESTDataSource {
  constructor() {
    super();

    const INTEGRATIONS_API_DOMAIN = getSubServiceDomain({
      name: 'INTEGRATIONS_API_DOMAIN'
    });

    this.baseURL = INTEGRATIONS_API_DOMAIN;
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
      throw new Error('Integrations api is not running');
    }

    throw new Error(body);
  }

  public async createIntegration(kind, params) {
    return this.post(`/${kind}/create-integration`, params);
  }

  public async removeIntegration(params) {
    return this.post('/integrations/remove', params);
  }

  public async removeAccount(params) {
    return this.post('/accounts/remove', params);
  }

  public async replyChatfuel(params) {
    return this.post('/chatfuel/reply', params);
  }

  public async sendEmail(kind, params) {
    return this.post(`/${kind}/send`, params);
  }

  public async deleteDailyVideoChatRoom(name) {
    return this.delete(`/daily/rooms/${name}`);
  }

  public async createDailyVideoChatRoom(params) {
    return this.post('/daily/room', params);
  }

  public async saveDailyRecordingInfo(params) {
    return this.post('/daily/saveRecordingInfo', params);
  }

  public async fetchApi(path, params) {
    return this.get(path, params);
  }

  public async replyTwitterDm(params) {
    return this.post('/twitter/reply', params);
  }

  public async replySmooch(params) {
    return this.post('/smooch/reply', params);
  }

  public async replyWhatsApp(params) {
    return this.post('/whatsapp/reply', params);
  }

  public async updateConfigs(configsMap) {
    return this.post('/update-configs', { configsMap });
  }

  public async createProductBoardNote(params) {
    return this.post('/productBoard/create-note', params);
  }

  public async sendSms(params) {
    return this.post('/telnyx/send-sms', params);
  }

  public async createCalendarEvent(params) {
    return this.post('/nylas/create-calendar-event', params);
  }

  public async editCalendarEvent(params) {
    return this.post('/nylas/edit-calendar-event', params);
  }

  public async deleteCalendarEvent(params) {
    return this.post('/nylas/delete-calendar-event', params);
  }

  public async connectCalendars(params) {
    return this.post('/nylas/connect-calendars', params);
  }

  public async deleteCalendars(params) {
    return this.post('/nylas/remove-calendars', params);
  }
}
