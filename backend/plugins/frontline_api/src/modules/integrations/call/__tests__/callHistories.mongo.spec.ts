import { randomUUID } from 'node:crypto';
import mongoose, { type Connection } from 'mongoose';
import type { IUser } from 'erxes-api-shared/core-types';
import type { IModels } from '~/connectionResolvers';
import { loadCallCdrClass } from '@/integrations/call/db/models/Cdrs';
import { loadCallHistoryClass } from '@/integrations/call/db/models/Histories';
import { loadCallIntegrationClass } from '@/integrations/call/db/models/Integrations';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
}));

const INBOX_ID = 'inbox-queue';
const CALLER = '99000001';

const operatorUser = (userId: string) => ({ _id: userId }) as unknown as IUser;

const queueLeg = (
  acctId: string,
  uniqueid: string,
  extension: string,
  answered: boolean,
) => ({
  acctId,
  uniqueid,
  inboxIntegrationId: INBOX_ID,
  src: CALLER,
  dst: extension,
  userfield: 'Inbound',
  lastapp: 'Queue',
  actionType: 'QUEUE[6500]',
  dstchannelExt: extension,
  dstanswer: answered ? extension : '',
  disposition: answered ? 'ANSWERED' : 'NO ANSWER',
  billsec: answered ? 12 : 0,
  start: new Date('2026-11-04T00:20:00Z'),
  end: new Date('2026-11-04T00:20:30Z'),
});

const mongoSuite =
  process.env.CALL_MONGO_TESTS === '1' ? describe : describe.skip;

mongoSuite('Operator call history', () => {
  let connection: Connection;
  let models: IModels;
  const databaseName = `erxes_call_test_${randomUUID().replace(/-/g, '')}`;

  const historyOf = (userId: string, callStatus?: 'cancelled') =>
    models.CallHistory.getCallHistories(
      { integrationId: INBOX_ID, ...(callStatus ? { callStatus } : {}) },
      operatorUser(userId),
    );

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(
        `mongodb://127.0.0.1:27017/${databaseName}?directConnection=true`,
        { serverSelectionTimeoutMS: 3000 },
      )
      .asPromise();

    models = {} as unknown as IModels;
    models.CallCdrs = connection.model(
      'calls_cdrs',
      loadCallCdrClass(models),
    ) as unknown as IModels['CallCdrs'];
    models.CallIntegrations = connection.model(
      'calls_integrations',
      loadCallIntegrationClass(models),
    ) as unknown as IModels['CallIntegrations'];
    models.CallHistory = connection.model(
      'calls_histories',
      loadCallHistoryClass(models),
    ) as unknown as IModels['CallHistory'];

    await Promise.all(
      Object.values(connection.models).map((model) => model.init()),
    );
  });

  beforeEach(async () => {
    await models.CallIntegrations.create({
      inboxId: INBOX_ID,
      wsServer: 'pbx.test:8089',
      phone: '70000000',
      srcTrunk: 'SHARED',
      dstTrunk: 'SHARED',
      queues: ['6500'],
      operators: [
        { userId: 'first', gsUsername: '1001' },
        { userId: 'second', gsUsername: '1002' },
      ],
    });

    await models.CallCdrs.insertMany([
      queueLeg('1', 'answered-by-second', '1001', false),
      queueLeg('2', 'answered-by-second', '1002', true),
      queueLeg('3', 'nobody-answered', '1001', false),
      queueLeg('4', 'nobody-answered', '1002', false),
      queueLeg('5', 'answered-by-first', '1001', true),
      queueLeg('6', 'answered-by-first', '1002', false),
    ]);
  });

  afterEach(async () => {
    if (!connection) return;
    await Promise.all(
      Object.values(connection.models).map((model) => model.deleteMany({})),
    );
  });

  afterAll(async () => {
    if (!connection) return;
    if (
      connection.name !== databaseName ||
      !databaseName.startsWith('erxes_call_test_')
    )
      throw new Error('Refusing to clean an unexpected database');
    await connection.dropDatabase();
    await connection.close();
  });

  test('a call another operator answered is not a missed call for the one who only rang', async () => {
    const history = await historyOf('first');

    expect(
      history.map(({ uniqueid, callStatus }) => [uniqueid, callStatus]).sort(),
    ).toEqual([
      ['answered-by-first', 'connected'],
      ['nobody-answered', 'cancelled'],
    ]);

    const missed = await historyOf('first', 'cancelled');

    expect(missed.map(({ uniqueid }) => uniqueid)).toEqual(['nobody-answered']);
  });

  test('the count matches the list for both operators', async () => {
    const count = (userId: string) =>
      models.CallHistory.getHistoriesCount(
        { integrationId: INBOX_ID },
        operatorUser(userId),
      );

    expect(await count('first')).toBe(2);
    expect(await count('second')).toBe(2);
  });
});
