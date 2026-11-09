import { randomUUID } from 'node:crypto';
import mongoose, { type Connection } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import type { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import { loadCallSessionClass } from '@/integrations/call/db/models/CallSessions';
import { loadCallCdrClass } from '@/integrations/call/db/models/Cdrs';
import { loadCallIntegrationClass } from '@/integrations/call/db/models/Integrations';
import { handleCallEvent } from '@/integrations/call/services/callEventService';
import { receiveCdr } from '@/integrations/call/services/cdrServices';
import { createOrUpdateErxesConversation } from '@/integrations/call/utils';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn(),
}));
jest.mock('@/integrations/call/utils', () => ({
  cfRecordUrl: jest.fn(),
  createOrUpdateErxesConversation: jest.fn(),
  toCamelCase: (source: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(source).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
        value,
      ]),
    ),
}));
jest.mock('@/integrations/call/redlock', () => ({
  redlock: { acquire: async () => ({ release: async () => undefined }) },
  acquireCustomerLock: async () => null,
}));
jest.mock('@/integrations/call/store', () => ({
  getOrCreateCustomer: async () => ({ erxesApiId: 'customer' }),
}));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));

interface IConversationPayload {
  conversationId?: string;
  integrationId?: string;
}

const CALLER = '99000001';
const TRUNK = 'SHARED';
const PHONE = '70000000';

const BRANCHES = [
  { inboxId: 'inbox-central', queue: '6522' },
  { inboxId: 'inbox-misheel', queue: '6523' },
  { inboxId: 'inbox-infection', queue: '6524' },
  { inboxId: 'inbox-arav', queue: '6525' },
];

const mongoSuite =
  process.env.CALL_MONGO_TESTS === '1' ? describe : describe.skip;

