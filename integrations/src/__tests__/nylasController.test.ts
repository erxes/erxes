import * as sinon from 'sinon';
import {
  accountFactory,
  integrationFactory,
  nylasCalendarFactory,
  nylasEventFactory
} from '../factories';
import * as gmailApi from '../gmail/api';
import memoryStorage, { initMemoryStorage } from '../inmemoryStorage';
import * as messageBroker from '../messageBroker';
import { Integrations } from '../models';
import Accounts, { IAccount } from '../models/Accounts';
import * as api from '../nylas/api';
import * as auth from '../nylas/auth';
import {
  createNylasIntegration,
  getMessage,
  nylasCheckCalendarAvailability,
  nylasConnectCalendars,
  nylasCreateCalenderEvent,
  nylasCreateSchedulePage,
  nylasDeleteCalendarEvent,
  nylasDeleteSchedulePage,
  nylasFileUpload,
  nylasGetAccountCalendars,
  nylasGetAllEvents,
  nylasGetAttachment,
  nylasGetCalendarOrEvent,
  nylasGetCalendars,
  nylasGetEvents,
  nylasGetSchedulePage,
  nylasGetSchedulePages,
  nylasRemoveCalendars,
  nylasSendEmail,
  nylasSendEventAttendance,
  nylasUpdateEvent,
  nylasUpdateSchedulePage,
  updateCalendar
} from '../nylas/handleController';
import {
  NylasCalendars,
  NylasEvents,
  NylasGmailConversationMessages,
  NylasPages
} from '../nylas/models';
import * as nylasUtils from '../nylas/utils';
import * as utils from '../utils';
import './setup.ts';

initMemoryStorage();

