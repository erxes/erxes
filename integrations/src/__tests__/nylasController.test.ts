import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import memoryStorage, { initMemoryStorage } from '../inmemoryStorage';
import * as messageBroker from '../messageBroker';
import { Integrations } from '../models';
import { IAccount } from '../models/Accounts';
import * as api from '../nylas/api';
import * as auth from '../nylas/auth';
import {
  createNylasIntegration,
  getMessage,
  nylasCheckCalendarAvailability,
  nylasCreateCalenderEvent,
  nylasDeleteCalendarEvent,
  nylasFileUpload,
  nylasGetAllEvents,
  nylasGetAttachment,
  nylasGetCalendarOrEvent,
  nylasGetCalendars,
  nylasSendEmail,
  nylasSendEventAttendance,
  nylasUpdateEvent
} from '../nylas/handleController';
import {
  NylasCalendars,
  NylasEvent,
  NylasGmailConversationMessages
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
    sendRequestMock.restore();
    nylasInstanceMock.restore();

    await NylasGmailConversationMessages.deleteMany({});
    await NylasEvent.deleteMany({});
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

    expect(updatedIntegration.nylasToken).toBe('access_token');

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

    expect(updatedIntegration.nylasToken).toBe('access_token');
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

    expect(updatedIntegration.nylasToken).toBe('access_token');

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

    expect(updatedIntegration.nylasToken).toBe('access_token');
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

    expect(updatedIntegration.nylasToken).toBe('access_token');

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

    await Integrations.create({ erxesApiId: 'erxesApiId' });

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
    expect(updatedIntegration.nylasToken).toEqual('access_token');

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

    const mock1 = sinon.stub(api, 'getCalenderOrEventList').returns(
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
      .stub(api, 'getCalenderOrEventList')
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

    const mock1 = sinon.stub(api, 'getCalenderOrEventList').returns(
      Promise.resolve([
        {
          id: '321',
          calendar_id: calendar.providerCalendarId
        }
      ])
    );

    await nylasGetAllEvents(_account);

    const event = await NylasEvent.findOne({
      providerCalendarId: calendar.providerCalendarId
    });

    expect(event.providerEventId).toBe('321');
    expect(event.providerCalendarId).toBe(calendar.providerCalendarId);

    mock1.restore();

    const mock2 = sinon
      .stub(api, 'getCalenderOrEventList')
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

    const eventCreated = await NylasEvent.findOne({
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

    const response = await NylasEvent.findOne({ providerEventId: 'eventId' });

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

    expect(await NylasEvent.findOne({ providerEventId: 'eventId123' })).toBe(
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
      await NylasEvent.findOne({ providerCalendarId: 'calendarId123123v' })
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
});