mongoSuite('Call legs posted under peer integrations', () => {
  let connection: Connection;
  let models: IModels;
  let conversations: Map<string, string | undefined>;
  const databaseName = `erxes_call_test_${randomUUID().replace(/-/g, '')}`;

  const integrationOf = async (inboxId: string) => {
    const integration = await models.CallIntegrations.findOne({ inboxId });
    if (!integration) throw new Error(`Missing integration ${inboxId}`);
    return integration as ICallIntegrationDocument;
  };

  const postLeg = async (
    inboxId: string,
    leg: Record<string, string | number>,
  ) =>
    receiveCdr(
      models,
      'test',
      {
        src: CALLER,
        userfield: 'Inbound',
        src_trunk_name: TRUNK,
        dst_trunk_name: '',
        billsec: 0,
        disposition: 'NO ANSWER',
        ...leg,
      },
      await integrationOf(inboxId),
    );

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(
        `mongodb://127.0.0.1:27017/${databaseName}?directConnection=true`,
        { serverSelectionTimeoutMS: 3000 },
      )
      .asPromise();

    models = {} as unknown as IModels;
    models.CallSessions = connection.model(
      'calls_sessions',
      loadCallSessionClass(models),
    ) as unknown as IModels['CallSessions'];
    models.CallCdrs = connection.model(
      'calls_cdrs',
      loadCallCdrClass(models),
    ) as unknown as IModels['CallCdrs'];
    models.CallIntegrations = connection.model(
      'calls_integrations',
      loadCallIntegrationClass(models),
    ) as unknown as IModels['CallIntegrations'];

    await Promise.all(
      Object.values(connection.models).map((model) => model.init()),
    );
  });

  beforeEach(async () => {
    conversations = new Map();

    jest
      .mocked(createOrUpdateErxesConversation)
      .mockImplementation(async (_subdomain, payload: IConversationPayload) => {
        const _id = payload.conversationId || randomUUID();
        const known = conversations.has(_id);

        if (!known || payload.integrationId) {
          conversations.set(_id, payload.integrationId);
        }

        return { status: 'success', data: { _id } };
      });

    await models.CallIntegrations.insertMany(
      BRANCHES.map(({ inboxId, queue }) => ({
        inboxId,
        wsServer: 'pbx.test:8089',
        phone: PHONE,
        srcTrunk: TRUNK,
        dstTrunk: TRUNK,
        queues: [queue],
        operators: [],
      })),
    );
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

  test('a follow-me leg posted first under another branch joins the ringing call', async () => {
    const central = await integrationOf('inbox-central');

    await handleCallEvent(
      models,
      'test',
      {
        type: 'ringing',
        uniqueid: 'call.240',
        linkedid: 'call.240',
        callType: 'incoming',
        callerIdNum: CALLER,
        srcTrunkName: TRUNK,
      },
      central,
    );
    await handleCallEvent(
      models,
      'test',
      {
        type: 'ringing',
        uniqueid: 'call.261',
        linkedid: 'call.240',
        callType: 'incoming',
        callerIdNum: CALLER,
        srcTrunkName: TRUNK,
      },
      central,
    );

    await postLeg('inbox-infection', {
      AcctId: '1',
      uniqueid: 'call.260',
      session: 'pbx-session-1',
      userfield: 'Outbound',
      dst: '77000001',
      lastapp: 'Dial',
      action_type: 'FOLLOWME[3021]',
      src_trunk_name: '',
      dst_trunk_name: TRUNK,
      start: '2026-11-04 08:20:28',
      end: '2026-11-04 08:21:14',
    });

    expect(conversations.size).toBe(1);

    await postLeg('inbox-arav', {
      AcctId: '2',
      uniqueid: 'call.240',
      session: 'pbx-session-1',
      dst: '6523',
      lastapp: 'ForkCDR',
      action_type: 'QUEUE[6523]',
      disposition: 'ANSWERED',
      start: '2026-11-04 08:20:27',
      end: '2026-11-04 08:20:27',
    });
    await postLeg('inbox-central', {
      AcctId: '3',
      uniqueid: 'call.240',
      session: 'pbx-session-1',
      dst: '3021',
      lastapp: 'VoiceMail',
      action_type: 'VM',
      disposition: 'ANSWERED',
      billsec: 2,
      start: '2026-11-04 08:21:18',
      end: '2026-11-04 08:21:20',
    });

    expect([...conversations.values()]).toEqual(['inbox-misheel']);
  });

  test('a follow-me leg posted last under another branch joins the same PBX session', async () => {
    await postLeg('inbox-central', {
      AcctId: '10',
      uniqueid: 'call.280',
      session: 'pbx-session-2',
      dst: PHONE,
      lastapp: 'ForkCDR',
      action_type: 'DIAL',
      start: '2026-11-04 08:23:24',
      end: '2026-11-04 08:23:24',
    });
    await postLeg('inbox-misheel', {
      AcctId: '11',
      uniqueid: 'call.280',
      session: 'pbx-session-2',
      dst: '6524',
      lastapp: 'ForkCDR',
      action_type: 'QUEUE[6524]',
      disposition: 'ANSWERED',
      start: '2026-11-04 08:23:49',
      end: '2026-11-04 08:23:49',
    });
    await postLeg('inbox-arav', {
      AcctId: '12',
      uniqueid: 'call.283',
      session: 'pbx-session-2',
      userfield: 'Outbound',
      dst: '77000002',
      lastapp: 'Dial',
      action_type: 'FOLLOWME[3019]',
      disposition: 'ANSWERED',
      billsec: 29,
      src_trunk_name: '',
      dst_trunk_name: TRUNK,
      start: '2026-11-04 08:23:49',
      end: '2026-11-04 08:24:25',
    });

    expect([...conversations.values()]).toEqual(['inbox-infection']);
  });

  test('a redial to another branch after the first call ended opens its own conversation', async () => {
    await postLeg('inbox-central', {
      AcctId: '20',
      uniqueid: 'call.300',
      session: 'pbx-session-3',
      dst: '6524',
      lastapp: 'ForkCDR',
      action_type: 'QUEUE[6524]',
      start: '2026-11-04 08:30:00',
      end: '2026-11-04 08:30:05',
    });
    await postLeg('inbox-central', {
      AcctId: '21',
      uniqueid: 'call.310',
      session: 'pbx-session-4',
      dst: '6525',
      lastapp: 'ForkCDR',
      action_type: 'QUEUE[6525]',
      start: '2026-11-04 08:30:40',
      end: '2026-11-04 08:30:45',
    });

    expect([...conversations.values()].sort()).toEqual([
      'inbox-arav',
      'inbox-infection',
    ]);
  });
});