describe('Test nylas controller', () => {
  let sendRequestMock;
  let nylasInstanceMock;
  let _account;
  const emptyAccount = {} as IAccount;
  const erxesApiId = null;

  beforeEach(async () => {
    process.env.NYLAS_ENCRYPTION_KEY = 'U66vhgcUKrUxCrRU4H0FYcqEtnGUK5Sz';
    sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns(Promise.resolve('code'));
    sendRequestMock.onCall(1).returns(
      Promise.resolve({
        access_token: 'access_token',
        account_id: 'account_id',
        billing_state: 'cancelled'
      })
    );

    nylasInstanceMock = sinon
      .stub(api, 'enableOrDisableAccount')
      .resolves('success');

    await integrationFactory({ erxesApiId });
    _account = await accountFactory({
      nylasAccountId: 'nylasAccountId',
      nylasToken: 'token'
    });
  });

  afterEach(async () => {
    delete process.env.NYLAS_ENCRYPTION_KEY;

    sendRequestMock.restore();
    nylasInstanceMock.restore();

    await NylasGmailConversationMessages.deleteMany({});
    await NylasEvents.deleteMany({});
    await NylasCalendars.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Create Nylas Exchange integration', async () => {
    const doc = {
      username: 'username',
      password: 'password',
      email: 'email',
      host: 'host',
      billingState: 'cancelled',
      integrationId: erxesApiId,
      kind: 'exchange'
    };

    await createNylasIntegration('exchange', erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({
      erxesApiId
    }).lean();

    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toBe(
      'access_token'
    );

    await Integrations.create({ kind: 'exchange', email: 'john@mail.com' });

    try {
      await createNylasIntegration('exchange', erxesApiId, {
        email: 'john@mail.com'
      });
    } catch (e) {
      expect(e.message).toBe(`john@mail.com already exists`);
    }
  });

  test('Create Nylas IMAP integration', async () => {
    const doc = {
      username: 'username',
      password: 'password',
      email: 'email',
      imapHost: 'imapHost',
      smtpHost: 'smtpHost',
      imapPort: 1,
      smtpPort: 2,
      billingState: 'cancelled'
    };

    await createNylasIntegration('imap', erxesApiId, doc);

    const updatedIntegration = await Integrations.findOne({
      erxesApiId
    }).lean();

    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toBe(
      'access_token'
    );
  });

  test('Create Nylas outlook integration', async () => {
    sendRequestMock.restore();

    const mockRequest = sinon.stub(utils, 'sendRequest');

    mockRequest.onCall(0).returns(Promise.resolve('code'));
    mockRequest.onCall(1).returns(
      Promise.resolve({
        access_token: 'access_token',
        account_id: 'account_id',
        billing_state: 'paid'
      })
    );

    const doc = {
      username: 'username',
      password: 'password',
      billingState: 'cancelled'
    };

    await createNylasIntegration('outlook', erxesApiId, {
      ...doc,
      email: 'email@outlook.com'
    });

    const updatedIntegration = await Integrations.findOne({
      erxesApiId
    }).lean();

    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toBe(
      'access_token'
    );

    const mock = sinon
      .stub(auth, 'connectYahooAndOutlookToNylas')
      .throws(new Error('Failed to create outlook integration'));

    try {
      await createNylasIntegration('outlook', erxesApiId, {
        ...doc,
        email: 'test@outlook.com'
      });
    } catch (e) {
      expect(e.message).toBe('Failed to create outlook integration');
    }

    mock.restore();
    mockRequest.restore();
  });

  test('Create Nylas yahoo integration', async () => {
    await createNylasIntegration('yahoo', erxesApiId, {
      username: 'username',
      password: 'password',
      email: 'email'
    });

    const updatedIntegration = await Integrations.findOne({
      erxesApiId
    }).lean();

    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toBe(
      'access_token'
    );
    expect(updatedIntegration.nylasBillingState).toBe('paid');
  });

  test('Create Nylas gmail integration', async () => {
    const providerMock = sinon
      .stub(nylasUtils, 'getProviderSettings')
      .callsFake(() => {
        return Promise.resolve({});
      });

    const configMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    const redisMock = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('email321,refrshToken');
    });

    const redisRemoveMock = sinon
      .stub(memoryStorage(), 'removeKey')
      .callsFake(() => {
        return Promise.resolve('success');
      });

    await createNylasIntegration('gmail', 'erxesApiId', {
      username: 'username',
      password: 'password',
      email: 'emailtest@gmail.com',
      billingState: 'cancelled'
    });

    const updatedIntegration = await Integrations.findOne({
      erxesApiId: 'erxesApiId'
    }).lean();

    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toBe(
      'access_token'
    );

    providerMock.restore();
    configMock.restore();
    redisMock.restore();
    redisRemoveMock.restore();
  });

  test('Get message', async () => {
    try {
      await getMessage('alksjd', 'alskdj');
    } catch (e) {
      expect(e.message).toBe('Integration not found!');
    }

    const message = await NylasGmailConversationMessages.create({
      erxesApiMessageId: 'asjlkd',
      subject: 'aklsdj'
    });

    await Integrations.create({ erxesApiId: '123', kind: 'gmail' });

    const response = await getMessage('asjlkd', '123');

    expect(response._id).toBe(message._id);

    try {
      await getMessage('ww', '123');
    } catch (e) {
      expect(e.message).toBe('Conversation message not found');
    }
  });

  test('Nylas file upload', async () => {
    try {
      await nylasFileUpload('alksjd', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({ erxesApiId: 'erxesApiId' });

    const mockFileUpload = sinon.stub(api, 'uploadFile');

    mockFileUpload.onCall(0).throws(new Error('Failed to upload a file'));

    try {
      await nylasFileUpload('erxesApiId', { file: {} });
    } catch (e) {
      expect(e.message).toBe('Failed to upload a file');
    }

    mockFileUpload.onCall(1).returns(Promise.resolve('success'));

    const result = await nylasFileUpload('erxesApiId', { file: {} });

    expect(result).toBe('success');

    mockFileUpload.restore();
  });

  test('Nylas get attachment', async () => {
    try {
      await nylasGetAttachment('alksjd', 'salksdj');
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const mock = sinon.stub(api, 'getAttachment');

    mock.onCall(0).returns(undefined);

    await Integrations.create({ erxesApiId: 'erxesApiId' });

    try {
      await nylasGetAttachment('1231ljl', 'erxesApiId');
    } catch (e) {
      expect(e.message).toBe('Attachment not found');
    }

    mock.onCall(1).returns('success');

    expect(await nylasGetAttachment('1231ljl', 'erxesApiId')).toBe('success');

    mock.restore();
  });

  test('Nylas send email', async () => {
    sendRequestMock.restore();

    const redisAddtoArrayMock = sinon
      .stub(memoryStorage(), 'addToArray')
      .callsFake(() => {
        return Promise.resolve('success');
      });

    const redisRemoveFromArrayMock = sinon
      .stub(memoryStorage(), 'removeFromArray')
      .callsFake(() => {
        return Promise.resolve('success');
      });

    try {
      await nylasSendEmail('alksjd', {});
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.create({
      erxesApiId: 'erxesApiId',
      nylasToken: nylasUtils.encryptToken('token')
    });

    const params = {
      to: [{ email: 'to@mail.com' }],
      cc: [{ email: 'cc@mail.com' }],
      bcc: [{ email: 'bcc@mail.com' }],
      body: 'alksdjalksdj',
      threadId: 'threadId',
      subject: 'subject',
      attachments: [],
      replyToMessageId: '123'
    } as any;

    const mock = sinon.stub(api, 'sendMessage');

    mock.onCall(0).throws(new Error('Failed to send email'));

    params.shouldResolve = true;

    try {
      await nylasSendEmail('erxesApiId', params);
    } catch (e) {
      expect(e.message).toBe('Failed to send email');
    }

    const mockRequest = sinon
      .stub(utils, 'sendRequest')
      .callsFake(() => Promise.resolve('success'));

    params.shouldResolve = false;

    mock.onCall(1).returns(Promise.resolve({ _id: 'askldj' }));

    expect(await nylasSendEmail('erxesApiId', params)).toBe('success');

    params.shouldResolve = true;

    expect(await nylasSendEmail('erxesApiId', params)).toBe('success');

    mock.restore();
    mockRequest.restore();
    redisAddtoArrayMock.restore();
    redisRemoveFromArrayMock.restore();
  });

  test('Create Nylas integration ', async () => {
    const providerMock = sinon
      .stub(nylasUtils, 'getProviderSettings')
      .callsFake(() => {
        return Promise.resolve({});
      });

    const configMock = sinon
      .stub(nylasUtils, 'getNylasConfig')
      .callsFake(() => {
        return Promise.resolve({
          NYLAS_CLIENT_ID: 'NYLAS_CLIENT_ID',
          NYLAS_CLIENT_SECRET: 'NYLAS_CLIENT_SECRET'
        });
      });

    const redisMock = sinon.stub(memoryStorage(), 'get').callsFake(() => {
      return Promise.resolve('email321@gmail.com,refrshToken');
    });

    const redisRemoveMock = sinon
      .stub(memoryStorage(), 'removeKey')
      .callsFake(() => {
        return Promise.resolve('success');
      });

    await createNylasIntegration('gmail', 'erxesApiId', {});

    const updatedIntegration = await Integrations.findOne({
      erxesApiId: 'erxesApiId'
    });

    expect(updatedIntegration.email).toEqual('email321@gmail.com');
    expect(nylasUtils.decryptToken(updatedIntegration.nylasToken)).toEqual(
      'access_token'
    );

    providerMock.restore();
    redisMock.restore();
    configMock.restore();
    redisRemoveMock.restore();
  });

  test('Get calendars', async () => {
    try {
      await nylasGetCalendars(emptyAccount);
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const mock1 = sinon.stub(api, 'getCalendarList').returns(
      Promise.resolve([
        {
          id: 1,
          account_id: 'account_id',
          name: 'my calendar',
          description: 'description',
          read_only: false
        }
      ])
    );

    const [calendar] = await nylasGetCalendars(_account);

    expect(calendar.providerCalendarId).toBe('1');
    expect(calendar.accountUid).toBe('account_id');
    expect(calendar.name).toBe('my calendar');

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'getCalendarList')
      .throws(new Error('error calendar'));

    try {
      await nylasGetCalendars(_account);
    } catch (e) {
      expect(e.message).toBe('error calendar');
    }

    mock2.restore();
  });

  test('Get calendar events', async () => {
    try {
      await nylasGetAllEvents(emptyAccount);
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const integration = await integrationFactory({
      erxesApiId: 'erxesApiId',
      nylasAccountId: 'nylasAccountId',
      nylasToken: 'token'
    });

    const calendar = await NylasCalendars.create({
      accountUid: integration.nylasAccountId,
      providerCalendarId: '123'
    });

    const mock1 = sinon.stub(api, 'getEventList').returns(
      Promise.resolve([
        {
          id: '321',
          calendar_id: calendar.providerCalendarId
        }
      ])
    );

    await nylasGetAllEvents(_account);

    const event = await NylasEvents.findOne({
      providerCalendarId: calendar.providerCalendarId
    });

    expect(event.providerEventId).toBe('321');
    expect(event.providerCalendarId).toBe(calendar.providerCalendarId);

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'getEventList')
      .throws(new Error('error events'));

    try {
      await nylasGetAllEvents(_account);
    } catch (e) {
      expect(e.message).toBe('error events');
    }

    mock2.restore();
  });

  test('Get calender or event', async () => {
    try {
      await nylasGetCalendarOrEvent('id', 'calendars', 'erxesApId123');
    } catch (e) {
      expect(e.message).toBe('Integration not found with id: erxesApId123');
    }

    const mock1 = sinon
      .stub(api, 'getCalendarOrEvent')
      .returns(Promise.resolve({ status: 'success' }));

    const integration = await integrationFactory({ erxesApiId: 'erxesApId' });

    const response = await nylasGetCalendarOrEvent(
      'id',
      'calendars',
      integration.erxesApiId
    );

    expect(response.status).toBe('success');

    mock1.restore();
  });

  test('Check calendar availability', async () => {
    try {
      await nylasCheckCalendarAvailability('erxesApiId123', {
        startTime: 1,
        endTime: 2
      });
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock1 = sinon
      .stub(api, 'checkCalendarAvailability')
      .returns(Promise.resolve([{ object: 'free_busy' }]));

    const [response] = await nylasCheckCalendarAvailability(_account._id, {
      startTime: 1,
      endTime: 2
    });

    expect(response.object).toBe('free_busy');

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'checkCalendarAvailability')
      .throws(new Error('error'));

    try {
      await nylasCheckCalendarAvailability(_account._id, {
        startTime: 1,
        endTime: 2
      });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock2.restore();
  });

  test('Delete calendar event', async () => {
    try {
      await nylasDeleteCalendarEvent({
        eventId: 'eventId',
        accountId: 'erxesApiId123'
      });
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock1 = sinon
      .stub(api, 'deleteCalendarEvent')
      .returns(Promise.resolve({ status: 'success' }));

    await nylasDeleteCalendarEvent({
      eventId: 'eventId',
      accountId: _account._id
    });

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'deleteCalendarEvent')
      .throws(new Error('error'));

    try {
      await nylasDeleteCalendarEvent({
        eventId: 'eventId',
        accountId: _account._id
      });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock2.restore();
  });

  test('Create calendar event', async () => {
    const doc = {
      calendarId: '1',
      when: 1,
      start: 2,
      end: 3,
      readonly: false,
      participants: [{ name: 'name' }],
      notifyParticipants: false
    };

    try {
      await nylasCreateCalenderEvent({ accountId: 'erxesApiId123', doc });
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock1 = sinon
      .stub(api, 'createEvent')
      .returns(Promise.resolve({ status: 'success' }));

    await nylasCreateCalenderEvent({ accountId: _account._id, doc });

    mock1.restore();

    const mock2 = sinon.stub(api, 'createEvent').throws(new Error('error'));

    try {
      await nylasCreateCalenderEvent({ accountId: _account._id, doc });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock2.restore();
  });

  test('Update event', async () => {
    const args = {
      eventId: 'eventId',
      doc: {
        calendarId: '1',
        when: 1,
        start: 2,
        end: 3,
        readonly: false,
        participants: [{ name: 'name' }],
        notifyParticipants: false
      }
    };

    try {
      await nylasUpdateEvent({
        accountId: 'erxesApiId123',
        ...args
      });
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock1 = sinon
      .stub(api, 'updateEvent')
      .returns(Promise.resolve({ status: 'success' }));

    await nylasUpdateEvent({ accountId: _account._id, ...args });

    mock1.restore();

    const mock2 = sinon.stub(api, 'updateEvent').throws(new Error('error'));

    try {
      await nylasUpdateEvent({ accountId: _account._id, ...args });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock2.restore();
  });

  test('Send event attendance', async () => {
    const args = {
      eventId: 'eventId',
      doc: {
        status: 'maybe'
      }
    } as any;

    try {
      await nylasSendEventAttendance({ erxesApiId: 'erxesApiId123', ...args });
    } catch (e) {
      expect(e.message).toBe('Integration not found with id: erxesApiId123');
    }

    const integration = await integrationFactory({ erxesApiId: 'erxesApiId' });

    const mock1 = sinon
      .stub(api, 'sendEventAttendance')
      .returns(Promise.resolve({ status: 'success' }));

    await nylasSendEventAttendance({
      erxesApiId: integration.erxesApiId,
      ...args
    });

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'sendEventAttendance')
      .throws(new Error('error'));

    try {
      await nylasSendEventAttendance({
        erxesApiId: integration.erxesApiId,
        ...args
      });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock2.restore();
  });

  test('Sync event', async () => {
    try {
      await nylasUtils.syncEvents('event.created', 'accountUid', 'eventId');
    } catch (e) {
      expect(e.message).toBe('Account not found with accountUid: accountUid');
    }

    const mock = sinon.stub(messageBroker, 'sendMessage').callsFake(() => {
      return Promise.resolve({ accountId: 'nylasAccountId' });
    });

    const integration = await integrationFactory({
      nylasAccountId: 'nylasAccountId'
    });

    const mockEventCreate = sinon.stub(api, 'getCalendarOrEvent').returns(
      Promise.resolve({
        id: 'eventId',
        calendar_id: 'calendarId',
        when: {
          end_time: 'end_time',
          start_time: 'start_time'
        }
      })
    );

    await nylasUtils.syncEvents(
      'event.created',
      integration.nylasAccountId,
      'eventId'
    );

    const eventCreated = await NylasEvents.findOne({
      providerEventId: 'eventId'
    });

    expect(eventCreated.providerEventId).toBe('eventId');
    expect(eventCreated.providerCalendarId).toBe('calendarId');

    mockEventCreate.restore();

    const mockEventUpdated = sinon.stub(api, 'getCalendarOrEvent').returns(
      Promise.resolve({
        id: 'eventId',
        calendar_id: 'calendarId123',
        when: {
          end_time: 'end_time',
          start_time: 'start_time'
        }
      })
    );

    await nylasUtils.syncEvents(
      'event.updated',
      integration.nylasAccountId,
      'eventId'
    );

    const response = await NylasEvents.findOne({ providerEventId: 'eventId' });

    expect(response.providerCalendarId).toBe('calendarId123');

    mockEventUpdated.restore();

    // no event found to update
    const mockEventUpdatedFail = sinon
      .stub(api, 'getCalendarOrEvent')
      .returns(Promise.resolve({ id: 'eventId333' }));

    try {
      await nylasUtils.syncEvents(
        'event.updated',
        integration.nylasAccountId,
        'eventId'
      );
    } catch (e) {
      expect(e.message).toBe('Event not found to be updated eventId333');
    }

    mockEventUpdatedFail.restore();

    await nylasUtils.syncEvents(
      'event.deleted',
      integration.nylasAccountId,
      'eventId123'
    );

    expect(await NylasEvents.findOne({ providerEventId: 'eventId123' })).toBe(
      null
    );

    const mockFail = sinon
      .stub(api, 'getCalendarOrEvent')
      .throws(new Error('error'));

    const integration2 = await integrationFactory({
      nylasAccountId: 'nylasAccountId'
    });

    try {
      await nylasUtils.syncEvents(
        'event.created',
        integration2.nylasAccountId,
        'eventId123'
      );
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock.restore();
    mockFail.restore();
  });

  test('Sync calendars', async () => {
    try {
      await nylasUtils.syncCalendars(
        'calendar.created',
        'accountUid',
        'calendarId'
      );
    } catch (e) {
      expect(e.message).toBe('Account not found with accountUid: accountUid');
    }

    const integration = await integrationFactory({
      nylasAccountId: 'nylasAccountId'
    });

    const mockCalendarCreate = sinon.stub(api, 'getCalendarOrEvent').returns(
      Promise.resolve({
        id: 'calendarId123123v',
        account_id: 'account_id',
        name: 'name'
      })
    );

    await nylasUtils.syncCalendars(
      'calendar.created',
      integration.nylasAccountId,
      'calendarId123123v'
    );

    const calendarCreated = await NylasCalendars.findOne({
      providerCalendarId: 'calendarId123123v'
    });

    expect(calendarCreated.providerCalendarId).toBe('calendarId123123v');

    mockCalendarCreate.restore();

    const mockCalendarUpdate = sinon.stub(api, 'getCalendarOrEvent').returns(
      Promise.resolve({
        id: 'calendarId123123v',
        name: 'updated name'
      })
    );

    await nylasUtils.syncCalendars(
      'calendar.updated',
      integration.nylasAccountId,
      'calendarId123123v'
    );

    const calendarUpdated = await NylasCalendars.findOne({
      providerCalendarId: 'calendarId123123v'
    });

    expect(calendarUpdated.name).toBe('updated name');

    mockCalendarUpdate.restore();

    // no calendar found to update
    const mockCalendarUpdateFail = sinon
      .stub(api, 'getCalendarOrEvent')
      .returns(
        Promise.resolve({
          id: 'caleId123123v',
          name: 'updated name'
        })
      );

    try {
      await nylasUtils.syncCalendars(
        'calendar.updated',
        integration.nylasAccountId,
        'caleId123123v'
      );
    } catch (e) {
      expect(e.message).toBe('Calendar not found to be updated caleId123123v');
    }

    mockCalendarUpdateFail.restore();

    await nylasUtils.syncCalendars(
      'calendar.deleted',
      integration.nylasAccountId,
      'calendarId123123v'
    );

    expect(
      await NylasCalendars.findOne({ providerCalendarId: 'calendarId123123v' })
    ).toBe(null);
    expect(
      await NylasEvents.findOne({ providerCalendarId: 'calendarId123123v' })
    ).toBe(null);

    const mockFail = sinon
      .stub(api, 'getCalendarOrEvent')
      .throws(new Error('error'));

    try {
      await nylasUtils.syncCalendars(
        'calendar.created',
        integration.nylasAccountId,
        'calendarId123123v'
      );
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mockFail.restore();
  });

  test('Update calendar', async () => {
    try {
      await updateCalendar({ _id: 'calendarId' });
    } catch (e) {
      expect(e.message).toBe('Calendar not found');
    }

    const integration = await integrationFactory({
      erxesApiId: 'erxesApiId',
      nylasAccountId: 'nylasAccountId',
      nylasToken: 'token'
    });

    const calendar = await NylasCalendars.create({
      accountUid: integration.nylasAccountId,
      providerCalendarId: '123'
    });

    const color = '#fff';

    const updated = await updateCalendar({ _id: calendar._id, color });

    expect(updated.color).toBe(color);
  });

  test('Connect calendars', async () => {
    const uid = 'google-uid';
    const accountEmail = 'email321@gmail.com';
    const kind = 'gmail';
    const nylasAccountId = 'nylasId';

    const redisMock = sinon
      .stub(memoryStorage(), 'get')
      .returns(Promise.resolve(`${accountEmail},refrshToken,${kind}`));

    const account = await accountFactory({
      email: accountEmail,
      kind,
      nylasAccountId,
      nylasToken: 'token'
    });

    const { accountId, email } = await nylasConnectCalendars(uid);

    expect(account._id).toBe(accountId);
    expect(accountEmail).toBe(email);

    try {
      await nylasConnectCalendars(uid);
    } catch (e) {
      expect(e.message).toBe('revoke error');
    }

    const connectProviderMock = sinon
      .stub(auth, 'connectProviderToNylas')
      .returns(Promise.resolve({ account }));

    const calendarList = sinon.stub(api, 'getCalendarList').returns(
      Promise.resolve([
        {
          id: 1,
          account_id: nylasAccountId,
          name: 'my calendar',
          description: 'description',
          read_only: false
        }
      ])
    );

    try {
      await nylasConnectCalendars(uid);
    } catch (e) {
      expect(e.message).toBe('events not found');
    }

    connectProviderMock.restore();
    calendarList.restore();
    redisMock.restore();
  });

  test('Remove calendars', async () => {
    try {
      await nylasRemoveCalendars('accId');
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const mock = sinon
      .stub(gmailApi, 'revokeToken')
      .throws(new Error('revoke error'));

    const account = await accountFactory({
      nylasAccountId: 'nylasId'
    });

    try {
      await nylasRemoveCalendars(account._id);
    } catch (e) {
      expect(e.message).toBe('revoke error');
    }

    const account2 = await accountFactory({
      nylasAccountId: 'nylasId2'
    });

    await nylasCalendarFactory({
      providerCalendarId: 'calendar.id',
      accountUid: account2.nylasAccountId
    });

    mock.onCall(1).returns(Promise.resolve(true));

    const nylasRevokeTokenMock = sinon
      .stub(api, 'revokeTokenAccount')
      .returns(true);

    await nylasRemoveCalendars(account2._id);

    mock.restore();
    nylasRevokeTokenMock.restore();
  });

  test('Get account calendars', async () => {
    try {
      await nylasGetAccountCalendars('accId');
    } catch (e) {
      expect(e.message).toBe('Account not found');
    }

    const account = await accountFactory({
      nylasAccountId: 'nylasId2'
    });

    const calendars = await nylasGetAccountCalendars(account._id, true);

    expect(calendars.length).toEqual(0);
  });

  test('Nylas get events', async () => {
    const providerCalendarId = 'calendarId';
    const account = await Accounts.findOne({});

    const calendar = await nylasCalendarFactory({
      providerCalendarId,
      accountUid: account.nylasAccountId
    });

    const getTime = (date: string) => {
      return new Date(date).getTime() / 1000;
    };

    const mock = sinon.stub(api, 'getEventList').returns(
      Promise.resolve([
        {
          id: '321',
          calendar_id: providerCalendarId,
          when: {
            start_time: getTime('2020-11-10'),
            end_time: getTime('2020-11-11')
          }
        }
      ])
    );

    const _event = await nylasEventFactory({
      title: 'event',
      providerCalendarId,
      when: {
        start_time: getTime('2020-11-10'),
        end_time: getTime('2020-11-11')
      }
    });

    const params = {
      calendarIds: providerCalendarId,
      startTime: '2020-10-27',
      endTime: '2020-11-27'
    };

    const events = await nylasGetEvents(params);

    expect(events.length).toEqual(1);
    expect(_event._id).toEqual(events[0]._id);

    await NylasCalendars.updateOne(
      { _id: calendar._id },
      { $set: { syncedMonths: ['2020-10'] } }
    );

    await nylasGetEvents(params);

    const events2 = await nylasGetEvents({
      ...params,
      calendarIds: 'providerCalendarId'
    });

    expect(events2.length).toEqual(0);

    mock.onCall(1).throws(new Error('error'));

    try {
      await nylasGetEvents({
        calendarIds: providerCalendarId,
        startTime: 'start',
        endTime: 'end'
      });
    } catch (e) {
      expect(e.message).toBe('error');
    }

    const milliseconds = nylasUtils.getTime(new Date('2020-11-27'));

    expect(milliseconds).toBeDefined();

    mock.restore();
  });

  test('Nylas get schedule pages', async () => {
    try {
      await nylasGetSchedulePages('erxesApiId123');
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock = sinon.stub(api, 'getSchedulePages').returns(
      Promise.resolve([
        {
          id: 321,
          name: 'Page name',
          slug: 'page-slug',
          config: {
            appearance: {},
            event: {
              title: 'title',
              location: 'location',
              duration: 30
            },
            booking: {}
          }
        }
      ])
    );

    const pages = await nylasGetSchedulePages(_account._id);

    expect(pages.length).toEqual(1);
    expect('title').toEqual(pages[0].config.event.title);

    const alreadyExists = await nylasGetSchedulePages(_account._id);
    expect(alreadyExists.length).toEqual(1);
    expect('title').toEqual(alreadyExists[0].config.event.title);

    mock.restore();
  });

  test('Nylas get schedule page', async () => {
    const page = await nylasGetSchedulePage(_account._id);

    expect(page).toBeNull();
  });

  test('Nylas create schedule page', async () => {
    const account = await Accounts.findOne({});
    const doc = {
      name: 'Page name',
      slug: 'page-slug',

      timezone: 'string',
      calendarIds: ['id'],
      event: {
        title: 'title',
        location: 'location',
        duration: 30
      }
    };

    try {
      await nylasCreateSchedulePage('erxesApiId123', doc);
    } catch (e) {
      expect(e.message).toBe('Account not found with id: erxesApiId123');
    }

    const mock = sinon.stub(api, 'createSchedulePage').returns(
      Promise.resolve([
        {
          id: 321,
          name: 'Page name',
          slug: 'page-slug',
          config: {
            appearance: {},
            event: {
              title: 'title',
              location: 'location',
              duration: 30
            },
            booking: {}
          }
        }
      ])
    );

    await nylasCreateSchedulePage(account._id, doc);
    const pages = await NylasPages.find();

    expect(pages.length).toEqual(1);
    expect(pages[0].pageId).toEqual(321);

    mock.onCall(1).callsFake(() => {
      throw new Error('error');
    });

    try {
      await nylasCreateSchedulePage('account._id', doc);
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock.restore();
  });

  test('Nylas update schedule page', async () => {
    const page = await NylasPages.findOne({});
    const doc = {
      name: 'Page name',
      slug: 'page-slug',

      timezone: 'string',
      calendarIds: ['id'],
      event: {
        title: 'title',
        location: 'location',
        duration: 30
      }
    };

    try {
      await nylasUpdateSchedulePage('erxesApiId123', doc);
    } catch (e) {
      expect(e.message).toBe('Page not found with id: erxesApiId123');
    }

    const mock = sinon
      .stub(api, 'updateSchedulePage')
      .returns(Promise.resolve());

    await nylasUpdateSchedulePage(page._id, doc);

    mock.onCall(1).callsFake(() => {
      throw new Error('error');
    });

    try {
      await nylasUpdateSchedulePage(page._id, doc);
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock.restore();
  });

  test('Nylas delete schedule page', async () => {
    try {
      await nylasDeleteSchedulePage('_id');
    } catch (e) {
      expect(e.message).toBe('page not found with id: _id');
    }

    const mock = sinon.stub(api, 'deleteSchedulePage');

    mock.onCall(0).callsFake(() => {
      throw new Error('error');
    });

    const page = await NylasPages.findOne({});

    try {
      await nylasDeleteSchedulePage(page._id);
    } catch (e) {
      expect(e.message).toBe('error');
    }

    mock.onCall(2).returns(() => {
      Promise.resolve();
    });

    await nylasDeleteSchedulePage(page._id);

    mock.restore();
  });
});
